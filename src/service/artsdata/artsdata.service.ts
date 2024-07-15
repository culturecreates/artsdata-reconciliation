import { Injectable } from "@nestjs/common";
import { ARTSDATA } from "../../config";
import { QUERIES } from "../../constant/recon-queries.constants";
import { HttpService } from "../http";
import { ReconciliationServiceHelper } from "../../helper/reconciliation-service.helper";
import { QueryCondition } from "../../dto";

@Injectable()
export class ArtsdataService {

  constructor(private readonly httpService: HttpService) {
  }

  _getArtsdataEndPoint(): string {
    const route = "repositories/" + ARTSDATA.REPOSITORY;
    const sparqlEndpoint = new URL(route, ARTSDATA.ENDPOINT);
    return sparqlEndpoint.toString();
  }

  async getReconciliationResult(name: string, propertyConditions: QueryCondition[], type: string, limit?: number) {
    if (name === undefined || name === null || name === "") {
      return [];
    }

    const rawSparqlQuery: string = this._getSparqlQuery(name, type, limit);
    const rawSparqlQueryWithPropertyFilters = this._resolvePropertyConditions(rawSparqlQuery, propertyConditions);
    const sparqlQuery: string = "query=" + encodeURIComponent(rawSparqlQueryWithPropertyFilters);
    const sparqlEndpoint: string = this._getArtsdataEndPoint();
    const response = await this.httpService.postRequest(sparqlEndpoint, sparqlQuery);
    return ReconciliationServiceHelper.formatReconciliationResponse(name, response);
  }


  private _getSparqlQuery(name: string, type: string, limit: number | undefined): string {
    const graphdbIndex: string = ReconciliationServiceHelper.getGraphdbIndex(type);
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
    return rawSparqlQuery;
  }

  private _resolvePropertyConditions(rawSparqlQuery: string, propertyConditions: QueryCondition[]) {
    const propertyTriples: string = "";
    propertyConditions.forEach((condition) => {
      if (condition.required) {
        propertyTriples.concat(`?entity schema:${condition.pid} ${condition.v} .`);
      } else {
        propertyTriples.concat(`OPTIONAL {?entity schema:${condition.pid} ${condition.v} .}`);
      }
    });
    rawSparqlQuery = rawSparqlQuery.replace("PROPERTY_PLACE_HOLDER", propertyTriples);
    return rawSparqlQuery;
  }
}
