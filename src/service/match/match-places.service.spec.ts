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

    it('Reconcile a Place with name `Plas Bell`, which a close match of name', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Plas Bell"}],
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

    it('It should match a place whose French title is the search term', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: "schema:Place",
            limit: 1,
            conditions: [
                {
                    matchType: "name",
                    propertyValue: "Place des arts"
                }
            ]
        }

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KP-3");
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

    it('It should match a place whose French title is the search term', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: "schema:Place",
            limit: 1,
            conditions: [
                {
                    matchType: "name",
                    propertyValue: "Place des arts"
                }
            ]
        }

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V2);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KP-3");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Place")?.id)
            .toBe("http://schema.org/Place");

    });

    it('Reconcile Place with Name and Postal code', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: "schema:Place",
            limit: 1,
            conditions: [
                {
                    matchType: "name",
                    propertyValue: "Place des arts",
                },
                {
                    matchType: "property",
                    propertyValue: "H2X 1Z8",
                    propertyId: "schema:address/schema:postalCode",
                    required: true,
                },
            ],
        }

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V2);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KP-3");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Place")?.id)
            .toBe("http://schema.org/Place");

    });

    it('Reconcile Place with Name and Street Address', async () => {

        const reconciliationQuery: ReconciliationQuery ={
            type: "schema:Place",
            limit: 1,
            conditions: [
                {
                    matchType: "name",
                    propertyValue: "Place des arts",
                },
                {
                    matchType: "property",
                    propertyValue: "175, rue Sainte-Catherine Ouest",
                    propertyId: "schema:address/schema:streetAddress",
                    required: true,
                },
            ],
        }

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KP-3");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Place")?.id)
            .toBe("http://schema.org/Place");

    });

    it('It should find by name', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: "schema:Place",
            limit: 1,
            conditions: [
                {
                    matchType: "name",
                    propertyValue: "Place des arts"
                }
            ]
        }

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KP-3");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Place")?.id)
            .toBe("http://schema.org/Place");

    });

    it('Reconcile Place with name and postal code and match should be false since postal code is incorrect', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: "schema:Place",
            limit: 1,
            conditions: [
                {
                    matchType: "name",
                    propertyValue: "Place des arts"
                }
            ]
        }

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KP-3");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Place")?.id)
            .toBe("http://schema.org/Place");

    });

    it('Reconcile Place with name and locality, the match should be true since all are exactly matching', async () => {

        const reconciliationQuery: ReconciliationQuery =  {
            type: "schema:Place",
            limit: 1,
            conditions: [
                {
                    matchType: "name",
                    propertyValue: "Place des Arts",
                },
                {
                    matchType: "property",
                    propertyValue: "Toronto",
                    propertyId:
                        "<http://schema.org/address>/<http://schema.org/addressLocality>",
                },
            ],
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KP-3");
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
