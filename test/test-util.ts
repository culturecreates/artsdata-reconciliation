// In test-utils.ts
import {MatchService} from "../src/service";
import {ReconciliationQuery} from "../src/dto";
import {LanguageEnum} from "../src/enum";
import { Test, TestingModule } from "@nestjs/testing";
import { ManifestController, MatchController } from "../src/controller";
import { ManifestService, ArtsdataService, HttpService } from "../src/service";

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

export async function setupMatchService() {
  const app: TestingModule = await Test.createTestingModule({
    controllers: [ManifestController, MatchController],
    providers: [ManifestService, MatchService, ArtsdataService, HttpService],
  }).compile();

  const matchService = app.get<MatchService>(MatchService);
  const artsdataService = app.get<ArtsdataService>(ArtsdataService);
  await artsdataService.checkConnectionWithRetry();

  return { matchService, app };
}