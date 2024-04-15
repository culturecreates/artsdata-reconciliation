import { Module } from "@nestjs/common";
import { ManifestController, ReconciliationController } from "./controller";
import { ManifestService, ReconciliationService } from "./service";
import { ArtsdataService } from "./service/artsdata";
import { HttpService } from "./service/http";

@Module({
  imports: [],
  controllers: [
    ManifestController,
    ReconciliationController
  ],
  providers: [
    ManifestService,
    ReconciliationService,
    ArtsdataService,
    HttpService

  ]
})
export class AppModule {
}
