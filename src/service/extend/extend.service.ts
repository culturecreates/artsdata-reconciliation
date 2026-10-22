import {Injectable} from "@nestjs/common";
import {ArtsdataService} from "../artsdata";
import {ArtsdataConstants, EXTEND_QUERY, PREFIXES, PROPOSED_EXTEND_PROPERTIES_METADATA} from "../../constant";
import {Exception, MatchServiceHelper} from "../../helper";
import {
    DataExtensionQueryDTO,
    DataExtensionResponseDTO,
    ExtendQueryProperty,
    ProposedExtendProperty
} from "../../dto/extend";
import {QUERY_BY_GRAPH} from "../../constant/extend/query-by-graph.constants";
import {
    ExpandablePropertyEnum,
    ExtendExternalGraphTypeEnum,
    ExtendPropertySettingsEnum,
    LanguageEnum,
    ProposedEntityTypeEnum
} from "../../enum";
import {
    DEFAULT_LITERAL_PROPERTIES,
    EXPANDABLE_PROPERTIES,
    LANGUAGE_LITERAL_PROPERTIES
} from "../../constant/extend/expandable-properties.constants";
import {FEATURE_FLAG} from "../../config";
import {Literal, Parser as N3Parser, Term} from "n3";

const N_TRIPLES_MEDIA_TYPE = "application/n-triples";

/**
 * A variable of the extend query and where its values come from: the triples with this predicate about the
 * entity, or, when `parent` is set, about the entity linked by the `parent` variable (an expanded property).
 */
interface ExtendSlot {
    variable: string;
    predicate: string;
    parent?: string;
}

interface ExtendPropertyParts {
    pattern: string;
    constructTriples: string[];
    slots: ExtendSlot[];
}

@Injectable()
export class ExtendService {

    constructor(private readonly _artsdataService: ArtsdataService) {
    }


    async getDataExtension(dataExtensionQuery: DataExtensionQueryDTO, requestLanguage: string = LanguageEnum.ENGLISH) {
        const {sparqlQuery, slots} = this._generateQuery(dataExtensionQuery, this._resolveLanguage(requestLanguage));
        const expandProperties = dataExtensionQuery.properties
            .filter(property => property.settings?.content === ExtendPropertySettingsEnum.EXPAND);
        const result = await this._artsdataService.executeSparqlQuery(sparqlQuery, false, N_TRIPLES_MEDIA_TYPE);
        const formattedResult = this._formatResult(dataExtensionQuery.ids, slots, result);

        if (expandProperties.length > 0) {
            const expandedPropertyPrefixes = expandProperties.map(property => `${property.id}_`);

            formattedResult.rows.forEach(row => {
                expandProperties.forEach(property => {
                    const propertyPrefix = `${property.id}_`;
                    const expandedProperties = row?.properties.filter(item => item.id.startsWith(propertyPrefix));

                    if (expandedProperties?.length) {
                        const properties = expandedProperties.map(prop => {
                            row.properties = row.properties.filter(item => item.id !== prop.id);
                            return {id: prop.id.split(propertyPrefix).pop(), values: prop.values};
                        });

                        const expandingProperty = row.properties.find(item => item.id === property.id);
                        if (expandingProperty?.values?.[0]) {
                            (expandingProperty.values[0] as any)["properties"] = properties;
                        }
                    }
                });
            });

            formattedResult.meta = formattedResult.meta.filter(
                item => !expandedPropertyPrefixes.some(prefix => item.id.startsWith(prefix))
            );
        }

        return formattedResult;
    }

    getProposedProperties(entityType: ProposedEntityTypeEnum): ProposedExtendProperty {
        switch (entityType) {
            case ProposedEntityTypeEnum.EVENT:
                return PROPOSED_EXTEND_PROPERTIES_METADATA.EVENT;
            case ProposedEntityTypeEnum.PLACE:
                return PROPOSED_EXTEND_PROPERTIES_METADATA.PLACE;
            case ProposedEntityTypeEnum.PERSON:
                return PROPOSED_EXTEND_PROPERTIES_METADATA.PERSON;
            case ProposedEntityTypeEnum.ORGANIZATION:
                return PROPOSED_EXTEND_PROPERTIES_METADATA.ORGANIZATION;
            case ProposedEntityTypeEnum.AGENT:
                return PROPOSED_EXTEND_PROPERTIES_METADATA.AGENT;
            case ProposedEntityTypeEnum.CONCEPT:
                return PROPOSED_EXTEND_PROPERTIES_METADATA.CONCEPT;
            case ProposedEntityTypeEnum.LIVE_PERFORMANCE_WORK:
            case ProposedEntityTypeEnum.PERFORMANCE_WORK:
                return PROPOSED_EXTEND_PROPERTIES_METADATA.LIVE_PERFORMANCE_WORK;
            default:
                throw Exception.badRequest("Invalid entity type");
        }
    }

