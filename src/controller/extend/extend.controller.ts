import { Body , Controller , Get , Post , Query } from "@nestjs/common";
import { ApiOperation , ApiQuery , ApiResponse , ApiTags } from "@nestjs/swagger";
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
  async getDataExtension(@Body() dataExtensionQuery: DataExtensionQueryDTO): Promise<DataExtensionResponseDTO> {
    return await this._extendService.getDataExtension(dataExtensionQuery);
  }

}
