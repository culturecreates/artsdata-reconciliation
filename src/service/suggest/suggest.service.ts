import { Injectable } from "@nestjs/common";
import { ArtsdataService } from "../artsdata";
import { ArtsdataConstants , SUGGEST_QUERY } from "../../constant";
import { GRAPHDB_INDEX } from "../../config";
import { Exception } from "../../helper";

@Injectable()
export class SuggestService {

  constructor(private readonly _artsdataService: ArtsdataService) {
  }

  async getSuggestedEntities(prefix: string , cursor: number) {
    this._validatePrefix(prefix);
    const sparqlQuery = this._generateSparqlQueryForEntitySuggestion(prefix , cursor);
    const result = await this._artsdataService.executeSparqlQuery(sparqlQuery);
    return this._formatResult(result);
  }

  async getSuggestedProperties(prefix: string , cursor: number) {
    this._validatePrefix(prefix);
    const sparqlQuery = this._generateSparqlQueryForPropertySuggestion(prefix , cursor);
    const result = await this._artsdataService.executeSparqlQuery(sparqlQuery);
    return this._formatResult(result);
  }

  async getSuggestedTypes(prefix: string , cursor: number) {
    this._validatePrefix(prefix);
    const sparqlQuery = this._generateSparqlQueryForPropertyType(prefix , cursor);
    const result = await this._artsdataService.executeSparqlQuery(sparqlQuery);
    return this._formatResult(result);
  }

  private _generateSparqlQueryForEntitySuggestion(query: string , cursor: number) {
    const sparqlQuery = SUGGEST_QUERY.ENTITY.replace("QUERY_PLACE_HOLDER" , query + "*")
      .replace("INDEX_PLACE_HOLDER" , GRAPHDB_INDEX.ENTITY)
      .replace("QUERY_PLACEHOLDER" , query.toLowerCase())
      .replace("FILTER_CONDITION_PLACEHOLDER" , "FILTER (CONTAINS(STR(?entity),\"kg.artsdata.ca/resource/K\")) ");
    if (cursor) {
      return `${sparqlQuery} OFFSET ${cursor}`;
    }
    return sparqlQuery;
  }

  private _generateSparqlQueryForPropertySuggestion(query: string , cursor: number) {
    const sparqlQuery = SUGGEST_QUERY.ENTITY.replace("QUERY_PLACE_HOLDER" , query + "*")
      .replace("INDEX_PLACE_HOLDER" , GRAPHDB_INDEX.PROPERTY)
      .replace("QUERY_PLACEHOLDER" , query.toLowerCase())
      .replace("FILTER_CONDITION_PLACEHOLDER" , "");
    if (cursor) {
      return `${sparqlQuery} OFFSET ${cursor}`;
    }
    return sparqlQuery;
  }

  private _generateSparqlQueryForPropertyType(query: string , cursor: number) {
    const sparqlQuery = SUGGEST_QUERY.ENTITY.replace("QUERY_PLACE_HOLDER" , query + "*")
      .replace("INDEX_PLACE_HOLDER" , GRAPHDB_INDEX.TYPE)
      .replace("QUERY_PLACEHOLDER" , query.toLowerCase())
      .replace("FILTER_CONDITION_PLACEHOLDER" , "FILTER NOT EXISTS { ?entity a rdf:Property }");

    if (cursor) {
      return `${sparqlQuery} OFFSET ${cursor}`;
    }
    return sparqlQuery;
  }

  private _formatResult(result: any) {
    const results: any[] = [];
    result.results.bindings?.forEach((item: any) => {
      const currentId = item.entity?.value?.split(ArtsdataConstants.PREFIX).pop();
      const CurrentName = item.name?.value;
      const currentDescription = item.description?.value;
      const currentImage = item.image?.value;
      const currentType = item.typeLabel?.value;
      if (!results.filter((r) => r.id === currentId).length) {
        results.push({
          id: currentId ,
          name: CurrentName ,
          description: currentDescription ,
          image: currentImage ,
          type: currentType
        });
      } else {
        const existingEntry = results.find((r) => r.id === currentId);
        const existingType = existingEntry.type;
        if (currentType) {
          if (existingEntry.type) {
            if (existingType && typeof existingType === "string") {
              existingEntry.type = [existingType , currentType];
            } else {
              existingEntry.type.push(currentType);
            }
          }
        }
      }
    });
    return { result: results };
  }

  private _validatePrefix(prefix: string) {
    if (prefix.trim().length === 0) {
      Exception.badRequest("Prefix cannot be empty");
    }
  }
}
