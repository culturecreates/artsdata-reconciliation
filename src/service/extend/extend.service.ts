import { Injectable } from "@nestjs/common";
import { ArtsdataService } from "../artsdata";
import { EntityClassEnum } from "../../enum/entity-class.enum";
import { ArtsdataConstants , EXTEND_QUERY , PROPOSED_EXTEND_PROPERTIES_METADATA } from "../../constant";
import { Exception } from "../../helper";
import {
  DataExtensionQueryDTO ,
  DataExtensionResponseDTO ,
  ExtendQueryProperty ,
  ProposedExtendProperty
} from "../../dto/extend";

@Injectable()
export class ExtendService {

  constructor(private readonly _artsdataService: ArtsdataService) {
  }


  async getDataExtension(dataExtensionQuery: DataExtensionQueryDTO) {
    //Get the query
    const sparqlQuery: string = this._generateQuery(dataExtensionQuery);
    const expandProperties = dataExtensionQuery.properties.filter((property) => property.expand);
    const result = await this._artsdataService.executeSparqlQuery(sparqlQuery);
    const formattedResult = this._formatResult(dataExtensionQuery.ids , result);

    if (expandProperties.length > 0) {
      const properties: { id: any; values: any; }[] = [];
      const expandedPropertyPrefixes = expandProperties.map((property) => `${property.id}_`);
      formattedResult.rows.forEach((row) => {
        expandProperties.forEach((property) => {
          const expandedPropertyId = property.id;
          const propertyPrefix = `${expandedPropertyId}_`;
          const expandedProperty = row?.properties.filter((item: any) => item.id.startsWith(propertyPrefix));
          if (expandedProperty?.length) {
            for (const prop of expandedProperty) {
              const propertyId = prop.id;
              //Remove the property with propertyId from the row properties
              row.properties = row.properties.filter((item: any) => item.id !== propertyId);
              properties.push({ id: prop.id.split(propertyPrefix).pop() , values: prop.values });
            }
            const expandingProperties = row.properties.find((item) => item.id === expandedPropertyId);
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
      default:
        throw Exception.badRequest("Invalid entity type");
    }
  }

  private _generateQuery(dataExtensionQuery: DataExtensionQueryDTO) {
    let query: string = EXTEND_QUERY;
    const { ids , properties } = dataExtensionQuery;
    const uris = ids.map(id => `${ArtsdataConstants.PREFIX}${id}`);
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
    const triple = `OPTIONAL {?uri schema:${id} ?${id}.}\n`;
    if (expand) {
      if (id === "address") {
        const expandedProperties = this._getExpandedPropertiesForAddress();
        const expandedTriples = expandedProperties.map(prop => `?${id} schema:${prop} ?${id}_${prop}.`).join("\n");
        return `${triple} OPTIONAL {${expandedTriples} }`
      }
    }
    return triple;
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
        let values: any;

        if (key !== "uri") {
          if (row[key].type === "literal") {
            values = { "str": row[key].value , lang: row[key]["xml:lang"] };
          }

          if (row[key].type === "uri") {
            values = { "id": row[key].value?.split(ArtsdataConstants.PREFIX)?.[1] };
          }

          const existingValues: any = formattedRow[id].properties.find((item: any) => item.id === key);
          if (!existingValues) {
            formattedRow[id].properties.push({ id: valueId , values: [values] });
          } else {
            const existingValue = existingValues.values;
            // Check if the value already exists
            const valueExists = existingValue.some((item: any) => {
              if (item.str && values.str && item.lang && values.lang) {
                return item.str === values.str && item.lang === values.lang;
              } else if (item.str && values.str) {
                return item.str === values.str;
              } else if (item.id && values.id) {
                return item.id === values.id;
              }
              return false;
            });

            if (!valueExists) {
              existingValues.values.push(values);
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
}
