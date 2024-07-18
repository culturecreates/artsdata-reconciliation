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

  private _getArtsdataEndPoint(): string {
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
    return ReconciliationServiceHelper.formatReconciliationResponse(response, name);
  }

  private _getSparqlQuery(name: string, type: string, limit: number | undefined): string {
    const graphdbIndex: string = ReconciliationServiceHelper.getGraphdbIndex(type);
    let rawSparqlQuery: string = QUERIES.RECONCILIATION_QUERY
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
    let propertyTriples: string = "";
    let rawConditionValue: string;
    let formattedConditionValue: string;
    propertyConditions.forEach((condition) => {
      rawConditionValue = condition.v;
      formattedConditionValue = ReconciliationServiceHelper.isValidURI(rawConditionValue) ? `<${rawConditionValue}>` : `"${rawConditionValue}"`;
      if (condition.required) {
        propertyTriples = propertyTriples.concat(`?entity schema:${condition.pid} ${formattedConditionValue} .`);
      } else {
        propertyTriples = propertyTriples.concat(`OPTIONAL {?entity schema:${condition.pid} ${formattedConditionValue} .}`);
      }
    });
    rawSparqlQuery = rawSparqlQuery.replace("PROPERTY_PLACE_HOLDER", propertyTriples);
    return rawSparqlQuery;
  }

  async getReconcileResultById(id: string) {
    const uri = id.startsWith("http://kg.artsdata.ca/resource/") ? `<id>` : `<http://kg.artsdata.ca/resource/${id}>`;
    const rawSparqlQuery = QUERIES.RECONCILIATION_BY_ID_QUERY.replace("URI_PLACEHOLDER", uri);
    const sparqlQuery: string = "query=" + encodeURIComponent(rawSparqlQuery) + "&infer=false";
    const sparqlEndpoint: string = this._getArtsdataEndPoint();
    const response = await this.httpService.postRequest(sparqlEndpoint, sparqlQuery);
    return ReconciliationServiceHelper.formatReconciliationResponse(response);
  }
}
