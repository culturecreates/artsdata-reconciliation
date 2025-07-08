import { Injectable } from "@nestjs/common";
import { ArtsdataService } from "../artsdata";
import { ManifestService } from "../manifest";
import { Exception , MatchServiceHelper } from "../../helper";
import { ArtsdataProperties , QUERIES } from "../../constant";
import { QueryCondition , ReconciliationRequest , ReconciliationResponse , ReconciliationResults } from "../../dto";
import { LanguageEnum , MatchQualifierEnum , MatchQuantifierEnum , MatchTypeEnum } from "../../enum";


@Injectable()
export class MatchService {

  constructor(private readonly _artsdataService: ArtsdataService ,
              private readonly _manifestService: ManifestService) {
  }

  /**
   * @name reconcileByRawQueries
   * @description Reconcile by raw queries
   * @param acceptLanguage
   * @param rawQueries
   * @returns {Promise<any>}
   */
  async reconcileByRawQueries(acceptLanguage: LanguageEnum , rawQueries: string): Promise<any> {
    if (!rawQueries) {
      return this._manifestService.getServiceManifest();
    }
    let queries;
    try {
      queries = JSON.parse(rawQueries);
    } catch (e) {
      return Exception.badRequest("The request is not a valid JSON object.");
    }
    return await this.reconcileByQueries(acceptLanguage , queries);
  }

  /**
   * @private
   * @name reconcileByQueries
   * @description Resolve property conditions
   * @param rawSparqlQuery
   * @param propertyConditions
   * @returns {string}
   */
  private _resolvePropertyConditions(rawSparqlQuery: string , propertyConditions: QueryCondition[]): string {
    let propertyTriples: string = "";
    propertyConditions.forEach((condition , index) => {
      propertyTriples = propertyTriples.concat(this._generateTripleFromCondition(condition , index));
    });
    rawSparqlQuery = rawSparqlQuery.replace("PROPERTY_PLACE_HOLDER" , propertyTriples);
    return rawSparqlQuery;

  }

  /**
   * @private
   * @name _getSparqlQuery
   * @description Get SPARQL query
   * @param name
   * @param isQueryByURI
   * @param type
   * @param limit
   * @return {string}
   */
  private _getSparqlQuery(name: string | undefined , isQueryByURI: boolean , type: string , limit: number): string {
    const graphdbIndex: string = MatchServiceHelper.getGraphdbIndex(type);

    const rawQuery = isQueryByURI ? QUERIES.RECONCILIATION_QUERY_BY_URI : QUERIES.RECONCILIATION_QUERY;
    if (name) {
      name = isQueryByURI ? (name?.startsWith("K") ?
          "<http://kg.artsdata.ca/resource/" + name + ">" :
          "<" + name + ">") :
        "\"" + MatchServiceHelper.prependDoubleSlashToSpecialChars(name as string) + "\"";
    }


    const queryReplacementString: string = name ? `values ?query { ${name}  }` : "";
    const queryFilterReplacementString: string = name ? `      luc:query ?query ;` : "";

    return rawQuery
      .replace("INDEX_PLACE_HOLDER" , graphdbIndex)
      .replace("QUERY_PLACE_HOLDER" , queryReplacementString)
      .replace("QUERY_FILTER_PLACE_HOLDER" , queryFilterReplacementString)
      .replace("URI_PLACEHOLDER" , `${name}`)
      .replace("LIMIT_PLACE_HOLDER" , `LIMIT ${limit}`);
  }

  /**
   * @private
   * @name _resolveConditions
   * @description Resolve conditions
   * @param conditions
   * @return {{name: string | undefined, propertyConditions: QueryCondition[]}}
   */
  private _resolveConditions(conditions: QueryCondition[]): {
    name: string | undefined;
    propertyConditions: QueryCondition[];
  } {
    const name = conditions
      .find(condition => condition.matchType == MatchTypeEnum.NAME)?.propertyValue;
    const propertyConditions = conditions
      .filter(condition => condition.matchType == MatchTypeEnum.PROPERTY);
    return { name , propertyConditions };
  }

