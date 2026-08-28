import {MatchService,} from "../../service";
import {ReconciliationQuery} from "../../dto";
import {Entities} from "../../constant";
import {LanguageEnum, MatchQualifierEnum, MatchQuantifierEnum} from "../../enum";
import {
    dropIndexAndTheGraph,
    setupMatchService,
    uploadDataSetAndCreateLuceneConnector
} from "../../../test/util/common-util";
import {IndexFileNameEnum} from "../../enum/index-names.enum";
import {MatchServiceHelper} from "../../helper";
import {SparqlVersionEnum} from "../../enum/sparql-versions.enum";

describe('Test match qualifier - reconciliation-qualifier-date-range v1', () => {

    let matchService: MatchService;
    const testDatasetPath = 'test/fixtures/files/date-range-qualifier-match.ttl';
    let testLuceneConnectorId: string;
    let testGraphUri: string;

    beforeAll(async () => {
        const setup = await setupMatchService();
        matchService = setup.matchService;

        const {
            graphUri,
            luceneConnector
        } = await uploadDataSetAndCreateLuceneConnector(IndexFileNameEnum.EVENT, testDatasetPath)
        testGraphUri = graphUri;
        testLuceneConnectorId = luceneConnector;
        jest.spyOn(MatchServiceHelper, 'getGraphdbIndex').mockReturnValue(luceneConnector);
    });
    afterAll(async () => {
        await dropIndexAndTheGraph(testGraphUri, testLuceneConnectorId);
    })

    it(`'2025-01-01' is an invalid date range`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{
                matchType: "property",
                propertyId: "http://schema.org/startDate",
                propertyValue: "2025-01-01",
                required: true,
                matchQualifier: MatchQualifierEnum.DATE_RANGE
            }],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        const allResults = response.results?.[0]?.candidates;
        expect(allResults).toHaveLength(0);

    });

    it(`'2025-03-04/' => Should find events held on or after 2025-03-04`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{
                matchType: "property",
                propertyId: "http://schema.org/startDate",
                propertyValue: "2025-03-04/",
                required: true,
                matchQualifier: MatchQualifierEnum.DATE_RANGE
            }],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        const allResults = response.results?.[0]?.candidates;
        expect(allResults).toHaveLength(2);

        const expectedIds = ["Event4", "Event5"];
        expectedIds.forEach((expectedId, index) => {
            expect(allResults?.[index]?.id).toBe(expectedId);
        });

    });

    it(`'/2025-05-06' =>  Should find events held on or before /2025-05-06' `, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{
                matchType: "property",
                propertyId: "http://schema.org/startDate",
                propertyValue: "/2025-05-06",
                required: true,
                matchQualifier: MatchQualifierEnum.DATE_RANGE
            }],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        const allResults = response.results?.[0]?.candidates;
        expect(allResults).toHaveLength(5);

        const expectedIds = ["Event1", "Event2", "Event3", "Event4", "Event5"];

        expectedIds.forEach((expectedId, index) => {
            expect(allResults?.[index]?.id).toBe(expectedId);
        });

    });

    it(`'2025-01-01/2025-02-03' => Should find events happening between 2025-01-01 and 2025-02-03 (including dates)`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{
                matchType: "property",
                propertyId: "http://schema.org/startDate",
                propertyValue: "2025-01-01/2025-02-03",
                required: true,
                matchQualifier: MatchQualifierEnum.DATE_RANGE
            }],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        const allResults = response.results?.[0]?.candidates;
        expect(allResults).toHaveLength(2);

        const expectedIds = ["Event1", "Event2"];

        expectedIds.forEach((expectedId, index) => {
            expect(allResults?.[index]?.id).toBe(expectedId);
        });

    });

    it(`'2025-03-03T12:00:00-05:00/2025-03-03T20:00:00-05:00' => Event between given dates (including) `, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{
                matchType: "property",
                propertyId: "http://schema.org/startDate",
                propertyValue: "2025-03-03T12:00:00-05:00/2025-03-03T20:00:00-05:00",
                required: true,
                matchQualifier: MatchQualifierEnum.DATE_RANGE
            }],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        const allResults = response.results?.[0]?.candidates;
        expect(allResults).toHaveLength(1);

        expect(allResults?.[0]?.id).toBe("Event3");

    });

    it(`'2024-12-31T23:59:00-05:00/2025-02-01' => Combination of date and date times`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{
                matchType: "property",
                propertyId: "http://schema.org/startDate",
                propertyValue: "2024-12-31T23:59:00-05:00/2025-02-01T00:00:00-05:00",
                required: true,
                matchQualifier: MatchQualifierEnum.DATE_RANGE
            }],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        const allResults = response.results?.[0]?.candidates;
        expect(allResults).toHaveLength(1);

        expect(allResults?.[0]?.id).toBe("Event1");

    });

    it(`NOT 2025-01-01/2025-03-03 => All events out of this range`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{
                matchType: "property",
                propertyId: "http://schema.org/startDate",
                propertyValue: "2025-01-01/2025-03-03",
                required: true,
                matchQualifier: MatchQualifierEnum.DATE_RANGE,
                matchQuantifier: MatchQuantifierEnum.NONE
            }],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        const allResults = response.results?.[0]?.candidates;
        expect(allResults).toHaveLength(2);

        const expectedIds = [ "Event4", "Event5"];

        expectedIds.forEach((expectedId, index) => {
            expect(allResults?.[index]?.id).toBe(expectedId);
        });

    });
});
