import { Injectable } from "@nestjs/common";
import { ArtsdataService } from "../artsdata";
import { ReconciliationQuery, ReconciliationResponse } from "../../dto";
import { ManifestService } from "../manifest";

@Injectable()
export class ReconciliationService {

  constructor(private readonly _artsdataService: ArtsdataService,
              private readonly _manifestService: ManifestService
  ) {
  }

  async reconcileByRawQueries(rawQueries: string): Promise<any> {

    if (!rawQueries) {
      return this._manifestService.getServiceManifest();
    }

    const queries = JSON.parse(rawQueries);
    let index = 0;
    const results: any = {};
    while (true) {
      const queryIndex: string = "q" + index;
      const query = queries[queryIndex];
      if (!query) {
        break;
      }
      const result =
        await this._artsdataService.getReconciliationResult(query.query, query.type, query.limit);
      results["q0"] = { result: result };
      index++;
    }
    return results;
  }

  async reconcileByQueries(reconciliationRequest: ReconciliationQuery[]): Promise<ReconciliationResponse[]> {
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
