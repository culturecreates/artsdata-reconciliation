import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ReconciliationQuery, ReconciliationResponse } from "../../dto";
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
    name: "queries",
    description: "Queries",
    required: true,
    explode: false,
  })
  async reconcileByQuery(
    @Query("queries") rawQueries: string,
  ): Promise<ReconciliationResponse[]> {
    return await this._reconciliationService.reconcileByRawQueries(rawQueries);
  }

  @Post("/recon")
  @ApiOperation({ summary: "Reconcile" })
  @ApiResponse({ status: 200, type: ReconciliationResponse, isArray: true, description: "Reconciliation response" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiBody({type: ReconciliationQuery, isArray: true})

  async reconcileByQueries(@Body() reconciliationRequest: any): Promise<ReconciliationResponse[]>{
    return await this._reconciliationService.reconcileByQueries(reconciliationRequest);
  }

}
