import { Body , Controller , Get , Post , Query } from "@nestjs/common";
import { ApiOperation , ApiQuery , ApiResponse , ApiTags } from "@nestjs/swagger";
import { MatchService } from "../../service";
import { ReconciliationRequest , ReconciliationResponse } from "../../dto";

@Controller()

@ApiTags("Match Service APIs")
export class MatchController {
  constructor(private readonly _matchService: MatchService) {
  }

  @Get("/match")
  @ApiOperation({ summary: "Send reconciliation queries to the match service" })
  @ApiResponse({
    status: 200 , type: ReconciliationResponse , isArray: true ,
    description: "Reconciliation candidates for each query"
  })
  @ApiResponse({
    status: 401 , type: ReconciliationResponse ,
    description: "Authentication failure, when a [security scheme](https://spec.openapis.org/oas/latest.html#security-scheme-object) " +
      "is provided in the [service manifest](#/components/schemas/manifest)"
  })
  @ApiQuery({
    name: "queries" ,
    description: "Queries" ,
    required: false ,
    explode: false ,
    example: "{ \"queries\": [ { \"type\": \"schema:Place\", \"limit\": 2, \"conditions\": [ { \"matchType\": \"name\", \"v\": \"Roy Thomson hall\" } ] } ] }"
  })
  async reconcileByQuery(
    @Query("queries") rawQueries: string
  ): Promise<ReconciliationResponse[]> {
    return await this._matchService.reconcileByRawQueries(rawQueries);
  }

  @Post("/match")
  @ApiOperation({ summary: "Send reconciliation queries to the match service" })
  @ApiResponse({
    status: 200 , type: ReconciliationResponse , isArray: true ,
    description: "Reconciliation candidates for each query"
  })
  @ApiResponse({
    status: 401 , type: ReconciliationResponse ,
    description: "Authentication failure, when a [security scheme](https://spec.openapis.org/oas/latest.html#security-scheme-object) " +
      "is provided in the [service manifest](#/components/schemas/manifest)"
  })
  async reconcileByQueries(@Body() reconciliationRequest: ReconciliationRequest): Promise<ReconciliationResponse> {
    return await this._matchService.reconcileByQueries(reconciliationRequest);
  }


}
