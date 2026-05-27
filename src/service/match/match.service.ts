import {Injectable} from "@nestjs/common";
import {ArtsdataService} from "../artsdata";
import {ManifestService} from "../manifest";
import {Exception, MatchServiceHelper} from "../../helper";
import {ArtsdataConstants, ArtsdataProperties, Entities, QUERIES,} from "../../constant";
import {QueryCondition, ReconciliationRequest, ReconciliationResponse, ReconciliationResults,} from "../../dto";
import {LanguageEnum, MatchQualifierEnum, MatchQuantifierEnum, MatchTypeEnum,} from "../../enum";
import {SparqlVersionEnum} from "../../enum/sparql-versions.enum";

@Injectable()
export class MatchService {
    constructor(
        private readonly _artsdataService: ArtsdataService,
        private readonly _manifestService: ManifestService,
    ) {
    }

    /**
     * @name reconcileByRawQueries
     * @description Reconcile by raw queries
     * @param acceptLanguage
     * @param rawQueries
     * @returns {Promise<any>}
     */
    async reconcileByRawQueries(acceptLanguage: LanguageEnum, rawQueries: string): Promise<any> {
        if (!rawQueries) {
            return this._manifestService.getServiceManifest();
        }

        try {
            const queries = JSON.parse(rawQueries);
            return await this.reconcileByQueries(acceptLanguage, queries);
        } catch {
            return Exception.badRequest("The request is not a valid JSON object.");
        }
    }

    /**
     * @private
     * @name reconcileByQueries
     * @description Resolve property conditions
     * @param rawSparqlQuery
     * @param propertyConditions
     * @returns {string}
     */
    private _resolvePropertyConditions(rawSparqlQuery: string, propertyConditions: QueryCondition[]): string {

        const propertyTriples = propertyConditions
            .map((condition, index) => this._generateTripleFromCondition(condition, index))
            .join("");

        return rawSparqlQuery.replace("PROPERTY_PLACE_HOLDER", propertyTriples);
    }

    /**
     * @private
     * @name _resolveConditions
     * @description Resolve conditions
     * @param conditions
     * @return {{name: string | undefined, propertyConditions: QueryCondition[]}}
     */
    private _resolveConditions(conditions: QueryCondition[]):
        { id: string | undefined, name: string | string[] | undefined; propertyConditions: QueryCondition[]; } {
        return {
            id: conditions.find(({matchType}) => matchType === MatchTypeEnum.ID)
                ?.propertyValue as string,
            name: conditions.find(({matchType}) => matchType === MatchTypeEnum.NAME)
                ?.propertyValue,
            propertyConditions: conditions
                .filter(({matchType}) => matchType === MatchTypeEnum.PROPERTY)
        };
    }

    /**
     * @private
     * @name _resolvePropertyValue
     * @description Resolve property value
     * @param value
     * @param property
     * @param matchQualifier
     * @return {string}
     */
    private _resolvePropertyValue(value: string | string[], property: string,
                                  matchQualifier: MatchQualifierEnum | undefined): string | string[] {

        if (Array.isArray(value)) {
            return value.flatMap((val) => this._resolvePropertyValue(val, property, matchQualifier));
        }

        if (matchQualifier === MatchQualifierEnum.REGEX_MATCH) {
            return `"${value.replace("\\", "\\\\")}"`;
        }

        if (MatchServiceHelper.isValidURI(value)) {
            return `<${value}>`;
        }


        switch (property) {
            case ArtsdataProperties.START_DATE:
            case ArtsdataProperties.END_DATE:
                const variable = property === ArtsdataProperties.START_DATE ? "?startDate" : "?endDate";
                const xsdDateRegex = /^-?\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(Z|[+-](0\d|1[0-4]):[0-5]\d)?$/;

                if (xsdDateRegex.test(value)) {
                    return `${variable};
                FILTER(${variable} = "${value}"^^xsd:date || ( ${variable} > "${value}T00:00:00"^^xsd:dateTime && ${variable} < "${value}T23:59:59"^^xsd:dateTime ))`;
                } else {
                    return `${variable};
                FILTER(${variable} = "${value}"^^xsd:dateTime )`;
                }

            case ArtsdataProperties.SAME_AS:
            case ArtsdataProperties.LOCATION:
            case ArtsdataProperties.ORGANIZER:
            case ArtsdataProperties.PERFORMER:
            case ArtsdataProperties.ADDITIONAL_TYPE:
            case ArtsdataProperties.MAIN_ENTITY_OF_PAGE:
            case ArtsdataProperties.AUDIENCE:
            case ArtsdataProperties.EVENT_STATUS:
            case ArtsdataProperties.IN_LANGUAGE:
            case ArtsdataProperties.SUB_EVENT:
                return MatchServiceHelper.isValidURI(value) ? `<${value}>` : `"${value}"`;
            default:
                return `"${value}"`;
        }
    }

