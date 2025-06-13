import { Injectable } from "@nestjs/common";
import { ArtsdataService } from "../artsdata";
import { SUGGEST_QUERY } from "../../constant/suggest/suggest-queries.constants";
import { ArtsdataConstants } from "../../constant";
import { GRAPHDB_INDEX } from "../../config";

@Injectable()
export class SuggestService {

  constructor(private readonly _artsdataService: ArtsdataService) {
  }

  private _generateSparqlQueryForEntitySuggestion(query: string , cursor: number) {
    const sparqlQuery = SUGGEST_QUERY.ENTITY.replace("QUERY_PLACE_HOLDER" , query)
      .replace("INDEX_PLACE_HOLDER" , GRAPHDB_INDEX.ENTITY)
      .replace("  FILTER_BY_ENTITY_PLACEHOLDER" , "FILTER (CONTAINS(STR(?entity),\"kg.artsdata.ca/resource/K\")) ");
    if (cursor) {
      return `${sparqlQuery} OFFSET ${cursor}`;
    }
    return sparqlQuery;
  }

  async getSuggestedEntities(prefix: string , cursor: number) {
    const sparqlQuery = this._generateSparqlQueryForEntitySuggestion(prefix , cursor);
    const result = await this._artsdataService.executeSparqlQuery(sparqlQuery);
    return this._formatResult(result);
  }

  private _formatResult(result: any) {
    const results: any[] = [];
    result.results.bindings?.forEach((item: any) => {
      const id = item.entity?.value?.split(ArtsdataConstants.PREFIX).pop();
      const name = item.name?.value;
      const description = item.description?.value;
      const image = item.image?.value;
      const type = item.typeLabel?.value;
      if (!results.filter((r) => r.id === id).length) {
        results.push({ id , name , description , image , type });
      } else {
        //Skipping duplicate entries
      }
    });
    return {result: results};
  }

  async getSuggestedProperties(prefix: string , cursor: number) {
    const sparqlQuery = this._generateSparqlQueryForPropertySuggestion(prefix , cursor);
    const result = await this._artsdataService.executeSparqlQuery(sparqlQuery);
    return this._formatResult(result);
  }

  private _generateSparqlQueryForPropertySuggestion(query: string , cursor: number) {
    const sparqlQuery = SUGGEST_QUERY.ENTITY.replace("QUERY_PLACE_HOLDER" , query)
      .replace("INDEX_PLACE_HOLDER" , GRAPHDB_INDEX.PROPERTY)
      .replace("FILTER_BY_ENTITY_PLACEHOLDER" , "");
    if (cursor) {
      return `${sparqlQuery} OFFSET ${cursor}`;
    }
    return sparqlQuery;

  }

  private _generateSparqlQueryForPropertyType(query: string , cursor: number) {
    const sparqlQuery = SUGGEST_QUERY.ENTITY.replace("QUERY_PLACE_HOLDER" , query)
      .replace("INDEX_PLACE_HOLDER" , GRAPHDB_INDEX.TYPE)
      .replace("FILTER_BY_ENTITY_PLACEHOLDER" , "");
    if (cursor) {
      return `${sparqlQuery} OFFSET ${cursor}`;
    }
    return sparqlQuery;
  }

  async getSuggestedTypes(query: string , cursor: number) {
    const sparqlQuery = this._generateSparqlQueryForPropertyType(query , cursor);
    const result = await this._artsdataService.executeSparqlQuery(sparqlQuery);
    return this._formatResult(result);
  }
}
