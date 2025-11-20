import {Test, TestingModule} from "@nestjs/testing";
import {ManifestController, MatchController} from "../../controller";
import {ArtsdataService, HttpService, ManifestService, MatchService,} from "../../service";
import {ReconciliationQuery, ReconciliationResponse} from "../../dto";
import {Entities} from "../../constant";
import {MatchTypeEnum} from "../../enum";
import {executeAndCompareResults} from "../../../test/test-util";


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

    it('Reconcile a place with name `Roy Thomson Hall`, which is exact match', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Roy Thomson Hall"}],
            limit: 1
        };

        const expectedResult = {
            id: "K11-19",
            name: "Roy Thomson Hall",
            type: Entities.PLACE,
            match: false,
            count: 1
        }

        await executeAndCompareResults(matchService, expectedResult, reconciliationQuery);
    });

    it(`Reconcile a place entity with name 'Roy Thomson', which is a close match`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Roy Thomson"}],
            limit: 1
        };

        const expectedResult = {
            id: "K11-19",
            name: "Roy Thomson Hall",
            type: Entities.PLACE,
            match: false,
            count: 1
        }

        await executeAndCompareResults(matchService, expectedResult, reconciliationQuery);
    });

    it(`Reconcile a place entity with name 'Thomson Hall', which is a close match`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Thomson Hall"}],
            limit: 1
        };

        const expectedResult = {
            id: "K11-19",
            name: "Roy Thomson Hall",
            type: Entities.PLACE,
            match: false,
            count: 1
        }

        await executeAndCompareResults(matchService, expectedResult, reconciliationQuery);
    });

    it(`Reconcile a place entity with accented name 'Amphithéâtre Cogeco', which is close match`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Amphithéâtre Cogeco"}],
            limit: 1
        };

        const expectedResult = {
            id: "K5-463",
            name: "Amphithéâtre Cogeco",
            type: Entities.PLACE,
            match: false,
            count: 1
        }

        await executeAndCompareResults(matchService, expectedResult, reconciliationQuery);
    });

    it(`Reconcile an place entity with uri 'http://kg.artsdata.ca/resource/K11-192`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{matchType: MatchTypeEnum.ID, propertyValue: "http://kg.artsdata.ca/resource/K11-192"}],
            limit: 1
        };

        const expectedResult = {
            id: "K11-192",
            name: "Sanderson Centre",
            type: Entities.PLACE,
            match: false,
            count: 1
        }

        await executeAndCompareResults(matchService, expectedResult, reconciliationQuery);
    });
});

