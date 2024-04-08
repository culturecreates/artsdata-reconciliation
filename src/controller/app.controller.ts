import { Controller, Get } from "@nestjs/common";
import { AppService } from "../service/app.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ServiceManifestResponse } from "../dto/manifest.dto";

@Controller()
@ApiTags("APIs")
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Get()
  @ApiOperation({ summary: "Get service manifest" })
  @ApiResponse({ status: 200, type: ServiceManifestResponse, })
  @ApiResponse({ status: 500,description: "Internal server error"})
  getServiceManifest(): ServiceManifestResponse {
    return this.appService.getServiceManifest();
  }
}
