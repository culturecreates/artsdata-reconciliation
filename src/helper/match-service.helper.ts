import {LanguageEnum, MatchQualifierEnum} from "../enum";
import {GRAPHDB_INDEX} from "../config";
import {QueryCondition, ReconciliationQuery, ResultCandidates} from "../dto";
import {isURL} from "validator";
import {ArtsdataConstants, Entities, SCHEMA_ORG_PROPERTY_URI_MAP} from "../constant";
import {JaroWinklerDistance} from "natural";
import {QUERIES_V2} from "../constant/match/match-queries-v2.constants";

export class MatchServiceHelper {

    static escapeSpecialCharacters(inputString: string) {
        const luceneSpecialChars = ["+", "-", "!", "(", ")", "||", "{", "}", "[", "]", "^", "\"", "~", "*", "?",
            ":", "\\", "/", "&&", "AND", "OR", "NOT", "TO",];
        return Array.from(inputString)
            .map(char =>
                luceneSpecialChars.includes(char)
                    ? (char === "\\" ? `\\${char}` : `\\\\${char}`)
                    : char
            )
            .join("");
    }

    static formatReconciliationResponse(responseLanguage: LanguageEnum, sparqlResponse: any,
                                        reconciliationQuery: ReconciliationQuery, isQueryByURI: boolean): ResultCandidates[] {
        const bindings = sparqlResponse?.results?.bindings || [];
        const uniqueIds = [...new Set(bindings.map((binding: any) => binding["entity"].value))];
        const candidates: ResultCandidates[] = [];

        for (const currentId of uniqueIds) {
            const currentBindings = bindings
                .filter((binding: any) => binding["entity"].value === currentId);
            const currentBinding = currentBindings[0];
            const resultCandidate = new ResultCandidates();

            resultCandidate.id = currentBinding["entity"].value?.split(ArtsdataConstants.PREFIX).pop();
            const name = currentBinding["name"]?.value;
            const nameEn = currentBinding["nameEn"]?.value;
            const nameFr = currentBinding["nameFr"]?.value;
            const description = currentBinding["description"]?.value;
            const descriptionEn = currentBinding["descriptionEn"]?.value;
            const descriptionFr = currentBinding["descriptionFr"]?.value;

            const additionalPropertiesForAutoMatch = {
                url: currentBinding["url"]?.value,
                postalCode: currentBinding["postalCode"]?.value,
                addressLocality: currentBinding["addressLocality"]?.value,
                startDate: currentBinding["startDate"]?.value,
                endDate: currentBinding["endDate"]?.value,
                locationName: currentBinding["locationName"]?.value,
                locationUri: currentBinding["locationUri"]?.value,
                wikidata: currentBinding["wikidata"]?.value,
                isni: currentBinding["isni"]?.value,
            };

            if (responseLanguage === LanguageEnum.FRENCH) {
                resultCandidate.name = nameFr || name || nameEn;
                resultCandidate.description = descriptionFr || description || descriptionEn;
            } else {
                resultCandidate.name = nameEn || name || nameFr;
                resultCandidate.description = descriptionEn || description || descriptionFr;
            }

            resultCandidate.score = Math.round(Number(currentBinding["total_score"]?.value));
            resultCandidate.match =
                isQueryByURI ||
                MatchServiceHelper.isAutoMatch(resultCandidate, reconciliationQuery, additionalPropertiesForAutoMatch);

            resultCandidate.type = currentBindings.map((binding: any) => ({
                id: binding["type"]?.value,
                name: binding["type_label"]?.value,
            }));

            candidates.push(resultCandidate);
        }

        return candidates;
    }

    static getGraphdbIndex(type: string): string {
        switch (type) {
            case "schema:Event":
                return GRAPHDB_INDEX.EVENT;
            case "schema:Place":
                return GRAPHDB_INDEX.PLACE;
            case "schema:Organization":
                return GRAPHDB_INDEX.ORGANIZATION;
            case "schema:Person":
                return GRAPHDB_INDEX.PERSON;
            case "dbo:Agent":
                return GRAPHDB_INDEX.AGENT;
            case "skos:Concept":
                return GRAPHDB_INDEX.CONCEPT;
            case "ado:EventType":
                return GRAPHDB_INDEX.EVENT_TYPE;
            case "ado:LivePerformanceWork":
                return GRAPHDB_INDEX.LIVE_PERFORMANCE_WORK;
            default:
                return GRAPHDB_INDEX.DEFAULT;
        }
    }

