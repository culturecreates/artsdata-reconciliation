import { LanguageEnum } from "../enum";
import { GRAPHDB_INDEX } from "../config";
import { ReconciliationQuery, ResultCandidates } from "../dto";
import { isURL } from "validator";
import { ArtsdataConstants, Entities } from "../constant";
import { JaroWinklerDistance } from "natural";

export class MatchServiceHelper {

    static escapeSpecialCharacters(inputString: string) {
        const luceneSpecialChars = ["+", "-", "!", "(", ")","||", "{", "}", "[", "]", "^", "\"", "~", "*", "?",
            ":", "\\", "/", "AND", "OR", "NOT", "TO",];
        return Array.from(inputString)
            .map(char =>
                luceneSpecialChars.includes(char)
                    ? (char === "\\" ? `\\${char}` : `\\\\${char}`)
                    : char
            )
            .join("");
    }

    static formatReconciliationResponse(responseLanguage: LanguageEnum, sparqlResponse: any,
                                        reconciliationQuery: ReconciliationQuery, isQueryByURI: boolean): ResultCandidates[] {
        const bindings = sparqlResponse?.results?.bindings || [];
        const uniqueIds = [...new Set(bindings.map((binding: any) => binding["entity"].value))];
        const candidates: ResultCandidates[] = [];

        for (const currentId of uniqueIds) {
            const currentBindings = bindings
                .filter((binding: any) => binding["entity"].value === currentId);
            const currentBinding = currentBindings[0];
            const resultCandidate = new ResultCandidates();

            resultCandidate.id = currentBinding["entity"].value?.split(ArtsdataConstants.PREFIX).pop();
            const name = currentBinding["name"]?.value;
            const nameEn = currentBinding["nameEn"]?.value;
            const nameFr = currentBinding["nameFr"]?.value;
            const description = currentBinding["description"]?.value;
            const descriptionEn = currentBinding["descriptionEn"]?.value;
            const descriptionFr = currentBinding["descriptionFr"]?.value;

      const additionalPropertiesForAutoMatch = {
        url: currentBinding["url"]?.value,
        postalCode: currentBinding["postalCode"]?.value,
        addressLocality: currentBinding["addressLocality"]?.value,
        startDate: currentBinding["startDate"]?.value,
        endDate: currentBinding["endDate"]?.value,
        locationName: currentBinding["locationName"]?.value,
        locationUri: currentBinding["locationUri"]?.value,
        wikidata: currentBinding["wikidata"]?.value,
        isni: currentBinding["isni"]?.value,
      };

            if (responseLanguage === LanguageEnum.FRENCH) {
                resultCandidate.name = nameFr || name || nameEn;
                resultCandidate.description = descriptionFr || description || descriptionEn;
            } else {
                resultCandidate.name = nameEn || name || nameFr;
                resultCandidate.description = descriptionEn || description || descriptionFr;
            }

            resultCandidate.score = Math.round(
                Number(currentBinding["score"]?.value),
            );
            resultCandidate.match =
                isQueryByURI ||
                MatchServiceHelper.isAutoMatch(resultCandidate, reconciliationQuery, additionalPropertiesForAutoMatch);

            resultCandidate.type = currentBindings.map((binding: any) => ({
                id: binding["type_label"]?.value,
                name: binding["type_label"]?.value,
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
        return !!(
            query?.match(artsdataIdPattern) ||
            (this.isValidURI(query) && query.startsWith(ArtsdataConstants.PREFIX))
        );
    }

    static isAutoMatch(recordFetched: { [key: string]: any }, reconciliationQuery: ReconciliationQuery,
                       additionalProperties: any): boolean {
        const recordFromQuery = this.formatReconciliationQuery(reconciliationQuery);

    function cleanName(name: string) {
      return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z]/g, ""); // keep only letters
    }

    function nameSimilarity(nameInQuery: string, nameInResult: string) {
      const similarityScore = JaroWinklerDistance(
        cleanName(nameInQuery),
        cleanName(nameInResult),
      );
      return similarityScore > 0.9;
    }

    const matchers = {
      veryClose: (a: string | undefined, b: string | undefined) => {
        if (!a || !b) return false;
        return nameSimilarity(a, b);
      },
      exactDate: (a: string | undefined, b: string | undefined) => {
        if (!a || !b) return false;
        return new Date(a) === new Date(b);
      },
      closeDates: (
        startDateA: string,
        startDateB: string,
        endDateA: string | undefined,
        endDateB: string | undefined,
      ) => {
        const dateStampA = endDateA
          ? new Date(endDateA).getTime()
          : new Date(startDateA).getTime();
        const dateStampB = endDateB
          ? new Date(endDateB).getTime()
          : new Date(startDateB).getTime();
        if (isNaN(dateStampA) || isNaN(dateStampB)) return false;
        //if the difference between the two dates is greater than 24 hours (86400000 milliseconds), return false
        return Math.abs(dateStampA - dateStampB) <= 86400000;
      },
      exact: (a: string | undefined, b: string | undefined) => {
        if (!a || !b) return false;
        return a === b;
      },
      notDifferentIfBothExists: (
        a: string | undefined,
        b: string | undefined,
      ) => {
        if (!a || !b) return true;
        return a !== b;
      },
      exactUrl: (a: string, b: string) => {
        if (a && b) {
          const urlA = new URL(a.toLowerCase());
          const urlB = new URL(b.toLowerCase());

          let hostA = urlA.hostname;
          let hostB = urlB.hostname;
          // Normalize path (remove trailing slash unless root)
          let pathA = urlA.pathname.replace(/\/+$/, "") || "/";
          let pathB = urlB.pathname.replace(/\/+$/, "") || "/";
          return `${hostA}${pathA}` === `${hostB}${pathB}`;
        } else {
          return false;
        }
      },
    };

    const checkIfIsniIsExactMatch = [
      matchers.exact(additionalProperties.isni, recordFromQuery.isni),
    ];

    // Wikidata should be exact match
    const checkIfWikidataIdIsExactMatch = [
      matchers.exact(additionalProperties.wikidata, recordFromQuery.wikidata),
    ];

    const checkIfNameIsCloseAndWikidataIdIsExact = [
      matchers.veryClose(recordFetched.name, recordFromQuery.name),
      matchers.exact(additionalProperties.wikidata, recordFromQuery.wikidata),
    ];

    // Name should be close match and postal code should be exact match, wikidata should be exact match if present
    const checkIfNameIsClosePostalCodeIsExactAndWikidataIsNotDifferent = [
      matchers.veryClose(recordFetched.name, recordFromQuery.name),
      matchers.exact(
        additionalProperties.postalCode,
        recordFromQuery.postalCode,
      ),
      matchers.notDifferentIfBothExists(
        additionalProperties.wikidata,
        recordFromQuery.wikidata,
      ),
    ];
    //Name and address locality should be close match, wikidata should be exact match if present
    const checkIfNameAddressLocalityAreCloseAndWikidataIsNotDifferentForPlace =
      [
        matchers.veryClose(recordFetched.name, recordFromQuery.name),
        matchers.veryClose(
          additionalProperties.addressLocality,
          recordFromQuery.addressLocality,
        ),
        matchers.notDifferentIfBothExists(
          additionalProperties.wikidata,
          recordFromQuery.wikidata,
        ),
      ];
    //Name is very close and URL is exact match, wikidata should be exact match if present
    const checkIfNameIsCloseUrlIsExactAndWikidataIsNotDifferentForPlace = [
      matchers.veryClose(recordFetched.name, recordFromQuery.name),
      matchers.exactUrl(
        additionalProperties.url,
        recordFromQuery.url as string,
      ),
      matchers.notDifferentIfBothExists(
        additionalProperties.wikidata,
        recordFromQuery.wikidata,
      ),
    ];

    //TODO Add endDate logic for event
    const checksNameStartDateEndDatePlaceUriMatchForEvents = [
      matchers.veryClose(recordFetched.name, recordFromQuery.name),
      matchers.exactDate(additionalProperties.startDate, recordFromQuery.startDate
      ),
      matchers.exactUrl(additionalProperties.locationUri, recordFromQuery.locationUri as string,),
      matchers.closeDates(additionalProperties.startDate, recordFromQuery.startDate as string,
        additionalProperties.endDate, recordFromQuery.endDate,
      ),
    ];

    //TODO Add endDate logic for event
    const checksNameStartDateEndDatePlaceNamePostalCodeMatchForEvents = [
      matchers.veryClose(recordFetched.name, recordFromQuery.name),
      matchers.exactDate(additionalProperties.startDate, recordFromQuery.startDate),
      matchers.exact(additionalProperties.postalCode, recordFromQuery.postalCode),
      matchers.veryClose(additionalProperties.locationName, recordFromQuery.locationName),
      matchers.closeDates(
        additionalProperties.startDate, recordFromQuery.startDate as string, additionalProperties.endDate,
        recordFromQuery.endDate),
    ];

    if (reconciliationQuery.type === Entities.PLACE) {
      return (
        checkIfWikidataIdIsExactMatch.every(Boolean) ||
        checkIfNameIsClosePostalCodeIsExactAndWikidataIsNotDifferent.every(Boolean) ||
        checkIfNameAddressLocalityAreCloseAndWikidataIsNotDifferentForPlace.every(Boolean) ||
        checkIfNameIsCloseUrlIsExactAndWikidataIsNotDifferentForPlace.every(Boolean)
      );
    } else if (reconciliationQuery.type === Entities.EVENT) {
      return (
        checksNameStartDateEndDatePlaceUriMatchForEvents.every(Boolean) ||
        checksNameStartDateEndDatePlaceNamePostalCodeMatchForEvents.every(Boolean)
      );
    } else {
      return (
        checkIfWikidataIdIsExactMatch.every(Boolean) ||
        checkIfIsniIsExactMatch.every(Boolean) ||
        checkIfNameIsCloseAndWikidataIdIsExact.every(Boolean)
      );
    }
  }

  private static formatReconciliationQuery(reconciliationQuery: ReconciliationQuery) {
    const { conditions } = reconciliationQuery;
    const name = conditions.find((condition) => condition.matchType === "name")
      ?.propertyValue as string | undefined;
    const postalCode = conditions.find((condition) =>
      condition.propertyId?.includes("postalCode"),
    )?.propertyValue as string | undefined;
    const addressLocality = conditions.find((condition) =>
      condition.propertyId?.includes("addressLocality"),
    )?.propertyValue as string | undefined;
    const addressRegion = conditions.find((condition) =>
      condition.propertyId?.includes("addressRegion"),
    )?.propertyValue as string | undefined;
    const url = conditions.find((condition) =>
      condition.propertyId?.includes("url"),
    )?.propertyValue as string | undefined;
    const sameAs = conditions
      .filter((condition) => condition.propertyId?.includes("sameAs"))
      ?.map((sameAs) => sameAs.propertyValue as string | undefined);

    const startDate = conditions.find((condition) =>
      condition.propertyId?.includes("startDate"),
    )?.propertyValue as string | undefined;
    const endDate = conditions.find((condition) =>
      condition.propertyId?.includes("endDate"),
    )?.propertyValue as string | undefined;

    const locationName = conditions.find((condition) =>
      condition.propertyId?.includes(
        "<https://schema.org/location>/<https://schema.org/name>",
      ),
    )?.propertyValue as string | undefined;
    const locationUri = conditions.find((condition) =>
      condition.propertyId?.includes(
        "<https://schema.org/location>/<https://schema.org/sameAs>",
      ),
    )?.propertyValue as string | undefined;

    const wikidata = sameAs?.find((sameAs) =>
      sameAs?.startsWith("http://www.wikidata.org/entity/"),
    );
    const isni = sameAs?.find((sameAs) =>
      sameAs?.startsWith("https://isni.org/isni/"),
    );

    return {
      name,
      postalCode,
      addressLocality,
      addressRegion,
      url,
      startDate,
      endDate,
      locationName,
      locationUri,
      isni: isni?.length ? isni : undefined,
      wikidata: wikidata?.length ? wikidata : undefined,
    };
  }
}
