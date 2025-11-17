import {Test, TestingModule} from "@nestjs/testing";
import {ManifestController, MatchController} from "../../controller";
import {ArtsdataService, HttpService, ManifestService, MatchService,} from "../../service";
import {ReconciliationQuery} from "../../dto";
import {Entities} from "../../constant";
import {LanguageEnum, MatchTypeEnum} from "../../enum";


describe('Test reconciling places using sparql query version 2', () => {

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

    it('Reconcile a place entity with name, which is close match', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PERSON,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Jérémy De"}],
            limit: 1
        };

        const expectedResult = {
            id: "http://kg.artsdata.ca/resource/K2-2791",
            name: "Jérémy Desmarais",
            type: Entities.PERSON,
            match: false,
            count: 1
        }

        await executeAndCompareResults(expectedResult, reconciliationQuery);
    });

});

