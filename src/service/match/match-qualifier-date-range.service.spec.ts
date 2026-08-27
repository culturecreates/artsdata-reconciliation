import {MatchService,} from "../../service";
import {ReconciliationQuery} from "../../dto";
import {Entities} from "../../constant";
import {LanguageEnum, MatchQualifierEnum} from "../../enum";
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
    const testDatasetPath = 'test/fixtures/files/qualifier-match.ttl';
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

    it(`Should find a event with start Date '2025-01-01' `, async () => {

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

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];
        expect(actualResult?.id).toBe("Event1");

    });

    it(`Should find a event with start Date '2025-01-01/' `, async () => {

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

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];
        expect(actualResult?.id).toBe("Event1");

    });

    it(`Should find a event with start Date '/2025-02-02' `, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{
                matchType: "property",
                propertyId: "http://schema.org/startDate",
                propertyValue: "/2025-02-02",
                required: true,
                matchQualifier: MatchQualifierEnum.DATE_RANGE
            }],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        expect( allResults?.[0]?.id).toBe("Event2");

    });

    it(`Should find a event with start Date '2025-01-01/2025-02-03' `, async () => {

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

        expect(response.results).toHaveLength(2);
        const allResults = response.results?.[0]?.candidates;
        expect( allResults?.[0]?.id).toBe("Event1");
        expect( allResults?.[0]?.id).toBe("Event2");

    });

});