    /**
     * Only languages we know are interpolated into the query; anything else falls back to English.
     * Handles header values such as "fr-CA,fr;q=0.9".
     */
    private _resolveLanguage(requestLanguage: string): string {
        const language = `${requestLanguage ?? ""}`.split(",")[0].split(";")[0].trim().slice(0, 2).toLowerCase();
        return Object.values(LanguageEnum).includes(language as LanguageEnum) ? language : LanguageEnum.ENGLISH;
    }

    private _toEntityUri(id: string): string {
        return MatchServiceHelper.isValidURI(id) ? id.trim() : `${ArtsdataConstants.PREFIX_ADR}${id.trim()}`;
    }

    private _generateQuery(dataExtensionQuery: DataExtensionQueryDTO, language: string) {
        const {ids, properties} = dataExtensionQuery;

        // Generate URIs with prefix if necessary
        const uriPlaceholder = ids.map(id => `(<${this._toEntityUri(id)}>)`).join(" ");

        // Generate property patterns, the triples to construct and the variables to read them back from
        const parts = properties.map(property => this._generateTripleFromCondition(property, language));
        const slots: ExtendSlot[] = parts.flatMap(part => part.slots);

        const query = EXTEND_QUERY
            .replace("<CONSTRUCT_PLACE_HOLDER>", parts.flatMap(part => part.constructTriples).join("\n"))
            .replace("<URI_PLACE_HOLDER>", uriPlaceholder)
            .replace("<TRIPLES_PLACE_HOLDER>", parts.map(part => part.pattern).join(""));

        return {sparqlQuery: query, slots};
    }

    /**
     * @private
     * @name _isLanguageLiteralProperty
     * @description Properties holding strings or language strings, read with `adp:prefLangLiteral`
     */
    private _isLanguageLiteralProperty(predicate: string): boolean {
        return LANGUAGE_LITERAL_PROPERTIES.some(property => predicate === `${PREFIXES.SCHEMA}${property}`);
    }

    private _generateTripleFromCondition(property: ExtendQueryProperty, language: string): ExtendPropertyParts {
        const {id, settings} = property;

        let objectId = id;

        if (MatchServiceHelper.isValidURI(id)) {

            const supportedPrefixes = [PREFIXES.SCHEMA, PREFIXES.RDF, PREFIXES.ADO];
            const matchedPrefix = supportedPrefixes.find(prefix => id.startsWith(prefix));

            if (!matchedPrefix) {
                Exception.badRequest("This URI is not supported.");
            } else {
                objectId = id.slice(matchedPrefix.length);
            }
        }
        const predicateIri = MatchServiceHelper.isValidURI(id) ? id : `${PREFIXES.SCHEMA}${objectId}`;
        const predicate = MatchServiceHelper.isValidURI(id) ? `<${id}>` : `schema:${objectId}`;
        const slots: ExtendSlot[] = [{variable: objectId, predicate: predicateIri}];

        if (settings?.content === ExtendPropertySettingsEnum.LITERAL) {
            return this._generateLiteralTriple(objectId, predicate, predicateIri, language);
        }

        if (settings?.content !== ExtendPropertySettingsEnum.EXPAND) {
            return {
                pattern: this._valuePattern("?uri", predicate, predicateIri, objectId, language),
                constructTriples: [`?uri ${predicate} ?${objectId} .`],
                slots
            };
        }

        const expandedProperties = this._getExpandableProperties(id);
        if (!expandedProperties.length) {
            console.log("No expanded properties found for id: ", id);
        }
        const constructTriples = [`?uri ${predicate} ?${objectId} .`];
        const expandedPatterns = expandedProperties.map(prop => {
            const subPredicate = prop === "type" ? "rdf:type" : `schema:${prop}`;
            const subPredicateIri = prop === "type" ? `${PREFIXES.RDF}type` : `${PREFIXES.SCHEMA}${prop}`;
            constructTriples.push(`?${objectId} ${subPredicate} ?${objectId}_${prop} .`);
            slots.push({variable: `${objectId}_${prop}`, predicate: subPredicateIri, parent: objectId});
            return this._valuePattern(`?${objectId}`, subPredicate, subPredicateIri, `${objectId}_${prop}`, language);
        });

        return {
            pattern: `OPTIONAL { ?uri ${predicate} ?${objectId} .\n${expandedPatterns.join("")}}\n`,
            constructTriples,
            slots
        };
    }

