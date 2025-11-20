// In test-utils.ts
import {MatchService} from "../src/service";
import {ReconciliationQuery} from "../src/dto";
import {LanguageEnum} from "../src/enum";

export async function executeAndCompareResults(
    matchService: MatchService,
    expectedResult: {
        id: string;
        name: string;
        type: string;
        match: boolean;
        count: number
    },
    reconciliationQuery: ReconciliationQuery
) {
    const result = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
        {queries: [reconciliationQuery]}, 'v2');

    const allResults = result.results?.[0]?.candidates;
    const actualResult = allResults?.[0];

    if (expectedResult.id) {
        expect(actualResult?.id).toBe(expectedResult.id);
    }

    if (expectedResult.name) {
        expect(actualResult?.name).toBe(expectedResult.name);
    }

    if (expectedResult.count) {
        expect(expectedResult.count).toBe(allResults?.length);
    }

    if (expectedResult.type) {
        const expectedTypeUri = expectedResult.type.replace('schema:', 'http://schema.org/')
        expect(actualResult?.type?.some(type => type.id === expectedTypeUri)).toBeTruthy();
    }

    if (expectedResult.match) {
        expect(actualResult?.match).toBeTruthy();
    }
}