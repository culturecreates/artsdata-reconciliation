import {MatchService,} from "../../service";
import {ReconciliationQuery} from "../../dto";
import {Entities} from "../../constant";
import {LanguageEnum, MatchQuantifierEnum, MatchTypeEnum} from "../../enum";
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


    it('Reconcile an ado:Event with exact name, startDate and location URI and endDate, should be exact match', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.ADO_EVENT,
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
        const actualResult = response.results?.[0]?.candidates?.[0];

        expect(actualResult?.id).toBe("KE-4");
        expect(actualResult?.match).toBeTruthy();

    });

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
        expect(actualResult?.type?.find(type => type.id === Entities.EVENT)?.id)
            .toBe(Entities.EVENT);

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
            conditions: [{matchType: MatchTypeEnum.ID, propertyValue: "http://kg.artsdata.ca/resource/KE-4", required:true}],
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
        expect(actualResult?.type?.find(type => type.id === Entities.EVENT)?.id)
            .toBe(Entities.EVENT);
    });

});

describe('Reconcile events with subEvents', () => {

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

    it(`Event with sameAs`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {
                    matchType: MatchTypeEnum.NAME,
                    propertyValue: "Event Series One"
                }, {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: [
                        "https://isni.org/isni/0000000123456789",
                        "https://musicbrainz.org/artist/6b52e1be-f27a-433c-b51a-3f2d63abc2ba"
                    ],
                    propertyId: "http://schema.org/sameAs",
                    matchQuantifier: MatchQuantifierEnum.ANY,
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

        expect(actualResult?.id).toBe("EventSeries1");
        expect(allResults?.length).toBe(1);
    });

    it(`Event with subEvents not matching - Auto match should be false `, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {
                    matchType: MatchTypeEnum.NAME,
                    propertyValue: "Event Series One"
                }, {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "2025-01-01T13:00:00-04:00",
                    propertyId: "http://schema.org/startDate",
                    required: true
                }, {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "2025-01-28T13:00:00-04:00",
                    propertyId: "http://schema.org/endDate",
                    required: true
                }, {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "http://kg.artsdata.ca/resource/KP-1",
                    propertyId: "http://schema.org/location",
                    required: true
                }, {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: ["http://kg.artsdata.ca/resource/SubEvent1", "http://kg.artsdata.ca/resource/SubEvent2"],
                    propertyId: "http://schema.org/subEvent",
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

        expect(actualResult?.id).toBe("EventSeries1");
        expect(actualResult?.match).toBeTruthy();
        expect(allResults?.length).toBe(1);
    });

    it(`Event with subEvents with different count - Auto match should be true `, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {
                    matchType: MatchTypeEnum.NAME,
                    propertyValue: "Event Series One"
                }, {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "2025-01-01T13:00:00-04:00",
                    propertyId: "http://schema.org/startDate",
                    required: true
                }, {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "2025-01-28T13:00:00-04:00",
                    propertyId: "http://schema.org/endDate",
                    required: true
                }, {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "http://kg.artsdata.ca/resource/KP-1",
                    propertyId: "http://schema.org/location",
                    required: true
                }, {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "http://kg.artsdata.ca/resource/SubEvent1",
                    propertyId: "http://schema.org/subEvent",
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

        expect(actualResult?.id).toBe("EventSeries1");
        expect(actualResult?.match).toBeTruthy();
        expect(allResults?.length).toBe(1);
    });

    it(`Event without a subEvents matching to an event with subEvents - Auto match should be false `, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {
                    matchType: MatchTypeEnum.NAME,
                    propertyValue: "Event Series One"
                }, {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "2025-01-01T13:00:00-04:00",
                    propertyId: "http://schema.org/startDate",
                    required: true
                }, {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "2025-01-28T13:00:00-04:00",
                    propertyId: "http://schema.org/endDate",
                    required: true
                }, {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "http://kg.artsdata.ca/resource/KP-1",
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

        expect(actualResult?.id).toBe("EventSeries1");
        expect(actualResult?.match).toBeFalsy();
        expect(allResults?.length).toBe(1);
    });

    it(`Reconcile with matching event ID - Auto match should be true `, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {
                    matchType: MatchTypeEnum.NAME,
                    propertyValue: "A Beacon in the Night"
                }, {
                    matchType: MatchTypeEnum.ID,
                    propertyValue: "http://kg.artsdata.ca/resource/KE-1",
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

        expect(actualResult?.id).toBe("KE-1");
        expect(actualResult?.match).toBeTruthy();
    });

    it(`Reconcile with unmatching event ID - Auto match should be false `, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {
                    matchType: MatchTypeEnum.NAME,
                    propertyValue: "A Beacon in the Night"
                }, {
                    matchType: MatchTypeEnum.ID,
                    propertyValue: "http://kg.artsdata.ca/resource/UNMATCHED",
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

        expect(actualResult?.id).toBe("KE-1");
        expect(actualResult?.match).toBeFalsy();
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


describe('Compare lucene scores for startDate within 24 hours', () => {

    let matchService: MatchService;
    const testDatasetPath = 'test/fixtures/files/events-with-name.ttl';
    let testLuceneConnectorId: string;
    let testGraphUri: string;

    // A startDate within 24h adds a lucene boost; anything outside adds nothing. Scores are rounded to
    // 2 decimals, so a difference of at least 1 can't be fuzzy-name noise and shows the boost applied.
    const MIN_DATE_BOOST = 1;

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

    async function scoreOf(expectedId: string, name: string, startDate?: string, location?: string) {
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: name}],
            limit: 10
        };
        if (location) {
            reconciliationQuery.conditions.push({
                matchType: MatchTypeEnum.PROPERTY,
                propertyValue: location,
                propertyId: "http://schema.org/location",
                required: true
            });
        }
        if (startDate) {
            reconciliationQuery.conditions.push({
                matchType: MatchTypeEnum.PROPERTY,
                propertyValue: startDate,
                propertyId: "http://schema.org/startDate",
                required: false
            });
        }

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        expect(response.results).toHaveLength(1);
        const candidate = response.results?.[0]?.candidates?.find(({id}) => id === expectedId);
        expect(candidate).toBeDefined();
        return candidate!.score;
    }

    it(`Dance Night: matching startDate dateTime scores clearly higher than the same date a year earlier`, async () => {
        // KE-5 startDate is 2026-04-25T19:30:00-07:00
        const location = "http://kg.artsdata.ca/resource/K-PortTheatreAuditorium";
        const matching = await scoreOf("KE-5", "Dance Night", "2026-04-25T19:30:00-07:00", location);
        const yearEarlier = await scoreOf("KE-5", "Dance Night", "2025-04-25T19:30:00-07:00", location);
        const nameOnly = await scoreOf("KE-5", "Dance Night", undefined, location);

        expect(matching - yearEarlier).toBeGreaterThanOrEqual(MIN_DATE_BOOST);
        // One digit apart as text, a year apart in time: no boost at all
        expect(yearEarlier).toBeCloseTo(nameOnly, 2);
    });

    it(`Dance Night: startDate 6 hours off still gets the same boost as an exact match`, async () => {
        // 2026-04-25T19:30-07:00 == 2026-04-26T02:30Z; 20:30Z is 6h earlier
        const matching = await scoreOf("KE-5", "Dance Night", "2026-04-26T02:30:00Z");
        const sixHoursEarlier = await scoreOf("KE-5", "Dance Night", "2026-04-25T20:30:00Z");
        const nameOnly = await scoreOf("KE-5", "Dance Night");

        expect(matching - nameOnly).toBeGreaterThanOrEqual(MIN_DATE_BOOST);
        expect(sixHoursEarlier).toBeCloseTo(matching, 2);
    });

    it(`Dance Night: startDate more than 24h away gets no boost`, async () => {
        const nameOnly = await scoreOf("KE-5", "Dance Night");
        const twoDaysLater = await scoreOf("KE-5", "Dance Night", "2026-04-27T19:30:00-07:00");

        expect(twoDaysLater).toBeCloseTo(nameOnly, 2);
    });

    it(`A Beacon in the Night: date-only 2025-01-01 scores clearly higher than 2024-01-01`, async () => {
        // KE-1 startDate is 2025-01-01 (xsd:date)
        const matching = await scoreOf("KE-1", "A Beacon in the Night", "2025-01-01");
        const yearEarlier = await scoreOf("KE-1", "A Beacon in the Night", "2024-01-01");
        const nameOnly = await scoreOf("KE-1", "A Beacon in the Night");

        expect(matching - yearEarlier).toBeGreaterThanOrEqual(MIN_DATE_BOOST);
        expect(yearEarlier).toBeCloseTo(nameOnly, 2);
    });

    it(`A Beacon in the Night: date-only 2025-01-01 scores clearly higher than 2025-01-09`, async () => {
        const matching = await scoreOf("KE-1", "A Beacon in the Night", "2025-01-01");
        const eightDaysLater = await scoreOf("KE-1", "A Beacon in the Night", "2025-01-09");

        expect(matching - eightDaysLater).toBeGreaterThanOrEqual(MIN_DATE_BOOST);
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
        expect(actualResult?.type?.find(type => type.id === Entities.EVENT)?.id)
            .toBe(Entities.EVENT);

    });

    it(`Reconcile an event entity with uri 'http://kg.artsdata.ca/resource/KE-4, which is a exact match`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{matchType: MatchTypeEnum.ID, propertyValue: "http://kg.artsdata.ca/resource/KE-4", required:true}],
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
        expect(actualResult?.type?.find(type => type.id === Entities.EVENT)?.id)
            .toBe(Entities.EVENT);
    });
});


