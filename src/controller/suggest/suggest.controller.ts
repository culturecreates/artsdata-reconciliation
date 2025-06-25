import { Controller , Get , Query } from "@nestjs/common";
import { ApiOperation , ApiQuery , ApiResponse , ApiTags } from "@nestjs/swagger";
import { PreviewService } from "../../service/preview";
import { SuggestService } from "../../service/suggest";

@Controller("/suggest")

@ApiTags("Suggest Service APIs")
// @UseInterceptors(new HeaderValidationInterceptor("accept" , ["application/reconciliation.v1+json"]))
export class SuggestController {
  constructor(private readonly _suggestService: SuggestService) {
  }

  @Get("entity")
  @ApiOperation({ summary: "Suggest entity" })
  @ApiQuery({
    name: "prefix" ,
    type: String ,
    description: "The string input by the user in the auto-suggest-enabled field" ,
    required: true ,
    explode: false
  })
  @ApiQuery({
    name: "cursor" ,
    type: Number ,
    description: "The offset value for pagination. If not provided, defaults to 0" ,
    required: false ,
    explode: false
  })
  async getSuggestedEntities(@Query("prefix") prefix: string, @Query("cursor") cursor: number) {
    return await this._suggestService.getSuggestedEntities(prefix, cursor);
  }

  @Get("property")
  @ApiOperation({ summary: "Suggest property" })
  @ApiQuery({
    name: "prefix" ,
    type: String ,
    description: "The string input by the user in the auto-suggest-enabled field" ,
    required: true ,
    explode: false
  })
  @ApiQuery({
    name: "cursor" ,
    type: Number ,
    description: "The offset value for pagination. If not provided, defaults to 0" ,
    required: false ,
    explode: false
  })
  async getSuggestedProperties(@Query("prefix") prefix: string, @Query("cursor") cursor: number) {
    return await this._suggestService.getSuggestedProperties(prefix, cursor);
  }


  @Get("type")
  @ApiOperation({ summary: "Suggest type" })
  @ApiQuery({
    name: "prefix" ,
    type: String ,
    description: "The string input by the user in the auto-suggest-enabled field" ,
    required: true ,
    explode: false
  })
  @ApiQuery({
    name: "cursor" ,
    type: Number ,
    description: "The offset value for pagination. If not provided, defaults to 0" ,
    required: false ,
    explode: false
  })
  async getSuggestedTypes(@Query("prefix") prefix: string, @Query("cursor") cursor: number) {
    return await this._suggestService.getSuggestedTypes(prefix, cursor);
  }
}
