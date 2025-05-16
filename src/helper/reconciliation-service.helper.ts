import { MatchRequestLanguageEnum } from "../enum";
import { GRAPHDB_INDEX } from "../config";
import { ResultCandidates } from "../dto";
import { isURL } from "validator";

export class ReconciliationServiceHelper {

  static formatReconciliationResponse(responseLanguage: MatchRequestLanguageEnum , sparqlResponse: any , query?: string)
    : ResultCandidates[] {
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

        const resultCandidate = new ResultCandidates();
        const currentBinding = currentBindings.find((binding: any) => binding["entity"].value === currentId);
        const uri = currentBinding["entity"].value;
        resultCandidate.id = uri?.split("http://kg.artsdata.ca/resource/").pop();

        //NAME
        const name = currentBinding["name"]?.value;
        const nameEn = currentBinding["nameEn"]?.value;
        const nameFr = currentBinding["nameFr"]?.value;

        //DESCRIPTION
        const description = currentBinding["description"]?.value;
        const descriptionEn = currentBinding["descriptionEn"]?.value;
        const descriptionFr = currentBinding["descriptionFr"]?.value;

        switch (responseLanguage) {
          case MatchRequestLanguageEnum.ENGLISH:
            resultCandidate.name = nameEn || name || nameFr;
            resultCandidate.description = descriptionEn || description || descriptionFr;
            break;
          case MatchRequestLanguageEnum.FRENCH:
            resultCandidate.name = nameFr || name || nameEn;
            resultCandidate.description = descriptionFr || description || descriptionEn;
            break;
          default:
            resultCandidate.name = nameEn || name || nameFr;
            resultCandidate.description = descriptionEn || description || descriptionFr;
        }

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
    return isURL(text);
  }

  static isQueryByURI(query: string) {
    const artsdataIdPattern = "^K[0-9]+-[0-9]+$";
    return !!(query?.match(artsdataIdPattern) ||
      (this.isValidURI(query) && query.startsWith("http://kg.artsdata.ca/resource/K")));

  }
}