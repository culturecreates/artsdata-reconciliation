import {MatchService,} from "../../service";
import {ReconciliationQuery} from "../../dto";
import {Entities} from "../../constant";
import {LanguageEnum, MatchTypeEnum} from "../../enum";
import {
    dropIndexAndTheGraph,
    setupMatchService,
    uploadDataSetAndCreateLuceneConnector
} from "../../../test/util/common-util";
import {IndexFileNameEnum} from "../../enum/index-names.enum";


describe('Test reconciling events using sparql query version 2', () => {

    let matchService: MatchService;
    const testDatasetPath = 'test/fixtures/files/events-with-name.ttl';

    beforeAll(async () => {
        const setup = await setupMatchService();
        matchService = setup.matchService;
        await uploadDataSetAndCreateLuceneConnector(IndexFileNameEnum.EVENT, testDatasetPath)
    });
    afterAll(async () => {
        await dropIndexAndTheGraph();
    })

    it('Reconcile an event with name `A Beacon in the Night`, which is exact match', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "A Beacon in the Night"}],
            limit: 1
        };

        const result = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});
        const allResults = result.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-1");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeFalsy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Event")?.id)
            .toBe("http://schema.org/Event");

    });

    it(`Reconcile an event entity with uri 'http://kg.artsdata.ca/resource/KE-4`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [{matchType: MatchTypeEnum.ID, propertyValue: "http://kg.artsdata.ca/resource/KE-4"}],
            limit: 1
        };

        const result = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});
        const allResults = result.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KE-4");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeTruthy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Event")?.id)
            .toBe("http://schema.org/Event");
    });
});

