import {Injectable} from "@nestjs/common";
import {ArtsdataService} from "../artsdata";
import {ArtsdataConstants, SUGGEST_QUERY} from "../../constant";
import {GRAPHDB_INDEX} from "../../config";
import {Exception} from "../../helper";

@Injectable()
export class SuggestService {

    constructor(private readonly _artsdataService: ArtsdataService) {
    }

    async getSuggestedEntities(prefix: string, cursor: number) {
        return this._getSuggestions(prefix, cursor, this._generateSparqlQueryForEntitySuggestion.bind(this));
    }

    async getSuggestedProperties(prefix: string, cursor: number) {
        const suggestedProperties = await this._getSuggestions(prefix, cursor, this._generateSparqlQueryForPropertySuggestion.bind(this));
        const supportedQualifiers = MatchServiceHelper.getAllQualifiers()
        return suggestedProperties.result.map(result => {
            return {...result, matchQualifiers: supportedQualifiers}
        })
    }

    async getSuggestedTypes(prefix: string, cursor: number) {
        return this._getSuggestions(prefix, cursor, this._generateSparqlQueryForPropertyType.bind(this));
    }

    private async _getSuggestions(prefix: string, cursor: number,
                                  queryGenerator: (prefix: string, cursor: number) => string
    ) {
        this._validatePrefix(prefix);
        const sparqlQuery = queryGenerator(prefix, cursor);
        const result = await this._artsdataService.executeSparqlQuery(sparqlQuery);
        return this._formatResult(result);
    }

    private _generateSparqlQueryForEntitySuggestion(query: string, cursor: number) {
        const sparqlQuery = SUGGEST_QUERY.ENTITY.replace("QUERY_PLACE_HOLDER", query + "*")
            .replace("INDEX_PLACE_HOLDER", GRAPHDB_INDEX.ENTITY)
            .replace("QUERY_PLACEHOLDER", query.toLowerCase())
            .replace("FILTER_CONDITION_PLACEHOLDER", `FILTER (STRSTARTS(STR(?entity),"${ArtsdataConstants.PREFIX_INCLUDING_K}")) `);
        if (cursor) {
            return `${sparqlQuery} OFFSET ${cursor}`;
        }
        return sparqlQuery;
    }

    private _generateSparqlQueryForPropertySuggestion(query: string, cursor: number) {
        const sparqlQuery = SUGGEST_QUERY.ENTITY.replace("QUERY_PLACE_HOLDER", query + "*")
            .replace("INDEX_PLACE_HOLDER", GRAPHDB_INDEX.PROPERTY)
            .replace("QUERY_PLACEHOLDER", query.toLowerCase())
            .replace("FILTER_CONDITION_PLACEHOLDER", "");
        if (cursor) {
            return `${sparqlQuery} OFFSET ${cursor}`;
        }
        return sparqlQuery;
    }

    private _generateSparqlQueryForPropertyType(query: string, cursor: number) {
        const sparqlQuery = SUGGEST_QUERY.ENTITY.replace("QUERY_PLACE_HOLDER", query + "*")
            .replace("INDEX_PLACE_HOLDER", GRAPHDB_INDEX.TYPE)
            .replace("QUERY_PLACEHOLDER", query.toLowerCase())
            .replace("FILTER_CONDITION_PLACEHOLDER", "FILTER NOT EXISTS { ?entity a rdf:Property }");

        if (cursor) {
            return `${sparqlQuery} OFFSET ${cursor}`;
        }
        return sparqlQuery;
    }

    private _formatResult(result: any) {
        const results: any[] = [];
        result.results.bindings?.forEach((item: any) => {
            const currentId = item.entity?.value?.split(ArtsdataConstants.PREFIX).pop();
            const currentEntry = results.find((r) => r.id === currentId);

            if (!currentEntry) {
                results.push({
                    id: currentId,
                    name: item.name?.value,
                    description: item.description?.value,
                    image: item.image?.value,
                    type: item.typeLabel?.value
                });
            } else if (item.typeLabel?.value) {
                const currentType = item.typeLabel.value;
                if (typeof currentEntry.type === "string") {
                    currentEntry.type = [currentEntry.type, currentType];
                } else {
                    currentEntry.type.push(currentType);
                }
            }
        });
        return {result: results};
    }

    private _validatePrefix(prefix: string) {
        if (!prefix.trim()) {
            Exception.badRequest("Prefix cannot be empty");
        }
    }
}
