import {MatchService,} from "../../service";
import {ReconciliationQuery} from "../../dto";
import {Entities} from "../../constant";
import {MatchTypeEnum} from "../../enum";
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

