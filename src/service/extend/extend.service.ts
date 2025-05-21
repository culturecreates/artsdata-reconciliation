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


  async getDataExtension(dataExtensionQuery: DataExtensionQueryDTO): Promise<DataExtensionResponseDTO> {
    //Get the query
    const sparqlQuery: string = this._generateQuery(dataExtensionQuery);
    const result = await this._artsdataService.executeSparqlQuery(sparqlQuery);

    return this._formatResult(dataExtensionQuery.ids , result);
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
    return `?uri schema:${property.id} ?${property.id}.\n`;
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
}
