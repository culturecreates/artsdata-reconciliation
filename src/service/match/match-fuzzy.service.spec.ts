import { MatchService } from "../../service";
import { ReconciliationQuery } from "../../dto";
import { Entities } from "../../constant";
import { MatchTypeEnum } from "../../enum";
import { LanguageEnum } from "../../enum";
import { setupMatchService } from "../../../test/test-util";

// Tests for fuzzy matching

// Word (token) analysis
// =========================
// Use quotes to escape multiple words
// In tests use 3 back slash: example: propertyValue: "\\\"Capitol Theatre\\\"~2"
// In SPARQL use 1 back slash "name:\"Capitol Theater\"" 
// using the "\\\"Capitol Theatre\\\"~2" means slop of 3, meaning the words "Capitol" and "Theater" can appear within 3 positions of each other in the text (allowing for up to 3 intervening words, or for the words to be swapped, etc.).


// Character (Edit Distance) analysis
// =========================
// Use edit distance with ~ followed by a number
// Example: "Jeremy~2" means find names that are within an edit distance of 2 from "Jeremy"
// A space between words means OR. Example: "Capitol Theatre" means find either "Capitol" OR "Theatre"
// Use + to replace a space for an exact match like: "Jeremy+Desmarais"
// Use AND if you want both words "Jeremy~2 AND Desmarais~2"

describe('Test fuzzy matching', () => {

    let matchService: MatchService;

    beforeAll(async () => {
        const setup = await setupMatchService();
        matchService = setup.matchService;
    });

    
    it(`Edit distance 2`, async () => {
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PERSON,
            conditions: [{
                matchType: MatchTypeEnum.NAME,
                propertyValue: "Jeremy~2 AND Desmarais~2"
            }],
            limit: 5
        };

        const result = await matchService.reconcileByQueries(LanguageEnum.ENGLISH, { queries: [reconciliationQuery] }, "v2");
        console.log(JSON.stringify(result, null, 2));
        const candidate = result.results?.[0]?.candidates?.[0];
        expect(candidate.name).toBe("Jérémy Desmarais");
        expect(candidate.id).toBe("K2-2791");
    });

    it(`Edit distance 1 will not find Jérémy`, async () => {
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PERSON,
            conditions: [{
                matchType: MatchTypeEnum.NAME,
                propertyValue: "Jeremy~1 AND Desmarais~1"
            }],
            limit: 5
        };

        const result = await matchService.reconcileByQueries(LanguageEnum.ENGLISH, { queries: [reconciliationQuery] }, "v2");
        console.log(JSON.stringify(result, null, 2));
        const candidate = result.results?.[0]?.candidates?.[0];
        expect(candidate).not.toBeDefined();
    });

    it(`Slop 3 will NOT find Jérémy in first place, but they will be in the top few`, async () => {
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PERSON,
            conditions: [{
                matchType: MatchTypeEnum.NAME,
                propertyValue: "\\\"Jeremy Desmarais\\\"~3"
            }],
            limit: 5
        };

        const result = await matchService.reconcileByQueries(LanguageEnum.ENGLISH, { queries: [reconciliationQuery] }, "v2");
        console.log(JSON.stringify(result, null, 2));
        const candidate = result.results?.[0]?.candidates?.[0];
        expect(candidate).not.toBeDefined();
    });

    it(`Slop 3 will find a longer phrase with Capitol Gallery`, async () => {
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{
                matchType: MatchTypeEnum.NAME,
                propertyValue: "\\\"Capitol Gallery\\\"~3"
            }],
            limit: 5
        };

        const result = await matchService.reconcileByQueries(LanguageEnum.ENGLISH, { queries: [reconciliationQuery] }, "v2");
        console.log(JSON.stringify(result, null, 2));
        const candidate = result.results?.[0]?.candidates?.[0];
        expect(candidate.name).toBe("Capitol Theatre Art Gallery");
    });

     it(`Reconcile Capitol Theatre as a phrase`, async () => {
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{
                matchType: MatchTypeEnum.NAME,
                propertyValue: "\\\"Capitol Theatre\\\""
            }],
            limit: 1
        };

        const result = await matchService.reconcileByQueries(LanguageEnum.ENGLISH, { queries: [reconciliationQuery] }, "v2");
        const candidate = result.results?.[0]?.candidates?.[0];
        expect(candidate.name).toBe("Capitol Theatre");
        expect(candidate.id).toBe("K11-116");
    });

    it(`Reconcile Capitol Theatre using character`, async () => {
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{
                matchType: MatchTypeEnum.NAME,
                propertyValue: "Capitol+Theatre"
            }],
            limit: 1
        };

        const result = await matchService.reconcileByQueries(LanguageEnum.ENGLISH, { queries: [reconciliationQuery] }, "v2");
        const candidate = result.results?.[0]?.candidates?.[0];
        expect(candidate.name).toBe("Capitol Theatre");
        expect(candidate.id).toBe("K11-116");
    });
});