    /**
     * @private
     * @name _generateTripleFromCondition
     * @description Generate triple from condition
     * @param condition
     * @param index
     */
    private _generateTripleFromCondition(condition: QueryCondition, index: number,): string {
        const {required, propertyId, propertyValue: rawConditionValue, matchQualifier, matchQuantifier} = condition;

        const propertyIdSubstituted = propertyId ? MatchServiceHelper.substitutePrefix(propertyId as string) : propertyId;

        const formattedConditionValue =
            this._resolvePropertyValue(rawConditionValue, propertyIdSubstituted as string, matchQualifier);
        const formattedPropertyId: string = MatchServiceHelper.isValidURI(propertyIdSubstituted as string)
            ? this._resolvePropertyPath(propertyIdSubstituted as string)
            : `${propertyIdSubstituted}`;

        let triple = this._resolveMatchQualifierAndQuantifier(matchQualifier as MatchQualifierEnum,
            formattedPropertyId, matchQuantifier as MatchQuantifierEnum, formattedConditionValue, index);

        return required ? triple : `OPTIONAL { ${triple} }\n`;
    }

    /**
     * @name reconcileByQueries
     * @description Reconcile by queries
     * @param requestLanguage
     * @param reconciliationRequest
     * @param version (v1 by default or v2 for a new sparql version)
     */
    async reconcileByQueries(requestLanguage: LanguageEnum, reconciliationRequest: ReconciliationRequest, version?: string)
        : Promise<ReconciliationResponse> {
        const {queries} = reconciliationRequest;
        const results: ReconciliationResults[] = [];
        let sparqlQuery;
        for (const reconciliationQuery of queries) {
            try {
                const {type, limit, conditions} = reconciliationQuery;
                const {id, name, propertyConditions} = this._resolveConditions(conditions);
                const isQueryByURI: boolean = !!id;

                //TODO Remove this condition once the new version is fully released
                if (version === SparqlVersionEnum.V2) {
                    sparqlQuery = this._generateSparqlQueryV2(id, name as string, type, limit || 25, propertyConditions);
                } else {
                    sparqlQuery = this._generateSparqlQuery(id, name as string, type, limit || 25, propertyConditions);
                }

                const response = await this._artsdataService.executeSparqlQuery(sparqlQuery);
                const candidates = MatchServiceHelper.formatReconciliationResponse(requestLanguage,
                    response, reconciliationQuery, isQueryByURI);
                results.push({candidates});
            } catch (error) {
                console.error("Error in reconciliation query:", error);
                results.push({candidates: []});
            }
        }
        return {results};
    }

