import { Injectable } from "@nestjs/common";
import { ARTSDATA } from "../../config";
import { HttpService } from "../http";
import { ReconciliationServiceHelper } from "../../helper";
import { MatchRequestLanguageEnum } from "../../enum";
import { QUERIES } from "../../constant";
import { ResultCandidates } from "../../dto";

@Injectable()
export class ArtsdataService {

  constructor(private readonly httpService: HttpService) {
  }

  private _getArtsdataEndPoint(): string {
    const route = "repositories/" + ARTSDATA.REPOSITORY;
    const sparqlEndpoint = new URL(route , ARTSDATA.ENDPOINT);
    return sparqlEndpoint.toString();
  }

  async getReconciliationResult(responseLanguage: MatchRequestLanguageEnum , sparqlQuery: string , name: string) {

    const sparqlEndpoint: string = this._getArtsdataEndPoint();
    const response = await this.httpService.postRequest(sparqlEndpoint , sparqlQuery);
    return ReconciliationServiceHelper.formatReconciliationResponse(responseLanguage , response , name);
  }

  async getReconcileResultById(responseLanguage: MatchRequestLanguageEnum , id: string): Promise<ResultCandidates[]> {
    const uri = id.startsWith("http://kg.artsdata.ca/resource/") ? `<id>` : `<http://kg.artsdata.ca/resource/${id}>`;
    const rawSparqlQuery = QUERIES.RECONCILIATION_QUERY_BY_URI
      .replace("URI_PLACEHOLDER" , uri);
    const sparqlQuery: string = "query=" + encodeURIComponent(rawSparqlQuery) + "&infer=false";
    const sparqlEndpoint: string = this._getArtsdataEndPoint();
    const response = await this.httpService.postRequest(sparqlEndpoint , sparqlQuery);
    return ReconciliationServiceHelper.formatReconciliationResponse(responseLanguage , response);
  }
}
