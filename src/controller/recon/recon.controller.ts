import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ServiceManifestResponse } from "../../dto/manifest.dto";
import { ReconciliationService } from "../../service";

@Controller()
@ApiTags("APIs")
export class ReconciliationController {
  constructor(private readonly _reconciliationService: ReconciliationService) {
  }

  @Get()
  @ApiOperation({ summary: "Reconcile" })
  @ApiResponse({ status: 200, type: ServiceManifestResponse })
  @ApiResponse({ status: 500, description: "Internal server error" })
  reconcile(): Object | null {
    return this._reconciliationService.reconcile();
  }
}
