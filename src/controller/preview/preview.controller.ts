import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PreviewService } from "../../service/preview";

@Controller("/preview")
@ApiTags("Preview Service APIs")
export class PreviewController {
  constructor(private readonly _previewService: PreviewService) {}

  @Get()
  @ApiOperation({ summary: "Preview entity" })
  @ApiQuery({
    name: "id",
    type: String,
    description: "Provide artsdata identifier",
    required: true,
    explode: false,
  })
  @ApiResponse({
    status: 200,
    type: String,
    description: "Embeddable HTML previews of their entities",
  })
  async getPreview(@Query("id") entityId: string): Promise<string> {
    return await this._previewService.getPreview(entityId);
  }
}
