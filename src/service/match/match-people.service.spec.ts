import { MatchService } from "../../service";
import {ReconciliationQuery} from "../../dto";
import {Entities} from "../../constant";
import {MatchTypeEnum} from "../../enum";
import {executeAndCompareResults, setupMatchService} from "../../../test/test-util";


describe('Test reconciling people using sparql query version 2', () => {

    let matchService: MatchService;

    beforeAll(async () => {
        const setup = await setupMatchService();
        matchService = setup.matchService;
    });

    it(`Reconcile a person entity with name 'Jérémy De', which is close match`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PERSON,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Jérémy De"}],
            limit: 1
        };

        const expectedResult = {
            id: "K2-2791",
            name: "Jérémy Desmarais",
            type: Entities.PERSON,
            match: false,
            count: 1
        }

        await executeAndCompareResults(matchService, expectedResult, reconciliationQuery);
    });

    it(`Reconcile an person entity with uri 'http://kg.artsdata.ca/resource/K5-198`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PERSON,
            conditions: [{matchType: MatchTypeEnum.ID, propertyValue: "http://kg.artsdata.ca/resource/K5-198"}],
            limit: 1
        };

        const expectedResult = {
            id: "K5-198",
            name: "Alex Roy",
            type: Entities.PERSON,
            match: false,
            count: 1
        }

        await executeAndCompareResults(matchService, expectedResult, reconciliationQuery);
    });

});

