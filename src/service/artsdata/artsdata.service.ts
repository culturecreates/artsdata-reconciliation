import { Injectable } from "@nestjs/common";
import { ARTSDATA } from "../../config";
import { QUERIES } from "../../constant/recon-queries.constants";
import { HttpService } from "../http";
import { ReconciliationServiceHelper } from "../../helper/reconciliation-service.helper";

@Injectable()
export class ArtsdataService {

  constructor(private readonly httpService: HttpService) {
  }

  _getArtsdataEndPoint(): string {
    const route = "repositories/" + ARTSDATA.REPOSITORY;
    const sparqlEndpoint = new URL(route, ARTSDATA.ENDPOINT);
    return sparqlEndpoint.toString();
  }

  async getReconciliationResult(name: string, type: string, limit?: number) {
    if (name === undefined || name === null || name === "") {
      return [];
    }
    const graphdbIndex: string = ReconciliationServiceHelper.getGraphdbIndex(type);
    const sparqlEndpoint: string = this._getArtsdataEndPoint();
    let rawSparqlQuery: string = QUERIES.RECONCILITAION_QUERY
      .replace("INDEX_PLACE_HOLDER", graphdbIndex)
      .replace("QUERY_PLACE_HOLDER", name);
    let typePlaceholderReplace: string;
    if (type) {
      typePlaceholderReplace = `values ?type { ${type} }`;
    } else {
      typePlaceholderReplace = "";
    }
    rawSparqlQuery = rawSparqlQuery.replace("TYPE_PLACE_HOLDER", typePlaceholderReplace);


    if (limit && limit > 0) {
      rawSparqlQuery = rawSparqlQuery + " LIMIT " + limit;
    }
    const sparqlQuery = "query=" + encodeURIComponent(rawSparqlQuery);
    const response = await this.httpService.postRequest(sparqlEndpoint, sparqlQuery);
    return ReconciliationServiceHelper.formatReconciliationResponse(name, response);
  }


}
