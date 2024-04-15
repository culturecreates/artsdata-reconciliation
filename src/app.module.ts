import { Module } from "@nestjs/common";
import { ManifestController, ReconciliationController } from "./controller";
import { ManifestService, ReconciliationService } from "./service";

@Module({
  imports: [],
  controllers: [
    ManifestController,
    ReconciliationController
  ],
  providers: [
    ManifestService,
    ReconciliationService]
})
export class AppModule {
}
