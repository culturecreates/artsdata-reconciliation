import { Controller , Get } from "@nestjs/common";
import { ManifestService } from "../../service";
import { ApiOperation , ApiResponse , ApiTags } from "@nestjs/swagger";
import { ServiceManifestResponse } from "../../dto";

@Controller()
// @UseInterceptors(new HeaderValidationInterceptor("accept" , ["application/reconciliation.v1+json"]))
export class ManifestController {
  constructor(private readonly appService: ManifestService) {
  }

  @Get()
  @ApiTags("Service Definition")
  @ApiOperation({ summary: "Get service manifest" })
  @ApiResponse({ status: 200 , type: ServiceManifestResponse })
  @ApiResponse({ status: 500 , description: "Internal server error" })
  // @ApiProduces("application/reconciliation.v1+json")
  getServiceManifest(): ServiceManifestResponse | undefined {
    return this.appService.getServiceManifest();
  }
}
