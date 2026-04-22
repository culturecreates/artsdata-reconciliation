import {Test, TestingModule} from "@nestjs/testing";
import {ArtsdataService} from "../artsdata";
import {HttpService} from "../http";

/**
 * Test Lucene index name — unique to this suite so it does not clash with
 * any production index.
 */
const TEST_INDEX = "unit-test-lucene-index";

/**
 * Named graph that holds all test triples.  Dropping this graph in
 * afterAll removes all test data in a single operation.
 */
const TEST_GRAPH = "http://test.artsdata.ca/lucene-unit-test";

// ---------------------------------------------------------------------------
// SPARQL strings used to set up and tear down the controlled dataset
// ---------------------------------------------------------------------------

/**
 * Creates a minimal Lucene connector that indexes schema:Event entities by
 * their schema:name value.  The connector has no graph filter so it will
 * index triples regardless of which named graph they live in.
 */
const CREATE_INDEX_SPARQL = `
PREFIX luc: <http://www.ontotext.com/connectors/lucene#>
PREFIX luc-inst: <http://www.ontotext.com/connectors/lucene/instance#>
INSERT DATA {
    luc-inst:${TEST_INDEX} luc:createConnector '''
{
  "fields": [
    {
      "fieldName": "name",
      "propertyChain": ["http://schema.org/name"],
      "indexed": true,
      "stored": true,
      "analyzed": true,
      "multivalued": true,
      "ignoreInvalidValues": true,
      "facet": true
    }
  ],
  "languages": [],
  "types": ["http://schema.org/Event"],
  "readonly": false,
  "detectFields": false,
  "importGraph": false,
  "skipInitialIndexing": false,
  "boostProperties": [],
  "stripMarkup": false
}
''' .
}`;

/**
 * Inserts two minimal schema:Event triples into the dedicated test graph.
 * This is the controlled dataset the Lucene index will search over.
 */
const INSERT_DATA_SPARQL = `
PREFIX schema: <http://schema.org/>
INSERT DATA {
    GRAPH <${TEST_GRAPH}> {
        <http://test.artsdata.ca/event/jazz-night> a schema:Event ;
            schema:name "Jazz Night Festival" .
        <http://test.artsdata.ca/event/classical-evening> a schema:Event ;
            schema:name "Classical Music Evening" .
    }
}`;

/**
 * Drops the Lucene connector.  In GraphDB, connectors are managed via
 * special INSERT DATA statements using the :dropConnector predicate.
 */
const DROP_INDEX_SPARQL = `
PREFIX luc: <http://www.ontotext.com/connectors/lucene#>
PREFIX luc-inst: <http://www.ontotext.com/connectors/lucene/instance#>
INSERT DATA {
    luc-inst:${TEST_INDEX} luc:dropConnector "" .
}`;

/**
 * Removes the entire test graph.  SILENT suppresses the error when the
 * graph does not exist (e.g. after a previous failed run).
 */
const DROP_DATA_SPARQL = `DROP SILENT GRAPH <${TEST_GRAPH}>`;

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

/**
 * Polls GraphDB until the Lucene connector has indexed at least one entity
 * or the timeout (default 30 s) is exceeded.  This avoids a brittle fixed
 * delay: GraphDB indexes in the background, and the time varies with load.
 */
async function waitForIndex(
    service: ArtsdataService,
    indexName: string,
    timeoutMs = 30_000,
    intervalMs = 500,
): Promise<void> {
    const probeQuery = `
PREFIX con: <http://www.ontotext.com/connectors/lucene#>
PREFIX con-inst: <http://www.ontotext.com/connectors/lucene/instance#>
PREFIX schema: <http://schema.org/>
SELECT ?entity WHERE {
    [] a con-inst:${indexName} ;
       con:query "name: *" ;
       con:entities ?entity .
    ?entity a schema:Event .
} LIMIT 1`;

    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        try {
            const result = await service.executeSparqlQuery(probeQuery);
            if ((result?.results?.bindings ?? []).length > 0) return;
        } catch {
            // Index may not be available yet — keep polling
        }
        await new Promise((r) => setTimeout(r, intervalMs));
    }
    throw new Error(`[lucene-dataset] Timed out waiting for index "${indexName}" to become ready after ${timeoutMs}ms`);
}

describe("Lucene index with controlled runtime dataset", () => {
    jest.setTimeout(60000);

    let artsdataService: ArtsdataService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ArtsdataService, HttpService],
        }).compile();

        artsdataService = module.get<ArtsdataService>(ArtsdataService);
        await artsdataService.checkConnectionWithRetry();

        // Drop any leftover index/data from a previous failed run (ignore errors)
        try { await artsdataService.executeSparqlUpdate(DROP_INDEX_SPARQL); } catch (err) {
            console.warn(`[lucene-dataset] Skipping drop index during setup (may not exist): ${err instanceof Error ? err.message : String(err)}`);
        }
        try { await artsdataService.executeSparqlUpdate(DROP_DATA_SPARQL); } catch (err) {
            console.warn(`[lucene-dataset] Skipping drop data during setup (may not exist): ${err instanceof Error ? err.message : String(err)}`);
        }

        // Create the Lucene connector and insert the minimal test dataset
        await artsdataService.executeSparqlUpdate(CREATE_INDEX_SPARQL);
        await artsdataService.executeSparqlUpdate(INSERT_DATA_SPARQL);

        // Poll until GraphDB has finished indexing the new triples (up to 30 s)
        await waitForIndex(artsdataService, TEST_INDEX);
    });

    afterAll(async () => {
        try { await artsdataService.executeSparqlUpdate(DROP_INDEX_SPARQL); } catch (err) {
            console.warn(`[lucene-dataset] Failed to drop index during teardown: ${err instanceof Error ? err.message : String(err)}`);
        }
        try { await artsdataService.executeSparqlUpdate(DROP_DATA_SPARQL); } catch (err) {
            console.warn(`[lucene-dataset] Failed to drop data during teardown: ${err instanceof Error ? err.message : String(err)}`);
        }
    });

    it("should find a schema:Event by name keyword using the Lucene index", async () => {
        const query = `
PREFIX con: <http://www.ontotext.com/connectors/lucene#>
PREFIX con-inst: <http://www.ontotext.com/connectors/lucene/instance#>
PREFIX schema: <http://schema.org/>

SELECT ?entity ?name WHERE {
    [] a con-inst:${TEST_INDEX} ;
       con:query "name: Jazz" ;
       con:entities ?entity .
    ?entity a schema:Event .
    ?entity schema:name ?name .
}`;

        const result = await artsdataService.executeSparqlQuery(query);
        const bindings = result?.results?.bindings ?? [];

        expect(bindings.length).toBeGreaterThan(0);
        expect(bindings[0].name.value).toBe("Jazz Night Festival");
    });

    it("should return no results when the search term does not match any entity in the dataset", async () => {
        const query = `
PREFIX con: <http://www.ontotext.com/connectors/lucene#>
PREFIX con-inst: <http://www.ontotext.com/connectors/lucene/instance#>
PREFIX schema: <http://schema.org/>

SELECT ?entity WHERE {
    [] a con-inst:${TEST_INDEX} ;
       con:query "name: Opera" ;
       con:entities ?entity .
    ?entity a schema:Event .
}`;

        const result = await artsdataService.executeSparqlQuery(query);
        const bindings = result?.results?.bindings ?? [];

        expect(bindings.length).toBe(0);
    });
});
