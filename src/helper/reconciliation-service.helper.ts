import { MultilingualValues, ReconciliationResponse } from "../dto";
import { LanguageTagEnum } from "../enum";
import { GRAPHDB_INDEX } from "../config";

export class ReconciliationServiceHelper {

  static formatReconciliationResponse(query: string, sparqlResponse: any): ReconciliationResponse[] {

    return sparqlResponse?.results?.bindings?.map((binding: any) => {
      const nameValues: MultilingualValues[] = [];
      const descriptionValues: MultilingualValues[] = [];

      const result = new ReconciliationResponse();
      const uri = binding["entity"].value;
      result.id = uri?.split("http://kg.artsdata.ca/resource/").pop();

      //NAME
      const name = binding["name"]?.value;
      const nameEn = binding["nameEn"]?.value;
      const nameFr = binding["nameFr"]?.value;
      if (nameEn) {
        nameValues.push({ str: nameEn, lang: LanguageTagEnum.ENGLISH });
      }
      if (nameFr) {
        nameValues.push({ str: nameFr, lang: LanguageTagEnum.FRENCH });
      }
      if (name && !nameEn || !nameFr) {
        nameValues.push({ str: name });
      }
      result.name = { values: nameValues };

      //DESCRIPTION
      const description = binding["description"]?.value;
      const descriptionEn = binding["descriptionEn"]?.value;
      const descriptionFr = binding["descriptionFr"]?.value;
      if (descriptionEn) {
        descriptionValues.push({ str: descriptionEn, lang: LanguageTagEnum.ENGLISH });
      }
      if (descriptionFr) {
        descriptionValues.push({ str: descriptionFr, lang: LanguageTagEnum.FRENCH });
      }
      if (description && !descriptionEn && !descriptionFr) {
        descriptionValues.push({ str: description });
      }
      result.description = { values: descriptionValues };

      //SCORE
      result.score = binding["score"]?.value;

      //TODO match is incorrect when query contains accented characters
      result.match = binding["name"]?.value.toLowerCase() === query.toLowerCase();
      result.type = [{ id: binding["type"]?.value, name: binding["type_label"]?.value }];
      return result;
    });

  }

  static getGraphdbIndex(type: string): string {
    switch (type) {
      case "schema:Event":
        return GRAPHDB_INDEX.EVENT;
      case "schema:Place":
        return GRAPHDB_INDEX.PLACE;
      case "schema:Organization":
        return GRAPHDB_INDEX.ORGANIZATION;
      case "schema:Person":
        return GRAPHDB_INDEX.PERSON;
      case "skos:Concept":
        return GRAPHDB_INDEX.CONCEPT;
      case "ado:EventType":
        return GRAPHDB_INDEX.EVENT_TYPE;
      default:
        return GRAPHDB_INDEX.DEFAULT;
    }

  }
}