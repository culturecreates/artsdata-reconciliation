import { Injectable } from "@nestjs/common";
import { ArtsdataService } from "../artsdata";
import { SUGGEST_QUERY } from "../../constant/suggest/suggest-queries.constants";
import { ArtsdataConstants } from "../../constant";

@Injectable()
export class SuggestService {

  constructor(private readonly _artsdataService: ArtsdataService) {
  }

  private _generateSparqlQuery(query: string , cursor: number) {
    const sparqlQuery = SUGGEST_QUERY.ENTITY.replace("QUERY_PLACE_HOLDER" , query);
    if (cursor) {
      return `${sparqlQuery} OFFSET ${cursor}`;
    }
    return sparqlQuery;
  }

  async getSuggestedEntities(prefix: string , cursor: number) {
    const sparqlQuery = this._generateSparqlQuery(prefix , cursor);
    const result = await this._artsdataService.executeSparqlQuery(sparqlQuery);
    return this._formatResult(result);
  }

  private _formatResult(result: any) {
    return result.results.bindings?.map((item: any) => {
      let name , description , id;
      if (item) {
        name = item.name?.value;
        description = item.description?.value;
        id = item.entity?.value?.split(ArtsdataConstants.PREFIX).pop();
      }
      return { id , name , description };
    });
  }
}
