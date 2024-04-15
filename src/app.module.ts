import { Module } from "@nestjs/common";
import { ManifestController } from "./controller/manifest/manifest.controller";
import { ManifestService } from "./service/manifest/manifest.service";

@Module({
  imports: [],
  controllers: [ManifestController],
  providers: [ManifestService]
})
export class AppModule {
}
