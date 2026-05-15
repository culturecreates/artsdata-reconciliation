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

describe('Test matching Organization using qualifier RegexMatch using sparql query v1', () => {

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

    it('Should match culture creates, if search by just domain name \'culturecreates.com\'', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.ORGANIZATION,
            conditions: [{
                matchType: "property",
                propertyId: "http://schema.org/url",
                propertyValue: "culturecreates.com",
                required: true,
                matchQualifier: MatchQualifierEnum.REGEX_MATCH
            }],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("Organization1");

    });

    it('Should match culture creates, if search by valid URL', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.ORGANIZATION,
            conditions: [{
                matchType: "property",
                propertyId: "http://schema.org/url",
                propertyValue: "http://culturecreates.com",
                required: true,
                matchQualifier: MatchQualifierEnum.REGEX_MATCH
            }],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("Organization1");

    });

    it('Should match culturecreates, if search by regex keyword', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.ORGANIZATION,
            conditions: [{
                matchType: "property",
                propertyId: "http://schema.org/url",
                propertyValue: "https?://culturecreates.com",
                required: true,
                matchQualifier: MatchQualifierEnum.REGEX_MATCH
            }],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("Organization1");

    });

});
