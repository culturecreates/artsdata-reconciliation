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

        expect(matching).toBeGreaterThan(yearEarlier);
        expect(yearEarlier).toBeCloseTo(nameOnly, 2);
    });

    it(`A Beacon in the Night: date-only 2025-01-01 scores clearly higher than 2025-01-09`, async () => {
        const matching = await scoreOf("KE-1", "A Beacon in the Night", "2025-01-01");
        const eightDaysLater = await scoreOf("KE-1", "A Beacon in the Night", "2025-01-09");

        expect(matching).toBeGreaterThan(eightDaysLater);
    });

    it('startDate including time match should have the same lucene score', async () => {

        const reconciliationQueryWithStartDate: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {
                    matchType: MatchTypeEnum.NAME,
                    propertyValue: "Beacon Night"
                },
                {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "2025-03-03",
                    propertyId: "http://schema.org/startDate",
                    required: true
                }

            ],
            limit: 1
        };

        const reconciliationQueryWithStartDateTime: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {
                    matchType: MatchTypeEnum.NAME,
                    propertyValue: "Beacon Night"
                },
                {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyValue: "2025-03-03T17:00:00-05:00",
                    propertyId: "http://schema.org/startDate",
                    required: true
                }

            ],
            limit: 1
        };

        const responseForQueryWithStartDate = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQueryWithStartDate]});

        const responseForQueryWithStartDateTime = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQueryWithStartDateTime]});

        const allResultsForStartDate = responseForQueryWithStartDate.results?.[0]?.candidates;
        const actualResultForStartDate = allResultsForStartDate?.[0];

        const allResultsForStarTDateTime = responseForQueryWithStartDateTime.results?.[0]?.candidates;
        const actualResultForStartDateTime = allResultsForStarTDateTime?.[0];

        expect(actualResultForStartDateTime?.score).toBe(actualResultForStartDate?.score);

    });

});
