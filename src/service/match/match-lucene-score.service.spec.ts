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


describe('Tests to compare lucene scores', () => {

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

    it('startDate including time match should boost the lucene score', async () => {

        const reconciliationQueryWithStartDate: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {
                    matchType: MatchTypeEnum.NAME,
                    propertyValue: "Beacon Night"},
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

        expect(actualResultForStartDateTime?.score).toBeGreaterThan(actualResultForStartDate?.score);

    });

});
