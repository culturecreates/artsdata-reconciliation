import { Injectable } from "@nestjs/common";
import { ArtsdataService } from "../artsdata";
import { ManifestService } from "../manifest";
import { ReconciliationResponse } from "../../dto";
import { Exception } from "../../helper";

@Injectable()
export class ReconciliationService {

  constructor(private readonly _artsdataService: ArtsdataService,
              private readonly _manifestService: ManifestService) {
  }

  async reconcileByRawQueries(rawQueries: string): Promise<any> {

    if (!rawQueries) {
      return this._manifestService.getServiceManifest();
    }
    let queries;
    try {
      queries = JSON.parse(rawQueries);
    } catch (e) {
      return Exception.badRequest("The request is not a valid JSON object.");
    }
    return await this.reconcileByQueries(queries);
  }

  async reconcileByQueries(queries: any): Promise<any> {
    let index = 0;
    const results: any = {};
    while (true) {
      const queryIndex: string = "q" + index;
      const query = queries[queryIndex];
      if (!query) {
        break;
      }
      const result: ReconciliationResponse[] =
        await this._artsdataService.getReconciliationResult(query.query, query.type, query.limit);
      results["q" + index] = { result: result };
      index++;
    }
    return results;
  }

}
