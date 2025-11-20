import {Test, TestingModule} from "@nestjs/testing";
import {ManifestController, MatchController} from "../../controller";
import {ArtsdataService, HttpService, ManifestService, MatchService,} from "../../service";
import {ReconciliationQuery} from "../../dto";
import {Entities} from "../../constant";
import { MatchTypeEnum} from "../../enum";
import {executeAndCompareResults, setupMatchService} from "../../../test/test-util";


describe('Test reconciling organizations using sparql query version 2', () => {

    let matchService: MatchService;

    beforeAll(async () => {
        const setup = await setupMatchService();
        matchService = setup.matchService;
    });

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

        await executeAndCompareResults(matchService, expectedResult, reconciliationQuery);
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

        await executeAndCompareResults(matchService, expectedResult, reconciliationQuery);
    });

});

