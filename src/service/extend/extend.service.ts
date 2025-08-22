import { Injectable } from "@nestjs/common";
import { ArtsdataService } from "../artsdata";
import { EntityClassEnum } from "../../enum/entity-class.enum";
import { ArtsdataConstants , EXTEND_QUERY , PROPOSED_EXTEND_PROPERTIES_METADATA } from "../../constant";
import { Exception , MatchServiceHelper } from "../../helper";
import {
  DataExtensionQueryDTO ,
  DataExtensionResponseDTO ,
  ExtendQueryProperty ,
  ProposedExtendProperty
} from "../../dto/extend";
import { QUERY_BY_GRAPH } from "../../constant/extend/query-by-graph.constants";

@Injectable()
export class ExtendService {

  constructor(private readonly _artsdataService: ArtsdataService) {
  }


  async getDataExtension(dataExtensionQuery: DataExtensionQueryDTO) {
    //Get the query
    const sparqlQuery: string = this._generateQuery(dataExtensionQuery);
    const expandProperties = dataExtensionQuery.properties
      .filter((property) => property.expand);
    const result = await this._artsdataService.executeSparqlQuery(sparqlQuery);
    const formattedResult = this._formatResult(dataExtensionQuery.ids , result);

    if (expandProperties.length > 0) {
      let properties: { id: any; values: any; }[] = [];
      const expandedPropertyPrefixes = expandProperties
        .map((property) => `${property.id}_`);
      formattedResult.rows.forEach((row) => {
        expandProperties.forEach((property) => {
          const expandedPropertyId = property.id;
          const propertyPrefix = `${expandedPropertyId}_`;
          const expandedProperty = row?.properties
            .filter((item: any) => item.id.startsWith(propertyPrefix));
          if (expandedProperty?.length) {
            properties = [];
            for (const prop of expandedProperty) {
              const propertyId = prop.id;
              //Remove the property with propertyId from the row properties
              row.properties = row.properties.filter((item: any) => item.id !== propertyId);
              properties.push({ id: prop.id.split(propertyPrefix).pop() , values: prop.values });
            }
            const expandingProperties = row.properties
              .find((item) => item.id === expandedPropertyId);
            (expandingProperties?.values?.[0] as any)["properties"] = properties || [];
          }
        });
      });
      expandedPropertyPrefixes.forEach((prefix) => {
        formattedResult.meta = formattedResult.meta.filter(
          item => !item.id.startsWith(prefix)
        );
      });
    }
    return formattedResult;
  }

  getProposedProperties(entityType: EntityClassEnum): ProposedExtendProperty {
    switch (entityType) {
      case EntityClassEnum.EVENT:
        return PROPOSED_EXTEND_PROPERTIES_METADATA.EVENT;
      case EntityClassEnum.PLACE:
        return PROPOSED_EXTEND_PROPERTIES_METADATA.PLACE;
      case EntityClassEnum.PERSON:
        return PROPOSED_EXTEND_PROPERTIES_METADATA.PERSON;
      case EntityClassEnum.ORGANIZATION:
        return PROPOSED_EXTEND_PROPERTIES_METADATA.ORGANIZATION;
      case EntityClassEnum.AGENT:
        return PROPOSED_EXTEND_PROPERTIES_METADATA.AGENT;
      default:
        throw Exception.badRequest("Invalid entity type");
    }
  }

  private _generateQuery(dataExtensionQuery: DataExtensionQueryDTO) {
    let query: string = EXTEND_QUERY;
    const { ids , properties } = dataExtensionQuery;
    const uris = ids.map(id => {
      if (MatchServiceHelper.isValidURI(id)) {
        return id;
      } else
        return `${ArtsdataConstants.PREFIX}${id}`;
    });
    const uriPlaceholder = uris.map(item => `(<${item}>)`).join(" ");
    query = query.replace("<URI_PLACE_HOLDER>" , uriPlaceholder);

    let propertyTriples: string = "";
    properties.forEach((property) => {
      propertyTriples = propertyTriples.concat(this._generateTripleFromCondition(property));
    });
    query = query.replace("<TRIPLES_PLACE_HOLDER>" , propertyTriples);

    return query;
  }

  private _generateTripleFromCondition(property: ExtendQueryProperty) {
    const { id , expand } = property;
    let expandedTriples;
    if (expand) {
      if (id === "address") {
        const expandedProperties = this._getExpandedPropertiesForAddress();
        expandedTriples = expandedProperties
          .map(prop => `\t\tOPTIONAL {?${id} schema:${prop} ?${id}_${prop}.}`).join("\n");
      }
    }
    return `OPTIONAL {?uri schema:${id} ?${id}. ${expandedTriples ? `\n${expandedTriples}\n` : ""}}\n`;
  }

