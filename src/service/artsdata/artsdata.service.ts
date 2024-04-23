import { Injectable } from "@nestjs/common";
import { ARTSDATA } from "../../config";
import { QUERIES } from "../../constant/recon-queries.constants";
import { HttpService } from "../http";
import { ReconciliationServiceHelper } from "../../helper/reconciliation-service.helper";
import { ReconciliationResponse } from "../../dto";

@Injectable()
export class ArtsdataService {

  constructor(private readonly httpService: HttpService) {
  }

  _getArtsdataEndPoint(): string {
    const sparqlEndpoint = new URL("repositories/artsdata", ARTSDATA.ENDPOINT);
    return sparqlEndpoint.toString();
  }

  async getReconciliationResult(name: string, type: string, limit?: number): Promise<ReconciliationResponse[]> {
    if (name === undefined || name === null || name === "" || type === undefined || type === null || type === "") {
      return [];
    }
    const sparqlEndpoint = this._getArtsdataEndPoint();
    let rawSparqlQuery: string = QUERIES.RECONCILITAION_QUERY
      .replace("QUERY_PLACE_HOLDER", name)
      .replace("TYPE_PLACE_HOLDER", type);
    if (limit && limit > 0) {
      rawSparqlQuery = rawSparqlQuery + " LIMIT " + limit;
    }
    const sparqlQuery = "query=" + encodeURIComponent(rawSparqlQuery);
    const response = await this.httpService.postRequest(sparqlEndpoint, sparqlQuery);
    return ReconciliationServiceHelper.formatReconciliationResponse(response);
  }


}
