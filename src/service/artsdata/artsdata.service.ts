import { Injectable } from "@nestjs/common";
import { ARTSDATA } from "../../config";
import { HttpService } from "../http";
import { MatchServiceHelper } from "../../helper";
import { LanguageEnum } from "../../enum";
import { QUERIES } from "../../constant";
import { ResultCandidates } from "../../dto";

@Injectable()
export class ArtsdataService {

  constructor(private readonly httpService: HttpService) {
  }

  /**
   * @name _getArtsdataEndPoint
   * @description Get the Artsdata endpoint
   * @returns {string}
   */
  private _getArtsdataEndPoint(): string {
    const route = "repositories/" + ARTSDATA.REPOSITORY;
    const sparqlEndpoint = new URL(route , ARTSDATA.ENDPOINT);
    return sparqlEndpoint.toString();
  }

  /**
   * @name executeSparqlQuery
   * @description Get raw result for sparql query from Artsdata
   * @param sparqlQuery
   */
  async executeSparqlQuery(sparqlQuery: string): Promise<any> {
    const sparqlEndpoint: string = this._getArtsdataEndPoint();
    const queryParam = "query=" + encodeURIComponent(sparqlQuery) + "&infer=false";
    return await this.httpService.postRequest(sparqlEndpoint , queryParam);
  }

  async getReconcileResultById(responseLanguage: LanguageEnum , id: string): Promise<ResultCandidates[]> {
    const uri = id.startsWith("http://kg.artsdata.ca/resource/") ? `<id>` : `<http://kg.artsdata.ca/resource/${id}>`;
    const rawSparqlQuery = QUERIES.RECONCILIATION_QUERY_BY_URI
      .replace("URI_PLACEHOLDER" , uri);
    const sparqlQuery: string = "query=" + encodeURIComponent(rawSparqlQuery) + "&infer=false";
    const sparqlEndpoint: string = this._getArtsdataEndPoint();
    const response = await this.httpService.postRequest(sparqlEndpoint , sparqlQuery);
    return MatchServiceHelper.formatReconciliationResponse(responseLanguage , response);
  }
}
