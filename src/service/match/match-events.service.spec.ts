import {MatchService,} from "../../service";
import {MatchServiceHelper} from "../../helper";
import {ReconciliationQuery} from "../../dto";
import {Entities} from "../../constant";
import {MatchTypeEnum, LanguageEnum} from "../../enum";
import {executeAndCompareResults, setupMatchService} from "../../../test/test-util";


describe('Test reconciling events using sparql query version 2', () => {

    let matchService: MatchService;

    beforeAll(async () => {
        const setup = await setupMatchService();
        matchService = setup.matchService;
    });

    it('Reconcile an event with name `Émile Bilodeau`, which is exact match', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Émile Bilodeau"}],
            limit: 1
        };

        const expectedResult = {
            id: "K23-5524",
            name: "Émile Bilodeau",
            type: Entities.EVENT,
            match: false,
            count: 1
        }

        await executeAndCompareResults(matchService, expectedResult, reconciliationQuery);
    });

    it(`Reconcile an event entity with uri 'http://kg.artsdata.ca/resource/K23-5524`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{matchType: MatchTypeEnum.ID, propertyValue: "http://kg.artsdata.ca/resource/K23-5524"}],
            limit: 1
        };

        const expectedResult = {
            id: "K23-5524",
            name: "Émile Bilodeau",
            type: Entities.EVENT,
            match: false,
            count: 1
        }

        await executeAndCompareResults(matchService, expectedResult, reconciliationQuery);
    });
});


describe('locationRelated matcher — containment-aware location matching', () => {

    const baseQuery: ReconciliationQuery = {
        type: Entities.EVENT,
        conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Romeo & Juliet"}],
        limit: 5
    };

    const baseRecord = {name: "Romeo & Juliet"};

    it('auto-matches when query location is the room and graph location is the building (containedInPlace)', () => {
        // Graph candidate: location = K2-5487 (building), containsPlace = K2-6080 (room)
        // Query: locationUri = K2-6080 (room)
        const additionalProperties = {
            startDate: "2026-04-25T19:30:00-07:00",
            endDate: undefined,
            locationUri: "http://kg.artsdata.ca/resource/K2-5487",
            containedInPlaceUri: undefined,
            containsPlaceUri: "http://kg.artsdata.ca/resource/K2-6080",
            postalCode: undefined,
            locationName: undefined,
            url: undefined,
            wikidata: undefined,
            isni: undefined,
        };

        const queryWithLocation: ReconciliationQuery = {
            ...baseQuery,
            conditions: [
                {matchType: MatchTypeEnum.NAME, propertyValue: "Romeo & Juliet"},
                {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyId: "schema:startDate",
                    propertyValue: "2026-04-25T19:30:00-07:00"
                },
                {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyId: "schema:location",
                    propertyValue: "http://kg.artsdata.ca/resource/K2-6080"
                }
            ]
        };

        const result = MatchServiceHelper.isAutoMatch(baseRecord, queryWithLocation, additionalProperties);
        expect(result).toBe(true);
    });

    it('auto-matches when query location is the building and graph location is the room (containsPlace)', () => {
        // Graph candidate: location = K2-6080 (room), containedInPlace = K2-5487 (building)
        // Query: locationUri = K2-5487 (building)
        const additionalProperties = {
            startDate: "2026-04-25T19:30:00-07:00",
            endDate: undefined,
            locationUri: "http://kg.artsdata.ca/resource/K2-6080",
            containedInPlaceUri: "http://kg.artsdata.ca/resource/K2-5487",
            containsPlaceUri: undefined,
            postalCode: undefined,
            locationName: undefined,
            url: undefined,
            wikidata: undefined,
            isni: undefined,
        };

        const queryWithLocation: ReconciliationQuery = {
            ...baseQuery,
            conditions: [
                {matchType: MatchTypeEnum.NAME, propertyValue: "Romeo & Juliet"},
                {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyId: "schema:startDate",
                    propertyValue: "2026-04-25T19:30:00-07:00"
                },
                {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyId: "schema:location",
                    propertyValue: "http://kg.artsdata.ca/resource/K2-5487"
                }
            ]
        };

        const result = MatchServiceHelper.isAutoMatch(baseRecord, queryWithLocation, additionalProperties);
        expect(result).toBe(true);
    });

    it('does not auto-match when location is unrelated to the graph location', () => {
        // Graph candidate: location = K2-6080 (room), containedInPlace = K2-5487 (building)
        // Query: locationUri = K11-19 (Roy Thomson Hall — completely unrelated)
        const additionalProperties = {
            startDate: "2026-04-25T19:30:00-07:00",
            endDate: undefined,
            locationUri: "http://kg.artsdata.ca/resource/K2-6080",
            containedInPlaceUri: "http://kg.artsdata.ca/resource/K2-5487",
            containsPlaceUri: undefined,
            postalCode: undefined,
            locationName: undefined,
            url: undefined,
            wikidata: undefined,
            isni: undefined,
        };

        const queryWithLocation: ReconciliationQuery = {
            ...baseQuery,
            conditions: [
                {matchType: MatchTypeEnum.NAME, propertyValue: "Romeo & Juliet"},
                {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyId: "schema:startDate",
                    propertyValue: "2026-04-25T19:30:00-07:00"
                },
                {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyId: "schema:location",
                    propertyValue: "http://kg.artsdata.ca/resource/K11-19"
                }
            ]
        };

        const result = MatchServiceHelper.isAutoMatch(baseRecord, queryWithLocation, additionalProperties);
        expect(result).toBe(false);
    });

    it('does not auto-match when name does not match even if location containment matches', () => {
        const additionalProperties = {
            startDate: "2026-04-25T19:30:00-07:00",
            endDate: undefined,
            locationUri: "http://kg.artsdata.ca/resource/K2-5487",
            containedInPlaceUri: undefined,
            containsPlaceUri: "http://kg.artsdata.ca/resource/K2-6080",
            postalCode: undefined,
            locationName: undefined,
            url: undefined,
            wikidata: undefined,
            isni: undefined,
        };

        const queryWithLocation: ReconciliationQuery = {
            ...baseQuery,
            conditions: [
                {matchType: MatchTypeEnum.NAME, propertyValue: "Romeo & Juliet"},
                {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyId: "schema:startDate",
                    propertyValue: "2026-04-25T19:30:00-07:00"
                },
                {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyId: "schema:location",
                    propertyValue: "http://kg.artsdata.ca/resource/K2-6080"
                }
            ]
        };

        const differentNameRecord = {name: "Hamlet"};
        const result = MatchServiceHelper.isAutoMatch(differentNameRecord, queryWithLocation, additionalProperties);
        expect(result).toBe(false);
    });
});