    static isValidURI(text: string) {
        return isURL(text);
    }

    static isQueryByURIOrArtsdataId(query: string) {
        const artsdataIdPattern = "^K[0-9]+-[0-9]+$";
        return !!(query?.match(artsdataIdPattern) || (this.isValidURI(query) && query.startsWith(ArtsdataConstants.PREFIX)));
    }

    static isAutoMatch(recordFetched: { [key: string]: any }, reconciliationQuery: ReconciliationQuery,
                       additionalProperties: any): boolean {
        const recordFromQuery = this.formatReconciliationQuery(reconciliationQuery);

        function cleanName(name: string) {
            return name
                .trim()
                .toLowerCase()
                .replace(/[^a-z]/g, ""); // keep only letters
        }

        function nameSimilarity(nameInQuery: string, nameInResult: string) {
            const similarityScore = JaroWinklerDistance(cleanName(nameInQuery), cleanName(nameInResult));
            return similarityScore > 0.92;
        }

        const matchers = {
            veryClose: (a: string | undefined, b: string | undefined) => {
                if (!a || !b) return false;
                return nameSimilarity(a, b);
            },
            exactDate: (a: string | undefined, b: string | undefined) => {
                if (!a || !b) return false;
                return new Date(a)?.getTime() === new Date(b).getTime();
            },
            closeDates: (startDateA: string, startDateB: string, endDateA: string | undefined,
                         endDateB: string | undefined) => {
                const dateStampA = endDateA
                    ? new Date(endDateA).getTime()
                    : new Date(startDateA).getTime();
                const dateStampB = endDateB
                    ? new Date(endDateB).getTime()
                    : new Date(startDateB).getTime();
                if (isNaN(dateStampA) || isNaN(dateStampB)) return false;
                //if the difference between the two dates is greater than 24 hours (86400000 milliseconds), return false
                return Math.abs(dateStampA - dateStampB) <= 86400000;
            },
            exact: (a: string | undefined, b: string | undefined) => {
                if (!a || !b) return false;
                return a === b;
            },
            notDifferentIfBothExists: (a: string | undefined, b: string | undefined) => {
                if (!a || !b) return true;
                return a === b;
            },
            exactUrl: (a: string, b: string) => {
                if (a && b) {
                    const urlA = new URL(a.toLowerCase());
                    const urlB = new URL(b.toLowerCase());

                    let hostA = urlA.hostname;
                    let hostB = urlB.hostname;
                    // Normalize path (remove trailing slash unless root)
                    let pathA = urlA.pathname.replace(/\/+$/, "") || "/";
                    let pathB = urlB.pathname.replace(/\/+$/, "") || "/";
                    return `${hostA}${pathA}` === `${hostB}${pathB}`;
                } else {
                    return false;
                }
            },
        };

        const checkIfIsniIsExactMatch = [
            matchers.exact(additionalProperties.isni, recordFromQuery.isni),
        ];

        // Wikidata should be exact match
        const checkIfWikidataIdIsExactMatch = [
            matchers.exact(additionalProperties.wikidata, recordFromQuery.wikidata),
        ];

        const checkIfNameIsCloseAndWikidataIdIsExact = [
            matchers.veryClose(recordFetched.name, recordFromQuery.name),
            matchers.exact(additionalProperties.wikidata, recordFromQuery.wikidata),
        ];

        // Name should be close match and postal code should be exact match, wikidata should be exact match if present
        const checkIfNameIsClosePostalCodeIsExactAndWikidataIsNotDifferent = [
            matchers.veryClose(recordFetched.name, recordFromQuery.name),
            matchers.exact(additionalProperties.postalCode, recordFromQuery.postalCode),
            matchers.notDifferentIfBothExists(additionalProperties.wikidata, recordFromQuery.wikidata)
        ];

        //Name and address locality should be close match, postal code and wikidata should be exact match if present
        const checkIfNameAddressLocalityAreCloseAndPostalCodeAndWikidataIsNotDifferentForPlace =
            [
                matchers.veryClose(recordFetched.name, recordFromQuery.name),
                matchers.notDifferentIfBothExists(additionalProperties.postalCode, recordFromQuery.postalCode),
                matchers.veryClose(additionalProperties.addressLocality, recordFromQuery.addressLocality),
                matchers.notDifferentIfBothExists(additionalProperties.wikidata, recordFromQuery.wikidata)
            ];

        //Name is very close and URL is exact match, postal code and wikidata should be exact match if present
        const checkIfNameIsCloseUrlIsExactAndPostalCodeAndWikidataIsNotDifferentForPlace = [
            matchers.veryClose(recordFetched.name, recordFromQuery.name),
            matchers.exactUrl(
                additionalProperties.url,
                recordFromQuery.url as string,
            ),
            matchers.notDifferentIfBothExists(additionalProperties.postalCode, recordFromQuery.postalCode),
            matchers.notDifferentIfBothExists(additionalProperties.wikidata, recordFromQuery.wikidata)
        ];

        const checksNameStartDateEndDatePlaceUriMatchForEvents = [
            matchers.veryClose(recordFetched.name, recordFromQuery.name),
            matchers.exactDate(additionalProperties.startDate, recordFromQuery.startDate
            ),
            matchers.exactUrl(additionalProperties.locationUri, recordFromQuery.locationUri as string,),
            matchers.closeDates(additionalProperties.startDate, recordFromQuery.startDate as string,
                additionalProperties.endDate, recordFromQuery.endDate,
            ),
        ];

        const checksNameStartDateEndDatePlaceNamePostalCodeMatchForEvents = [
            matchers.veryClose(recordFetched.name, recordFromQuery.name),
            matchers.exactDate(additionalProperties.startDate, recordFromQuery.startDate),
            matchers.exact(additionalProperties.postalCode, recordFromQuery.postalCode),
            matchers.veryClose(additionalProperties.locationName, recordFromQuery.locationName),
            matchers.closeDates(
                additionalProperties.startDate, recordFromQuery.startDate as string, additionalProperties.endDate,
                recordFromQuery.endDate),
        ];

        if (reconciliationQuery.type === Entities.PLACE) {
            return (
                checkIfWikidataIdIsExactMatch.every(Boolean) ||
                checkIfNameIsClosePostalCodeIsExactAndWikidataIsNotDifferent.every(Boolean) ||
                checkIfNameAddressLocalityAreCloseAndPostalCodeAndWikidataIsNotDifferentForPlace.every(Boolean) ||
                checkIfNameIsCloseUrlIsExactAndPostalCodeAndWikidataIsNotDifferentForPlace.every(Boolean)
            );
        } else if (reconciliationQuery.type === Entities.EVENT) {
            return (
                checksNameStartDateEndDatePlaceUriMatchForEvents.every(Boolean) ||
                checksNameStartDateEndDatePlaceNamePostalCodeMatchForEvents.every(Boolean)
            );
        } else {
            return (
                checkIfWikidataIdIsExactMatch.every(Boolean) ||
                checkIfIsniIsExactMatch.every(Boolean) ||
                checkIfNameIsCloseAndWikidataIdIsExact.every(Boolean)
            );
        }
    }

