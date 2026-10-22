import {ExtendService} from "./extend.service";
import {ArtsdataService} from "../artsdata";
import {DataExtensionQueryDTO} from "../../dto/extend";
import {ArtsdataConstants} from "../../constant";

const R = ArtsdataConstants.PREFIX_ADR;
const SCHEMA = "http://schema.org/";
const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

const triple = (s: string, p: string, o: string) => `<${s}> <${p}> ${o} .`;
const uri = (value: string) => `<${value}>`;

describe('ExtendService CONSTRUCT query and N-Triples response', () => {
    let executeSparqlQuery: jest.Mock;
    let extendService: ExtendService;

    const extend = (query: DataExtensionQueryDTO, language?: string) =>
        extendService.getDataExtension(query, language);
    const sentQuery = (): string => executeSparqlQuery.mock.calls[0][0];

    beforeEach(() => {
        executeSparqlQuery = jest.fn().mockResolvedValue("");
        extendService = new ExtendService({executeSparqlQuery} as unknown as ArtsdataService);
    });

    describe('query', () => {
        it('Should construct triples from explicit statements only and ask for N-Triples', async () => {
            await extend({ids: ["K1-1"], properties: [{id: "name"}, {id: "startDate"}]});

            expect(sentQuery()).toContain("CONSTRUCT {");
            expect(sentQuery()).toContain("FROM <http://www.ontotext.com/explicit>");
            expect(sentQuery()).toContain("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>");
            expect(sentQuery()).toContain("PREFIX adp: <http://kg.artsdata.ca/plugin#>");
            expect(executeSparqlQuery).toHaveBeenCalledWith(expect.any(String), false, "application/n-triples");
        });

        it('Should read string properties with a single language and not with an OPTIONAL', async () => {
            await extend({
                ids: ["K1-1"],
                properties: [{id: "name"}, {id: "description"}, {id: "disambiguatingDescription"}, {id: "startDate"}]
            }, "fr");

            for (const property of ["name", "description", "disambiguatingDescription"]) {
                expect(sentQuery()).toContain(`BIND(adp:prefLangLiteral(?uri, schema:${property}, "fr") AS ?${property})`);
                expect(sentQuery()).not.toContain(`OPTIONAL { ?uri schema:${property} ?${property}`);
            }
            // not a string property: unchanged
            expect(sentQuery()).toContain("OPTIONAL { ?uri schema:startDate ?startDate . }");
        });

        it('Should read the string properties of an expanded entity with the same language', async () => {
            await extend({
                ids: ["K1-1"],
                properties: [{id: "location", settings: {content: "expand"}} as any]
            }, "en");

            expect(sentQuery()).toContain('BIND(adp:prefLangLiteral(?location, schema:name, "en") AS ?location_name)');
            expect(sentQuery()).toContain('BIND(adp:prefLangLiteral(?location, schema:description, "en") AS ?location_description)');
            expect(sentQuery()).toContain("OPTIONAL { ?location rdf:type ?location_type . }");
        });

        it('Should read the label of a linked entity with the requested language for a literal setting', async () => {
            await extend({
                ids: ["K1-1"],
                properties: [{id: "organizer", settings: {content: "literal"}} as any]
            }, "fr");

            expect(sentQuery()).toContain('BIND(adp:prefLangLiteral(?organizer_entity, schema:name, "fr") AS ?organizer)');
            expect(sentQuery()).toContain("FILTER(isLiteral(?organizer_literal))");
        });

        it.each([
            ["fr-CA,fr;q=0.9", "fr"],
            ["FR", "fr"],
            ["de", "en"],
            [undefined, "en"],
            ['en") } # injected', "en"],
        ])('Should resolve the language "%s" to "%s"', async (header, expected) => {
            await extend({ids: ["K1-1"], properties: [{id: "name"}]}, header as string);

            expect(sentQuery()).toContain(`schema:name, "${expected}")`);
        });
    });

    describe('response', () => {
        it('Should return an empty row, never null, for ids without data', async () => {
            executeSparqlQuery.mockResolvedValue(triple(`${R}K1-2`, `${SCHEMA}name`, '"Two"'));

            const result = await extend({ids: ["K1-1", "K1-2", "K1-3"], properties: [{id: "name"}]});

            expect(result.rows).toEqual([
                {id: "K1-1", properties: []},
                {id: "K1-2", properties: [{id: "name", values: [{str: "Two"}]}]},
                {id: "K1-3", properties: []},
            ]);
        });

        it('Should return one row per id, in the requested order, for a large request', async () => {
            const ids = Array.from({length: 50}, (_, i) => `K43-${12400 + i}`);
            // data for the first 35 only: the rest used to come back as null
            executeSparqlQuery.mockResolvedValue(ids.slice(0, 35)
                .map(id => triple(`${R}${id}`, `${SCHEMA}name`, `"Name ${id}"`)).join("\n"));

            const result = await extend({ids: [...ids].reverse(), properties: [{id: "name"}]});

            expect(result.rows).toHaveLength(50);
            expect(result.rows.every(row => row && Array.isArray(row.properties))).toBe(true);
            expect(result.rows.map(row => row.id)).toEqual([...ids].reverse());
        });

        it('Should return types and links as ids, strings with their language, and keep the property order', async () => {
            executeSparqlQuery.mockResolvedValue([
                triple(`${R}K1-1`, `${SCHEMA}name`, '"Event One"@en'),
                triple(`${R}K1-1`, RDF_TYPE, uri(`${SCHEMA}Event`)),
                triple(`${R}K1-1`, RDF_TYPE, uri(`${R.replace("resource/", "ontology/")}Event`)),
                triple(`${R}K1-1`, `${SCHEMA}sameAs`, uri("http://www.wikidata.org/entity/Q1")),
                triple(`${R}K1-1`, `${SCHEMA}url`, '"http://event-one.com"'),
            ].join("\n"));

            const result = await extend({
                ids: ["K1-1"],
                properties: [{id: RDF_TYPE}, {id: "name"}, {id: "sameAs"}, {id: "url"}]
            });

            expect(result.meta.map(m => m.id)).toEqual(["type", "name", "sameAs", "url"]);
            expect(result.rows).toEqual([{
                id: "K1-1",
                properties: [
                    {
                        id: "type", values: [{id: `${SCHEMA}Event`}, {id: "http://kg.artsdata.ca/ontology/Event"}]
                    },
                    {id: "name", values: [{str: "Event One", lang: "en"}]},
                    {id: "sameAs", values: [{id: "http://www.wikidata.org/entity/Q1"}]},
                    {id: "url", values: [{str: "http://event-one.com"}]},
                ]
            }]);
        });

        it('Should nest the properties of an expanded entity under the value of the property', async () => {
            executeSparqlQuery.mockResolvedValue([
                triple(`${R}K1-1`, `${SCHEMA}location`, uri(`${R}K11-25`)),
                triple(`${R}K1-2`, `${SCHEMA}location`, uri(`${R}K11-26`)),
                triple(`${R}K11-25`, `${SCHEMA}name`, '"Centaur Theatre"@en'),
                triple(`${R}K11-25`, RDF_TYPE, uri(`${SCHEMA}Place`)),
                triple(`${R}K11-26`, `${SCHEMA}name`, '"Another Place"@en'),
                // a triple about an entity nobody links to is ignored
                triple(`${R}K99-9`, `${SCHEMA}name`, '"Unrelated"@en'),
            ].join("\n"));

            const result = await extend({
                ids: ["K1-1", "K1-2"],
                properties: [{id: "location", settings: {content: "expand"}} as any]
            });

            expect(result.meta.map(m => m.id)).toEqual(["location"]);
            expect(result.rows).toEqual([
                {
                    id: "K1-1",
                    properties: [{
                        id: "location",
                        values: [{
                            id: "K11-25",
                            properties: [
                                {id: "name", values: [{str: "Centaur Theatre", lang: "en"}]},
                                {id: "type", values: [{id: `${SCHEMA}Place`}]},
                            ]
                        }]
                    }]
                },
                {
                    id: "K1-2",
                    properties: [{
                        id: "location",
                        values: [{
                            id: "K11-26",
                            properties: [{id: "name", values: [{str: "Another Place", lang: "en"}]}]
                        }]
                    }]
                },
            ]);
        });

        it('Should not repeat a value returned twice', async () => {
            const sameTriple = triple(`${R}K1-1`, `${SCHEMA}url`, '"http://event-one.com"');
            executeSparqlQuery.mockResolvedValue(`${sameTriple}\n${sameTriple}`);

            const result = await extend({ids: ["K1-1"], properties: [{id: "url"}]});

            expect(result.rows[0].properties).toEqual([{id: "url", values: [{str: "http://event-one.com"}]}]);
        });
    });
});
