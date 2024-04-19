import { Controller, Get } from "@nestjs/common";
import { ManifestService } from "../../service/manifest/manifest.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ServiceManifestResponse } from "../../dto/manifest.dto";

@Controller()
@ApiTags("APIs")
export class ManifestController {
  constructor(private readonly appService: ManifestService) {
  }

  @Get()
  @ApiOperation({ summary: "Get service manifest" })
  @ApiResponse({ status: 200, type: ServiceManifestResponse, })
  @ApiResponse({ status: 500,description: "Internal server error"})
  getServiceManifest(): ServiceManifestResponse {
    return this.appService.getServiceManifest();
  }
}
