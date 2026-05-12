import {MatchService,} from "..";
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


describe('Test auto-match Persons using sparql query v1', () => {

    let matchService: MatchService;
    const testDatasetPath = 'test/fixtures/files/auto-match.ttl';
    let testLuceneConnectorId: string;
    let testGraphUri: string;

    beforeAll(async () => {
        const setup = await setupMatchService();
        matchService = setup.matchService;

        const {
            graphUri,
            luceneConnector
        } = await uploadDataSetAndCreateLuceneConnector(IndexFileNameEnum.PERSON, testDatasetPath)
        testGraphUri = graphUri;
        testLuceneConnectorId = luceneConnector;
        jest.spyOn(MatchServiceHelper, 'getGraphdbIndex').mockReturnValue(luceneConnector);
    });
    afterAll(async () => {
        await dropIndexAndTheGraph(testGraphUri, testLuceneConnectorId);
    })

    it('Expect exact name to set match:true', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PERSON,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Paul Samuel"}],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KPR-4");
        expect(actualResult.match).toBeTruthy()
    });

    it('Expect exact wikidata id to set match:true', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PERSON,
            conditions: [
                {
                    "matchType": MatchTypeEnum.PROPERTY,
                    "propertyId": "<http://schema.org/sameAs>",
                    "propertyValue": "http://www.wikidata.org/entity/Q123",
                    "required": true
                }
            ],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KPR-5");
        expect(actualResult.match).toBeTruthy()
    });

    it('Expect exact name to set match:false when more than one exact match', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PERSON,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Person with common name"}],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        const allResults = response.results?.[0]?.candidates;
        const firstResult = allResults?.[0];
        expect(["KPR-1", "KPR-2"]).toContain(firstResult?.id);
        expect(firstResult?.match).toBe(false);
    });

});

describe('Test auto-match Organizations using sparql query v1', () => {

    let matchService: MatchService;
    const testDatasetPath = 'test/fixtures/files/auto-match.ttl';
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

    it('Expect exact name to set match:true for organizations', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.ORGANIZATION,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Organization in Ottawa"}],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("Org2");
        expect(actualResult.match).toBeTruthy()
    });

    it('Expect exact wikidata id to set match:true for organizations', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.ORGANIZATION,
            conditions: [
                {
                    "matchType": MatchTypeEnum.PROPERTY,
                    "propertyId": "<http://schema.org/sameAs>",
                    "propertyValue": "http://www.wikidata.org/entity/Q111",
                    "required": true
                }
            ],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("Org1");
        expect(actualResult.match).toBeTruthy()
    });

    it('Expect exact ISNI id to set match:true for organizations', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.ORGANIZATION,
            conditions: [
                {
                    "matchType": MatchTypeEnum.PROPERTY,
                    "propertyId": "<http://schema.org/sameAs>",
                    "propertyValue": "https://isni.org/isni/123",
                    "required": true
                }
            ],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("Org2");
        expect(actualResult.match).toBeTruthy()
    });
});

describe('Test auto-matching Places using sparql query v1', () => {

    let matchService: MatchService;
    const testDatasetPath = 'test/fixtures/files/auto-match.ttl';
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

    it('Expect exact name to set match:true', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [
                {
                    "matchType": MatchTypeEnum.NAME,
                    "propertyValue": "Arts Court",
                    "required": false
                },
                {
                    "matchType": MatchTypeEnum.PROPERTY,
                    "propertyId": "<http://schema.org/address>/<http://schema.org/postalCode>",
                    "propertyValue": "H0H 0H0",
                    "required": false
                }
            ],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KP-1");
        expect(actualResult?.match).toBe(true);
    });

    it('Expect exact name to set match:false when more than one exact match', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [
                {
                    "matchType": MatchTypeEnum.NAME,
                    "propertyValue": "Place with common name",
                    "required": false
                },
                {
                    "matchType": MatchTypeEnum.PROPERTY,
                    "propertyId": "<http://schema.org/address>/<http://schema.org/postalCode>",
                    "propertyValue": "H0H 0H0",
                    "required": false
                }
            ],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        const allResults = response.results?.[0]?.candidates;
        const firstResult = allResults?.[0];
        expect(["KP-7", "KP-8"]).toContain(firstResult?.id);
        expect(firstResult?.match).toBe(false);
    });

    it(`Auto-match Place with alternate name`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [
                {
                    matchType: MatchTypeEnum.NAME,
                    propertyValue: "Alternate Name"
                },
                {
                    "matchType": MatchTypeEnum.PROPERTY,
                    "propertyId": "<http://schema.org/address>/<http://schema.org/postalCode>",
                    "propertyValue": "H0B 0HB",
                    "required": false
                }],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        console.log("allResults", allResults);
        expect(actualResult?.id).toBe("Place1");
        expect(actualResult?.match).toBeTruthy();
    });
});