import { Injectable } from "@nestjs/common";
import { ArtsdataService } from "../artsdata";
import { ManifestService } from "../manifest";
import { ReconciliationRequest, ReconciliationResponse, ReconciliationResults } from "../../dto";
import { Exception } from "../../helper";
import { ReconRequestMatchTypeEnum } from "../../enum";

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

  async reconcileByQueries(reconciliationRequest: ReconciliationRequest): Promise<ReconciliationResponse> {

    const { queries } = reconciliationRequest;
    const results: ReconciliationResults[] = [];
    if (!queries) {
      return { results: [] };
    }
    for (const reconciliationQuery of queries) {
      const { type, limit, conditions } = reconciliationQuery;
      const query = conditions
        .find(condition => condition.matchType == ReconRequestMatchTypeEnum.NAME)?.v;
      const candidates = await this._artsdataService.getReconciliationResult(query as string, type, limit);
      results.push({ candidates: candidates });
    }
    return { results };
  }

}
