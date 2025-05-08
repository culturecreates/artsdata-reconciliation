import { Body , Controller , Get , Headers , Post , Query } from "@nestjs/common";
import { ApiHeader , ApiOperation , ApiQuery , ApiResponse , ApiTags } from "@nestjs/swagger";
import { MatchService } from "../../service";
import { ReconciliationRequest , ReconciliationResponse } from "../../dto";

@Controller()

@ApiTags("Match Service APIs")
@ApiHeader({ name: "version" , description: "The version supported are 0.2 and 1.0" , required: true })
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
  async reconcileByQuery(@Headers("version") version: string ,
                         @Query("queries") rawQueries: string): Promise<ReconciliationResponse[]> {
    return await this._matchService.reconcileByRawQueries(version , rawQueries);
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
  async reconcileByQueries(@Headers("version") version: string ,
                           @Body() reconciliationRequest: ReconciliationRequest) {
    return await this._matchService.reconcileByQueries(version , reconciliationRequest);
  }


}
