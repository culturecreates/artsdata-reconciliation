import { LanguageEnum } from "../enum";
import { GRAPHDB_INDEX } from "../config";
import { ReconciliationQuery , ResultCandidates } from "../dto";
import { isURL } from "validator";
import { ArtsdataConstants } from "../constant";

export class MatchServiceHelper {

  static escapeSpecialCharacters(inputString: string) {
    const luceneSpecialChars = ["+" , "-" , "!" , "(" , ")" , "{" , "}" , "[" , "]" , "^" , "\"" , "~" , "*" , "?" , ":" , "\\" , "/"];
    return Array.from(inputString)
      .map(char =>
        luceneSpecialChars.includes(char)
          ? (char === "\\" ? `\\${char}` : `\\\\${char}`)
          : char
      )
      .join("");
  }

  static formatReconciliationResponse(responseLanguage: LanguageEnum , sparqlResponse: any ,
                                      reconciliationQuery: ReconciliationQuery , isQueryByURI: boolean): ResultCandidates[] {
    const bindings = sparqlResponse?.results?.bindings || [];
    const uniqueIds = [...new Set(bindings.map((binding: any) => binding["entity"].value))];
    const candidates: ResultCandidates[] = [];

    for (const currentId of uniqueIds) {
      const currentBindings = bindings.filter((binding: any) => binding["entity"].value === currentId);
      const currentBinding = currentBindings[0];
      const resultCandidate = new ResultCandidates();

      resultCandidate.id = currentBinding["entity"].value?.split(ArtsdataConstants.PREFIX).pop();
      const name = currentBinding["name"]?.value;
      const nameEn = currentBinding["nameEn"]?.value;
      const nameFr = currentBinding["nameFr"]?.value;
      const description = currentBinding["description"]?.value;
      const descriptionEn = currentBinding["descriptionEn"]?.value;
      const descriptionFr = currentBinding["descriptionFr"]?.value;

      const additionalPropertiesForMatchCalculation = {
        url: currentBinding["url"]?.value ,
        postalCode: currentBinding["postalCode"]?.value ,
        addressLocality: currentBinding["addressLocality"]?.value
      };

      if (responseLanguage === LanguageEnum.FRENCH) {
        resultCandidate.name = nameFr || name || nameEn;
        resultCandidate.description = descriptionFr || description || descriptionEn;
      } else {
        resultCandidate.name = nameEn || name || nameFr;
        resultCandidate.description = descriptionEn || description || descriptionFr;
      }

      resultCandidate.score = Math.round(Number(currentBinding["score"]?.value));
      resultCandidate.match = isQueryByURI || MatchServiceHelper.calculateMatch(resultCandidate , reconciliationQuery ,
        additionalPropertiesForMatchCalculation);

      resultCandidate.type = currentBindings.map((binding: any) => ({
        id: binding["type_label"]?.value ,
        name: binding["type_label"]?.value
      }));

      candidates.push(resultCandidate);
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
      (this.isValidURI(query) && query.startsWith(ArtsdataConstants.PREFIX)));

  }

  static calculateMatch(recordFetched: { [key: string]: any } , reconciliationQuery: ReconciliationQuery ,
                        additionalProperties: any): boolean {
    const recordFromQuery = this.formatReconciliationQuery(reconciliationQuery);

    const matchers = {
      exactOrMissing: (a: string | undefined , b: string | undefined) => {
        if (!a || !b) return true;
        return a?.trim()?.toLowerCase() === b?.trim()?.toLowerCase();
      } ,
      exact: (a: string | undefined , b: string | undefined) => {
        if (!b) return true;
        return a?.trim()?.toLowerCase() === b?.trim()?.toLowerCase();
      } ,
      isniAndWikidataLogic: (aISNI: string | undefined , bISNI: string | undefined ,
                             aWikidata: string | undefined , bWikidata: string | undefined) => {
        const isniExists = aISNI && bISNI;
        const wikidataExists = aWikidata && bWikidata;

        if (isniExists && wikidataExists) {
          return aISNI === bISNI && aWikidata === bWikidata;
        }
        if (aISNI && bISNI) return aISNI === bISNI;
        if (aWikidata && bWikidata) return aWikidata === bWikidata;

        return true; // One or both missing
      }
    };

    const checks = [
      matchers.exactOrMissing(recordFetched.name , recordFromQuery.name) ,
      matchers.exact(additionalProperties.postalCode , recordFromQuery.postalCode) ,
      matchers.exact(additionalProperties.addressLocality , recordFromQuery.addressLocality) ,
      matchers.exact(recordFetched.url , recordFromQuery.url) ,
      matchers.isniAndWikidataLogic(recordFetched.isni , recordFromQuery.isni , recordFetched.wikidata , recordFromQuery.wikidata)
    ];

    return checks.every(Boolean);
  }

  private static formatReconciliationQuery(reconciliationQuery: ReconciliationQuery) {

    const { conditions } = reconciliationQuery;
    const name = conditions.find(condition => condition.matchType === "name")?.propertyValue as string | undefined;
    const postalCode = conditions.find(condition => condition.propertyId?.includes("postalCode"))?.propertyValue as string | undefined;
    const addressLocality = conditions.find(condition => condition.propertyId?.includes("addressLocality"))?.propertyValue as string | undefined;
    const addressRegion = conditions.find(condition => condition.propertyId?.includes("addressRegion"))?.propertyValue as string | undefined;
    const url = conditions.find(condition => condition.propertyId?.includes("url"))?.propertyValue as string | undefined;
    const sameAs = conditions.filter(condition => condition.propertyId?.includes("sameAs"))
      ?.map(sameAs => sameAs.propertyValue as string | undefined);

    const wikidata = sameAs?.find((sameAs) => sameAs?.startsWith("http://www.wikidata.org/entity/"));
    const isni = sameAs?.find((sameAs) => sameAs?.startsWith("https://isni.org/isni/"));

    return {
      name ,
      postalCode ,
      addressLocality ,
      addressRegion ,
      url ,
      isni: isni?.length ? isni : undefined ,
      wikidata: wikidata?.length ? wikidata : undefined
    };
  }
}