    /**
     * @private
     * @name _valuePattern
     * @description Pattern binding `?variable` to the value(s) of `predicate` on `subject`. String and language
     * string properties are bound with `adp:prefLangLiteral`, which returns one literal in the requested language
     * instead of one row per language; the other properties keep a plain OPTIONAL.
     */
    private _valuePattern(subject: string, predicate: string, predicateIri: string, variable: string, language: string) {
        if (this._isLanguageLiteralProperty(predicateIri)) {
            return `BIND(adp:prefLangLiteral(${subject}, ${predicate}, "${language}") AS ?${variable})\n`;
        }
        return `OPTIONAL { ${subject} ${predicate} ?${variable} . }\n`;
    }

    /**
     * @name _generateLiteralTriple
     * @description Builds the patterns for a property requested with `settings.content = literal`.
     * A literal value of the property is kept as is. When the property links to an entity, the literal that
     * labels the linked entity (for example `schema:organizer/schema:name`) is read with `adp:prefLangLiteral`,
     * so a single value in the requested language is returned. Both cases are constructed with the property's
     * predicate, so the response keeps a single `literal` value per property and needs no post-processing.
     * @private
     */
    private _generateLiteralTriple(objectId: string, predicate: string, predicateIri: string, language: string): ExtendPropertyParts {
        const slots: ExtendSlot[] = [{variable: objectId, predicate: predicateIri}];

        if (this._isLanguageLiteralProperty(predicateIri)) {
            return {
                pattern: this._valuePattern("?uri", predicate, predicateIri, objectId, language),
                constructTriples: [`?uri ${predicate} ?${objectId} .`],
                slots
            };
        }

        const labelProperty = DEFAULT_LITERAL_PROPERTIES.find(prop => this._isLanguageLiteralProperty(`${PREFIXES.SCHEMA}${prop}`))
            ?? DEFAULT_LITERAL_PROPERTIES[0];
        return {
            pattern: `OPTIONAL { ?uri ${predicate} ?${objectId}_literal . FILTER(isLiteral(?${objectId}_literal)) }
                OPTIONAL { ?uri ${predicate} ?${objectId}_entity . FILTER(!isLiteral(?${objectId}_entity))
                    BIND(adp:prefLangLiteral(?${objectId}_entity, schema:${labelProperty}, "${language}") AS ?${objectId}) }\n`,
            constructTriples: [`?uri ${predicate} ?${objectId}_literal .`, `?uri ${predicate} ?${objectId} .`],
            slots
        };
    }

    /**
     * @name _getExpandableProperties
     * @description Returns the properties used to describe the entity linked by an expandable
     * property, or the given fallback when the property is not expandable.
     * @private
     */
    private _getExpandableProperties(id: string, fallback: string[] = []): string[] {
        switch (id as ExpandablePropertyEnum) {
            case ExpandablePropertyEnum.LOCATION:
                return EXPANDABLE_PROPERTIES.LOCATION;
            case ExpandablePropertyEnum.ADDRESS:
                return EXPANDABLE_PROPERTIES.ADDRESS;
            case ExpandablePropertyEnum.PERFORMER:
                return EXPANDABLE_PROPERTIES.PERFORMER;
            case ExpandablePropertyEnum.ORGANIZER:
                return EXPANDABLE_PROPERTIES.ORGANIZER;
            case ExpandablePropertyEnum.OFFERS:
                return EXPANDABLE_PROPERTIES.OFFERS;
            default:
                return fallback;
        }
    }

