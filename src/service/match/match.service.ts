import { Injectable } from "@nestjs/common";
import { ArtsdataService } from "../artsdata";
import { ManifestService } from "../manifest";

import { Exception , ReconciliationServiceHelper } from "../../helper";
import { ArtsdataProperties , QUERIES } from "../../constant";
import { QueryCondition , ReconciliationRequest , ReconciliationResults , ResultCandidates } from "../../dto";
import { MatchQualifierEnum , MatchTypeEnum } from "../../enum";

@Injectable()
export class MatchService {

  constructor(private readonly _artsdataService: ArtsdataService ,
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

  private _resolvePropertyConditions(rawSparqlQuery: string , propertyConditions: QueryCondition[]) {
    let propertyTriples: string = "";
    propertyConditions.forEach((condition , index) => {
      propertyTriples = propertyTriples.concat(this._generateTripleForCondition(condition , index));
    });
    rawSparqlQuery = rawSparqlQuery.replace("PROPERTY_PLACE_HOLDER" , propertyTriples);
    return rawSparqlQuery;

  }

  private _getSparqlQuery(name: string | undefined , isQueryByURI: boolean , type: string , limit: number | undefined): string {
    const graphdbIndex: string = ReconciliationServiceHelper.getGraphdbIndex(type);

    const rawQuery = isQueryByURI ? QUERIES.RECONCILIATION_QUERY_BY_URI : QUERIES.RECONCILIATION_QUERY;
    if (name) {
      name = isQueryByURI ? (name?.startsWith("K") ?
          "<http://kg.artsdata.ca/resource/" + name + ">" :
          "<" + name + ">") :
        "\"" + name + "\"";
    }
    const queryReplacementString: string = name ? `values ?query { ${name}  }` : "";
    const queryFilterReplacementString: string = name ? `      luc:query ?query ;` : "";
    const typePlaceholderReplace: string = type ? `values ?type { ${type} }` : "";

    return rawQuery
      .replace("INDEX_PLACE_HOLDER" , graphdbIndex)
      .replace("QUERY_PLACE_HOLDER" , queryReplacementString)
      .replace("QUERY_FILTER_PLACE_HOLDER" , queryFilterReplacementString)
      .replace("TYPE_PLACE_HOLDER" , typePlaceholderReplace)
      .replace("URI_PLACEHOLDER" , `${name}`)
      .replace("LIMIT_PLACE_HOLDER" , limit ? `LIMIT ${limit}` : "");
  }

  private _resolveConditions(conditions: QueryCondition[]) {
    const name = conditions
      .find(condition => condition.matchType == MatchTypeEnum.NAME)?.v;
    const propertyConditions = conditions
      .filter(condition => condition.matchType == MatchTypeEnum.PROPERTY);
    return { name , propertyConditions };
  }

  private _resolvePropertyValue(value: string , property: string) {
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
        return ReconciliationServiceHelper.isValidURI(value) ? `<${value}>` : `"${value}"`;
      default:
        return `"${value}"`;
    }
  }

  private _generateTripleForCondition(condition: QueryCondition , index: number): string {
    const { required , pid , v: rawConditionValue , matchQualifier } = condition;
    const formattedConditionValue = this._resolvePropertyValue(rawConditionValue , pid as string);

    const formattedPropertyId = ReconciliationServiceHelper.isValidURI(pid as string) ? `<${pid}>` : `${pid}`;

    let triple;
    if (matchQualifier !== MatchQualifierEnum.WILDCARD_MATCH) {
      triple = `?entity ${formattedPropertyId} ${formattedConditionValue} .`;
    } else {
      const objectId = `?obj_${index + 1}`;
      triple = `?entity ${formattedPropertyId} ${objectId}
        FILTER REGEX(${objectId}, ${formattedConditionValue}, "i").`;
    }
    return required ? triple : `OPTIONAL { ${triple} }`;
  }

  async reconcileByQueries(reconciliationRequest: ReconciliationRequest) {

    const { queries } = reconciliationRequest;
    const results: ReconciliationResults[] = [];
    if (!queries) {
      return { results: [] };
    }
    for (const reconciliationQuery of queries) {
      const { type , limit , conditions } = reconciliationQuery;
      const { name , propertyConditions } = this._resolveConditions(conditions);
      const isQueryByURI = !!name && ReconciliationServiceHelper.isQueryByURI(name);
      const rawSparqlQuery: string = this._getSparqlQuery(name , isQueryByURI , type , limit);
      const rawSparqlQueryWithPropertyFilters = this._resolvePropertyConditions(rawSparqlQuery , propertyConditions);
      const sparqlQuery: string = "query=" + encodeURIComponent(rawSparqlQueryWithPropertyFilters) + "&infer=false";

      const candidates: ResultCandidates[] = await this._artsdataService.getReconciliationResult(sparqlQuery , name as string);
      results.push({ candidates });
    }
    return { results };
  }
}