    /**
     * @private
     * @name _resolveMatchQualifierAndQuantifier
     * @description Resolve match qualifier, matchQualifier is defaulted to exact match
     * @param matchQualifier
     * @param formattedPropertyId
     * @param matchQuantifier
     * @param formattedConditionValue
     * @param index
     */
    private _resolveMatchQualifierAndQuantifier(matchQualifier: MatchQualifierEnum, formattedPropertyId: string,
                                                matchQuantifier: MatchQuantifierEnum, formattedConditionValue: string | string[], index: number) {
        //Setting default values for match qualifier and match quantifier
        matchQuantifier = matchQuantifier || MatchQuantifierEnum.ALL;
        matchQualifier = matchQualifier || MatchQualifierEnum.EXACT_MATCH;

        const isConditionValueArray = Array.isArray(formattedConditionValue);
        let triple: string = "";
        if (isConditionValueArray) {
            const objectId = `?obj_${index + 1}`;
            switch (matchQualifier) {
                case MatchQualifierEnum.EXACT_MATCH:
                    if (matchQuantifier === MatchQuantifierEnum.ANY) {
                        triple = `?entity ${formattedPropertyId} ${objectId} FILTER (${objectId} IN (${(formattedConditionValue as string[]).join(" , ")})).`;
                    } else if (matchQuantifier === MatchQuantifierEnum.ALL) {
                        triple = `${(formattedConditionValue as string[])
                            .map((v) => ` FILTER EXISTS {?entity ${formattedPropertyId} ${v}}`)
                            .join("\n")}`;
                    } else if (matchQuantifier === MatchQuantifierEnum.NONE) {
                        triple = `${(formattedConditionValue as string[])
                            .map((v) => ` FILTER NOT EXISTS {?entity ${formattedPropertyId} ${v}}`)
                            .join("\n")}`;
                    } else {
                        Exception.badRequest("Unsupported match qualifier");
                    }
                    break;
                case MatchQualifierEnum.REGEX_MATCH:
                    triple = `?entity ${formattedPropertyId} ${objectId}
          FILTER ( ${(formattedConditionValue as string[])
                        .map((v) => `REGEX (${objectId}, ${v}, "i")`).join(" || ")} ;`;
                    break;
                default:
                    Exception.badRequest("Unsupported match qualifier");
                    break;
            }
        } else {
            switch (matchQualifier) {
                case MatchQualifierEnum.EXACT_MATCH:
                    triple = `?entity ${formattedPropertyId} ${formattedConditionValue} .`;
                    break;
                case MatchQualifierEnum.REGEX_MATCH:
                    const objectId = `?obj_${index + 1}`;
                    triple = `?entity ${formattedPropertyId} ${objectId}
          FILTER REGEX(str(${objectId}), ${formattedConditionValue}, "i").`;
                    break;
                default:
                    Exception.badRequest("Unsupported match qualifier");
                    triple = "";
                    break;
            }
            if (matchQuantifier === MatchQuantifierEnum.NONE) {
                return `FILTER NOT EXISTS { ${triple} }.`;
            }
        }

        return triple;
    }

    /**
     * @private
     * @name _generateSparqlQueryV2
     * @description Generate SPARQL query for v2
     * @param id
     * @param name
     * @param type
     * @param limit
     * @param propertyConditions
     */
    private _generateSparqlQueryV2(id: string | undefined, name: string | undefined, type: string,
                                   limit: number, propertyConditions: QueryCondition[]) {
        const luceneIndex = MatchServiceHelper.getGraphdbIndex(type, SparqlVersionEnum.V2);
        const selectVariables = ['?entity'];
        const subQueries = [];
        const scoreVariables = new Set<string>();

        const addSubQuery = (propertyName: string, value: string, generator: Function) => {
            const scoreVariable = `?${propertyName}_score`;
            selectVariables.push(scoreVariable);
            scoreVariables.add(scoreVariable);
            subQueries.push(generator(value, type, scoreVariable, limit));
        };

        if (id) {
            const uri = id.startsWith('K') ? `${ArtsdataConstants.PREFIX}${id}` : id;
            addSubQuery('id', uri, MatchServiceHelper.generateSubQueryToURI);
        } else if (name) {
            addSubQuery('name', name, (value: string, type: string, scoreVar: string) =>
                MatchServiceHelper.generateSubQueryUsingLuceneQuerySearch('name', value, luceneIndex, type,
                    scoreVar, limit));
        }
        // Fetch name, type and type label and disambiguatingDescription
        const {
            selectQueryFragment,
            propertiesSubQuery
        } = MatchServiceHelper.generateSubQueryToFetchAdditionalProperties();

        const {
            scoreVariables: scoreVarsFromProps,
            propertySubQueries
        } = MatchServiceHelper.resolvedPropertyConditions(luceneIndex, propertyConditions, type, limit);

        scoreVarsFromProps.forEach(scoreVariables.add, scoreVariables);
        selectVariables.push(...scoreVarsFromProps, selectQueryFragment);
        subQueries.push(...propertySubQueries);

        return MatchServiceHelper.createSparqlQuery(selectVariables, subQueries, propertiesSubQuery, scoreVariables);
    }


