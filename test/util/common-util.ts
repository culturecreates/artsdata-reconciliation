import {ArtsdataService, HttpService, ManifestService, MatchService} from "../../src/service";
import {ReconciliationQuery} from "../../src/dto";
import {LanguageEnum} from "../../src/enum";
import {Test, TestingModule} from "@nestjs/testing";
import {ManifestController, MatchController} from "../../src/controller";
import {readFile} from 'node:fs/promises';
import {executeSparql} from "./graphdb.util";
import N3 from 'n3';
import { randomUUID } from 'node:crypto';

export async function executeAndCompareResults(
    matchService: MatchService,
    expectedResult: {
        id: string;
        name?: string;
        type: string;
        match: boolean;
        count: number
    },
    reconciliationQuery: ReconciliationQuery,
    version?: string
) {
    const result = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
        {queries: [reconciliationQuery]}, version);

    const allResults = result.results?.[0]?.candidates;
    const actualResult = allResults?.[0];

    if (expectedResult.id) {
        expect(actualResult?.id).toBe(expectedResult.id);
    }

    if (expectedResult.name) {
        expect(actualResult?.name).toBe(expectedResult.name);
    }

    if (expectedResult.count) {
        expect(allResults?.length).toBe(expectedResult.count);
    }

    if (expectedResult.type) {
        const expectedTypeUri = expectedResult.type.replace('schema:', 'http://schema.org/')
        expect(actualResult?.type?.some(type => type.id === expectedTypeUri)).toBeTruthy();
    }

    if (expectedResult.match) {
        expect(actualResult?.match).toBeTruthy();
    }
}

export async function setupMatchService() {
    const app: TestingModule = await Test.createTestingModule({
        controllers: [ManifestController, MatchController],
        providers: [ManifestService, MatchService, ArtsdataService, HttpService],
    }).compile();

    const matchService = app.get<MatchService>(MatchService);
    const artsdataService = app.get<ArtsdataService>(ArtsdataService);
    await artsdataService.checkConnectionWithRetry();

    return {matchService, app};
}

/**
 * Reads the specified SPARQL file and extracts the Lucene connector configuration.
 * @param indexFileName - The name of the SPARQL file containing the Lucene index configuration.
 * @returns A string representing the Lucene connector configuration.
 * @throws Will throw an error if the index file is empty or if there is an issue reading the file.
 */
async function getLuceneConfigs(indexFileName: string) {
    let luceneConfigExtract: string = ''
    if (!indexFileName) {
        throw new Error("Index is empty");
    } else {
        //read the file and get the index config
        try {
            const luceneQuery = await readFile(`seed/sparql/index/${indexFileName}`, 'utf8')
            const regex = /'''([\s\S]*?)'''/;
            const match = luceneQuery.match(regex);
            if (match) {
                luceneConfigExtract = match[1];
            }
        } catch (error) {
            console.error(`Error reading index file ${indexFileName}:`, error);
            throw new Error(`Error reading index file ${indexFileName}: ${error.message}`);
        }
    }
    const luceneConfigExtractJson = JSON.parse(luceneConfigExtract);

    luceneConfigExtractJson.importGraph = true;
    luceneConfigExtractJson.readonly = true;

    return JSON.stringify(luceneConfigExtractJson);

}

async function generateInsertQueryToLoadData(testDataFilePath: string, graphUri: string) {
    const parser = new N3.Parser();
    const writer = new N3.Writer({format: 'N-Triples'});
    const ttl = (await readFile(testDataFilePath, 'utf8')).toString();


    return new Promise((resolve, reject) => {
        //Read ttl from file
        // 1. Parse the TTL and capture prefi   xes
        parser.parse(ttl, (error: any, quad: any, prefixes: any) => {
            if (error) return reject(error);

            if (quad) {
                writer.addQuad(quad);
            } else {
                // 2. Format the prefixes for SPARQL (PREFIX pre: <uri>)
                const prefixStrings = Object.entries(prefixes).map(
                    ([prefix, uri]) => `PREFIX ${prefix}: <${uri}>`
                );

                // 3. Finalize the N-Triples string
                writer.end((err: any, triplesBlock: string) => {
                    if (err) return reject(err);

                    const sparql = [
                        ...prefixStrings,
                        '',
                        'INSERT DATA {',
                        `  GRAPH <${graphUri}> {`,
                        triplesBlock.trim().split('\n').map(line => `    ${line}`).join('\n'),
                        '  }',
                        '}'
                    ].join('\n');

                    resolve(sparql);
                });
            }
        });
    });
}

async function createLuceneConnectorQuery(index: string, graphUri: string, luceneConnector: string) {
    let insertQueryTemplate = `
    PREFIX luc: <http://www.ontotext.com/connectors/lucene#>
    INSERT {
        GRAPH luc:graph { ?s ?p ?o }
    }
    WHERE {
        GRAPH <${graphUri}> { ?s ?p ?o }
    };
    
    PREFIX :<http://www.ontotext.com/connectors/lucene#>
    PREFIX inst:<http://www.ontotext.com/connectors/lucene/instance#>
    
    INSERT DATA {    
    inst:${luceneConnector} :createConnector '''
    LUCENE_CONFIG_PLACEHOLDER`;

    const luceneIndexConfigModified = await getLuceneConfigs(index);

    return insertQueryTemplate
        .replace('LUCENE_CONFIG_PLACEHOLDER', luceneIndexConfigModified)
        .concat(`''' .}`);
}

/**
 * Generates a SPARQL INSERT query to insert data into a Lucene index.
 * @param index - The name of the Lucene index.
 * @param testDataFilePath - The path to the JSON-LD file containing the test data.
 * @returns A string representing the SPARQL INSERT query.
 */
export async function uploadDataSetAndCreateLuceneConnector(index: string, testDataFilePath: string) {
    const uniqueId = randomUUID();
    const testGraphUri = `http://test.fixtures/${uniqueId}`;
    const testLuceneConnector = `test_index-${uniqueId}`

    try {//Update dataset
        const indexQuery = await generateInsertQueryToLoadData(testDataFilePath, testGraphUri);
        await executeSparql(indexQuery as string);

        //Create lucene connector
        const lucenceConnectorQuery = await createLuceneConnectorQuery(index, testGraphUri, testLuceneConnector)
        await executeSparql(lucenceConnectorQuery as string);
        return {graphUri: testGraphUri, luceneConnector: testLuceneConnector};
    } catch (error) {
        throw new Error(`Error creating lucene connector: ${error.message}`);
    }
}

export async function dropIndexAndTheGraph(graphUri: string, LuceneConnectorId: string) {
    const dropIndexQuery = `
        PREFIX luc-index: <http://www.ontotext.com/connectors/lucene/instance#>
        PREFIX luc: <http://www.ontotext.com/connectors/lucene#>
        INSERT DATA {
            luc-index:${LuceneConnectorId} luc:dropConnector [] .
        } ;
        DROP GRAPH <${graphUri}> 
        `
    await executeSparql(dropIndexQuery);
}
