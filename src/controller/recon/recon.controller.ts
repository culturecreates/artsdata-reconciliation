import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ReconciliationResponse } from "../../dto";
import { ReconciliationService } from "../../service";
import { ReconciliationTypesEnum } from "../../enum";

@Controller()
@ApiTags("APIs")
export class ReconciliationController {
  constructor(private readonly _reconciliationService: ReconciliationService) {
  }

  @Get("/recon")
  @ApiOperation({ summary: "Reconcile" })
  @ApiResponse({ status: 200, type: ReconciliationResponse, isArray: true, description: "Reconciliation response" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiQuery({
    name: "name",
    description: "Name of the entity to reconcile",
    required: true,
    explode: false,
    type: String
  })
  @ApiQuery({
    name: "type",
    description: "Type of the entity to reconcile",
    required: true,
    explode: false,
    enum: Object.values(ReconciliationTypesEnum)
  })
  async reconcile(
    @Query("name") name: string,
    @Query("type") type: string
  ): Promise<ReconciliationResponse[]> {
    return await this._reconciliationService.reconcile(name, type);
  }
}
