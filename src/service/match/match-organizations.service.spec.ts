import {Test, TestingModule} from "@nestjs/testing";
import {ManifestController, MatchController} from "../../controller";
import {ArtsdataService, HttpService, ManifestService, MatchService,} from "../../service";
import {ReconciliationQuery} from "../../dto";
import {Entities} from "../../constant";
import {LanguageEnum, MatchTypeEnum} from "../../enum";


describe('Test reconciling organizations using sparql query version 2', () => {

    let matchService: MatchService;

    beforeAll(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [ManifestController, MatchController],
            providers: [ManifestService, MatchService, ArtsdataService, HttpService],
        }).compile();

        matchService = app.get<MatchService>(MatchService);
        const artsdataService = app.get<ArtsdataService>(ArtsdataService);
        await artsdataService.checkConnectionWithRetry();
    });


    async function executeAndCompareResults(expectedResult: {
        id: string;
        name: string;
        type: string;
        match: boolean;
        count: number
    }, reconciliationQuery: ReconciliationQuery) {

        const result = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, 'v2')

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

    it(`Reconcile a organization by name 'Ballet Jörgen', which is close match - `, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.ORGANIZATION,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Ballet Jörgen"}],
            limit: 1
        };

        const expectedResult = {
            id: "K10-29",
            name: "Canada's Ballet Jörgen",
            type: Entities.ORGANIZATION,
            match: false,
            count: 1
        }

        await executeAndCompareResults(expectedResult, reconciliationQuery);
    });

    it(`Reconcile an organization entity with uri 'http://kg.artsdata.ca/resource/K5-32`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.ORGANIZATION,
            conditions: [{matchType: MatchTypeEnum.ID, propertyValue: "http://kg.artsdata.ca/resource/K5-32"}],
            limit: 1
        };

        const expectedResult = {
            id: "K5-32",
            name: "La Chicane",
            type: Entities.ORGANIZATION,
            match: false,
            count: 1
        }

        await executeAndCompareResults(expectedResult, reconciliationQuery);
    });

});

