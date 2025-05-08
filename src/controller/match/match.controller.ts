import { Body , Controller , Get , Post , Query , UseInterceptors } from "@nestjs/common";
import { ApiOperation , ApiProduces , ApiQuery , ApiResponse , ApiTags } from "@nestjs/swagger";
import { MatchService } from "../../service";
import { ReconciliationRequest , ReconciliationResponse } from "../../dto";
import { HeaderValidationInterceptor } from "../../header-validation/header-validation.interceptor";

@Controller()

@ApiTags("Match Service APIs")
@UseInterceptors(new HeaderValidationInterceptor("accept" , ["application/reconciliation.v1+json"]))
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
  @ApiProduces("application/reconciliation.v1+json")
  async reconcileByQuery(@Query("queries") rawQueries: string): Promise<ReconciliationResponse[]> {
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
  @ApiProduces("application/reconciliation.v1+json")
  async reconcileByQueries(@Body() reconciliationRequest: ReconciliationRequest) {
    return await this._matchService.reconcileByQueries(reconciliationRequest);
  }


}
