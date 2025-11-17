import {Test, TestingModule} from "@nestjs/testing";
import {ManifestController, MatchController} from "../../controller";
import {ArtsdataService, HttpService, ManifestService, MatchService,} from "../../service";
import {ReconciliationQuery, ReconciliationResponse} from "../../dto";
import {Entities} from "../../constant";
import {LanguageEnum, MatchTypeEnum} from "../../enum";


describe('Test reconciling people using sparql query version 2', () => {

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

    it('Reconcile a place entity with name, which is exact match', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Roy Thomson Hall"}],
            limit: 1
        };

        const expectedResult = {
            id: "http://kg.artsdata.ca/resource/K11-19",
            name: "Roy Thomson Hall",
            type: Entities.PLACE,
            match: false,
            count: 1
        }

        await executeAndCompareResults(expectedResult, reconciliationQuery);
    });

    it(`Reconcile a place entity with name, which is close match - 'Roy Thomson'`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Roy Thomson"}],
            limit: 1
        };

        const expectedResult = {
            id: "http://kg.artsdata.ca/resource/K11-19",
            name: "Roy Thomson Hall",
            type: Entities.PLACE,
            match: false,
            count: 1
        }

        await executeAndCompareResults(expectedResult, reconciliationQuery);
    });

    it(`Reconcile a place entity with name, which is close match - 'Thomson Hall'`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Thomson Hall"}],
            limit: 1
        };

        const expectedResult = {
            id: "http://kg.artsdata.ca/resource/K11-19",
            name: "Roy Thomson Hall",
            type: Entities.PLACE,
            match: false,
            count: 1
        }

        await executeAndCompareResults(expectedResult, reconciliationQuery);
    });

    it(`Reconcile a place entity with accented name, which is close match - 'Amphithéâtre Cogeco'`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Amphithéâtre Cogeco"}],
            limit: 1
        };

        const expectedResult = {
            id: "http://kg.artsdata.ca/resource/K5-463",
            name: "Amphithéâtre Cogeco",
            type: Entities.PLACE,
            match: false,
            count: 1
        }

        await executeAndCompareResults(expectedResult, reconciliationQuery);
    });
});

