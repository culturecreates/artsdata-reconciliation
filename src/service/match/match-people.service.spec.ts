import { MatchService } from "../../service";
import { ReconciliationQuery } from "../../dto";
import { Entities } from "../../constant";
import { MatchTypeEnum } from "../../enum";
import { LanguageEnum } from "../../enum";
import { setupMatchService } from "../../../test/test-util";


describe('Test reconciling people using sparql query version 2', () => {

    let matchService: MatchService;

    beforeAll(async () => {
        const setup = await setupMatchService();
        matchService = setup.matchService;
    });

    it(`Reconcile a person entity with name 'Jérémy De', which is close match`, async () => {
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PERSON,
            conditions: [{ matchType: MatchTypeEnum.NAME, propertyValue: "Jérémy De" }],
            limit: 1
        };

        const result = await matchService.reconcileByQueries(
            LanguageEnum.ENGLISH,
            { queries: [reconciliationQuery] },
            "v2"
        );

        const candidate = result.results?.[0]?.candidates?.[0];
        expect(candidate.id).toBe("K2-2791");
        expect(candidate.name).toBe("Jérémy Desmarais");
    });

    it(`Reconcile an person entity with uri 'http://kg.artsdata.ca/resource/K5-198`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PERSON,
            conditions: [{ matchType: MatchTypeEnum.ID, propertyValue: "http://kg.artsdata.ca/resource/K5-198" }],
            limit: 1
        };

       const result = await matchService.reconcileByQueries(
            LanguageEnum.ENGLISH,
            { queries: [reconciliationQuery] },
            "v2"
        );

        const candidate = result.results?.[0]?.candidates?.[0];
        expect(candidate.id).toBe("K5-198");
    });

});

