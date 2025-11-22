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

    
    it(`Fuzzy match person name 'Jérémy Des'`, async () => {
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PERSON,
            conditions: [{
                matchType: MatchTypeEnum.NAME,
                propertyValue: "Jeremy~^2+Desmarais~"
            }],
            limit: 5
        };

        const result = await matchService.reconcileByQueries(LanguageEnum.ENGLISH, { queries: [reconciliationQuery] }, "v2");
        console.log(JSON.stringify(result, null, 2));
        const candidate = result.results?.[0]?.candidates?.[0];
        expect(candidate.name).toBe("Jérémy Desmarais");
        expect(candidate.id).toBe("K2-2791");
    });

    it(`Reconcile person with name and wikidata ID`, async () => {
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PERSON,
            conditions: [
                {
                    matchType: MatchTypeEnum.NAME,
                    propertyValue: "Jérémy Desmarais"
                },
                {
                    matchType: MatchTypeEnum.PROPERTY,
                    propertyId: "http://schema.org/sameAs",
                    propertyValue: "http://www.wikidata.org/entity/Q111454795"
                }
            ],
            limit: 1
        };

        const result = await matchService.reconcileByQueries(LanguageEnum.ENGLISH, { queries: [reconciliationQuery] }, "v2");
        const candidate = result.results?.[0]?.candidates?.[0];
        expect(candidate).toBeDefined();
        expect(candidate.name).toBe("Jérémy Desmarais");
        expect(candidate.id).toBe("K2-2791");
    });

    // Match name by searching without accents
    // The lucene analylzer should be ascii folding to match "Jeremy" to "Jérémy"
    // NOTE: This is avandanced and may be commented out for future
    // it(`Reconcile person Jeremy Desmarais`, async () => {
    //     const reconciliationQuery: ReconciliationQuery = {
    //         type: Entities.PERSON,
    //         conditions: [{
    //             matchType: MatchTypeEnum.NAME,
    //             propertyValue: "Jeremy Desmarais"
    //         }],
    //         limit: 5
    //     };
    //
    //     const result = await matchService.reconcileByQueries(LanguageEnum.ENGLISH, { queries: [reconciliationQuery] }, "v2");
    //     const candidate = result.results?.[0]?.candidates?.[0];
    //     expect(candidate.name).toBe("Jérémy Desmarais");
    //     expect(candidate.id).toBe("K2-2791");
    // });

});

