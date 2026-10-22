import {MatchService} from "./match.service";
import {ArtsdataService} from "../artsdata";
import {ManifestService} from "../manifest";
import {Entities} from "../../constant";
import {LanguageEnum, MatchQualifierEnum} from "../../enum";
import {SparqlVersionEnum} from "../../enum/sparql-versions.enum";
import {ReconciliationQuery} from "../../dto";

describe('Test v1 match SPARQL when there is no literal string to search in the Lucene index', () => {

    let matchService: MatchService;
    let executeSparqlQuery: jest.Mock;

    const regexUrlCondition = {
        matchType: "property",
        propertyId: "http://schema.org/url",
        propertyValue: "culturecreates.com",
        required: true,
        matchQualifier: MatchQualifierEnum.REGEX_MATCH
    };

    const regexDescriptionCondition = {
        matchType: "property",
        propertyId: "http://schema.org/description",
        propertyValue: "festival",
        required: true,
        matchQualifier: MatchQualifierEnum.REGEX_MATCH
    };

    const reconcile = async (query: ReconciliationQuery) =>
        matchService.reconcileByQueries(LanguageEnum.ENGLISH, {queries: [query]}, SparqlVersionEnum.V1);

    beforeEach(() => {
        executeSparqlQuery = jest.fn().mockResolvedValue({results: {bindings: []}});
        matchService = new MatchService(
            {executeSparqlQuery} as unknown as ArtsdataService,
            {} as ManifestService
        );
    });

    it('Should not use the Lucene index and should score +1 for the type and +1 per required condition', async () => {
        await reconcile({
            type: Entities.ORGANIZATION,
            conditions: [regexUrlCondition, regexDescriptionCondition],
            limit: 10
        } as ReconciliationQuery);

        expect(executeSparqlQuery).toHaveBeenCalledTimes(1);
        const sparql: string = executeSparqlQuery.mock.calls[0][0];
        expect(sparql).not.toContain('luc:query');
        expect(sparql).not.toContain('luc:entities');
        expect(sparql).not.toContain('luc:score');
        expect(sparql).toContain('BIND(3 AS ?total_score)');
    });

    it('Should return no candidates without querying when only a type and non-required conditions are given', async () => {
        const response = await reconcile({
            type: Entities.ORGANIZATION,
            conditions: [{...regexUrlCondition, required: false}],
            limit: 10
        } as ReconciliationQuery);

        expect(executeSparqlQuery).not.toHaveBeenCalled();
        expect(response.results).toEqual([{candidates: []}]);
    });

    it('Should return no candidates without querying when nothing can bind the entity', async () => {
        const response = await reconcile({
            conditions: [{...regexUrlCondition, required: false}],
            limit: 10
        } as ReconciliationQuery);

        expect(executeSparqlQuery).not.toHaveBeenCalled();
        expect(response.results).toEqual([{candidates: []}]);
    });

    it('Should still use the Lucene index when a name is provided', async () => {
        await reconcile({
            type: Entities.ORGANIZATION,
            conditions: [
                {matchType: "name", propertyValue: "Culture Creates", required: true},
                regexUrlCondition
            ],
            limit: 10
        } as ReconciliationQuery);

        const sparql: string = executeSparqlQuery.mock.calls[0][0];
        expect(sparql).toContain('luc:query');
        expect(sparql).toContain('luc:entities');
        expect(sparql).toContain('luc:score');
    });

    it('Should still use the Lucene index for an exact Lucene-mapped property without a name', async () => {
        await reconcile({
            type: Entities.ORGANIZATION,
            conditions: [{
                matchType: "property",
                propertyId: "http://schema.org/url",
                propertyValue: "https://culturecreates.com",
                required: true
            }],
            limit: 10
        } as ReconciliationQuery);

        const sparql: string = executeSparqlQuery.mock.calls[0][0];
        expect(sparql).toContain('luc:query');
    });
});

describe('Test ORDER BY DESC(?total_score) ?startDate in v1 match SPARQL', () => {
    let executeSparqlQuery: jest.Mock;
    let matchService: MatchService;

    beforeEach(() => {
        executeSparqlQuery = jest.fn().mockResolvedValue({results: {bindings: []}});
        matchService = new MatchService({executeSparqlQuery} as unknown as ArtsdataService, {} as ManifestService);
    });

    it.each([
        [Entities.EVENT, true],
        [Entities.ORGANIZATION, false],
    ])('type %s should add ORDER BY DESC(?total_score) ?startDate: %s', async (type, expected) => {
        await matchService.reconcileByQueries(LanguageEnum.ENGLISH, {
            queries: [{
                type,
                conditions: [{matchType: "name", propertyValue: "Some name", required: true}],
                limit: 10
            } as ReconciliationQuery]
        }, SparqlVersionEnum.V1);

        const sparql: string = executeSparqlQuery.mock.calls[0][0];
        expect(sparql.includes('ORDER BY DESC(?total_score) ?startDate')).toBe(expected);
    });
});

describe('Test the properties searched in the Lucene index by v1 match', () => {
    let executeSparqlQuery: jest.Mock;
    let matchService: MatchService;

    beforeEach(() => {
        executeSparqlQuery = jest.fn().mockResolvedValue({results: {bindings: []}});
        matchService = new MatchService({executeSparqlQuery} as unknown as ArtsdataService, {} as ManifestService);
    });

    const lucene = async (type: string, propertyId: string, propertyValue: string) => {
        await matchService.reconcileByQueries(LanguageEnum.ENGLISH, {
            queries: [{
                type,
                conditions: [{matchType: "property", propertyId, propertyValue, required: false, matchQuantifier: "any"}],
                limit: 10
            } as ReconciliationQuery]
        }, SparqlVersionEnum.V1);
        return executeSparqlQuery.mock.calls[0]?.[0] as string | undefined;
    };

    it.each([
        [Entities.PLACE, "<http://schema.org/address>/<http://schema.org/postalCode>", "H2X 1Y4", "postalCode:"],
        [Entities.PLACE, "<http://schema.org/address>/<http://schema.org/addressRegion>", "Quebec", "addressRegion:"],
        [Entities.EVENT, "<http://schema.org/location>/<http://schema.org/name>", "Centaur", "locationName:"],
        [Entities.EVENT, "<https://schema.org/location>/<https://schema.org/name>", "Centaur", "locationName:"],
        [Entities.EVENT, "<http://schema.org/location>/<http://schema.org/address>/<http://schema.org/postalCode>", "H2Y 1T5", "locationPostalCode:"],
    ])('Should search %s property %s in the Lucene index', async (type, propertyId, value, field) => {
        const sparql = await lucene(type, propertyId, value);

        expect(sparql).toContain('luc:query');
        expect(sparql).toContain(field);
    });

    it.each([
        [Entities.PLACE, "<http://schema.org/address>/<http://schema.org/addressLocality>", "Montreal"],
        [Entities.EVENT, "<http://schema.org/performer>/<http://schema.org/name>", "A performer"],
    ])('Should not query when %s only has the property %s, which is not indexed', async (type, propertyId, value) => {
        const sparql = await lucene(type, propertyId, value);

        expect(sparql).toBeUndefined();
    });
});
