import { MultilingualValues, ResultCandidates } from "../dto";
import { LanguageTagEnum } from "../enum";
import { GRAPHDB_INDEX } from "../config";

export class ReconciliationServiceHelper {

  static formatReconciliationResponse(sparqlResponse: any, query?: string) {

    return sparqlResponse?.results?.bindings?.map((binding: any) => {
      const nameValues: MultilingualValues[] = [];
      const descriptionValues: MultilingualValues[] = [];

      const resultCandidate = new ResultCandidates();
      const uri = binding["entity"].value;
      resultCandidate.id = uri?.split("http://kg.artsdata.ca/resource/").pop();

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
      resultCandidate.name = { values: nameValues };

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
      resultCandidate.description = { values: descriptionValues };

      //SCORE
      resultCandidate.score = binding["score"]?.value;

      //TODO match is incorrect when query contains accented characters
      if (query) {
        resultCandidate.match = binding["name"]?.value.toLowerCase() === query.toLowerCase();
      }
      const typeUris = binding["type"]?.value.split("|");
      const typeLabels = binding["type_label"]?.value.split("|");
      const resultType: { id: string; name: string; }[] = [];
      if (typeUris?.length > 1) {
        for (let i = 0; typeUris?.length > i; i++) {
          resultType.push({ id: typeUris[i], name: typeLabels[i] });
        }
      } else {
        resultType.push({ id: typeUris?.[0], name: typeLabels?.[0] });
      }
      resultCandidate.type = resultType;
      return resultCandidate;
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

  static isValidURI(text: string) {
    try {
      new URL(text);
      return true;
    } catch (e) {
      return false;
    }
  }

  static isQueryByURI(query: string) {
    const artsdataIdPattern = "^K[0-9]+-[0-9]+$";
    return !!(query.match(artsdataIdPattern) ||
      (this.isValidURI(query) && query.startsWith("http://kg.artsdata.ca/resource/K")));

  }
}