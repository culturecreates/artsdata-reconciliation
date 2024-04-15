import { Injectable } from "@nestjs/common";
import { ArtsdataService } from "../artsdata";
import { ReconciliationResponse } from "../../dto";

@Injectable()
export class ReconciliationService {

  constructor(private readonly _artsdataService: ArtsdataService) {
  }

  async reconcile(name: string, type: string): Promise<ReconciliationResponse[]> {
    return this._artsdataService.getReconciliationResult(name, type);
  }
}