  private _formatResult(ids: string[] , result: any): DataExtensionResponseDTO {
    const bindings = result.results.bindings;
    const formattedRow: { [key: string]: any } = {};
    for (const row of bindings) {
      const id = row.uri.value;
      if (!formattedRow[id]) {
        formattedRow[id] = {
          id: id.split(ArtsdataConstants.PREFIX)[1] ,
          properties: []
        };
      }
      for (const key in row) {
        const valueId = key;
        let currentValue: any;

        if (key !== "uri") {
          if (row[key].type === "literal") {
            currentValue = { "str": row[key].value , lang: row[key]["xml:lang"] };
          }
          if (row[key].type === "bnode") {
            currentValue = { "id": row[key].value };
          }

          if (row[key].type === "uri") {
            const value = row[key].value;
            if (value.startsWith(ArtsdataConstants.PREFIX)) {
              currentValue = { "id": value.split(ArtsdataConstants.PREFIX)[1] };
            } else {
              currentValue = { "id": value };
            }
          }

          const existingValues: any = formattedRow[id].properties.find((item: any) => item.id === key);
          if (!existingValues) {
            formattedRow[id].properties.push({ id: valueId , values: [currentValue] });
          } else {
            const existingValue = existingValues.values;
            // Check if the value already exists
            const valueExists = existingValue.some((existingItem: any) => {
              if (existingItem.id && currentValue.id) {
                return existingItem.id === currentValue.id;
              } else if (existingItem.str && currentValue.str) {
                return existingItem.str === currentValue.str && existingItem.lang === currentValue.lang;
              } else if (existingItem.str && currentValue.str) {
                return existingItem.str === currentValue.str;
              }
              return false;
            });

            if (!valueExists) {
              existingValues.values.push(currentValue);
            }

          }
        }
      }
    }
    const rows = ids.map(id => formattedRow[`${ArtsdataConstants.PREFIX}${id}`]);
    const properties = result.head.vars.filter((item: any) => item !== "uri");
    const meta = properties.map((item: any) => {
      return { id: item , name: item };
    });

    return {
      meta ,
      rows
    };
  }

  private _getExpandedPropertiesForAddress() {
    return ["postalCode" , "addressLocality" , "addressCountry"];
  }

  async getDataFromGraph(graphURI: string , entityClass: EntityClassEnum , page: number = 1 , limit: number = 10) {
    const sparqlQuery = this._getSparqlQueryByTypeAndGraph(graphURI , entityClass , page , limit);
    const result = await this._artsdataService.executeSparqlQuery(sparqlQuery , true);
    return this._formatResults(result);
  }

  private _getSparqlQueryByTypeAndGraph(graphURI: string , entityClass: EntityClassEnum , page: number , limit: number): string {
    let query: string = QUERY_BY_GRAPH.GENERIC;

    switch (entityClass) {
      case EntityClassEnum.EVENT:
        query = query.replace("TYPE_PLACEHOLDER" , "schema:Event")
          .replace("<EXTRA_FIELD_WHERE_CLAUSE_QUERY_PLACEHOLDER>" ,
            `OPTIONAL {?uri schema:startDate ?startDate .}`)
          .replace("<EXTRA_FIELD_SELECT_CLAUSE_QUERY_PLACEHOLDER>" ,
            "(sample(?startDate) as ?start_date)");
        break;
      case EntityClassEnum.PLACE:
        query = query.replace("TYPE_PLACEHOLDER" , "schema:Place")
          .replace("<EXTRA_FIELD_WHERE_CLAUSE_QUERY_PLACEHOLDER>" ,
            `OPTIONAL {?uri schema:address/schema:postalCode ?postalCode .}`)
          .replace("<EXTRA_FIELD_SELECT_CLAUSE_QUERY_PLACEHOLDER>" ,
            "(sample(?postalCode) as ?postal_code)");
        break;
      case EntityClassEnum.ORGANIZATION:
        query = query.replace("TYPE_PLACEHOLDER" , "schema:Organization");
        break;
      case EntityClassEnum.PERSON:
        query = query.replace("TYPE_PLACEHOLDER" , "schema:Person");
        break;
      case EntityClassEnum.AGENT:
        query = query.replace("TYPE_PLACEHOLDER" , "dbo:Agent");
        break;
      default:
        throw Exception.badRequest("Invalid type provided");
    }
    return query.replace("GRAPH_URI_PLACEHOLDER" , graphURI)
      .replace("<EXTRA_FIELD_WHERE_CLAUSE_QUERY_PLACEHOLDER>" , "")
      .replace("<EXTRA_FIELD_SELECT_CLAUSE_QUERY_PLACEHOLDER>" , "")
      .replace("LIMIT_PLACEHOLDER" , limit.toString())
      .replace("OFFSET_PLACEHOLDER" , ((page - 1) * limit).toString());
  }

  /**
   * @name _formatResults
   * @description Format the results from the SPARQL query for query by graph id
   * @param result
   * @private
   */
  private _formatResults(result: any) {
    return result.results.bindings.map((row: any) => {
      const formattedRow: { [key: string]: any } = {};
      for (const key in row) {
        if (row[key].datatype === "http://www.w3.org/2001/XMLSchema#boolean") {
          formattedRow[key] = row[key].value === "true";
        } else if (row[key].type === "literal") {
          formattedRow[key] = row[key].value;
        } else if (row[key].type === "uri") {
          formattedRow[key] = row[key].value;
        } else if (row[key].type === "bnode") {
          formattedRow[key] = `_:${row[key].value}`;
        } else if (row[key].type === "bnode") {
          formattedRow[key] = `_:${row[key].value}`;
        }
      }
      return formattedRow;
    });
  }
}
