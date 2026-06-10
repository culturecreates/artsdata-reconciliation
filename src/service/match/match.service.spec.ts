import {MatchService,} from "../../service";
import {LanguageEnum, MatchTypeEnum} from "../../enum";
import {
    dropIndexAndTheGraph,
    setupMatchService,
    uploadDataSetAndCreateLuceneConnector
} from "../../../test/util/common-util";
import {IndexFileNameEnum} from "../../enum/index-names.enum";
import {MatchServiceHelper} from "../../helper";
import {ReconciliationQuery} from "../../dto";
import {SparqlVersionEnum} from "../../enum/sparql-versions.enum";

describe('Test reconciling events using sparql query version 1', () => {

    let matchService: MatchService;
    const testDatasetPath = 'test/fixtures/files/events-with-name.ttl';
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

    it('Reconcile event with partial name and that contains \'&\'.', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: "schema:Event",
            limit: 1,
            conditions: [
                {
                    matchType: "name",
                    propertyValue: "Banx & Ranx "
                }
            ]
        }

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-8");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Event")?.id)
            .toBe("http://schema.org/Event");

    });

    it('Reconcile event with partial name and that contains \'-\'.', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: "schema:Event",
            limit: 1,
            conditions: [
                {
                    matchType: "name",
                    propertyValue: "Pierre-Yves Roy-Desmarais"
                }
            ]
        }

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-7");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Event")?.id)
            .toBe("http://schema.org/Event");

    });

    it('Reconcile event with partial name and that contains \'||\'.', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: "schema:Event",
            limit: 1,
            conditions: [
                {
                    matchType: "name",
                    propertyValue: "Banx & Ranx || FMG"
                }
            ]
        }

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-8");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Event")?.id)
            .toBe("http://schema.org/Event");

    });

    it('Reconcile event with partial name and that contains \'(\' and \').', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: "schema:Event",
            limit: 1,
            conditions: [
                {
                    matchType: "name",
                    propertyValue: "Maï Nguyen (Vietnam)"
                }
            ]
        }

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-9");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Event")?.id)
            .toBe("http://schema.org/Event");

    });

    it('Reconcile event with partial name and that contains \'[\' and \']\'.', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: "schema:Event",
            limit: 1,
            conditions: [
                {
                    matchType: "name",
                    propertyValue: "j'essaye [Trois-Rivieres]"
                }
            ]
        }

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-10");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Event")?.id)
            .toBe("http://schema.org/Event");

    });

    it('Reconcile event with partial name and that contains AND', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: "schema:Event",
            limit: 1,
            conditions: [
                {
                    matchType: "name",
                    propertyValue: "Beacon AND Night"
                }
            ]
        }

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-2");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Event")?.id)
            .toBe("http://schema.org/Event");

    });

    it('It should match names with single neutral quote', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: "schema:Event",
            limit: 1,
            conditions: [
                {
                    matchType: "name",
                    propertyValue: "j'essaye [Trois-Rivières]"
                }
            ]
        }

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-10");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Event")?.id)
            .toBe("http://schema.org/Event");

    });

    it('It should match names with single curved quote', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: "schema:Event",
            limit: 1,
            conditions: [
                {
                    matchType: "name",
                    propertyValue: "j'essaye [Trois-Rivières]"
                }
            ]
        }

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-10");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Event")?.id)
            .toBe("http://schema.org/Event");

    });

    it('It should match names with single curved quote', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: "schema:Event",
            limit: 1,
            conditions: [
                {
                    matchType: "name",
                    propertyValue: "Emily D’Angelo"
                }
            ]
        }

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-11");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Event")?.id)
            .toBe("http://schema.org/Event");

    });

    it('It should match names with &', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: "schema:Event",
            limit: 1,
            conditions: [
                {
                    matchType: "name",
                    propertyValue: "Banx & Ranx"
                }
            ]
        }

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-8");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Event")?.id)
            .toBe("http://schema.org/Event");

    });

    it('It should match names with &', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: "schema:Event",
            limit: 1,
            conditions: [
                {
                    matchType: "name",
                    propertyValue: "Banx & Ranx"
                }
            ]
        }

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-8");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Event")?.id)
            .toBe("http://schema.org/Event");

    });

    it('Reconcile a Event with Invalid Artsdata ID - XXX', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: "schema:Event",
            limit: 1,
            conditions: [
                {
                    matchType: MatchTypeEnum.ID,
                    propertyValue: "XXX",
                },
            ],
        }

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe(undefined);
        expect(allResults?.length).toBe(0);
        expect(actualResult?.match).toBeFalsy();

    });

    it('Reconcile Event with Name and startDate in xsd:dateTime format', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: "schema:Event",
            limit: 1,
            conditions: [
                {
                    matchType: "name",
                    propertyValue: "At the Night",
                    propertyId: "string",
                    required: true,
                },
                {
                    matchType: "property",
                    propertyValue: "2025-12-28T13:00:00-04:00",
                    propertyId: "http://schema.org/startDate",
                    required: true,
                },
            ],
        }

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V1);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-6");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();

    });
});