  /**
   * @private
   * @name _resolvePropertyValue
   * @description Resolve property value
   * @param value
   * @param property
   * @return {string}
   */
  private _resolvePropertyValue(value: string , property: string): string {
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
        return MatchServiceHelper.isValidURI(value) ? `<${value}>` : `"${value}"`;
      default:
        return `"${value}"`;
    }
  }

  /**
   * @private
   * @name _generateTripleFromCondition
   * @description Generate triple from condition
   * @param condition
   * @param index
   */
  private _generateTripleFromCondition(condition: QueryCondition , index: number): string {
    const { required , propertyId , propertyValue: rawConditionValue , matchQualifier , matchQuantifier } = condition;
    const formattedConditionValue = this._resolvePropertyValue(rawConditionValue , propertyId as string);
    const formattedPropertyId = MatchServiceHelper.isValidURI(propertyId as string) ? `<${propertyId}>` : `${propertyId}`;

    let triple = this._resolveMatchQualifier(matchQualifier as MatchQualifierEnum , formattedPropertyId ,
      formattedConditionValue , index);
    triple = this._resolveMatchQuantifier(matchQuantifier as MatchQuantifierEnum , triple);
    triple = this._resolveRequired(triple , required as boolean);

    return triple;
  }

  /**
   * @name reconcileByQueries
   * @description Reconcile by queries
   * @param requestLanguage
   * @param reconciliationRequest
   */
  async reconcileByQueries(requestLanguage: LanguageEnum , reconciliationRequest: ReconciliationRequest)
    : Promise<ReconciliationResponse> {
    const { queries } = reconciliationRequest;
    const results: ReconciliationResults[] = [];
    for (const reconciliationQuery of queries) {
      const { type , limit , conditions } = reconciliationQuery;
      const { name , propertyConditions } = this._resolveConditions(conditions);
      const sparqlQuery = this._generateSparqlQuery(name , type , limit || 25 , propertyConditions);
      const response = await this._artsdataService.executeSparqlQuery(sparqlQuery);
      const candidates = MatchServiceHelper
        .formatReconciliationResponse(requestLanguage , response , name);
      results.push({ candidates });
    }
    return { results };

  }

  /**
   * @private
   * @name _resolveMatchQualifier
   * @description Resolve match qualifier, matchQualifier is defaulted to exact match
   * @param matchQualifier
   * @param formattedPropertyId
   * @param formattedConditionValue
   * @param index
   */
  private _resolveMatchQualifier(matchQualifier: MatchQualifierEnum , formattedPropertyId: string ,
                                 formattedConditionValue: string , index: number) {
    if (!matchQualifier) {
      matchQualifier = MatchQualifierEnum.EXACT_MATCH;
    }
    switch (matchQualifier) {
      case MatchQualifierEnum.EXACT_MATCH:
        return `?entity ${formattedPropertyId} ${formattedConditionValue} .`;
      case MatchQualifierEnum.REGEX_MATCH:
        const objectId = `?obj_${index + 1}`;
        return `?entity ${formattedPropertyId} ${objectId}
          FILTER REGEX(${objectId}, ${formattedConditionValue}, "i").`;
      default:
        Exception.badRequest("Unsupported match qualifier");
        return "";
    }
  }

  /**
   * @private
   * @name _resolveRequired
   * @description  Resolve required, required is defaulted to true
   * @param triple
   * @param required
   */
  private _resolveRequired(triple: string , required: boolean) {
    return required ? triple : `OPTIONAL { ${triple} }`;
  }

  /**
   * @private
   * @name _resolveMatchQuantifier
   * @description Resolve match quantifier, matchQuantifier is defaulted to ALL
   * @param matchQuantifier
   * @param triple
   */
  private _resolveMatchQuantifier(matchQuantifier: MatchQuantifierEnum , triple: string) {
    if (!matchQuantifier) {
      matchQuantifier = MatchQuantifierEnum.ALL;
    }
    switch (matchQuantifier) {
      case MatchQuantifierEnum.ALL:
        return triple;
      case MatchQuantifierEnum.ANY:
        return triple;
      case MatchQuantifierEnum.NONE:
        return `FILTER NOT EXISTS { ${triple} }.`;
      default:
        Exception.badRequest("Unsupported match quantifier");
    }
    return "";
  }

  /**
   * @private
   * @name _generateSparqlQuery
   * @description Generate SPARQL query
   * @param name
   * @param type
   * @param limit
   * @param propertyConditions
   */
  private _generateSparqlQuery(name: string | undefined , type: string , limit: number ,
                               propertyConditions: QueryCondition[]): string {

    const isQueryByURI = !!name && MatchServiceHelper.isQueryByURI(name);
    const rawSparqlQuery: string = this._getSparqlQuery(name , isQueryByURI , type , limit);
    return this._resolvePropertyConditions(rawSparqlQuery , propertyConditions);
  }
}
