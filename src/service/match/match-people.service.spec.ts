import { MatchService } from "../../service";
import { ReconciliationQuery } from "../../dto";
import { Entities } from "../../constant";
import { MatchTypeEnum } from "../../enum";
import { LanguageEnum } from "../../enum";
import {
    dropIndexAndTheGraph,
    setupMatchService,
    uploadDataSetAndCreateLuceneConnector
} from "../../../test/util/common-util";
import {IndexFileNameEnum} from "../../enum/index-names.enum";
import {MatchServiceHelper} from "../../helper";
import {SparqlVersionEnum} from "../../enum/sparql-versions.enum";


describe('Test matching person using sparql query v1', () => {

    let matchService: MatchService;
    const testDatasetPath = 'test/fixtures/files/places-people-and-organizations-with-name.ttl';
    let testLuceneConnectorId: string;
    let testGraphUri: string;

    beforeAll(async () => {
        const setup = await setupMatchService();
        matchService = setup.matchService;

        const {
            graphUri,
            luceneConnector
        } = await uploadDataSetAndCreateLuceneConnector(IndexFileNameEnum.PERSON, testDatasetPath)
        testGraphUri = graphUri;
        testLuceneConnectorId = luceneConnector;
        jest.spyOn(MatchServiceHelper, 'getGraphdbIndex').mockReturnValue(luceneConnector);
    });
    afterAll(async () => {
        await dropIndexAndTheGraph(testGraphUri, testLuceneConnectorId);
    })

    it('Reconcile a person with name `Persona bell`, which is exact match', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PERSON,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Persona bell"}],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KPR-1");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeTruthy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Person")?.id)
            .toBe("http://schema.org/Person");

    });

    it(`Reconcile an person entity with uri 'http://kg.artsdata.ca/resource/KPR-1`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PERSON,
            conditions: [{matchType: MatchTypeEnum.ID, propertyValue: "http://kg.artsdata.ca/resource/KPR-1"}],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KPR-1");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeTruthy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Person")?.id)
            .toBe("http://schema.org/Person");
    });

    it('Match initial in name without edit distance', async () => {

        // Words with less than 3 characters should not be considered in edit distance calculation, 
        // so "Warren H" should not match "Warren P. Sonoda"
        // and "Warren H" should not match "Garret T. Willie"
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PERSON,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Warren H"}],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});


        const allResults = response.results?.[0]?.candidates;
        expect(allResults?.some(result => result.id === "WarrenSonoda")).toBeFalsy();
        expect(allResults?.some(result => result.id === "GarretWillie")).toBeFalsy();
    });

     it('Match person with full name including initial ', async () => {
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PERSON,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Warren P. Sonoda"}],
            limit: 10
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]});


        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];
        expect(actualResult?.id).toBe("WarrenSonoda");
        expect(actualResult?.match).toBeTruthy();
    });


});

describe('Test reconciling person using sparql query version 2', () => {

    let matchService: MatchService;
    const testDatasetPath = 'test/fixtures/files/places-people-and-organizations-with-name.ttl';
    let testLuceneConnectorId: string;
    let testGraphUri: string;

    beforeAll(async () => {
        const setup = await setupMatchService();
        matchService = setup.matchService;

        const {
            graphUri,
            luceneConnector
        } = await uploadDataSetAndCreateLuceneConnector(IndexFileNameEnum.ALL_LITERALS, testDatasetPath)
        testGraphUri = graphUri;
        testLuceneConnectorId = luceneConnector;
        jest.spyOn(MatchServiceHelper, 'getGraphdbIndex').mockReturnValue(luceneConnector);
    });
    afterAll(async () => {
        await dropIndexAndTheGraph(testGraphUri, testLuceneConnectorId);
    })

    it('Reconcile an organization with name `Persona bell`, which is exact match', async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PERSON,
            conditions: [{matchType: MatchTypeEnum.NAME, propertyValue: "Persona bell"}],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V2);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KPR-1");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeTruthy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Person")?.id)
            .toBe("http://schema.org/Person");

    });

    it(`Reconcile an organization entity with uri 'http://kg.artsdata.ca/resource/KPR-1`, async () => {

        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PERSON,
            conditions: [{matchType: MatchTypeEnum.ID, propertyValue: "http://kg.artsdata.ca/resource/KPR-1"}],
            limit: 1
        };

        const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH,
            {queries: [reconciliationQuery]}, SparqlVersionEnum.V2);

        expect(response.results).toHaveLength(1);
        const allResults = response.results?.[0]?.candidates;
        const actualResult = allResults?.[0];

        expect(actualResult?.id).toBe("KPR-1");
        expect(allResults?.length).toBe(1);
        expect(actualResult?.match).toBeTruthy();
        expect(actualResult?.type?.find(type => type.id === "http://schema.org/Person")?.id)
            .toBe("http://schema.org/Person");
    });
});