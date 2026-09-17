import {Injectable} from "@nestjs/common";
import {ArtsdataService} from "../artsdata";
import {EntityClassEnum} from "../../enum/entity-class.enum";
import {ArtsdataConstants, EXTEND_QUERY, PREFIXES, PROPOSED_EXTEND_PROPERTIES_METADATA} from "../../constant";
import {Exception, MatchServiceHelper} from "../../helper";
import {
    DataExtensionQueryDTO,
    DataExtensionResponseDTO,
    ExtendQueryProperty,
    ProposedExtendProperty
} from "../../dto/extend";
import {QUERY_BY_GRAPH} from "../../constant/extend/query-by-graph.constants";
import {ExpandablePropertyEnum, ExtendPropertySettingsEnum} from "../../enum";
import {DEFAULT_LITERAL_PROPERTIES, EXPANDABLE_PROPERTIES} from "../../constant/extend/expandable-properties.constants";
import {FEATURE_FLAG} from "../../config";

@Injectable()
export class ExtendService {

    constructor(private readonly _artsdataService: ArtsdataService) {
    }


    async getDataExtension(dataExtensionQuery: DataExtensionQueryDTO) {
        const sparqlQuery: string = this._generateQuery(dataExtensionQuery);
        const expandProperties = dataExtensionQuery.properties
            .filter(property => property.settings?.content === ExtendPropertySettingsEnum.EXPAND);
        const result = await this._artsdataService.executeSparqlQuery(sparqlQuery);
        const formattedResult = this._formatResult(dataExtensionQuery.ids, result);

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

    getProposedProperties(entityType: EntityClassEnum): ProposedExtendProperty {
        switch (entityType) {
            case EntityClassEnum.EVENT:
                return PROPOSED_EXTEND_PROPERTIES_METADATA.EVENT;
            case EntityClassEnum.PLACE:
                return PROPOSED_EXTEND_PROPERTIES_METADATA.PLACE;
            case EntityClassEnum.PERSON:
                return PROPOSED_EXTEND_PROPERTIES_METADATA.PERSON;
            case EntityClassEnum.ORGANIZATION:
                return PROPOSED_EXTEND_PROPERTIES_METADATA.ORGANIZATION;
            case EntityClassEnum.AGENT:
                return PROPOSED_EXTEND_PROPERTIES_METADATA.AGENT;
            default:
                throw Exception.badRequest("Invalid entity type");
        }
    }

    private _generateQuery(dataExtensionQuery: DataExtensionQueryDTO) {
        const {ids, properties} = dataExtensionQuery;

        // Generate URIs with prefix if necessary
        const uris = ids.map(id => MatchServiceHelper.isValidURI(id) ? id.trim() : `${ArtsdataConstants.PREFIX}${id.trim()}`);
        const uriPlaceholder = uris.map(uri => `(<${uri}>)`).join(" ");

        // Replace URI placeholder in the query
        let query = EXTEND_QUERY.replace("<URI_PLACE_HOLDER>", uriPlaceholder);

        // Generate property triples and replace the placeholder
        const propertyTriples = properties.map(property => this._generateTripleFromCondition(property)).join("");
        query = query.replace("<TRIPLES_PLACE_HOLDER>", propertyTriples);

        return query;
    }

    private _generateTripleFromCondition(property: ExtendQueryProperty) {
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
        const predicate = MatchServiceHelper.isValidURI(id) ? `<${id}>` : `schema:${objectId}`;

        if (settings?.content === ExtendPropertySettingsEnum.LITERAL) {
            return this._generateLiteralTriple(id, objectId, predicate);
        }

        let expandedTriples;
        if (settings?.content === ExtendPropertySettingsEnum.EXPAND) {
            const expandedProperties = this._getExpandableProperties(id);
            if (!expandedProperties.length) {
                console.log("No expanded properties found for id: ", id);
            }
            expandedTriples = expandedProperties
                .map(prop => {
                    const predicate = prop === "type" ? `rdf:type` : `schema:${prop}`;
                    return `\t\tOPTIONAL {?${objectId} ${predicate} ?${objectId}_${prop}.}`
                }).join("\n");
        }

        return `OPTIONAL { ?uri ${predicate} ?${objectId}. 
                ${expandedTriples ? `\n${expandedTriples}\n` : ""}}\n`;
    }

    /**
     * @name _generateLiteralTriple
     * @description Builds the triple for a property requested with `settings.content = literal`.
     * The property is followed one hop further to the literal that labels the linked entity
     * (for example `schema:organizer/schema:name`). The hop is made optional with `?` so that
     * literal-only properties fall back to their own value, and the filter drops the entity URI
     * that the zero-length match keeps. Both cases therefore bind the same variable, so the
     * response keeps a single `literal` value per property and needs no post-processing.
     * @private
     */
    private _generateLiteralTriple(id: string, objectId: string, predicate: string) {
        const literalPath = DEFAULT_LITERAL_PROPERTIES.map(prop => `schema:${prop}`)
            .join("|");

        return `OPTIONAL { ?uri ${predicate}/(${literalPath})? ?${objectId}.
                FILTER(isLiteral(?${objectId}))\n}\n`;
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

    private _formatResult(ids: string[], result: any): DataExtensionResponseDTO {
        const bindings = result.results.bindings;
        const formattedRow: { [key: string]: any } = {};
        for (const row of bindings) {
            const id = row.uri.value;
            if (!formattedRow[id]) {
                formattedRow[id] = {
                    id: id.split(ArtsdataConstants.PREFIX)[1],
                    properties: []
                };
            }
            for (const key in row) {
                const valueId = key;
                let currentValue: any;
                const rowValue = row[key].value;

                if (key !== "uri") {
                    if (row[key].type === "literal") {
                        currentValue = {"str": row[key].value, lang: row[key]["xml:lang"]};
                    }
                    if (row[key].type === "bnode") {
                        currentValue = {"id": rowValue};
                    }

                    if (row[key].type === "uri") {
                        if (rowValue.startsWith(ArtsdataConstants.PREFIX)) {
                            currentValue = {"id": rowValue.split(ArtsdataConstants.PREFIX)[1]};
                        } else {
                            currentValue = {"id": rowValue};
                        }
                    }

                    const existingValues: any = formattedRow[id].properties.find((item: any) => item.id === key);
                    if (!existingValues) {
                        formattedRow[id].properties.push({id: valueId, values: [currentValue]});
                    } else {
                        const existingValue = existingValues.values;
                        // Check if the value already exists
                        const valueExists = existingValue.some((existingItem: any) => {
                            if (existingItem.id && currentValue.id) {
                                return existingItem.id === currentValue.id;
                            } else if (existingItem.str && currentValue.str) {
                                return existingItem.str === currentValue.str && existingItem.lang === currentValue.lang;
                            } else if (existingItem.str && currentValue.str) {
                                return existingItem.str === currentValue.str;
                            }
                            return false;
                        });

                        if (!valueExists) {
                            existingValues.values.push(currentValue);
                        }

                    }
                }
            }
        }
        const rows = ids.map(id => formattedRow[`${ArtsdataConstants.PREFIX}${id}`]);
        const properties = result.head.vars.filter((item: any) => item !== "uri");
        const meta = properties.map((item: any) => {
            return {id: item, name: item};
        });

        return {
            meta,
            rows
        };
    }


    async getExtendDataFromGraph(graphURI: string, entityClass: EntityClassEnum, entityUris: string[], region: string,
                                 page: number = 1, limit: number = 10) {
        if (entityUris?.length) {
            this._validateUris(entityUris);
        }

        const sparqlQuery = this._getSparqlQueryByTypeAndGraph(graphURI, entityClass, entityUris, region, page,
            limit);
        const result = await this._artsdataService.executeSparqlQuery(sparqlQuery, true);
        return this._formatExtendDataFromGraphResults(result);
    }

    private _getSparqlQueryByTypeAndGraph(graphURI: string, entityClass: EntityClassEnum, entityUris: string[],
                                          region: string, page: number, limit: number): string {
        let query: string = QUERY_BY_GRAPH.GENERIC;
        let uriQueryReplacement: string = ''
        if (entityUris?.length) {
            uriQueryReplacement = `VALUES ?uri { ${entityUris.map(uri => `<${uri}>`).join(" ")} }`;
        }
        query = query.replace("<FILTER_BY_ENTITY_URIS_PLACEHOLDER>", uriQueryReplacement);

        switch (entityClass) {
            case EntityClassEnum.EVENT:
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
            case EntityClassEnum.PLACE:
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
            case EntityClassEnum.ORGANIZATION:
                query = query.replace("TYPE_PLACEHOLDER", "schema:Organization")
                    .replace("<FILTER_BY_REGION_PLACEHOLDER>",
                        region ?
                            `OPTIONAL { ?uri schema:address/schema:addressRegion ?addressRegion.}
               OPTIONAL {?uri schema:location/schema:address/schema:addressRegion ?locationRegion}
              FILTER(LCASE(STR(?addressRegion)) = LCASE("${region}") || LCASE(STR(?locationRegion)) = LCASE("${region}"))`
                            : "");
                break;
            case EntityClassEnum.PERSON:
                query = query.replace("TYPE_PLACEHOLDER", "schema:Person")
                    .replace("<FILTER_BY_REGION_PLACEHOLDER>",
                        region ? `?uri schema:workLocation/schema:address/schema:addressRegion ?region.
        filter(LCASE(str(?region)) = LCASE("${region}"))` : "");
                break;
            case EntityClassEnum.AGENT:
                query = query.replace("TYPE_PLACEHOLDER", "dbo:Agent")
                    .replace("<FILTER_BY_REGION_PLACEHOLDER>",
                        region ? `OPTIONAL { ?uri schema:address/schema:addressRegion ?addressRegion.}
               OPTIONAL {?uri schema:location/schema:address/schema:addressRegion ?locationRegion}
               OPTIONAL {?uri schema:workLocation/schema:address/schema:addressRegion ?region}
              FILTER(LCASE(STR(?addressRegion)) = LCASE("${region}") || LCASE(STR(?locationRegion)) = LCASE(STR("${region}")) || LCASE(STR(?region)) = LCASE("${region}"))`
                            : "");
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
