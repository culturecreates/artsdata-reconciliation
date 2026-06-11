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


describe('Test matching events using sparql query v1', () => {

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

    it('Reconcile an event with name `A Beacon in the Night`, which is not exact match', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "A Beacon in the Night"}],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-1");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Event")?.id)
            .toBe("http://schema.org/Event");

    });

    it('Reconcile an event with name `Beacon Night` and start Date `2025-01-01`, which is not exact match', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {matchType: MatchTypeEnum.NAME, propertyValue: "Beacon Night"},
                {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "2025-01-01",
                    propertyId: "http://schema.org/startDate",
                    required: true
                }

            ],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-1");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();

    });


    it('Reconcile an event with name `Beacon Night` and start Date `2025-02-02`, which is not exact match', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {matchType: MatchTypeEnum.NAME, propertyValue: "Beacon Night"},
                {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "2025-02-02",
                    propertyId: "http://schema.org/startDate",
                    required: true
                }

            ],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-2");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();

    });

    it('Reconcile an event with name `Beacon Night` and start Date `2025-03-03`, which is should match an event startDate datatype is xsd:dateTime', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {matchType: MatchTypeEnum.NAME, propertyValue: "Beacon Night"},
                {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "2025-03-03",
                    propertyId: "http://schema.org/startDate",
                    required: true
                }

            ],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-4");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();

    });

    it('Reconcile an event with exact name, startDate and location URI and endDate, should be exact match', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {matchType: MatchTypeEnum.NAME, propertyValue: "A Beacon during the Night"},
                {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "2025-03-03T17:00:00-05:00",
                    propertyId: "http://schema.org/startDate",
                    required: true
                }, {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "2025-03-03T18:00:00-05:00",
                    propertyId: "http://schema.org/endDate",
                    required: true
                }, {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "http://kg.artsdata.ca/resource/KP-1",
                    propertyId: "http://schema.org/location",
                    required: true
                }

            ],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-4");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeTruthy();

    });

    it('Reconcile an event with exact name, startDate and location name, postal code and endDate, should be exact match', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {matchType: MatchTypeEnum.NAME, propertyValue: "A Beacon during the Night"},
                {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "2025-03-03T17:00:00-05:00",
                    propertyId: "http://schema.org/startDate",
                    required: true
                }, {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "2025-03-03T18:00:00-05:00",
                    propertyId: "http://schema.org/endDate",
                    required: true
                }, {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "One Location",
                    propertyId: "<http://schema.org/location>/<http://schema.org/name>",
                    required: true
                }, {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "12345",
                    propertyId: "<http://schema.org/location>/<http://schema.org/address>/<http://schema.org/postalCode>",
                    required: true
                }

            ],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-4");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeTruthy();

    });


    it(`Reconcile an event entity with uri 'http://kg.artsdata.ca/resource/KE-4, which is a true match`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{matchType: MatchTypeEnum.ID, propertyValue: "http://kg.artsdata.ca/resource/KE-4"}],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-4");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeTruthy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Event")?.id)
            .toBe("http://schema.org/Event");
    });

});

describe('Reconcile events with contained in place', () => {

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


    it(`Location uri of the auditorium (event linked to auditorium)`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {matchType: MatchTypeEnum.NAME, propertyValue: "Dance Night"},
                {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "http://kg.artsdata.ca/resource/K-PortTheatreAuditorium",
                    propertyId: "http://schema.org/location",
                    required: true
                }
            ],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-5");
        expect(allResults?.length).toBe(1);
    });

    it(`Event with location uri of the Building (event linked to auditorium)`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {matchType: MatchTypeEnum.NAME, propertyValue: "Dance Night"},
                {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "http://kg.artsdata.ca/resource/K-PortTheatre",
                    propertyId: "http://schema.org/location",
                    required: true
                }
            ],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-5");
        expect(allResults?.length).toBe(1);
    });

    it(`Event with location uri of the Building (event linked to auditorium) and startDate. Should be true match`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {matchType: MatchTypeEnum.NAME, propertyValue: "Dance Night"},
                {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "http://kg.artsdata.ca/resource/K-PortTheatre",
                    propertyId: "http://schema.org/location",
                    required: true
                },
                {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "2026-04-25T19:30:00-07:00",
                    propertyId: "http://schema.org/startDate",
                    required: false
                }
            ],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];
        expect(actualResult?.match).toBeTruthy();
        expect(actualResult?.id).toBe("KE-5");
        expect(allResults?.length).toBe(1);
    });

});


describe('Test reconciling events using sparql query version 2', () => {

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
        } = await uploadDataSetAndCreateLuceneConnector(IndexFileNameEnum.ALL_LITERALS, testDatasetPath)
        testGraphUri = graphUri;
        testLuceneConnectorId = luceneConnector;
        jest.spyOn(MatchServiceHelper, 'getGraphdbIndex').mockReturnValue(luceneConnector);
    });
    afterAll(async () => {
        await dropIndexAndTheGraph(testGraphUri, testLuceneConnectorId);
    })

    it('Reconcile an event with name `A Beacon in the Night`, which is not exact match', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "A Beacon in the Night"}],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V2);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-1");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Event")?.id)
            .toBe("http://schema.org/Event");

    });

    it(`Reconcile an event entity with uri 'http://kg.artsdata.ca/resource/KE-4, which is a exact match`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{matchType: MatchTypeEnum.ID, propertyValue: "http://kg.artsdata.ca/resource/KE-4"}],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, "V2");

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-4");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeTruthy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Event")?.id)
            .toBe("http://schema.org/Event");
    });
});


