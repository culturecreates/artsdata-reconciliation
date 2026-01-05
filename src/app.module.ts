import {MiddlewareConsumer, Module} from "@nestjs/common";
import {ManifestController, MatchController} from "./controller";
import {ArtsdataService, HttpService, ManifestService, MatchService} from "./service";
import {ExtendController} from "./controller/extend";
import {ExtendService} from "./service/extend";
import {PreviewService} from "./service/preview";
import {PreviewController} from "./controller/preview";
import {SuggestController} from "./controller/suggest";
import {SuggestService} from "./service/suggest";
import {LoggerMiddleware} from "./middleware";

@Module({
    imports: [],
    controllers: [
        ManifestController,
        MatchController,
        ExtendController,
        PreviewController,
        SuggestController
    ],
    providers: [
        ExtendService,
        ManifestService,
        MatchService,
        ArtsdataService,
        PreviewService,
        SuggestService,
        HttpService
    ]
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}