    private static formatReconciliationQuery(reconciliationQuery: ReconciliationQuery) {
        const {conditions} = reconciliationQuery;
        const name = conditions.find((condition) => condition.matchType === "name")
            ?.propertyValue as string | undefined;

        let postalCode: string | undefined = undefined, addressLocality: string | undefined = undefined,
            addressRegion: string | undefined = undefined, url: string | undefined = undefined,
            startDate: string | undefined = undefined, endDate: string | undefined = undefined,
            locationName: string | undefined = undefined, locationUri: string | undefined = undefined,
            wikidata: string | undefined = undefined, isni: string | undefined = undefined;
        let sameAs: string[] = [];

        for (const condition of conditions) {
            if (condition.propertyId) {
                let propertyId = condition.propertyId as string;
                if (propertyId.startsWith('schema:')) {
                    propertyId = propertyId.replace('schema:', '<http://schema.org/') + '>';
                } else if (isURL(propertyId)) {
                    propertyId = `<${propertyId}>`;
                } else if (!isURL(propertyId) && !((propertyId?.startsWith('<') && propertyId?.endsWith('>')))) {
                    propertyId = `<http://schema.org/${propertyId}>`;
                }

                switch (propertyId) {
                    case SCHEMA_ORG_PROPERTY_URI_MAP.POSTAL_CODE:
                    case SCHEMA_ORG_PROPERTY_URI_MAP.ADDRESS_POSTAL_CODE:
                        postalCode = condition.propertyValue as string;
                        break;
                    case SCHEMA_ORG_PROPERTY_URI_MAP.ADDRESS_LOCALITY:
                    case SCHEMA_ORG_PROPERTY_URI_MAP.ADDRESS_ADDRESS_LOCALITY:
                        addressLocality = condition.propertyValue as string;
                        break;
                    case SCHEMA_ORG_PROPERTY_URI_MAP.ADDRESS_REGION:
                    case    SCHEMA_ORG_PROPERTY_URI_MAP.ADDRESS_ADDRESS_REGION:
                        addressRegion = condition.propertyValue as string;
                        break;
                    case SCHEMA_ORG_PROPERTY_URI_MAP.URL:
                        url = condition.propertyValue as string;
                        break;
                    case SCHEMA_ORG_PROPERTY_URI_MAP.SAME_AS:
                        sameAs.push(condition.propertyValue as string);
                        break;
                    case SCHEMA_ORG_PROPERTY_URI_MAP.START_DATE:
                        startDate = condition.propertyValue as string;
                        break;
                    case SCHEMA_ORG_PROPERTY_URI_MAP.END_DATE:
                        endDate = condition.propertyValue as string;
                        break;
                    case SCHEMA_ORG_PROPERTY_URI_MAP.LOCATION:
                        locationUri = condition.propertyValue as string;
                        break;
                    case SCHEMA_ORG_PROPERTY_URI_MAP.LOCATION_NAME:
                        locationName = condition.propertyValue as string;
                        break;
                    case SCHEMA_ORG_PROPERTY_URI_MAP.LOCATIONS_URI:
                        locationUri = condition.propertyValue as string;
                        break;
                    default:
                        break
                }
            }
        }

        if (sameAs?.length) {
            wikidata = sameAs?.find((sameAs: any) => sameAs?.startsWith("http://www.wikidata.org/entity/"));
            isni = sameAs?.find((sameAs) => sameAs?.startsWith("https://isni.org/isni/"));
        }

        return {
            name,
            postalCode,
            addressLocality,
            addressRegion,
            url,
            startDate,
            endDate,
            locationName,
            locationUri,
            isni: isni ? (isni.length ? isni : undefined) : undefined,
            wikidata: wikidata ? (wikidata.length ? wikidata : undefined) : undefined,
        };
    }

