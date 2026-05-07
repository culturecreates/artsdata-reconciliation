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
import {MatchServiceHelper} from "../../helper";


describe('Test reconciling using fuzzy search v1', () => {

    let matchService: MatchService;
    const testDatasetPath = 'test/fixtures/files/places-for-fuzzy-search.ttl';
    let testLuceneConnectorId: string;
    let testGraphUri: string;

    beforeAll(async () => {
        const setup = await setupMatchService();
        matchService = setup.matchService;

        const {
            graphUri,
            luceneConnector
        } = await uploadDataSetAndCreateLuceneConnector(IndexFileNameEnum.PLACE, testDatasetPath)
        testGraphUri = graphUri;
        testLuceneConnectorId = luceneConnector;
        jest.spyOn(MatchServiceHelper, 'getGraphdbIndex').mockReturnValue(luceneConnector);
    });
    afterAll(async () => {
        await dropIndexAndTheGraph(testGraphUri, testLuceneConnectorId);
    })

    it('Reconcile an place with name `Theatre`, which is fuzzy match to \'Théâtre de la Cour des Arts\'', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Theatre"}],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KP-4");

    });

    it('Reconcile an place with name `Helene Larochelle`, which is fuzzy match to \'Centre de plein air Hélène Larochelle\'', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Helene Larochelle"}],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KP-5");

    });

    it('Reconcile an place with name `Helene Larochéllé`, which is fuzzy match with edit distance 2 \'Centre de plein air Hélène Larochelle\'', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Helene Larochéllé"}],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KP-5");

    });

    it('Reconcile an place with name `Helén Larochel`, which should match, since edit distance 2 match to \'Centre de plein air Hélène Larochelle\'', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Hélèn Larochel"}],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KP-5");
    });

    it('Reconcile an place with name `Helén Larochel`, which should not match, since edit distance 2 doesnt match to \'Centre de plein air Hélène Larochelle\'', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Helén Larochel"}],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        const allResults = response.results?.[0]?.candidates;
        expect(allResults).toHaveLength(0);
    });




});

