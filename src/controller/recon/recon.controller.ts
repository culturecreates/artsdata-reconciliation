import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ReconciliationRequest, ReconciliationResponse } from "../../dto";
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
  async reconcileByQuery(
    @Query("name") name: string,
    @Query("type") type: string
  ): Promise<ReconciliationResponse[]> {
    return await this._reconciliationService.reconcileByQuery(name, type);
  }

  @Post("/recon")
  @ApiOperation({ summary: "Reconcile" })
  @ApiResponse({ status: 200, type: ReconciliationResponse, isArray: true, description: "Reconciliation response" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiBody({type: ReconciliationRequest, isArray: true})
  async reconcileByQueries(@Body() reconciliationRequest: ReconciliationRequest[]): Promise<ReconciliationResponse[]>{
    return await this._reconciliationService.reconcileByQueries(reconciliationRequest);
  }

}
