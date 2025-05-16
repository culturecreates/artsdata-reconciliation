import { Module } from "@nestjs/common";
import { ManifestController , MatchController } from "./controller";
import { ArtsdataService , HttpService , ManifestService , MatchService } from "./service";
import { ExtendController } from "./controller/extend";
import { ExtendService } from "./service/extend";

@Module({
  imports: [] ,
  controllers: [
    ManifestController ,
    MatchController ,
    ExtendController
  ] ,
  providers: [
    ExtendService,
    ManifestService ,
    MatchService ,
    ArtsdataService ,
    HttpService
  ]
})
export class AppModule {
}
