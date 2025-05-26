import { Module } from "@nestjs/common";
import { ManifestController , MatchController } from "./controller";
import { ArtsdataService , HttpService , ManifestService , MatchService } from "./service";
import { ExtendController } from "./controller/extend";
import { ExtendService } from "./service/extend";
import { PreviewService } from "./service/preview";
import { PreviewController } from "./controller/preview";

@Module({
  imports: [] ,
  controllers: [
    ManifestController ,
    MatchController ,
    ExtendController,
    PreviewController
  ] ,
  providers: [
    ExtendService,
    ManifestService ,
    MatchService ,
    ArtsdataService ,
    PreviewService,
    HttpService
  ]
})
export class AppModule {
}
