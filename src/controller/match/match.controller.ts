import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Res,
} from "@nestjs/common";
import {
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { MatchService } from "../../service";
import { ReconciliationRequest, ReconciliationResponse } from "../../dto";
import { LanguageEnum } from "../../enum";
import { Response } from "express";

@Controller()
@ApiTags("Match Service APIs")
export class MatchController {
  constructor(private readonly _matchService: MatchService) {}

  @Get("/match")
  @ApiOperation({ summary: "Send reconciliation queries to the match service" })
  @ApiResponse({
    status: 200,
    type: ReconciliationResponse,
    isArray: true,
    description: "Reconciliation candidates for each query",
  })
  @ApiResponse({
    status: 401,
    type: ReconciliationResponse,
    description:
      "Authentication failure, when a [security scheme](https://spec.openapis.org/oas/latest.html#security-scheme-object) " +
      "is provided in the [service manifest](#/components/schemas/manifest)",
  })
  @ApiQuery({
    name: "queries",
    description: "Queries",
    required: false,
    explode: false,
    example:
      '{ "queries": [ { "type": "schema:Place", "limit": 2, "conditions": [ { "matchType": "name", "propertyValue": "Roy Thomson hall" } ] } ] }',
  })
  @ApiHeader({
    name: "accept-language",
    description:
      "Select language for the response. 'en' for English and 'fr' for French. 'en' is the default.",
    required: true,
    enum: ["en", "fr"], // Optional: List of allowed values
    example: "en", // Optional: Example value
  })
  async reconcileByQuery(
    @Headers("accept-language") acceptLanguage: LanguageEnum,
    @Query("queries") rawQueries: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ReconciliationResponse[]> {
    acceptLanguage = acceptLanguage || LanguageEnum.ENGLISH;
    response.setHeader("Content-Language", acceptLanguage);
    return await this._matchService.reconcileByRawQueries(acceptLanguage, rawQueries);
  }

  @Post("/match")
  @ApiOperation({ summary: "Send reconciliation queries to the match service" })
  @ApiResponse({
    status: 200,
    type: ReconciliationResponse,
    isArray: true,
    description: "Reconciliation candidates for each query",
  })
  @ApiResponse({
    status: 401,
    type: ReconciliationResponse,
    description:
      "Authentication failure, when a [security scheme](https://spec.openapis.org/oas/latest.html#security-scheme-object) " +
      "is provided in the [service manifest](#/components/schemas/manifest)",
  })
  @ApiHeader({
    name: "accept-language",
    description:
      "Select language for the response. 'en' for English and 'fr' for French. 'en' is the default.",
    required: true,
    enum: ["en", "fr"], // Optional: List of allowed values
    example: "en", // Optional: Example value
  })
  async reconcileByQueries(
    @Headers("accept-language") acceptLanguage: LanguageEnum,
    @Body() reconciliationRequest: ReconciliationRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    acceptLanguage = acceptLanguage || LanguageEnum.ENGLISH;
    response.setHeader("Content-Language", acceptLanguage);
    return await this._matchService.reconcileByQueries(acceptLanguage, reconciliationRequest);
  }


    @Post("/match/v2")
    @ApiOperation({ summary: "Send reconciliation queries to the match service-v2" })
    @ApiHeader({
        name: "accept-language",
        description:
            "Select language for the response. 'en' for English and 'fr' for French. 'en' is the default.",
        required: true,
        enum: ["en", "fr"], // Optional: List of allowed values
        example: "en", // Optional: Example value
    })
    async reconcileByQueriesV2(
        @Headers("accept-language") acceptLanguage: LanguageEnum,
        @Body() reconciliationRequest: ReconciliationRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        acceptLanguage = acceptLanguage || LanguageEnum.ENGLISH;
        response.setHeader("Content-Language", acceptLanguage);
        return await this._matchService.reconcileByQueries(acceptLanguage, reconciliationRequest, 'v2');
    }
}
