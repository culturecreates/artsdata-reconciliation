import { ReconciliationResponse } from "../dto";
import { GRAPHDB_INDEX } from "../config";

export class ReconciliationServiceHelper {

  static formatReconciliationResponse(query: string, sparqlResponse: any): ReconciliationResponse[] {

    return sparqlResponse?.results?.bindings?.map((binding: any) => {

      const result = new ReconciliationResponse();
      result.id = binding["entity"].value;
      result.disambiguatingDescription = binding["disambiguatingDescription"]?.value;
      result.name = binding["name"]?.value;
      result.score = binding["score"]?.value;
      //TODO match is incorrect when query contains accent characters
      result.match = binding["name"]?.value.toLowerCase() === query.toLowerCase();
      result.type = [{ id: binding["type"]?.value, name: binding["typeLabel"]?.value }];
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