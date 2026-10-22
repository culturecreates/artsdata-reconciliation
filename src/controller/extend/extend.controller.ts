import {Body, Controller, Get, Headers, Param, ParseArrayPipe, ParseIntPipe, Post, Query, Res,} from "@nestjs/common";
import {Response} from "express";
import {ApiHeader, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags,} from "@nestjs/swagger";
import {ExtendService} from "../../service/extend";
import {DataExtensionQueryDTO, DataExtensionResponseDTO, ProposedExtendProperty,} from "../../dto/extend";
import {ExtendExternalGraphTypeEnum, LanguageEnum, ProposedEntityTypeEnum} from "../../enum";

@Controller("/extend")
@ApiTags("Extend Service APIs")
export class ExtendController {
    constructor(private readonly _extendService: ExtendService) {
    }

    @Get("/propose")
    @ApiOperation({summary: "Get proposed properties for the selected type"})
    @ApiQuery({
        name: "type",
        enum: ProposedEntityTypeEnum,
        type: String,
        description: "Select type",
        required: true,
        explode: false,
    })
    @ApiResponse({
        status: 200,
        type: ProposedExtendProperty,
        description: "Proposed properties for the selected type",
    })
    getProposedProperties(
        @Query("type") type: ProposedEntityTypeEnum,
    ): ProposedExtendProperty {
        return this._extendService.getProposedProperties(type);
    }

    @Post()
    @ApiOperation({summary: "Get Data extension result"})
    @ApiResponse({
        status: 200,
        type: DataExtensionResponseDTO,
        isArray: true,
        description: "Reconciliation candidates for each query",
    })
    @ApiHeader({
        name: "accept-language",
        description:
            "Select language for the string values (name, description...). 'en' for English and 'fr' for French. 'en' is the default.",
        required: false,
        enum: ["en", "fr"],
        example: "en",
    })
    async getDataExtension(
        @Body() dataExtensionQuery: DataExtensionQueryDTO,
        @Headers("accept-language") acceptLanguage: LanguageEnum,
        @Res({passthrough: true}) response: Response,
    ) {
        acceptLanguage = acceptLanguage || LanguageEnum.ENGLISH;
        response.setHeader("Content-Language", acceptLanguage);
        return await this._extendService.getDataExtension(dataExtensionQuery, acceptLanguage);
    }

    @Get(":graph_uri/:entity_class")
    @ApiOperation({summary: "Get Data from a given graph"})
    @ApiParam({
        name: "entity_class",
        description: "**entity-class**",
        required: true,
        enum: Object.values(ExtendExternalGraphTypeEnum),
    })
    @ApiQuery({
        name: "page",
        description: "The page number.",
        required: true,
        explode: false,
        type: Number,
        example: 1,
    })
    @ApiQuery({
        name: "limit",
        description: "The page size.",
        required: true,
        explode: false,
        type: Number,
        example: 10,
    })
    @ApiQuery({
        name: "uri",
        type: [String],
        description: "select uris",
        required: false,
    })
    @ApiQuery({
        name: "region",
        type: String,
        description: "Select region",
        required: false,
    })
    async getExtendDataFromGraph(
        @Param("graph_uri") graphURI: string,
        @Param("entity_class") entityClass: ExtendExternalGraphTypeEnum,
        @Query("region") region: string,
        @Query("uri", new ParseArrayPipe({items: String, optional: true})) entityUris: string[],
        @Query("page", ParseIntPipe) page: number,
        @Query("limit", ParseIntPipe) limit: number,
    ) {
        return await this._extendService.getExtendDataFromGraph(graphURI, entityClass, entityUris, region, page, limit);
    }
}
