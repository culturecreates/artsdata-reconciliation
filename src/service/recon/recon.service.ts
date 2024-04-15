import { Injectable } from "@nestjs/common";
import { ArtsdataService } from "../artsdata";
import { ReconciliationRequest, ReconciliationResponse } from "../../dto";

@Injectable()
export class ReconciliationService {

  constructor(private readonly _artsdataService: ArtsdataService) {
  }

  async reconcileByQuery(name: string, type: string): Promise<ReconciliationResponse[]> {
    return this._artsdataService.getReconciliationResult(name, type);
  }

  async reconcileByQueries(reconciliationRequest: ReconciliationRequest[]): Promise<ReconciliationResponse[]> {
    const promises = reconciliationRequest.map(query =>
      this._artsdataService.getReconciliationResult(query.query, query.type)
    );

    const results = (await Promise.all(promises)).flat();

    const uniqueResults = results.filter((result, index, self) =>
      index === self.findIndex((object) => (
        object.id === result.id 
      ))
    );

    return uniqueResults;
  }

}
