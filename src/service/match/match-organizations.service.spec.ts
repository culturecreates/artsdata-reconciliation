import {Test, TestingModule} from "@nestjs/testing";
import {ManifestController, MatchController} from "../../controller";
import {ArtsdataService, HttpService, ManifestService, MatchService,} from "../../service";
import {ReconciliationQuery} from "../../dto";
import {Entities} from "../../constant";
import { MatchTypeEnum} from "../../enum";
import { LanguageEnum } from "../../enum";
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

    // exact id match for an Organization with multiple types
    it(`Reconcile an person entity with uri 'http://kg.artsdata.ca/resource/K5-198`, async () => {
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.ORGANIZATION,
            conditions: [{ 
                matchType: MatchTypeEnum.ID, 
                propertyValue: "http://kg.artsdata.ca/resource/K10-275" 
            }],
            limit: 1
        };

        const result = await matchService.reconcileByQueries(LanguageEnum.ENGLISH, { queries: [reconciliationQuery] }, "v2");
        const candidate = result.results?.[0]?.candidates?.[0];
        console.log(candidate);
        expect(candidate.id).toBe("K10-275");
        expect(candidate.type?.some(type => type.id === "http://schema.org/Organization")).toBeTruthy();
        expect(candidate.type?.some(type => type.id === "http://schema.org/PerformingGroup")).toBeTruthy();
    });

});

