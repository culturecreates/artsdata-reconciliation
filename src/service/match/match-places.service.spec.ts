import {MatchService,} from "../../service";
import {ReconciliationQuery} from "../../dto";
import {Entities} from "../../constant";
import {LanguageEnum, MatchTypeEnum} from "../../enum";
import {
    dropIndexAndTheGraph,
    executeAndCompareResults,
    setupMatchService,
    uploadDataSetAndCreateLuceneConnector
} from "../../../test/util/common-util";
import {IndexFileNameEnum} from "../../enum/index-names.enum";
import {MatchServiceHelper} from "../../helper";
import {SparqlVersionEnum} from "../../enum/sparql-versions.enum";


describe('Test reconciling Place using sparql query version 1', () => {

    let matchService: MatchService;
    const testDatasetPath = 'test/fixtures/files/places-people-and-organizations-with-name.ttl';
    let testLuceneConnectorId: string;
    let testGraphUri: string;

    beforeAll(async () => {
        const setup = await setupMatchService();
        matchService = setup.matchService;

        const {
            graphUri,
            luceneConnector
        } = await uploadDataSetAndCreateLuceneConnector(IndexFileNameEnum.PLACE, testDatasetPath)
        testGraphUri = graphUri;
        testLuceneConnectorId = luceneConnector;
        jest.spyOn(MatchServiceHelper, 'getGraphdbIndex').mockReturnValue(luceneConnector);
    });
    afterAll(async () => {
        await dropIndexAndTheGraph(testGraphUri, testLuceneConnectorId);
    })

    it('Reconcile a Place with name `Place bell`, which a exact match of name', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Place bell"}],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KP-1");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Place")?.id)
            .toBe("http://schema.org/Place");

    });

    it('Reconcile a Place with name `Place`, which a close match of name', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Place"}],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KP-1");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Place")?.id)
            .toBe("http://schema.org/Place");

    });

    it(`Reconcile an place entity with uri 'http://kg.artsdata.ca/resource/KP-1`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{matchType: MatchTypeEnum.ID, propertyValue: "http://kg.artsdata.ca/resource/KP-1"}],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KP-1");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeTruthy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Place")?.id)
            .toBe("http://schema.org/Place");
    });
});

describe('Test reconciling place using sparql query version 2', () => {

    let matchService: MatchService;
    const testDatasetPath = 'test/fixtures/files/places-people-and-organizations-with-name.ttl';
    let testLuceneConnectorId: string;
    let testGraphUri: string;

    beforeAll(async () => {
        const setup = await setupMatchService();
        matchService = setup.matchService;

        const {
            graphUri,
            luceneConnector
        } = await uploadDataSetAndCreateLuceneConnector(IndexFileNameEnum.ALL_LITERALS, testDatasetPath)
        testGraphUri = graphUri;
        testLuceneConnectorId = luceneConnector;
        jest.spyOn(MatchServiceHelper, 'getGraphdbIndex').mockReturnValue(luceneConnector);
    });
    afterAll(async () => {
        await dropIndexAndTheGraph(testGraphUri, testLuceneConnectorId);
    })

    it('Reconcile an place with name `Place bell`, which is exact match', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Place bell"}],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V2);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KP-1");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Place")?.id)
            .toBe("http://schema.org/Place");

    });

    it(`Reconcile an Place entity with uri 'http://kg.artsdata.ca/resource/KP-1`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{matchType: MatchTypeEnum.ID, propertyValue: "http://kg.artsdata.ca/resource/KP-1"}],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V2);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KP-1");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeTruthy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Place")?.id)
            .toBe("http://schema.org/Place");
    });
});
