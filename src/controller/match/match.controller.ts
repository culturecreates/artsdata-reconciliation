import { Body , Controller , Get , Headers , Post , Query , Res } from "@nestjs/common";
import { ApiHeader , ApiOperation , ApiQuery , ApiResponse , ApiTags } from "@nestjs/swagger";
import { MatchService } from "../../service";
import { ReconciliationRequest , ReconciliationResponse } from "../../dto";
import { MatchRequestLanguageEnum } from "../../enum";
import { Response } from "express";

@Controller()

@ApiTags("Match Service APIs")
//TODO add accept header when server supports multiple versions
// @UseInterceptors(new HeaderValidationInterceptor("accept" , ["application/reconciliation.v1+json"]))
//TODO add accept header if no language should be considered as default
// @UseInterceptors(new HeaderValidationInterceptor("accept-language" , ["en" , "fr"]))
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
  @ApiHeader({
    name: "accept-language" ,
    description: "Select language for the response. 'en' for English and 'fr' for French. 'en' is the default." ,
    required: true ,
    enum: ["en" , "fr"] , // Optional: List of allowed values
    example: "en" // Optional: Example value
  })
  // @ApiProduces("application/reconciliation.v1+json")
  async reconcileByQuery(@Headers("accept-language") acceptLanguage: MatchRequestLanguageEnum ,
                         @Query("queries") rawQueries: string ,
                         @Res({ passthrough: true }) response: Response): Promise<ReconciliationResponse[]> {
    acceptLanguage = acceptLanguage || MatchRequestLanguageEnum.ENGLISH;
    response.setHeader("Content-Language" , acceptLanguage);
    return await this._matchService.reconcileByRawQueries(acceptLanguage , rawQueries);
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
  @ApiHeader({
    name: "accept-language" ,
    description: "Select language for the response. 'en' for English and 'fr' for French. 'en' is the default." ,
    required: true ,
    enum: ["en" , "fr"] , // Optional: List of allowed values
    example: "en" // Optional: Example value
  })
  // @ApiProduces("application/reconciliation.v1+json")
  async reconcileByQueries(@Headers("accept-language") acceptLanguage: MatchRequestLanguageEnum ,
                           @Body() reconciliationRequest: ReconciliationRequest ,
                           @Res({ passthrough: true }) response: Response) {
    acceptLanguage = acceptLanguage || MatchRequestLanguageEnum.ENGLISH;
    response.setHeader("Content-Language" , acceptLanguage);
    return await this._matchService.reconcileByQueries(acceptLanguage , reconciliationRequest);
  }


}
