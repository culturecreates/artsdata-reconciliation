import {MatchService,} from "../../service";
import {ReconciliationQuery} from "../../dto";
import {Entities} from "../../constant";
import {LanguageEnum, MatchTypeEnum} from "../../enum";
import {
    dropIndexAndTheGraph,
    setupMatchService,
    uploadDataSetAndCreateLuceneConnector
} from "../../../test/util/common-util";
import {IndexFileNameEnum} from "../../enum/index-names.enum";
import {MatchServiceHelper} from "../../helper";
import {SparqlVersionEnum} from "../../enum/sparql-versions.enum";

describe('Test reconciling organizations using sparql query version 1', () => {

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
        } = await uploadDataSetAndCreateLuceneConnector(IndexFileNameEnum.ORGANIZATION, testDatasetPath)
        testGraphUri = graphUri;
        testLuceneConnectorId = luceneConnector;
        jest.spyOn(MatchServiceHelper, 'getGraphdbIndex').mockReturnValue(luceneConnector);
    });
    afterAll(async () => {
        await dropIndexAndTheGraph(testGraphUri, testLuceneConnectorId);
    })

    it('Reconcile a organization with name `Place Bell`, which is exact match', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.ORGANIZATION,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Place Bell"}],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V2);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KO-1");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeTruthy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Organization")?.id)
            .toBe("http://schema.org/Organization");

    });

    it(`Reconcile an organization entity with uri 'http://kg.artsdata.ca/resource/KO-1`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.ORGANIZATION,
            conditions: [{matchType: MatchTypeEnum.ID, propertyValue: "http://kg.artsdata.ca/resource/KO-1"}],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V2);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KO-1");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeTruthy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Organization")?.id)
            .toBe("http://schema.org/Organization");
    });
});

describe('Test reconciling Organizations using sparql query version 2', () => {

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

    it('Reconcile an organization with name `Place Bell`, which is exact match', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.ORGANIZATION,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Place Bell"}],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V2);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KO-1");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeTruthy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Organization")?.id)
            .toBe("http://schema.org/Organization");

    });

    it(`Reconcile an organization entity with uri 'http://kg.artsdata.ca/resource/KO-1`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.ORGANIZATION,
            conditions: [{matchType: MatchTypeEnum.ID, propertyValue: "http://kg.artsdata.ca/resource/KO-1"}],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V2);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KO-1");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeTruthy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Organization")?.id)
            .toBe("http://schema.org/Organization");
    });
});