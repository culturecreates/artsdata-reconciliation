import { Injectable } from "@nestjs/common";
import { ArtsdataService } from "../artsdata";
import { ManifestService } from "../manifest";
import { Exception, MatchServiceHelper } from "../../helper";
import { ArtsdataProperties, QUERIES } from "../../constant";
import { QueryCondition, ReconciliationRequest, ReconciliationResponse, ReconciliationResults } from "../../dto";
import { LanguageEnum, MatchQualifierEnum, MatchQuantifierEnum, MatchTypeEnum } from "../../enum";


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

    try {
      const queries = JSON.parse(rawQueries);
      return await this.reconcileByQueries(acceptLanguage , queries);
    } catch {
      return Exception.badRequest("The request is not a valid JSON object.");
    }
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
    const propertyTriples = propertyConditions
      .map((condition , index) => this._generateTripleFromCondition(condition , index))
      .join("");
    return rawSparqlQuery.replace("PROPERTY_PLACE_HOLDER" , propertyTriples);
  }

  /**
   * @private
   * @name _resolveConditions
   * @description Resolve conditions
   * @param conditions
   * @return {{name: string | undefined, propertyConditions: QueryCondition[]}}
   */
  private _resolveConditions(conditions: QueryCondition[]): {
    name: string | string[] | undefined;
    propertyConditions: QueryCondition[];
  } {
    return {
      name: conditions.find(({ matchType }) => matchType === MatchTypeEnum.NAME)?.propertyValue ,
      propertyConditions: conditions.filter(({ matchType }) => matchType === MatchTypeEnum.PROPERTY)
    };
  }

  /**
   * @private
   * @name _resolvePropertyValue
   * @description Resolve property value
   * @param value
   * @param property
   * @return {string}
   */
  private _resolvePropertyValue(value: string | string [] , property: string): (string | string[]) {
    if (Array.isArray(value)) {
      return value.flatMap(val => this._resolvePropertyValue(val , property));
    }

    if (MatchServiceHelper.isValidURI(value)) {
      return `<${value}>`;
    }

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
    const formattedPropertyId: string = MatchServiceHelper.isValidURI(propertyId as string) ?
      this._resolvePropertyPath(propertyId as string) : `${propertyId}`;

    let triple = this._resolveMatchQualifierAndQuantifier(matchQualifier as MatchQualifierEnum ,
      formattedPropertyId , matchQuantifier as MatchQuantifierEnum , formattedConditionValue , index);
    return required ? triple : `OPTIONAL { ${triple} }\n`;
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
    let sparqlQuery;
    for (const reconciliationQuery of queries) {
      try {
        const { type , limit , conditions } = reconciliationQuery;
        const { name , propertyConditions } = this._resolveConditions(conditions);
        const isQueryByURI: boolean = name ? MatchServiceHelper.isQueryByURI(name as string) : false;
        sparqlQuery = this._generateSparqlQuery(name as string , type , isQueryByURI , limit || 25 , propertyConditions);
        const response = await this._artsdataService.executeSparqlQuery(sparqlQuery);
        const candidates = MatchServiceHelper
          .formatReconciliationResponse(requestLanguage , response , reconciliationQuery , isQueryByURI);
        results.push({ candidates });
      } catch (error) {
        console.error("Error in reconciliation query:" , error);
        results.push({ candidates: [] });
      }
    }
    return { results };

  }

  /**
   * @private
   * @name _resolveMatchQualifierAndQuantifier
   * @description Resolve match qualifier, matchQualifier is defaulted to exact match
   * @param matchQualifier
   * @param formattedPropertyId
   * @param matchQuantifier
   * @param formattedConditionValue
   * @param index
   */
  private _resolveMatchQualifierAndQuantifier(matchQualifier: MatchQualifierEnum , formattedPropertyId: string ,
                                              matchQuantifier: MatchQuantifierEnum ,
                                              formattedConditionValue: string | string[] , index: number) {
    if (!matchQuantifier) {
      matchQuantifier = MatchQuantifierEnum.ALL;
    }
    if (!matchQualifier) {
      matchQualifier = MatchQualifierEnum.EXACT_MATCH;
    }

    const isConditionValueArray = Array.isArray(formattedConditionValue);
    let triple: string = "";
    if (isConditionValueArray) {
      const objectId = `?obj_${index + 1}`;
      switch (matchQualifier) {
        case MatchQualifierEnum.EXACT_MATCH:
          if (matchQuantifier === MatchQuantifierEnum.ANY) {
            triple = `?entity ${formattedPropertyId} ${objectId} FILTER (${objectId} IN (${(formattedConditionValue as string[]).join(" , ")})).`;
          } else if (matchQuantifier === MatchQuantifierEnum.ALL) {
            triple = `${(formattedConditionValue as string[])
              .map(v => ` FILTER EXISTS {?entity ${formattedPropertyId} ${v}}`).join("\n")}`;
          } else if (matchQuantifier === MatchQuantifierEnum.NONE) {
            triple = `${(formattedConditionValue as string[])
              .map(v => ` FILTER NOT EXISTS {?entity ${formattedPropertyId} ${v}}`).join("\n")}`;
          } else {
            Exception.badRequest("Unsupported match qualifier");
          }
          break;
        case MatchQualifierEnum.REGEX_MATCH:
          triple = `?entity ${formattedPropertyId} ${objectId}
          FILTER ( ${(formattedConditionValue as string[]).map(v => `REGEX (${objectId}, ${v}, "i")`).join(" || ")} ;`;
          break;
        default:
          Exception.badRequest("Unsupported match qualifier");
          break;
      }
    } else {
      switch (matchQualifier) {
        case MatchQualifierEnum.EXACT_MATCH:
          triple = `?entity ${formattedPropertyId} ${formattedConditionValue} .`;
          break;
        case MatchQualifierEnum.REGEX_MATCH:
          const objectId = `?obj_${index + 1}`;
          triple = `?entity ${formattedPropertyId} ${objectId}
          FILTER REGEX(${objectId}, ${formattedConditionValue}, "i").`;
          break;
        default:
          Exception.badRequest("Unsupported match qualifier");
          triple = "";
          break;
      }
      if (matchQuantifier === MatchQuantifierEnum.NONE) {
        return `FILTER NOT EXISTS { ${triple} }.`;
      }
    }

    return triple;

  }

  /**
   * @private
   * @name _generateSparqlQuery
   * @description Generate SPARQL query
   * @param name
   * @param type
   * @param isQueryByURI
   * @param limit
   * @param propertyConditions
   */
  private _generateSparqlQuery(name: string | undefined , type: string , isQueryByURI: boolean , limit: number ,
                               propertyConditions: QueryCondition[]): string {
    const graphdbIndex = MatchServiceHelper.getGraphdbIndex(type);
    let rawQuery = QUERIES.RECONCILIATION_QUERY;

    if (name) {
      name = isQueryByURI ? `<${name}>` : this._modifyNameForLuceneScore(MatchServiceHelper.escapeSpecialCharacters(name) , propertyConditions);
    }
    if (isQueryByURI) {
      rawQuery = rawQuery.replace("SELECT_ENTITY_QUERY_BY_KEYWORD_PLACEHOLDER" , `BIND(URI_PLACEHOLDER as ?entity)`);
    } else {
      rawQuery = rawQuery.replace("SELECT_ENTITY_QUERY_BY_KEYWORD_PLACEHOLDER" , QUERIES.SELECT_ENTITY_QUERY_BY_KEYWORD);
    }

    rawQuery = rawQuery
      .replace("INDEX_PLACE_HOLDER" , graphdbIndex)
      .replace("QUERY_PLACE_HOLDER" , name ? `values ?query { "${name}" }` : "")
      .replace("QUERY_FILTER_PLACE_HOLDER" , name ? "luc:query ?query ;" : "")
      .replace("URI_PLACEHOLDER" , name || "")
      .replace("LIMIT_PLACE_HOLDER" , `LIMIT ${limit}`);

    return this._resolvePropertyConditions(rawQuery , propertyConditions);
  }

  private _resolvePropertyPath(propertyId: string) {
    const parts = propertyId.trim().split("/http");
    let propertyPath = "";

    for (let i = 0; i < parts.length; i++) {
      const part = i === 0 ? parts[i] : "http" + parts[i];
      propertyPath += (part.startsWith("http") ? `<${part}>` : part);
      if (i < parts.length - 1) propertyPath += "/";
    }

    return propertyPath;
  }

  private _modifyNameForLuceneScore(name: string , propertyConditions: QueryCondition[]): string {
    const propertyMap = {
      "http://schema.org/url": "url" ,
      "http://schema.org/sameAs": "sameAs" ,
      "http://schema.org/postalCode": "postalCode",
      "http://schema.org/startDate": "startDate",
      "http://schema.org/endDate": "endDate",
      "<https://schema.org/location>/<https://schema.org/name>": "locationName",
      "<https://schema.org/location>/<https://schema.org/address>/<https://schema.org/postalCode>": "locationPostalCode"
    };

    return propertyConditions
      .filter(condition => condition.matchType === MatchTypeEnum.PROPERTY)
      .reduce((query, condition) => {
        Object.entries(propertyMap).forEach(([key, value]) => {
          if (condition.propertyId?.includes(key)) {
            query += this.resolvePropertyValueForLucene(condition.propertyValue, value);
          }
        });
        return query;
      }, `name: ${name}`);
  }

  private resolvePropertyValueForLucene(propertyValue: string | string[] , propertyId: string): string {
    const values = Array.isArray(propertyValue) ? propertyValue : [propertyValue];
    return values
      .map(value => ` ${propertyId}: ${MatchServiceHelper.escapeSpecialCharacters(value)}`)
      .join(" ");
  }
}
