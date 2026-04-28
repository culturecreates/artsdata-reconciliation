import {MatchService,} from "../../service";
import {ReconciliationQuery} from "../../dto";
import {Entities} from "../../constant";
import {MatchTypeEnum} from "../../enum";
import {
    dropIndexAndTheGraph,
    executeAndCompareResults,
    setupMatchService,
    uploadDataSetAndCreateLuceneConnector
} from "../../../test/util/common-util";
import { IndexFileNameEnum} from "../../enum/index-names.enum";


describe('Test reconciling events using sparql query version 2', () => {

    let matchService: MatchService;
    const testDatasetPath = 'test/fixtures/files/events-with-name.ttl';

    beforeAll(async () => {
        const setup = await setupMatchService();
        matchService = setup.matchService;
        await uploadDataSetAndCreateLuceneConnector(IndexFileNameEnum.EVENT, testDatasetPath)
    });
    afterAll(async () => {
        await dropIndexAndTheGraph();
    })

    it('Reconcile an event with name `A Beacon in the Night`, which is exact match', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "A Beacon in the Night"}],
            limit: 1
        };

        const expectedResult = {
            id: "KE-1",
            type: Entities.EVENT,
            match: false,
            count: 1
        }

        await executeAndCompareResults(matchService, expectedResult, reconciliationQuery);
    });

    it(`Reconcile an event entity with uri 'http://kg.artsdata.ca/resource/KE-4`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{matchType: MatchTypeEnum.ID, propertyValue: "http://kg.artsdata.ca/resource/KE-4"}],
            limit: 1
        };

        const expectedResult = {
            id: "KE-4",
            type: Entities.EVENT,
            match: false,
            count: 1
        }

        await executeAndCompareResults(matchService, expectedResult, reconciliationQuery);
    });
});