describe('locationRelated matcher — containment-aware location matching', () => {

    const baseRecord = {name: "Romeo & Juliet"};

    it('auto-matches when query location is the room and graph location is the building (containedInPlace)', () => {
        const additionalProperties = {
            startDate: "2026-04-25T19:30:00-07:00",
            endDate: undefined,
            locationUri: "http://kg.artsdata.ca/resource/K2-5487",
            locationContainedIn: undefined,
            locationContains: "http://kg.artsdata.ca/resource/K2-6080",
            postalCode: undefined,
            locationName: undefined,
            url: undefined,
            wikidata: undefined,
            isni: undefined,
            alternateName: undefined,
            addressLocality: undefined,
        };

        const query: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Romeo & Juliet"}],
            limit: 5
        };

        const recordFromQuery = {
            name: "Romeo & Juliet",
            startDate: "2026-04-25T19:30:00-07:00",
            endDate: undefined,
            locationUri: "http://kg.artsdata.ca/resource/K2-6080",
            locationContainedIn: undefined,
            locationContains: undefined,
            postalCode: undefined,
            addressLocality: undefined,
            addressRegion: undefined,
            url: undefined,
            locationName: undefined,
            wikidata: undefined,
            isni: undefined,
        };

        const result = MatchServiceHelper.isAutoMatch(baseRecord, query, additionalProperties, recordFromQuery);
        expect(result).toBe(true);
    });

    it('auto-matches when query location is the building and graph location is the room (containsPlace)', () => {
        const additionalProperties = {
            startDate: "2026-04-25T19:30:00-07:00",
            endDate: undefined,
            locationUri: "http://kg.artsdata.ca/resource/K2-6080",
            locationContainedIn: "http://kg.artsdata.ca/resource/K2-5487",
            locationContains: undefined,
            postalCode: undefined,
            locationName: undefined,
            url: undefined,
            wikidata: undefined,
            isni: undefined,
            alternateName: undefined,
            addressLocality: undefined,
        };

        const query: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Romeo & Juliet"}],
            limit: 5
        };

        const recordFromQuery = {
            name: "Romeo & Juliet",
            startDate: "2026-04-25T19:30:00-07:00",
            endDate: undefined,
            locationUri: "http://kg.artsdata.ca/resource/K2-5487",
            locationContainedIn: undefined,
            locationContains: undefined,
            postalCode: undefined,
            addressLocality: undefined,
            addressRegion: undefined,
            url: undefined,
            locationName: undefined,
            wikidata: undefined,
            isni: undefined,
        };

        const result = MatchServiceHelper.isAutoMatch(baseRecord, query, additionalProperties, recordFromQuery);
        expect(result).toBe(true);
    });

    it('does not auto-match when location is unrelated to the graph location', () => {
        const additionalProperties = {
            startDate: "2026-04-25T19:30:00-07:00",
            endDate: undefined,
            locationUri: "http://kg.artsdata.ca/resource/K2-6080",
            locationContainedIn: "http://kg.artsdata.ca/resource/K2-5487",
            locationContains: undefined,
            postalCode: undefined,
            locationName: undefined,
            url: undefined,
            wikidata: undefined,
            isni: undefined,
            alternateName: undefined,
            addressLocality: undefined,
        };

        const query: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Romeo & Juliet"}],
            limit: 5
        };

        const recordFromQuery = {
            name: "Romeo & Juliet",
            startDate: "2026-04-25T19:30:00-07:00",
            endDate: undefined,
            locationUri: "http://kg.artsdata.ca/resource/K11-19",
            locationContainedIn: undefined,
            locationContains: undefined,
            postalCode: undefined,
            addressLocality: undefined,
            addressRegion: undefined,
            url: undefined,
            locationName: undefined,
            wikidata: undefined,
            isni: undefined,
        };

        const result = MatchServiceHelper.isAutoMatch(baseRecord, query, additionalProperties, recordFromQuery);
        expect(result).toBe(false);
    });

    it('does not auto-match when name does not match even if location containment matches', () => {
        const additionalProperties = {
            startDate: "2026-04-25T19:30:00-07:00",
            endDate: undefined,
            locationUri: "http://kg.artsdata.ca/resource/K2-5487",
            locationContainedIn: undefined,
            locationContains: "http://kg.artsdata.ca/resource/K2-6080",
            postalCode: undefined,
            locationName: undefined,
            url: undefined,
            wikidata: undefined,
            isni: undefined,
            alternateName: undefined,
            addressLocality: undefined,
        };

        const query: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Romeo & Juliet"}],
            limit: 5
        };

        const recordFromQuery = {
            name: "Romeo & Juliet",
            startDate: "2026-04-25T19:30:00-07:00",
            endDate: undefined,
            locationUri: "http://kg.artsdata.ca/resource/K2-6080",
            locationContainedIn: undefined,
            locationContains: undefined,
            postalCode: undefined,
            addressLocality: undefined,
            addressRegion: undefined,
            url: undefined,
            locationName: undefined,
            wikidata: undefined,
            isni: undefined,
        };

        const differentNameRecord = {name: "Hamlet"};
        const result = MatchServiceHelper.isAutoMatch(differentNameRecord, query, additionalProperties, recordFromQuery);
        expect(result).toBe(false);
    });
});