    static getAllQualifiers() {
        return [{
            id: MatchQualifierEnum.EXACT_MATCH,
            name: "Exact match of the property value",
        }, {
            id: MatchQualifierEnum.REGEX_MATCH,
            name: "Match the property value using regular expression",
        }]
    }

    static generateSubQueryToFetchAdditionalProperties(type: string) {

        let propertiesSubQuery: string = QUERIES_V2.COMMON_PROPERTIES_TO_FETCH_QUERY;
        let selectQueryFragment: string = QUERIES_V2.COMMON_SELECT_QUERY_FOR_ALL_ENTITY_PROPERTIES_SUB_QUERY;

        switch (type) {
            case Entities.PERSON:
            case Entities.ORGANIZATION:
            case Entities.AGENT:
                selectQueryFragment += QUERIES_V2.SELECT_QUERY_FOR_AGENT_PROPERTIES_SUB_QUERY;
                propertiesSubQuery += QUERIES_V2.ADDITIONAL_PROPERTIES_TO_FETCH_FOR_AGENTS_SUB_QUERY;
                break;
            case Entities.PLACE:
                selectQueryFragment += QUERIES_V2.SELECT_QUERY_FOR_PLACE_PROPERTIES_SUB_QUERY;
                propertiesSubQuery += QUERIES_V2.ADDITIONAL_PROPERTIES_TO_FETCH_FOR_PLACES_SUB_QUERY
                break;
            case Entities.EVENT:
                selectQueryFragment += QUERIES_V2.SELECT_QUERY_FOR_EVENT_PROPERTIES_SUB_QUERY;
                propertiesSubQuery += QUERIES_V2.ADDITIONAL_PROPERTIES_TO_FETCH_FOR_EVENTS_SUB_QUERY
                break;
        }

        return {selectQueryFragment, propertiesSubQuery}

    }

