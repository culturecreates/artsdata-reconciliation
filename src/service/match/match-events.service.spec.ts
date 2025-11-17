import {Test, TestingModule} from "@nestjs/testing";
import {ManifestController, MatchController} from "../../controller";
import {ArtsdataService, HttpService, ManifestService, MatchService,} from "../../service";
import {ReconciliationQuery, ReconciliationResponse} from "../../dto";
import {Entities} from "../../constant";
import {LanguageEnum, MatchTypeEnum} from "../../enum";


describe('Test reconciling events using sparql query version 2', () => {

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

    it('Reconcile an event with name `Émile Bilodeau`, which is exact match', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Émile Bilodeau"}],
            limit: 1
        };

        const expectedResult = {
            id: "http://kg.artsdata.ca/resource/K23-5524",
            name: "Émile Bilodeau",
            type: Entities.EVENT,
            match: false,
            count: 1
        }

        await executeAndCompareResults(expectedResult, reconciliationQuery);
    });

    it(`Reconcile an event entity with uri 'http://kg.artsdata.ca/resource/K23-5524`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "http://kg.artsdata.ca/resource/K23-5524"}],
            limit: 1
        };

        const expectedResult = {
            id: "http://kg.artsdata.ca/resource/K23-5524",
            name: "Émile Bilodeau",
            type: Entities.EVENT,
            match: false,
            count: 1
        }

        await executeAndCompareResults(expectedResult, reconciliationQuery);
    });
});

