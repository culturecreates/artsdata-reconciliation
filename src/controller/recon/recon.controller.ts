import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ReconciliationRequest, ReconciliationResponse } from "../../dto";
import { ReconciliationService } from "../../service";

@Controller()
@ApiTags("APIs")
export class ReconciliationController {
  constructor(private readonly _reconciliationService: ReconciliationService) {
  }

  @Get("/reconcile")
  @ApiOperation({ summary: "Reconcile" })
  @ApiResponse({ status: 200, type: ReconciliationResponse, isArray: true, description: "Reconciliation response" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiQuery({
    name: "queries",
    description: "Queries",
    required: false,
    explode: false,
    example: "{\"queries\":{\"conditions\":[{\"matchType\":\"string\",\"v\":\"string\"}]}}"
  })
  async reconcileByQuery(
    @Query("queries") rawQueries: string
  ): Promise<ReconciliationResponse[]> {
    return await this._reconciliationService.reconcileByRawQueries(rawQueries);
  }

  @Post("/reconcile")
  @ApiOperation({ summary: "Reconcile" })
  @ApiResponse({ status: 200, type: ReconciliationResponse, isArray: true, description: "Reconciliation response" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async reconcileByQueries(@Body() reconciliationRequest: ReconciliationRequest): Promise<ReconciliationResponse> {
    return await this._reconciliationService.reconcileByQueries(reconciliationRequest);
  }

}