    /**
     * @private
     * @name _generateSparqlQuery
     * @description Generate SPARQL query
     * @param id
     * @param name
     * @param type
     * @param limit
     * @param propertyConditions
     */
    private _generateSparqlQuery(
        id: string | undefined, name: string | undefined, type: string, limit: number,
        propertyConditions: QueryCondition[]): string {

        const graphdbIndex = MatchServiceHelper.getGraphdbIndex(type);
        let rawQuery = QUERIES.RECONCILIATION_QUERY;

        if (name) {
            name = this._modifyNameForLuceneScore(MatchServiceHelper.transformSearchQuery(name, 'name'), propertyConditions);
        }
        if (id) {
            id = MatchServiceHelper.isValidURI(id) ? `<${id}>` : `<${ArtsdataConstants.PREFIX}${id}>`;
            rawQuery = rawQuery.replace("SELECT_ENTITY_QUERY_BY_KEYWORD_PLACEHOLDER",
                `BIND(${id} as ?entity)`);
        } else {
            rawQuery = rawQuery.replace("SELECT_ENTITY_QUERY_BY_KEYWORD_PLACEHOLDER",
                QUERIES.SELECT_ENTITY_QUERY_BY_KEYWORD);
        }

        rawQuery = this._addQueryToFetchAdditionalPropertiesForAutoMatchCalculations(type, rawQuery)

        rawQuery = rawQuery
            .replace("INDEX_PLACE_HOLDER", graphdbIndex)
            .replace("QUERY_FILTER_PLACE_HOLDER", name ? `luc:query ${name}` : "")
            .replace("LIMIT_PLACE_HOLDER", `LIMIT ${limit}`);

        return this._resolvePropertyConditions(rawQuery, propertyConditions);
    }

    /**
     * @private
     * @name _resolvePropertyConditions
     * @description Resolve property conditions
     * @param propertyId
     * @private
     */
    private _resolvePropertyPath(propertyId: string) {
        const parts = propertyId.trim().split("/http");
        let propertyPath = "";

        for (let i = 0; i < parts.length; i++) {
            const part = i === 0 ? parts[i] : "http" + parts[i];
            propertyPath += part.startsWith("http") ? `<${part}>` : part;
            if (i < parts.length - 1) propertyPath += "/";
        }

        return propertyPath;
    }

    /**
     * @private
     * @name _resolveConditions
     * @description Resolve conditions
     * @param name
     * @param propertyConditions
     * @private
     */
    private _modifyNameForLuceneScore(name: string, propertyConditions: QueryCondition[]): string {
        const propertyMap = {
            "http://schema.org/url": "url",
            "http://schema.org/sameAs": "sameAs",
            "http://schema.org/postalCode": "postalCode",
            "http://schema.org/startDate": "startDate",
            "http://schema.org/endDate": "endDate",
            "<https://schema.org/location>/<https://schema.org/name>": "locationName",
            "<https://schema.org/location>/<https://schema.org/address>/<https://schema.org/postalCode>": "locationPostalCode",
        };

        const luceneQuery = propertyConditions
            .filter((condition) => condition.matchType === MatchTypeEnum.PROPERTY)
            .reduce((query, condition) => {
                Object.entries(propertyMap).forEach(([key, value]) => {
                    if (condition.propertyId?.includes(key)) {
                        query = `${query} OR ${this._resolvePropertyValueForLucene(
                            condition.propertyValue,
                            value,
                        )}`;
                    }
                });
                return query;
            }, `${name}`);

        return `"${luceneQuery}" ;`;
    }

    /**
     * @private
     * @name _resolvePropertyConditions
     * @description Resolve property conditions
     * @param propertyValue
     * @param propertyId
     * @private
     */
    private _resolvePropertyValueForLucene(propertyValue: string | string[], propertyId: string): string {
        const values = Array.isArray(propertyValue) ? propertyValue : [propertyValue];
        return values
            .map((value) =>
                `${MatchServiceHelper.transformSearchQuery(value, propertyId)}`)
            .join(" ");
    }

