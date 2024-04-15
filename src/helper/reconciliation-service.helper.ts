import { ReconciliationResponse } from "../dto";

export class ReconciliationServiceHelper {

  static formatReconciliationResponse(sparqlResponse: any): ReconciliationResponse[] {

    return sparqlResponse?.results?.bindings?.map((binding: any) => {

      const result = new ReconciliationResponse();
      result.id = binding["originalUri"].value;
      result.disambiguatingDescription = binding["disambiguatingDescription"]?.value;
      result.name = binding["name"]?.value;
      result.score = binding["score"]?.value;
      result.match = binding["score"]?.value >= 10;
      result.type = [{ id: binding["type"]?.value, name: binding["typeLabel"]?.value }];
      return result;
    });

  }
}