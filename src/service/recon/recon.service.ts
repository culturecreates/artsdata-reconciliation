import { Injectable } from "@nestjs/common";
import { ArtsdataService } from "../artsdata";
import { ManifestService } from "../manifest";
import { QueryCondition, ReconciliationRequest, ReconciliationResponse, ReconciliationResults } from "../../dto";
import { Exception, ReconciliationServiceHelper } from "../../helper";
import { ReconRequestMatchTypeEnum } from "../../enum";
import { ArtsdataProperties } from "../../constant/properties.constants";
import { QUERIES } from "../../constant/recon-queries.constants";

@Injectable()
export class ReconciliationService {

  constructor(private readonly _artsdataService: ArtsdataService,
              private readonly _manifestService: ManifestService) {
  }

  async reconcileByRawQueries(rawQueries: string): Promise<any> {

    if (!rawQueries) {
      return this._manifestService.getServiceManifest();
    }
    let queries;
    try {
      queries = JSON.parse(rawQueries);
    } catch (e) {
      return Exception.badRequest("The request is not a valid JSON object.");
    }
    return await this.reconcileByQueries(queries);
  }

  async reconcileByQueries(reconciliationRequest: ReconciliationRequest): Promise<ReconciliationResponse> {

    const { queries } = reconciliationRequest;
    const results: ReconciliationResults[] = [];
    if (!queries) {
      return { results: [] };
    }
    for (const reconciliationQuery of queries) {
      const { type, limit, conditions } = reconciliationQuery;
      const { name, propertyConditions } = this._resolveConditions(conditions);
      const isQueryByURI = ReconciliationServiceHelper.isQueryByURI(name as string);
      const rawSparqlQuery: string = this._getSparqlQuery(name as string, isQueryByURI, type, limit);
      const rawSparqlQueryWithPropertyFilters = this._resolvePropertyConditions(rawSparqlQuery, propertyConditions);
      const sparqlQuery: string = "query=" + encodeURIComponent(rawSparqlQueryWithPropertyFilters);
      const candidates = await this._artsdataService.getReconciliationResult(sparqlQuery, name as string);
      results.push({ candidates: candidates });
    }
    return { results };
  }

  private _resolvePropertyConditions(rawSparqlQuery: string, propertyConditions: QueryCondition[]) {
    let propertyTriples: string = "";
    let rawConditionValue: string;
    let formattedConditionValue: string;
    propertyConditions.forEach((condition) => {
      rawConditionValue = condition.v;
      formattedConditionValue = ReconciliationServiceHelper.isValidURI(rawConditionValue) ? `<${rawConditionValue}>` : `"${rawConditionValue}"`;
      formattedConditionValue = this._resolvePropertyValue(rawConditionValue, condition.pid as string);
      if (condition.required) {
        propertyTriples = propertyTriples.concat(`?entity ${condition.pid} ${formattedConditionValue} .`);
      } else {
        propertyTriples = propertyTriples.concat(`OPTIONAL {?entity ${condition.pid} ${formattedConditionValue} .}`);
      }
    });
    rawSparqlQuery = rawSparqlQuery.replace("PROPERTY_PLACE_HOLDER", propertyTriples);
    return rawSparqlQuery;
  }

  private _getSparqlQuery(name: string, isQueryByURI: boolean, type: string, limit: number | undefined): string {
    const graphdbIndex: string = ReconciliationServiceHelper.getGraphdbIndex(type);

    const rawQuery = isQueryByURI ? QUERIES.RECONCILIATION_QUERY_BY_URI : QUERIES.RECONCILIATION_QUERY;
    if (isQueryByURI && name.startsWith("K")) {
      name = `<http://kg.artsdata.ca/resource/${name}>`;
    }else{
      name = `<${name}>`;
    }

    const queryReplacementString: string = name ? `values ?query { ${name}  }` : "";
    const queryFilterReplacementString: string = name ? `      luc:query ?query ;` : "";
    const typePlaceholderReplace: string = type ? `values ?type { ${type} }` : "";

    let rawSparqlQuery: string = rawQuery
      .replace("INDEX_PLACE_HOLDER", graphdbIndex)
      .replace("QUERY_PLACE_HOLDER", queryReplacementString)
      .replace("QUERY_FILTER_PLACE_HOLDER", queryFilterReplacementString)
      .replace("TYPE_PLACE_HOLDER", typePlaceholderReplace)
      .replace("URI_PLACEHOLDER", `${name}`);

    if (limit && limit > 0) {
      rawSparqlQuery = rawSparqlQuery + " LIMIT " + limit;
    }
    return rawSparqlQuery;
  }

  private _resolveConditions(conditions: QueryCondition[]) {
    const name = conditions
      .find(condition => condition.matchType == ReconRequestMatchTypeEnum.NAME)?.v;
    const propertyConditions = conditions
      .filter(condition => condition.matchType == ReconRequestMatchTypeEnum.PROPERTY);
    return { name, propertyConditions };
  }

  async reconcileById(id: string) {
    if (id?.trim()) {
      return await this._artsdataService.getReconcileResultById(id);
    }
    return undefined;
  }

  private _resolvePropertyValue(value: string, property: string) {
    switch (property) {
      case ArtsdataProperties.START_DATE:
      case ArtsdataProperties.END_DATE:
        return `"${value}"^^xsd:dateTime`;
      case ArtsdataProperties.SAME_AS:
      case ArtsdataProperties.LOCATION:
      case ArtsdataProperties.ORGANIZER:
      case ArtsdataProperties.PERFORMER:
      case ArtsdataProperties.ADDITIONAL_TYPE:
      case ArtsdataProperties.MAIN_ENTITY_OF_PAGE:
      case ArtsdataProperties.AUDIENCE:
      case ArtsdataProperties.EVENT_STATUS:
      case ArtsdataProperties.IN_LANGUAGE:
      case ArtsdataProperties.SUB_EVENT:
        return `<${value}>`;
      default:
        return `'${value}'`;
    }
  }
}
