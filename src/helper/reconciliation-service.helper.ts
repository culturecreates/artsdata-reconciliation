import { LanguageTagEnum } from "../enum";
import { GRAPHDB_INDEX } from "../config";
import { MultilingualValues , ResultCandidates } from "../dto";

export class ReconciliationServiceHelper {

  static formatReconciliationResponse(sparqlResponse: any , query?: string) {
    const bindings = sparqlResponse?.results?.bindings;
    const candidates: ResultCandidates[] = [];

    if (bindings?.length) {
      const uniqueIds: string[] = [];
      for (const binding of bindings) {
        if (!uniqueIds.includes(binding["entity"].value)) {
          uniqueIds.push(binding["entity"].value);
        }
      }

      for (const currentId of uniqueIds) {
        const currentBindings = bindings.filter((binding: any) => binding["entity"].value === currentId);

        const nameValues: MultilingualValues[] = [];
        const descriptionValues: MultilingualValues[] = [];

        const resultCandidate = new ResultCandidates();
        const currentBinding = currentBindings.find((binding: any) => binding["entity"].value === currentId);
        const uri = currentBinding["entity"].value;
        resultCandidate.id = uri?.split("http://kg.artsdata.ca/resource/").pop();

        //NAME
        const name = currentBinding["name"]?.value;
        const nameEn = currentBinding["nameEn"]?.value;
        const nameFr = currentBinding["nameFr"]?.value;
        if (nameEn) {
          nameValues.push({ str: nameEn , lang: LanguageTagEnum.ENGLISH });
        }
        if (nameFr) {
          nameValues.push({ str: nameFr , lang: LanguageTagEnum.FRENCH });
        }
        if (name && !nameEn || !nameFr) {
          nameValues.push({ str: name });
        }
        resultCandidate.name = { values: nameValues };

        //DESCRIPTION
        const description = currentBinding["description"]?.value;
        const descriptionEn = currentBinding["descriptionEn"]?.value;
        const descriptionFr = currentBinding["descriptionFr"]?.value;
        if (descriptionEn) {
          descriptionValues.push({ str: descriptionEn , lang: LanguageTagEnum.ENGLISH });
        }
        if (descriptionFr) {
          descriptionValues.push({ str: descriptionFr , lang: LanguageTagEnum.FRENCH });
        }
        if (description && !descriptionEn && !descriptionFr) {
          descriptionValues.push({ str: description });
        }
        resultCandidate.description = { values: descriptionValues };

        //SCORE
        const score = currentBinding["score"]?.value;
        resultCandidate.score = Number(score);

        //TODO match is incorrect when query contains accented characters
        if (query) {
          resultCandidate.match = currentBinding["name"]?.value.toLowerCase() === query.toLowerCase();
        }

        resultCandidate.type = currentBindings.map((binding: any) => ({
          id: binding["type_label"]?.value ,
          name: binding["type_label"]?.value
        }));
        candidates.push(resultCandidate);
      }
    }
    return candidates;

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
      case "dbo:Agent":
        return GRAPHDB_INDEX.AGENT;
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
    return !!(query?.match(artsdataIdPattern) ||
      (this.isValidURI(query) && query.startsWith("http://kg.artsdata.ca/resource/K")));

  }
}