describe('locationRelated matcher — containment-aware location matching', () => {

    const baseRecord = {name: "Romeo & Juliet"};

    it('auto-matches when query location is the room and graph location is the building (containedInPlace)', () => {
        const additionalProperties = {
            uri: "http://kg.artsdata.ca/resource/KE-1",
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
            types: [Entities.EVENT]
        };

        const query: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Romeo & Juliet"}],
            limit: 5
        };

        const recordFromQuery = {
            id: undefined,
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
            type: Entities.EVENT
        };

        const result = MatchServiceHelper.isAutoMatch(baseRecord, query, additionalProperties, recordFromQuery);
        expect(result).toBe(true);
    });

    it('auto-matches when query location is the building and graph location is the room (containsPlace)', () => {
        const additionalProperties = {
            uri: "http://kg.artsdata.ca/resource/KE-1",
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
            types: [Entities.EVENT]
        };

        const query: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Romeo & Juliet"}],
            limit: 5
        };

        const recordFromQuery = {
            id: undefined,
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
            type: Entities.EVENT
        };

        const result = MatchServiceHelper.isAutoMatch(baseRecord, query, additionalProperties, recordFromQuery);
        expect(result).toBe(true);
    });

    it('does not auto-match when location is unrelated to the graph location', () => {
        const additionalProperties = {
            uri: "http://kg.artsdata.ca/resource/KE-1",
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
            id: undefined,
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
            id: "http://kg.artsdata.ca/resource/KE-1",
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
            id: undefined,
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
            subEvents: undefined,
        };

        const differentNameRecord = {name: "Hamlet"};
        const result = MatchServiceHelper.isAutoMatch(differentNameRecord, query, additionalProperties, recordFromQuery);
        expect(result).toBe(false);
    });
});