    /**
     * @private
     * @name _formatResult
     * @description Rebuilds one row per requested id from the N-Triples returned by the CONSTRUCT query. Triples
     * about the entity are matched to the requested property by predicate; triples about an expanded entity
     * (a location, performer...) are added to the `<property>_<sub property>` value of every entity that links to it.
     * Every requested id gets a row, empty when nothing was found.
     */
    private _formatResult(ids: string[], slots: ExtendSlot[], result: string): DataExtensionResponseDTO {
        const entityUris = ids.map(id => this._toEntityUri(id));
        const valuesByEntity = new Map<string, Map<string, any[]>>(entityUris.map(uri => [uri, new Map()]));
        // entity uri -> expanded property variable -> uris of the linked entities
        const linkedEntities = new Map<string, Map<string, Set<string>>>(entityUris.map(uri => [uri, new Map()]));
        const mainSlots = slots.filter(slot => !slot.parent);
        const subSlots = slots.filter(slot => slot.parent);

        const addValue = (entityUri: string, variable: string, term: Term) => {
            const entityValues = valuesByEntity.get(entityUri)!;
            const values = entityValues.get(variable) ?? [];
            const value = this._toValue(term);
            if (!values.some(existing => existing.id === value.id && existing.str === value.str && existing.lang === value.lang)) {
                values.push(value);
            }
            entityValues.set(variable, values);
        };

        const quads = new N3Parser({format: "N-Triples"}).parse(result ?? "");

        for (const {subject, predicate, object} of quads) {
            const mainSlot = mainSlots.find(slot => slot.predicate === predicate.value);
            if (mainSlot && valuesByEntity.has(subject.value)) {
                addValue(subject.value, mainSlot.variable, object);
                if (subSlots.some(slot => slot.parent === mainSlot.variable)) {
                    const linked = linkedEntities.get(subject.value)!;
                    linked.set(mainSlot.variable, (linked.get(mainSlot.variable) ?? new Set()).add(object.value));
                }
            }
        }

        for (const {subject, predicate, object} of quads) {
            for (const slot of subSlots.filter(subSlot => subSlot.predicate === predicate.value)) {
                for (const [entityUri, linked] of linkedEntities) {
                    if (linked.get(slot.parent!)?.has(subject.value)) {
                        addValue(entityUri, slot.variable, object);
                    }
                }
            }
        }

        const rows = entityUris.map(uri => ({
            id: uri.startsWith(ArtsdataConstants.PREFIX_ADR) ? uri.slice(ArtsdataConstants.PREFIX_ADR.length) : uri,
            properties: slots
                .filter(slot => valuesByEntity.get(uri)!.has(slot.variable))
                .map(slot => ({id: slot.variable, values: valuesByEntity.get(uri)!.get(slot.variable)!}))
        }));
        const meta = slots.map(({variable}) => ({id: variable, name: variable}));

        return {
            meta,
            rows
        };
    }

    private _toValue(term: Term): any {
        if (term.termType === "Literal") {
            return {str: term.value, lang: (term as Literal).language || undefined};
        }
        if (term.termType === "NamedNode" && term.value.startsWith(ArtsdataConstants.PREFIX_ADR)) {
            return {id: term.value.slice(ArtsdataConstants.PREFIX_ADR.length)};
        }
        return {id: term.value};
    }


    async getExtendDataFromGraph(graphURI: string, entityClass: ExtendExternalGraphTypeEnum, entityUris: string[], region: string,
                                 page: number = 1, limit: number = 10) {
        if (entityUris?.length) {
            this._validateUris(entityUris);
        }

        const sparqlQuery = this._getSparqlQueryByTypeAndGraph(graphURI, entityClass, entityUris, region, page,
            limit);
        const result = await this._artsdataService.executeSparqlQuery(sparqlQuery, true);
        return this._formatExtendDataFromGraphResults(result);
    }