    /**
     * @private
     * @name _resolvePropertyConditions
     * @description Resolve property conditions
     * @param type
     * @param rawQuery
     * @private
     */
    private _addQueryToFetchAdditionalPropertiesForAutoMatchCalculations(type: string, rawQuery: string): string {

        switch (type) {
            case Entities.PLACE:
                rawQuery = rawQuery.replace(
                    "ADDITIONAL_SELECT_FOR_MATCH_PLACEHOLDER",
                    `(SAMPLE(?postalCode) AS ?postalCode)
                                (SAMPLE(?addressLocality) AS ?addressLocality)
                                (SAMPLE(?wikidata) AS ?wikidata)
                                (SAMPLE(?alternateName) AS ?alternateName)`)
                    .replace("ADDITIONAL_TRIPLES_FOR_MATCH_PLACEHOLDER",
                        `OPTIONAL { ?entity schema:alternateName ?alternateName} 
                                     OPTIONAL { ?entity schema:address/schema:postalCode ?postalCode }
                                     OPTIONAL { ?entity schema:address/schema:addressLocality ?addressLocality }
                                     OPTIONAL { ?entity schema:sameAs ?wikidata 
                                    FILTER (STRSTARTS(str(?wikidata), "http://www.wikidata.org/entity/"))
                                  }`);
                break;
            case Entities.EVENT:
                rawQuery = rawQuery.replace("ADDITIONAL_SELECT_FOR_MATCH_PLACEHOLDER",
                    `(SAMPLE(?startDate) AS ?startDate)
                                (SAMPLE(?endDate) AS ?endDate)
                                (SAMPLE(?locationName) AS ?locationName)
                                (SAMPLE(?postalCode) AS ?postalCode)
                                (SAMPLE(?artsdataUri) AS ?locationUri)
                                (SAMPLE(?alternateName) AS ?alternateName)
                                (SAMPLE(?locationContainedIn) AS ?locationContainedIn)
                                (SAMPLE(?locationContains) AS ?locationContains)`)
                    .replace("ADDITIONAL_TRIPLES_FOR_MATCH_PLACEHOLDER",
                        `OPTIONAL { ?entity schema:startDate ?startDate }
                                    OPTIONAL { ?entity schema:alternateName ?alternateName}  
                                    OPTIONAL { ?entity schema:endDate ?endDate }
                                    OPTIONAL { ?entity schema:location ?location .
                                    OPTIONAL { ?location schema:name ?locationName }
                                    OPTIONAL { ?location schema:address/schema:postalCode ?postalCode }
                                    OPTIONAL { BIND(?location AS ?artsdataUri)
                                        FILTER(STRSTARTS(STR(?artsdataUri), "${ArtsdataConstants.PREFIX_INCLUDING_K}"))
                                    }
                                    OPTIONAL {
                                        ?location schema:containedInPlace ?parentPlace .
                                        FILTER(STRSTARTS(STR(?parentPlace), "${ArtsdataConstants.PREFIX_INCLUDING_K}"))
                                        BIND(?parentPlace AS ?locationContainedIn)
                                    }
                                    OPTIONAL {
                                        ?location ^schema:containedInPlace ?childPlace .
                                        FILTER(STRSTARTS(STR(?childPlace), "${ArtsdataConstants.PREFIX_INCLUDING_K}"))
                                        BIND(?childPlace AS ?locationContains)
                                    }}`);
                break;
            case Entities.PERSON:
            case Entities.ORGANIZATION:
            case Entities.AGENT:
                rawQuery = rawQuery.replace("ADDITIONAL_SELECT_FOR_MATCH_PLACEHOLDER",
                    `(SAMPLE(?wikidata) AS ?wikidata)
                                (SAMPLE(?alternateName) AS ?alternateName)
                                (SAMPLE(?isni) AS ?isni)`)
                    .replace("ADDITIONAL_TRIPLES_FOR_MATCH_PLACEHOLDER",
                        ` OPTIONAL { ?entity schema:alternateName ?alternateName}  
                                      OPTIONAL { ?entity schema:sameAs ?sameAs 
                                      OPTIONAL {BIND(?sameAs AS ?wikidata)
                                        FILTER (STRSTARTS(str(?wikidata), "http://www.wikidata.org/entity/"))
                                      }
                                      OPTIONAL {BIND(?sameAs AS ?isni)
                                        FILTER (STRSTARTS(str(?isni), "https://isni.org/isni/"))
                                      }}`);
                break;
            default:
                rawQuery = rawQuery.replace("ADDITIONAL_TRIPLES_FOR_MATCH_PLACEHOLDER", "")
                    .replace("ADDITIONAL_SELECT_FOR_MATCH_PLACEHOLDER", "")
                break;

        }
        return rawQuery;
    }
}