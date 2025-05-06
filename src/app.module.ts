import { Module } from "@nestjs/common";
import { ManifestController , MatchController } from "./controller";
import { ArtsdataService , HttpService , ManifestService , MatchService } from "./service";

@Module({
  imports: [] ,
  controllers: [
    ManifestController ,
    MatchController
  ] ,
  providers: [
    ManifestService ,
    MatchService ,
    ArtsdataService ,
    HttpService

  ]
})
export class AppModule {
}