    private _getSparqlQueryByTypeAndGraph(graphURI: string, entityClass: ExtendExternalGraphTypeEnum, entityUris: string[],
                                          region: string, page: number, limit: number): string {
        let query: string = QUERY_BY_GRAPH.GENERIC;
        let uriQueryReplacement: string = ''
        if (entityUris?.length) {
            uriQueryReplacement = `VALUES ?uri { ${entityUris.map(uri => `<${uri}>`).join(" ")} }`;
        }
        query = query.replace("<FILTER_BY_ENTITY_URIS_PLACEHOLDER>", uriQueryReplacement);

        switch (entityClass) {
            case ExtendExternalGraphTypeEnum.EVENT:
                if (!FEATURE_FLAG.ENABLE_EVENT_BATCH_RECONCILIATION) {
                    Exception.badRequest("The option to reconcile events is currently disabled.")
                }
                query = query.replace("TYPE_PLACEHOLDER", "schema:Event")
                    .replace("<EXTRA_FIELD_SELECT_CLAUSE_QUERY_PLACEHOLDER>",
                        `(sample(?startDate) as ?start_date)
             (sample(?endDate) as ?end_date)
             (sample(?location) as ?location_uri)
             (sample(?location_name) as ?location_name)
             (sample(?postal_code) as ?postal_code)
             (sample(?offer_url) as ?offer_url)
             (COALESCE(sample(?location_uri), sample(?locationSameAs)) as ?location_artsdata_uri)
             (GROUP_CONCAT(DISTINCT ?performerName ; SEPARATOR = ", ") AS ?performer_name)
             (GROUP_CONCAT(DISTINCT ?eventStatus ; SEPARATOR = ", ") AS ?event_status)
             (GROUP_CONCAT(DISTINCT ?eventAttendanceMode ; SEPARATOR = ", ") AS ?event_attendance_mode)`)
                    .replace("<EXTRA_FIELD_WHERE_CLAUSE_QUERY_PLACEHOLDER>",
                        `OPTIONAL {?uri schema:startDate ?startDate .}
            OPTIONAL {?uri schema:endDate ?endDate .}
             # Location info
             OPTIONAL { 
                   ?uri schema:location ?location .
                  OPTIONAL { ?location schema:name ?location_name }
                  OPTIONAL { ?location schema:sameAs ?locationSameAs 
                  FILTER(STRSTARTS(STR(?locationSameAs), "${ArtsdataConstants.PREFIX_INCLUDING_K}")) }
                  OPTIONAL { ?location schema:address/schema:postalCode ?postal_code }
              }
              
             OPTIONAL { 
                   ?uri schema:performer ?performer .
                   OPTIONAL { ?performer schema:name   ?performer_name_en. FILTER( LANG(?performer_name_en) = "en")}
                   OPTIONAL { ?performer schema:name  ?performer_name_fr. FILTER( LANG(?performer_name_fr) = "fr")}
                   OPTIONAL { ?performer schema:name  ?performer_name_default. FILTER ( LANG(?performer_name_default) = "")}
                   OPTIONAL { ?performer schema:name  ?performer_name_mul. FILTER ( LANG(?performer_name_mul) = "mul")}
                  BIND(COALESCE(?performer_name_en, ?performer_name_fr, ?performer_name_mul, ?performer_name_default) as ?performerName)
              }
            #Offer buy uri
            OPTIONAL { ?uri schema:offers/schema:url ?offer_url }
            OPTIONAL { ?uri schema:eventStatus ?eventStatus }
            OPTIONAL { ?uri schema:eventAttendanceMode ?eventAttendanceMode }`)
                    .replace("<FILTER_BY_REGION_PLACEHOLDER>", "");
                break;
            case ExtendExternalGraphTypeEnum.PLACE:
                query = query.replace("TYPE_PLACEHOLDER", "schema:Place")
                    .replace("<EXTRA_FIELD_SELECT_CLAUSE_QUERY_PLACEHOLDER>",
                        `(sample(?postalCode) as ?postal_code)
            (sample(?addressLocality) as ?address_locality)
            (sample(?addressRegion) as ?address_region)`)
                    .replace("<EXTRA_FIELD_WHERE_CLAUSE_QUERY_PLACEHOLDER>",
                        `OPTIONAL {?uri schema:address/schema:postalCode ?postalCode .}
                   OPTIONAL { ?uri schema:address/schema:addressLocality ?addressLocality_en. FILTER( LANG(?addressLocality_en) = "en")}
                   OPTIONAL { ?uri schema:address/schema:addressLocality ?addressLocality_fr. FILTER( LANG(?addressLocality_fr) = "fr")}
                   OPTIONAL { ?uri schema:address/schema:addressLocality ?addressLocality_no. FILTER ( LANG(?addressLocality_no) = "")}
                  BIND(COALESCE(?addressLocality_en, ?addressLocality_fr, ?addressLocality_no) as ?addressLocality)
                   OPTIONAL { ?uri schema:address/schema:addressRegion ?addressRegion_en. FILTER( LANG(?addressRegion_en) = "en")}
                   OPTIONAL { ?uri schema:address/schema:addressRegion ?addressRegion_fr. FILTER( LANG(?addressRegion_fr) = "fr")}
                   OPTIONAL { ?uri schema:address/schema:addressRegion ?addressRegion_no. FILTER ( LANG(?addressRegion_no) = "")}
                  BIND(COALESCE(?addressRegion_en, ?addressRegion_fr, ?addressRegion_no) as ?addressRegion)`)
                    .replace("<FILTER_BY_REGION_PLACEHOLDER>",
                        region ? `?uri schema:address/schema:addressRegion ?region.
                   FILTER (LCASE(STR(?region)) = LCASE("${region}"))` : "");
                break;
            case ExtendExternalGraphTypeEnum.ORGANIZATION:
                query = query.replace("TYPE_PLACEHOLDER", "schema:Organization")
                    .replace("<FILTER_BY_REGION_PLACEHOLDER>",
                        region ?
                            `OPTIONAL { ?uri schema:address/schema:addressRegion ?addressRegion.}
               OPTIONAL {?uri schema:location/schema:address/schema:addressRegion ?locationRegion}
              FILTER(LCASE(STR(?addressRegion)) = LCASE("${region}") || LCASE(STR(?locationRegion)) = LCASE("${region}"))`
                            : "");
                break;
            case ExtendExternalGraphTypeEnum.PERSON:
                query = query.replace("TYPE_PLACEHOLDER", "schema:Person")
                    .replace("<FILTER_BY_REGION_PLACEHOLDER>",
                        region ? `?uri schema:workLocation/schema:address/schema:addressRegion ?region.
        filter(LCASE(str(?region)) = LCASE("${region}"))` : "");
                break;
            case ExtendExternalGraphTypeEnum.AGENT:
                query = query.replace("TYPE_PLACEHOLDER", "dbo:Agent")
                    .replace("<FILTER_BY_REGION_PLACEHOLDER>",
                        region ? `OPTIONAL { ?uri schema:address/schema:addressRegion ?addressRegion.}
               OPTIONAL {?uri schema:location/schema:address/schema:addressRegion ?locationRegion}
               OPTIONAL {?uri schema:workLocation/schema:address/schema:addressRegion ?region}
              FILTER(LCASE(STR(?addressRegion)) = LCASE("${region}") || LCASE(STR(?locationRegion)) = LCASE(STR("${region}")) || LCASE(STR(?region)) = LCASE("${region}"))`
                            : "");
                break;
            case ExtendExternalGraphTypeEnum.PERFORMANCE_WORK:
                query = query.replace("TYPE_PLACEHOLDER", "schema:PerformanceWork")
                    .replace("<FILTER_BY_REGION_PLACEHOLDER>", "")
                break;
            default:
                throw Exception.badRequest("Invalid type provided");
        }
        return query.replace("GRAPH_URI_PLACEHOLDER", graphURI)
            .replace("<EXTRA_FIELD_WHERE_CLAUSE_QUERY_PLACEHOLDER>", "")
            .replace("<EXTRA_FIELD_SELECT_CLAUSE_QUERY_PLACEHOLDER>", "")
            .replace("LIMIT_PLACEHOLDER", limit.toString())
            .replace("OFFSET_PLACEHOLDER", ((page - 1) * limit).toString());
    }

    /**
     * @name _formatExtendDataFromGraphResults
     * @description Format the results from the SPARQL query for query by graph id
     * @param result
     * @private
     */
    private _formatExtendDataFromGraphResults(result: any) {
        return result.results.bindings.map((row: any) => {
            const formattedRow: { [key: string]: any } = {};
            for (const key in row) {
                if (row[key].datatype === "http://www.w3.org/2001/XMLSchema#boolean") {
                    formattedRow[key] = row[key].value === "true";
                } else if (row[key].type === "literal") {
                    formattedRow[key] = row[key].value;
                } else if (row[key].type === "uri") {
                    formattedRow[key] = row[key].value;
                } else if (row[key].type === "bnode") {
                    formattedRow[key] = `_:${row[key].value}`;
                } else if (row[key].type === "bnode") {
                    formattedRow[key] = `_:${row[key].value}`;
                }
            }
            return formattedRow;

        });
    }


    private _validateUris(entityUris: string[]) {
        entityUris.forEach(uri => {
            if (!MatchServiceHelper.isValidURI(uri)) {
                throw Exception.badRequest(`Invalid URI: ${uri}`);
            }
        })
    }
}
