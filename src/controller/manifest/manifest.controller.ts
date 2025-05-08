import { Controller , Get , Headers } from "@nestjs/common";
import { ManifestService } from "../../service";
import { ApiHeader , ApiOperation , ApiResponse , ApiTags } from "@nestjs/swagger";
import { ServiceManifestResponse } from "../../dto";

@Controller()
export class ManifestController {
  constructor(private readonly appService: ManifestService) {
  }

  @Get()
  @ApiTags("Service Definition")
  @ApiHeader({ name: "Accept" , description: "The version supported is 1.0" , required: true })
  @ApiOperation({ summary: "Get service manifest" })
  @ApiResponse({ status: 200 , type: ServiceManifestResponse })
  @ApiResponse({ status: 500 , description: "Internal server error" })
  getServiceManifest(@Headers("Accept") accept: string): ServiceManifestResponse | undefined {
    return this.appService.getServiceManifest();
  }
}
