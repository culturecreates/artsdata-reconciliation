import {MatchService} from "./match.service";
import {ArtsdataService} from "../artsdata";
import {ManifestService} from "../manifest";
import {ReconciliationQuery} from "../../dto";
import {Entities} from "../../constant";
import {LanguageEnum, MatchQuantifierEnum} from "../../enum";
import {SparqlVersionEnum} from "../../enum/sparql-versions.enum";
import {
    dropIndexAndTheGraph,
    setupMatchService,
    uploadDataSetAndCreateLuceneConnector
} from "../../../test/util/common-util";
import {IndexFileNameEnum} from "../../enum/index-names.enum";
import {MatchServiceHelper} from "../../helper";

describe('Exact match of a URI value on a property stored as a string or as an IRI, query v1', () => {

    describe('generated filter', () => {
        let executeSparqlQuery: jest.Mock;
        let matchService: MatchService;

        beforeEach(() => {
            executeSparqlQuery = jest.fn().mockResolvedValue({results: {bindings: []}});
            matchService = new MatchService({executeSparqlQuery} as unknown as ArtsdataService, {} as ManifestService);
        });

        const sparqlFor = async (propertyValue: string | string[], matchQuantifier?: MatchQuantifierEnum) => {
            await matchService.reconcileByQueries(LanguageEnum.ENGLISH, {
                queries: [{
                    type: Entities.PLACE,
                    conditions: [{
                        matchType: "property",
                        propertyId: "http://schema.org/url",
                        propertyValue,
                        required: true,
                        matchQuantifier
                    }],
                    limit: 10
                } as ReconciliationQuery]
            }, SparqlVersionEnum.V1);
            return executeSparqlQuery.mock.calls[0][0] as string;
        };

        it('Should compare STR() with the string of the IRI and the property with the IRI', async () => {
            const sparql = await sparqlFor("http://www.placebell.ca");

            expect(sparql).toContain('FILTER( STR(?obj_1)  = "http://www.placebell.ca" || ?obj_1 = <http://www.placebell.ca>)');
        });

        it('Should do the same for a list with any', async () => {
            const sparql = await sparqlFor(["http://a.ca", "http://b.ca"], MatchQuantifierEnum.ANY);

            expect(sparql).toContain('STR(?obj_1) IN ("http://a.ca" , "http://b.ca")');
            expect(sparql).toContain('?obj_1 IN (<http://a.ca> , <http://b.ca>)');
        });

        it.each([MatchQuantifierEnum.ALL, MatchQuantifierEnum.NONE])('Should do the same for a list with %s', async (quantifier) => {
            const sparql = await sparqlFor(["http://a.ca", "http://b.ca"], quantifier);

            expect(sparql).toContain('STR(?obj_1)  = "http://a.ca" || ?obj_1 = <http://a.ca>');
            expect(sparql).toContain('STR(?obj_1)  = "http://b.ca" || ?obj_1 = <http://b.ca>');
        });

        it('Should leave a value that is not an IRI as it is', async () => {
            const sparql = await sparqlFor("not a uri");

            expect(sparql).toContain('FILTER( STR(?obj_1)  = "not a uri" || ?obj_1 = "not a uri")');
        });
    });

    describe('data', () => {
        let matchService: MatchService;
        let testLuceneConnectorId: string;
        let testGraphUri: string;

        beforeAll(async () => {
            const setup = await setupMatchService();
            matchService = setup.matchService;
            const {graphUri, luceneConnector} = await uploadDataSetAndCreateLuceneConnector(
                IndexFileNameEnum.PLACE, 'test/fixtures/files/exact-uri-match.ttl');
            testGraphUri = graphUri;
            testLuceneConnectorId = luceneConnector;
            jest.spyOn(MatchServiceHelper, 'getGraphdbIndex').mockReturnValue(luceneConnector);
        });

        afterAll(async () => {
            await dropIndexAndTheGraph(testGraphUri, testLuceneConnectorId);
        });

        const idsFor = async (propertyId: string, propertyValue: string) => {
            const response = await matchService.reconcileByQueries(LanguageEnum.ENGLISH, {
                queries: [{
                    type: Entities.PLACE,
                    conditions: [{matchType: "property", propertyId, propertyValue, required: true}],
                    limit: 10
                } as ReconciliationQuery]
            }, SparqlVersionEnum.V1);
            return response.results?.[0]?.candidates?.map(({id}) => id);
        };

        it.each([
            ["http://schema.org/url", "http://www.literal-url.ca", "KU-1"],
            ["http://schema.org/url", "http://www.iri-url.ca", "KU-2"],
            ["http://schema.org/sameAs", "http://www.wikidata.org/entity/Q100", "KU-1"],
            ["http://schema.org/sameAs", "http://www.wikidata.org/entity/Q200", "KU-2"],
        ])('Should find the place with %s %s whether it is stored as a string or as an IRI', async (propertyId, value, expectedId) => {
            expect(await idsFor(propertyId, value)).toEqual([expectedId]);
        });
    });
});
