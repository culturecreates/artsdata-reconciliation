import { Controller, Get } from "@nestjs/common";
import { ManifestService } from "../../service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ServiceManifestResponse } from "../../dto";

@Controller()
// @ApiTags("APIs")
export class ManifestController {
  constructor(private readonly appService: ManifestService) {
  }

  @Get()
  @ApiTags("Service Definition")
  @ApiOperation({ summary: "Get service manifest" })
  @ApiResponse({ status: 200, type: ServiceManifestResponse, })
  @ApiResponse({ status: 500,description: "Internal server error"})
  getServiceManifest(): ServiceManifestResponse {
    return this.appService.getServiceManifest();
  }
}