    static generateBindStatementForScoreCalculation(scoreVariables: Set<string>) {
        return `BIND( ${[...scoreVariables].map(v => `COALESCE(${v}, 0)`)
            .join(' + ')}  as ?total_score)`;
    }

    static generateSubQueryToURI(uri: string, type: string, scoreVariable: string, limit: number) {
        let query = QUERIES_V2.SELECT_ENTITY_BY_URI_TEMPLATE;

        query = query.replace("PROPERTY_TYPE_PLACEHOLDER", type);
        query = query.replace("URI_PLACEHOLDER", `<${uri}>`);
        query = query.replace("PROPERTY_SCORE_VARIABLE_PLACEHOLDER", scoreVariable);

        if (limit) {
            query = query + `LIMIT ${limit}`;
        }

        return `{ \n\t${query}\n }`;
    }

    static extractPropertyLocalName(value: string): string {
        const cleaned = value.replace(/^<|>$/g, "")
            .split(/[:/]/).filter(Boolean);
        return cleaned[cleaned.length - 1];
    }

    static generateSubQueryUsingLuceneQuerySearch(propertyName: string, propertyValue: string | string[],
                                                  lucenceIndex: string, type: string, scoreVariable: string, limit:number) {
        let query = QUERIES_V2.SUBQUERY_TO_FETCH_INDEXED_ENTITY_TEMPLATE;

        query = query.replace("INDEX_PLACEHOLDER", lucenceIndex);
        query = query.replace("LUCENE_QUERY_PLACEHOLDER", `${propertyName}: ${propertyValue}`);
        query = query.replace("TYPE_PLACEHOLDER", type || "?x");
        query = query.replace("PROPERTY_SCORE_VARIABLE_PLACEHOLDER", scoreVariable);
        query = query + ` LIMIT ${limit}`;

        return `{ \n\t${query}\n }`;
    }

    static resolvedPropertyConditions(luceneIndex: string, propertyConditions: QueryCondition[], type: string,
                                      limit:number) {
        const scoreVariables: string[] = [];
        const propertySubQueries: string[] = [];

        propertyConditions.forEach(({propertyId, propertyValue, required}) => {
            if (propertyId && propertyValue) {
                const propertyVariable = this.extractPropertyLocalName(propertyId);
                const scoreVariable = `?${propertyVariable}_score`;
                let subQuery = MatchServiceHelper.isValidURI(propertyValue as string)
                    ? this.generateSubqueryForUnindexedProperties(propertyId, propertyValue, scoreVariable)
                    : this.generateSubQueryUsingLuceneQuerySearch(propertyVariable, propertyValue, luceneIndex, type,
                        scoreVariable, limit);

                if (!required) {
                    subQuery = `OPTIONAL ${subQuery}\nBIND(IF( !BOUND( ${scoreVariable}),0,${scoreVariable}) as ${scoreVariable})`
                }

                propertySubQueries.push(subQuery);
                scoreVariables.push(scoreVariable);
            }
        });

        return {scoreVariables, propertySubQueries};
    }

    private static generateSubqueryForUnindexedProperties(propertyId: string, propertyValue: string | string[],
                                                          scoreVariable: string) {
        return QUERIES_V2.SUBQUERY_TO_FETCH_UNINDEXED_ENTITY_TEMPLATE
            .replace("PROPERTY_PLACEHOLDER", propertyId)
            .replace("PROPERTY_VARIABLE_PLACEHOLDER", `<${propertyValue}>`)
            .replace("PROPERTY_SCORE_VARIABLE_PLACEHOLDER", scoreVariable)
    }

    static createSparqlQuery(selectVariables: string[], subQueries: string[], propertiesSubQuery: string,
                             scoreVariables: Set<string>, limit: number) {
        const scoreVars = [...scoreVariables].join(' ');
        return [
            QUERIES_V2.PREFIXES,
            `SELECT DISTINCT ${selectVariables.join(' ')}`,
            `WHERE {`,
            subQueries.join('\n'),
            `# Properties to return with matching results`,
            `{${propertiesSubQuery}}`,
            MatchServiceHelper.generateBindStatementForScoreCalculation(scoreVariables),
            `}${QUERIES_V2.COMMON_GROUP_BY_STATEMENT} ${scoreVars}`
        ].join('\n');
    }


}
