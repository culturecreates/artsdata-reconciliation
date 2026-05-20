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

    it('Should match string "url" by just domain name \'culturecreates.com\'', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.ORGANIZATION,
            conditions: [{
                matchType: "property",
                propertyId: "http://schema.org/url",
                propertyValue: "culturecreates.com",
                required: true,
                matchQualifier: MatchQualifierEnum.REGEX_MATCH
            }],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("Organization1");

    });

    it('Should match string "url" using complete URL', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.ORGANIZATION,
            conditions: [{
                matchType: "property",
                propertyId: "http://schema.org/url",
                propertyValue: "http://culturecreates.com",
                required: true,
                matchQualifier: MatchQualifierEnum.REGEX_MATCH
            }],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];
        console.log("Actual result: ", actualResult);

        expect(actualResult?.id).toBe("Organization1");

    });

    it('Should match string "url" using regex modifier to allow http or https', async () => {
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.ORGANIZATION,
            conditions: [{
                matchType: "property",
                propertyId: "http://schema.org/url",
                propertyValue: "https?://culturecreates.com",
                required: true,
                matchQualifier: MatchQualifierEnum.REGEX_MATCH
            }],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("Organization1");

    });

    it('Should NOT match string "url" without REGEX qualifier', async () => {
        // a string "url" is converted to URI unless using REGEX_MATCH qualifier
        // All schema:url values should be stored as <URI> in the core graph
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.ORGANIZATION,
            conditions: [{
                matchType: "property",
                propertyId: "http://schema.org/url",
                propertyValue: "http://culturecreates.com",
                required: true
            }],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        const allResults = response.results?.[0]?.candidates;
        expect(allResults).toHaveLength(0);

    });

    it('Should match URI <url> without REGEX qualifier', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.ORGANIZATION,
            conditions: [{
                matchType: "property",
                propertyId: "http://schema.org/url",
                propertyValue: "https://anotherorganization.com",
                required: true
            }],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("Organization2");

    });

    it('Should match URI <url> using REGEX qualifier', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.ORGANIZATION,
            conditions: [{
                matchType: "property",
                propertyId: "http://schema.org/url",
                propertyValue: "anotherorganization.?com",
                required: true,
                matchQualifier: MatchQualifierEnum.REGEX_MATCH
            }],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("Organization2");

    });

    it('Should match name containing  special char ' + ' using REGEX qualifier', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.ORGANIZATION,
            conditions: [{
                matchType: "property",
                propertyId: "http://schema.org/name",
                propertyValue: "Arts \\+ Culture",
                required: true,
                matchQualifier: MatchQualifierEnum.REGEX_MATCH
            }],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("Organization3");

    });

    it(`Should match name containing special char '+' using REGEX expression containing '.'`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.ORGANIZATION,
            conditions: [{
                matchType: "property",
                propertyId: "http://schema.org/name",
                propertyValue: "Arts . Culture",
                required: true,
                matchQualifier: MatchQualifierEnum.REGEX_MATCH
            }],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("Organization3");

    });

});
