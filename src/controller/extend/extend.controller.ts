import { Body , Controller , Get , Param , ParseIntPipe , Post , Query } from "@nestjs/common";
import { ApiOperation , ApiParam , ApiQuery , ApiResponse , ApiTags } from "@nestjs/swagger";
import { EntityClassEnum } from "../../enum/entity-class.enum";
import { ExtendService } from "../../service/extend";
import { DataExtensionQueryDTO , DataExtensionResponseDTO , ProposedExtendProperty } from "../../dto/extend";

@Controller("/extend")

@ApiTags("Extend Service APIs")
// @UseInterceptors(new HeaderValidationInterceptor("accept" , ["application/reconciliation.v1+json"]))
export class ExtendController {
  constructor(private readonly _extendService: ExtendService) {
  }

  @Get("/propose")
  @ApiOperation({ summary: "Get proposed properties for the selected type" })
  @ApiQuery({
    name: "type" ,
    enum: EntityClassEnum ,
    type: String ,
    description: "Select type" ,
    required: true ,
    explode: false
  })
  @ApiResponse({
    status: 200 , type: ProposedExtendProperty ,
    description: "Proposed properties for the selected type"
  })
  getProposedProperties(@Query("type") type: EntityClassEnum): ProposedExtendProperty {
    return this._extendService.getProposedProperties(type);
  }

  @Post()
  @ApiOperation({ summary: "Get Data extension result" })
  @ApiResponse({
    status: 200 , type: DataExtensionResponseDTO , isArray: true ,
    description: "Reconciliation candidates for each query"
  })
  async getDataExtension(@Body() dataExtensionQuery: DataExtensionQueryDTO) {
    return await this._extendService.getDataExtension(dataExtensionQuery);
  }

  @Get(":graph_uri/:entity_class")
  @ApiOperation({ summary: "Get Data from a given graph" })
  @ApiParam({
    name: "entity_class" ,
    description: "**entity-class**" ,
    required: true ,
    enum: Object.values(EntityClassEnum)
  })
  @ApiQuery({
    name: "page" ,
    description: "The page number." ,
    required: true ,
    explode: false ,
    type: Number ,
    example: 1
  })
  @ApiQuery({
    name: "limit" ,
    description: "The page size." ,
    required: true ,
    explode: false ,
    type: Number ,
    example: 10
  })
  async getDataFromGraph(@Param("graph_uri") graphURI: string ,
                         @Param("entity_class") entityClass: EntityClassEnum ,
                         @Query("page" , ParseIntPipe) page: number ,
                         @Query("limit" , ParseIntPipe) limit: number) {
    return await this._extendService.getDataFromGraph(graphURI , entityClass , page , limit);
  }

}
