import {LanguageEnum, MatchQualifierEnum} from "../enum";
import {GRAPHDB_INDEX} from "../config";
import {QueryCondition, ReconciliationQuery, ResultCandidates} from "../dto";
import {isURL} from "validator";
import {ArtsdataConstants, Entities, PREFIXES, SCHEMA_ORG_PROPERTY_URI_MAP} from "../constant";
import {JaroWinklerDistance} from "natural";
import {QUERIES_V2} from "../constant/match/match-queries-v2.constants";
import {SparqlVersionEnum} from "../enum/sparql-versions.enum";
import {RecordFromQuery} from "../interface/match.interface";

export class MatchServiceHelper {

    static transformSearchQuery(inputString: string, lucenceFieldName: string) {
        const isNameProperty = lucenceFieldName.toLowerCase() === 'name';
        inputString = inputString.trim();
        const isInputStringURI = MatchServiceHelper.isValidURI(inputString);

        if (isInputStringURI) {
            // Escape special characters in the URI
            inputString = `\\"${inputString}\\"`
        } else {
            // Remove common lucene special chars
            inputString = inputString.replace(/[+\-&|!(){}\[\]^"~*?:\\\/]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        }

        let terms: string[] = [inputString];

        if (isNameProperty) {
            terms = inputString.toLowerCase().split(/\s+/)
        }

        const fuzzyTerms = terms.map(term => {
            return term.length < 3 ? term : isInputStringURI ? `${term}` : `${term}~2`;
        });

        const nameQuery = fuzzyTerms.map(term => `${lucenceFieldName}:${term}`).join(' AND ');

        if (isNameProperty) {
            const alternateNameQuery = fuzzyTerms.map(term => `alternateName:${term}`).join(' AND ');
            return `( (${nameQuery})^3 OR (${alternateNameQuery}) )`
        } else {
            return `(${nameQuery})`
        }
    }

    static generateDateQuery(value: string, propertyId: string) {
        const xsdDateRegex = /^-?\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(Z|[+-](0\d|1[0-4]):[0-5]\d)?$/;

        function toLuceneDate(value: string) {
            const iso = new Date(value).toISOString();

            return iso
                .slice(0, 19)
                .replace(/[-:T]/g, '');
        }

        if (xsdDateRegex.test(value)) {
            const startDateRange = toLuceneDate(value);
            const endDateRange = toLuceneDate(`${value}T23:59:59Z`);

            return `( ${propertyId}:${startDateRange.slice(0, 8)} OR ${propertyId}Time:[${startDateRange} TO ${endDateRange}] )`;
        } else {
            return `( ${propertyId}Time:${toLuceneDate(value)}^3 )`;
        }

    }

    static formatReconciliationResponse(responseLanguage: LanguageEnum, sparqlResponse: any,
                                        reconciliationQuery: ReconciliationQuery, isQueryByURI: boolean): ResultCandidates[] {
        const bindings = sparqlResponse?.results?.bindings || [];
        const uniqueIds = [...new Set(bindings.map((binding: any) => binding["entity"].value))];
        const candidates: ResultCandidates[] = [];
        const recordFromQuery: RecordFromQuery = this.extractRecordFromQuery(reconciliationQuery);

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
            const subEventSet = new Set();
            currentBindings.forEach((binding: any) => {
                if (binding.subEvent && binding.subEvent.value) {
                    subEventSet.add(binding.subEvent.value);
                }
            });

            const additionalPropertiesForAutoMatch = {
                url: currentBinding["url"]?.value,
                postalCode: currentBinding["postalCode"]?.value,
                addressLocality: currentBinding["addressLocality"]?.value,
                startDate: currentBinding["startDate"]?.value,
                endDate: currentBinding["endDate"]?.value,
                locationName: currentBinding["locationName"]?.value,
                locationUri: currentBinding["locationUri"]?.value,
                locationContainedIn: currentBinding["locationContainedIn"]?.value,
                locationContains: currentBinding["locationContains"]?.value,
                wikidata: currentBinding["wikidata"]?.value,
                isni: currentBinding["isni"]?.value,
                alternateName: currentBinding["alternateName"]?.value,
                subEvents: subEventSet.size > 0 ? [...subEventSet] : undefined,
            };


            if (responseLanguage === LanguageEnum.FRENCH) {
                resultCandidate.name = nameFr || name || nameEn;
                resultCandidate.description = descriptionFr || description || descriptionEn;
            } else {
                resultCandidate.name = nameEn || name || nameFr;
                resultCandidate.description = descriptionEn || description || descriptionFr;
            }
            resultCandidate.score = Math.round(Number(currentBinding["total_score"]?.value) * 100) / 100;
            resultCandidate.match =
                isQueryByURI ||
                MatchServiceHelper.isAutoMatch(resultCandidate, reconciliationQuery, additionalPropertiesForAutoMatch,
                    recordFromQuery);

            resultCandidate.type = currentBindings.map((binding: any) => ({
                id: binding["type"]?.value,
                name: binding["type_label"]?.value,
            }));

            resultCandidate.features = Object.entries(currentBinding)
                .filter(([key]) => key.endsWith("_score") && key !== "total_score")
                .map(([key, val]: [string, { datatype: string, type: string, value: string }]) => {
                    const id = key.replace("_score", "");
                    return {
                        id,
                        name: `${id} score for the entity`,
                        value: Math.round(parseFloat(val.value) * 100) / 100
                    };
                });

            candidates.push(resultCandidate);
        }

        // If there are multiple results with match = true, then set all of them to false
        const matchCount = candidates.filter(candidate => candidate.match).length;

        return matchCount > 1
            ? candidates.map(candidate => ({...candidate, match: false}))
            : candidates;
    }

    static getGraphdbIndex(type: string, version?: SparqlVersionEnum): string {
        if (version === SparqlVersionEnum.V2) {
            return GRAPHDB_INDEX.LABELLED_ENTITIES
        }

        switch (type) {
            case Entities.EVENT:
                return GRAPHDB_INDEX.EVENT;
            case Entities.PLACE:
                return GRAPHDB_INDEX.PLACE;
            case Entities.ORGANIZATION:
                return GRAPHDB_INDEX.ORGANIZATION;
            case Entities.PERSON:
                return GRAPHDB_INDEX.PERSON;
            case Entities.AGENT:
                return GRAPHDB_INDEX.AGENT;
            case Entities.CONCEPT:
                return GRAPHDB_INDEX.CONCEPT;
            case Entities.EVENT_TYPE:
                return GRAPHDB_INDEX.EVENT_TYPE;
            case Entities.LIVE_PERFORMANCE_WORK:
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

    static isAutoMatch(recordFetched: {
        [key: string]: any;
    }, reconciliationQuery: ReconciliationQuery, additionalProperties: any, recordFromQuery: RecordFromQuery): boolean {

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
            veryClose: (a: string | undefined, b: string | undefined, alternateName?: string | undefined) => {
                if (!a || !b) return false;
                return nameSimilarity(a, b) || (alternateName ? nameSimilarity(alternateName, b) : false);
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
            exact: (a: string | undefined, b: string | undefined, excludeSpace?: boolean) => {
                if (!a || !b) return false;
                if (excludeSpace) {
                    return a.replaceAll(' ', '').toLowerCase() === b.replaceAll(' ', '').toLowerCase();
                }
                return a === b;
            },
            notDifferentIfBothExists: (a: string | undefined, b: string | undefined) => {
                if (!a || !b) return true;
                return a === b;
            },
            listNotDifferentIfBothExists: (a: string[] | undefined, b: string[] | undefined) => {
                if (!a || !b) return true;
                return b.every(item => a.includes(item));
            },
            exactUrl: (a: string, b: string) => {
                if (a && b) {
                    try {
                        const urlA = new URL(a.toLowerCase());
                        const urlB = new URL(b.toLowerCase());

                        let hostA = urlA.hostname;
                        let hostB = urlB.hostname;
                        // Normalize path (remove trailing slash unless root)
                        let pathA = urlA.pathname.replace(/\/+$/, "") || "/";
                        let pathB = urlB.pathname.replace(/\/+$/, "") || "/";
                        return `${hostA}${pathA}` === `${hostB}${pathB}`;
                    } catch (e) {
                        return false;
                    }
                } else {
                    return false;
                }
            },
            exactLocationOrRelated: (
                locationUri: string | undefined, locationUriFromQuery: string | undefined,
                locationContainedIn: string | undefined, locationContains: string | undefined,
                locationContainedInFromQuery: string | undefined, locationContainsFromQuery: string | undefined
            ): boolean => {
                if (!locationUri || !locationUriFromQuery) return false;
                // Same place directly
                if (matchers.exactUrl(locationUri, locationUriFromQuery)) return true;
                // locationUri is a room, locationUriFromQuery is its building
                if (locationContainedIn && matchers.exactUrl(locationContainedIn, locationUriFromQuery)) return true;
                // locationUriFromQuery is a room, locationUri is its building
                if (locationContainedInFromQuery && matchers.exactUrl(locationUri, locationContainedInFromQuery)) return true;
                // locationUri is a building that contains locationUriFromQuery
                if (locationContains && matchers.exactUrl(locationContains, locationUriFromQuery)) return true;
                // locationUriFromQuery is a building that contains locationUri
                if (locationContainsFromQuery && matchers.exactUrl(locationUri, locationContainsFromQuery)) return true;
                return false;
            },
        };

        const checkIfIsniIsExactMatch = [
            matchers.exact(additionalProperties.isni, recordFromQuery.isni),
        ];

        // Wikidata should be exact match
        const checkIfWikidataIdIsExactMatch = [
            matchers.exact(additionalProperties.wikidata, recordFromQuery.wikidata),
        ];

        const checkIfNameIsCloseAndWikidataIdIsNotDifferentIfBothPresent = [
            matchers.veryClose(recordFetched.name, recordFromQuery.name, additionalProperties.alternateName),
            matchers.notDifferentIfBothExists(additionalProperties.wikidata, recordFromQuery.wikidata),
        ];

        // Name should be close match and postal code should be exact match, wikidata should be exact match if present
        const checkIfNameIsClosePostalCodeIsExactAndWikidataIsNotDifferent = [
            matchers.veryClose(recordFetched.name, recordFromQuery.name, additionalProperties.alternateName),
            matchers.exact(additionalProperties.postalCode, recordFromQuery.postalCode, true),
            matchers.notDifferentIfBothExists(additionalProperties.wikidata, recordFromQuery.wikidata)
        ];

        //Name and address locality should be close match, postal code and wikidata should be exact match if present
        const checkIfNameAddressLocalityAreCloseAndPostalCodeAndWikidataIsNotDifferentForPlace =
            [
                matchers.veryClose(recordFetched.name, recordFromQuery.name, additionalProperties.alternateName),
                matchers.notDifferentIfBothExists(additionalProperties.postalCode, recordFromQuery.postalCode),
                matchers.veryClose(additionalProperties.addressLocality, recordFromQuery.addressLocality),
                matchers.notDifferentIfBothExists(additionalProperties.wikidata, recordFromQuery.wikidata)
            ];

        //Name is very close and URL is exact match, postal code and wikidata should be exact match if present
        const checkIfNameIsCloseUrlIsExactAndPostalCodeAndWikidataIsNotDifferentForPlace = [
            matchers.veryClose(recordFetched.name, recordFromQuery.name, additionalProperties.alternateName),
            matchers.exactUrl(
                additionalProperties.url,
                recordFromQuery.url as string,
            ),
            matchers.notDifferentIfBothExists(additionalProperties.postalCode, recordFromQuery.postalCode),
            matchers.notDifferentIfBothExists(additionalProperties.wikidata, recordFromQuery.wikidata)
        ];

        const checksNameStartDateEndDatePlaceUriAndSubEventsMatchForEvents = [
            matchers.veryClose(recordFetched.name, recordFromQuery.name, additionalProperties.alternateName),
            matchers.exactDate(additionalProperties.startDate, recordFromQuery.startDate),
            matchers.exactLocationOrRelated(
                additionalProperties.locationUri,
                recordFromQuery.locationUri as string | undefined,
                additionalProperties.locationContainedIn,
                additionalProperties.locationContains,
                recordFromQuery.locationContainedIn as string | undefined,
                recordFromQuery.locationContains as string | undefined,
            ),
            matchers.closeDates(additionalProperties.startDate, recordFromQuery.startDate as string,
                additionalProperties.endDate, recordFromQuery.endDate,
            ),
            matchers.listNotDifferentIfBothExists(additionalProperties.subEvents, recordFromQuery.subEvents)
        ];

        const checksNameStartDateEndDatePlaceNamePostalCodeAndSubEventsMatchForEvents = [
            matchers.veryClose(recordFetched.name, recordFromQuery.name, additionalProperties.alternateName),
            matchers.exactDate(additionalProperties.startDate, recordFromQuery.startDate),
            matchers.exact(additionalProperties.postalCode, recordFromQuery.postalCode, true),
            matchers.veryClose(additionalProperties.locationName, recordFromQuery.locationName),
            matchers.closeDates(
                additionalProperties.startDate, recordFromQuery.startDate as string, additionalProperties.endDate,
                recordFromQuery.endDate),
            matchers.listNotDifferentIfBothExists(additionalProperties.subEvents, recordFromQuery.subEvents)

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
                checksNameStartDateEndDatePlaceUriAndSubEventsMatchForEvents.every(Boolean) ||
                checksNameStartDateEndDatePlaceNamePostalCodeAndSubEventsMatchForEvents.every(Boolean)
            );
        } else {
            return (
                checkIfWikidataIdIsExactMatch.every(Boolean) ||
                checkIfIsniIsExactMatch.every(Boolean) ||
                checkIfNameIsCloseAndWikidataIdIsNotDifferentIfBothPresent.every(Boolean)
            );
        }
    }

    private static extractRecordFromQuery(reconciliationQuery: ReconciliationQuery) {
        const {conditions} = reconciliationQuery;
        const name = conditions.find((condition) => condition.matchType === "name")
            ?.propertyValue as string | undefined;

        let postalCode: string | undefined = undefined, addressLocality: string | undefined = undefined,
            addressRegion: string | undefined = undefined, url: string | undefined = undefined,
            startDate: string | undefined = undefined, subEvents: string[] | undefined,
            endDate: string | undefined = undefined,
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
                    case SCHEMA_ORG_PROPERTY_URI_MAP.LOCATION_ADDRESS_POSTAL_CODE:
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
                    case SCHEMA_ORG_PROPERTY_URI_MAP.SUB_EVENT:
                        const subEventValue = condition.propertyValue;
                        if (Array.isArray(subEventValue)) {
                            subEvents = subEventValue as string[];
                        } else if (subEventValue) {
                            subEvents = [subEventValue];
                        } else {
                            subEvents = undefined;
                        }
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
            subEvents,
            locationName,
            locationUri,
            locationContainedIn: undefined,
            locationContains: undefined,
            isni: isni ? (isni.length ? isni : undefined) : undefined,
            wikidata: wikidata ? (wikidata.length ? wikidata : undefined) : undefined,
        } as RecordFromQuery;
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

    static generateSubQueryToFetchAdditionalProperties() {

        let propertiesSubQuery: string = QUERIES_V2.COMMON_PROPERTIES_TO_FETCH_QUERY;
        let selectQueryFragment: string = QUERIES_V2.COMMON_SELECT_QUERY_FOR_ALL_ENTITY_PROPERTIES_SUB_QUERY;

        return {selectQueryFragment, propertiesSubQuery}

    }

    static generateBindStatementForScoreCalculation(scoreVariables: Set<string>) {
        return `BIND( ${[...scoreVariables].map(v => `COALESCE(${v}, 0)`)
            .join(' + ')}  as ?total_score)`;
    }

    static generateSubQueryToURI(uri: string, type: string, scoreVariable: string, limit: number) {
        let query = QUERIES_V2.SELECT_ENTITY_BY_URI_TEMPLATE;

        query = query.replace("PROPERTY_TYPE_PLACEHOLDER", type ? `<${type}>` : '?x');
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
                                                  lucenceIndex: string, type: string, scoreVariable: string, limit: number) {
        let query = QUERIES_V2.SUBQUERY_TO_FETCH_INDEXED_ENTITY_TEMPLATE;

        query = query.replace("INDEX_PLACEHOLDER", lucenceIndex);
        query = query.replace("LUCENE_QUERY_PLACEHOLDER", `${propertyName}: ${propertyValue}`);
        query = query.replace("TYPE_PLACEHOLDER", type ? `<${type}>` : '?x');
        query = query.replace("PROPERTY_SCORE_VARIABLE_PLACEHOLDER", scoreVariable);
        query = query + ` LIMIT ${limit}`;

        return `{ \n\t${query}\n }`;
    }

    static resolvedPropertyConditions(luceneIndex: string, propertyConditions: QueryCondition[], type: string,
                                      limit: number) {
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
            .replace("PROPERTY_PLACEHOLDER",
                `${(propertyId.startsWith('<') && propertyId.endsWith('>')) ? propertyId : `<${propertyId}>`}`)
            .replace("PROPERTY_VARIABLE_PLACEHOLDER", `<${propertyValue}>`)
            .replace("PROPERTY_SCORE_VARIABLE_PLACEHOLDER", scoreVariable)
    }

    static createSparqlQuery(selectVariables: string[], subQueries: string[], propertiesSubQuery: string,
                             scoreVariables: Set<string>) {
        const scoreVars = [...scoreVariables].join(' ');
        return [
            QUERIES_V2.PREFIXES,
            `SELECT DISTINCT ${selectVariables.join(' ')}`,
            `WHERE {`,
            subQueries.join('\n'),
            `# Properties to return with matching results`,
            `{${propertiesSubQuery}}`,
            MatchServiceHelper.generateBindStatementForScoreCalculation(scoreVariables),
            `}${QUERIES_V2.COMMON_GROUP_BY_STATEMENT} ${scoreVars}`,
            `ORDER BY DESC(?total_score)`
        ].join('\n');
    }

    static substitutePrefix(text: string) {
        // 1. Count total colons in the string
        const prefixCount = (text.match(/:/g) || []).length;

        // 2. If exactly one colon exists and the string contains 'schema:', swap it
        if (prefixCount === 1) {
            return text.replace('schema:', PREFIXES.SCHEMA)
                .replace('skos:', PREFIXES.SKOS)
                .replace('ado:', PREFIXES.ADO)
                ;
        }

        return text;

    }
}
