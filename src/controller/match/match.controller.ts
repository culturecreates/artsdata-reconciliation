import {Body, Controller, Get, Headers, Post, Query, Res,} from "@nestjs/common";
import {ApiBody, ApiHeader, ApiOperation, ApiQuery, ApiResponse, ApiTags,} from "@nestjs/swagger";
import {MatchService} from "../../service";
import {ReconciliationRequest, ReconciliationResponse} from "../../dto";
import {LanguageEnum} from "../../enum";
import {Response} from "express";

@Controller()
@ApiTags("Match Service APIs")
export class MatchController {
    constructor(private readonly _matchService: MatchService) {
    }

    @Get("/match")
    @ApiOperation({
        summary: "Send reconciliation queries to the match service",
        description: `
### Reconciliation Query Format
A reconciliation query filters and ranks entity candidates based on the following fields:

* **\`conditions\`** *(Array, Required)*: A list of one or more constraints to filter candidates.
* **\`type\`** *(String, Optional)*: Restricts the search to a specific entity class (e.g., Event, Place, etc).
* **\`limit\`** *(Integer, Optional)*: Maximum number of candidates to return (must be a positive integer, default: 25).

#### Condition Object Structure
Each object inside the \`conditions\` array consists of:
* **\`matchType\`** *(String, Required)*: Must be \`name\`, \`id\`, or \`property\`.
* **\`propertyId\`** *(String)*: Required if \`matchType\` is \`property\`.
* **\`propertyValue\`** *(String or List of String, Required)*: The value(s) to match against.
* **\`required\`** *(Boolean, Optional)*: \`true\` acts as a strict filter; \`false\` only affects ranking score. *(Default: false)*
* **\`matchQuantifier\`** *(String, Optional)*: Logic for multi-values: \`any\` (OR), \`all\` (AND), or \`none\` (NOT). *(Default: any)*
* **\`matchQualifier\`** *(String, Optional)*: Matching relationship flavor (e.g., \`RegexMatch\`, \`ExactMatch\`). 

The service use REGEX function in SPARQL. The regular expression language is defined in XQuery 1.0 and XPath 2.0 Functions and Operators section. 
You can read more about the syntax here. Artsdata always uses the “i” flag to make characters case insensitive. 
Escape Regex operators like dot (.) and plus (+) when searching for the literal string by using 2 backslashes “\\”.`,
    })
    @ApiResponse({
        status: 200,
        type: ReconciliationResponse,
        isArray: true,
        description: "Reconciliation candidates for each query",
    })
    @ApiResponse({
        status: 401,
        type: ReconciliationResponse,
        description:
            "Authentication failure, when a [security scheme](https://spec.openapis.org/oas/latest.html#security-scheme-object) " +
            "is provided in the [service manifest](#/components/schemas/manifest)",
    })
    @ApiQuery({
        name: "queries",
        description: "Queries",
        required: false,
        explode: false,
        examples: {
            "Example1": {
                summary: "Finds a specific place like Roy Thomson Hall",
                description: "An example of a query that matches a place like Roy Thomson Hall",
                value: JSON.stringify({
                    queries: [
                        {
                            type: "schema:Place",
                            limit: 2,
                            conditions: [
                                {
                                    matchType: "name",
                                    propertyValue: "Roy Thomson hall",
                                    required: true
                                }
                            ]
                        }
                    ]
                })
            },
            "Example2": {
                summary: "Match all organizations with a website that contains the domain of the National Arts Centre 'nac-cna'",
                description: "An example of a query that matches all organizations with a website that contains the domain of the National Arts Centre 'nac-cna' using {Match Qualifier: RegexMatch}:",
                value: JSON.stringify({
                    queries: [
                        {
                            type: "schema:Organization",
                            conditions: [
                                {
                                    matchType: "property",
                                    propertyId: "http://schema.org/url",
                                    propertyValue: "nac-cna.ca",
                                    required: true,
                                    matchQuantifier: "all",
                                    matchQualifier: "RegexMatch"
                                }
                            ]
                        }
                    ]
                })
            },
            "Example3": {
                summary: "Query that matches all organizations that have an ISNI",
                description: "An example of a query that matches all organizations that have an ISNI using {Match Qualifier: RegexMatch}",
                value: JSON.stringify({
                    queries: [
                        {
                            type: "schema:Organization",
                            conditions: [
                                {
                                    matchType: "property",
                                    propertyId: "http://schema.org/sameAs",
                                    propertyValue: "ISNI.*",
                                    required: true,
                                    matchQuantifier: "all",
                                    matchQualifier: "RegexMatch"
                                }
                            ]
                        }
                    ]
                })
            }
        }
    })
    @ApiHeader({
        name: "accept-language",
        description:
            "Select language for the response. 'en' for English and 'fr' for French. 'en' is the default.",
        required: true,
        enum: ["en", "fr"], // Optional: List of allowed values
        example: "en", // Optional: Example value
    })
    async reconcileByQuery(
        @Headers("accept-language") acceptLanguage: LanguageEnum,
        @Query("queries") rawQueries: string,
        @Res({passthrough: true}) response: Response,
    ): Promise<ReconciliationResponse[]> {
        acceptLanguage = acceptLanguage || LanguageEnum.ENGLISH;
        response.setHeader("Content-Language", acceptLanguage);
        return await this._matchService.reconcileByRawQueries(acceptLanguage, rawQueries);
    }

    @Post("/match")
    @ApiOperation({
        summary: "Send reconciliation queries to the match service",
        description: `
### Reconciliation Query Format
A reconciliation query filters and ranks entity candidates based on the following fields:

* **\`conditions\`** *(Array, Required)*: A list of one or more constraints to filter candidates.
* **\`type\`** *(String, Optional)*: Restricts the search to a specific entity class (e.g., Event, Place, etc).
* **\`limit\`** *(Integer, Optional)*: Maximum number of candidates to return (must be a positive integer, default: 25).

#### Condition Object Structure
Each object inside the \`conditions\` array consists of:
* **\`matchType\`** *(String, Required)*: Must be \`name\`, \`id\`, or \`property\`.
* **\`propertyId\`** *(String)*: Required if \`matchType\` is \`property\`.
* **\`propertyValue\`** *(String or List of String, Required)*: The value(s) to match against.
* **\`required\`** *(Boolean, Optional)*: \`true\` acts as a strict filter; \`false\` only affects ranking score. *(Default: false)*
* **\`matchQuantifier\`** *(String, Optional)*: Logic for multi-values: \`any\` (OR), \`all\` (AND), or \`none\` (NOT). *(Default: any)*
* **\`matchQualifier\`** *(String, Optional)*: Matching relationship flavor (e.g., \`RegexMatch\`, \`ExactMatch\`). 

The service use REGEX function in SPARQL. The regular expression language is defined in XQuery 1.0 and XPath 2.0 Functions and Operators section. 
You can read more about the syntax here. Artsdata always uses the “i” flag to make characters case insensitive. 
Escape Regex operators like dot (.) and plus (+) when searching for the literal string by using 2 backslashes “\\”.`,
    })
    @ApiBody({
        type: ReconciliationRequest,
        description: 'Reconciliation query request payload',
        examples: {
            "Example1": {
                summary: "Finds a specific place like Roy Thomson Hall",
                description: "An example of a query that matches a place like Roy Thomson Hall",
                value: {
                    queries: [
                        {
                            type: "schema:Place",
                            limit: 2,
                            conditions: [
                                {
                                    matchType: "name",
                                    propertyValue: "Roy Thomson hall",
                                    required: true
                                }
                            ]
                        }
                    ]
                }
            },
            "Example2": {
                summary: "Match organizations by domain",
                description: "Matches all organizations with a website containing 'nac-cna' using RegexMatch.",
                value: {
                    queries: [
                        {
                            type: "schema:Organization",
                            conditions: [
                                {
                                    matchType: "property",
                                    propertyId: "http://schema.org/url",
                                    propertyValue: "nac-cna.ca",
                                    required: true,
                                    matchQuantifier: "all",
                                    matchQualifier: "RegexMatch"
                                }
                            ]
                        }
                    ]
                }
            },
            "Example3": {
                summary: "Query that matches all organizations that have an ISNI",
                description: "An example of a query that matches all organizations that have an ISNI using RegexMatch",
                value: {
                    queries: [
                        {
                            type: "schema:Organization",
                            conditions: [
                                {
                                    matchType: "property",
                                    propertyId: "http://schema.org/sameAs",
                                    propertyValue: "ISNI.*",
                                    required: true,
                                    matchQuantifier: "all",
                                    matchQualifier: "RegexMatch"
                                }
                            ]
                        }
                    ]
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        type: ReconciliationResponse,
        isArray: true,
        description: "Reconciliation candidates for each query",
    })
    @ApiResponse({
        status: 401,
        type: ReconciliationResponse,
        description:
            "Authentication failure, when a [security scheme](https://spec.openapis.org/oas/latest.html#security-scheme-object) " +
            "is provided in the [service manifest](#/components/schemas/manifest)",
    })
    @ApiHeader({
        name: "accept-language",
        description:
            "Select language for the response. 'en' for English and 'fr' for French. 'en' is the default.",
        required: true,
        enum: ["en", "fr"], // Optional: List of allowed values
        example: "en", // Optional: Example value
    })
    async reconcileByQueries(
        @Headers("accept-language") acceptLanguage: LanguageEnum,
        @Body() reconciliationRequest: ReconciliationRequest,
        @Res({passthrough: true}) response: Response,
    ) {
        acceptLanguage = acceptLanguage || LanguageEnum.ENGLISH;
        response.setHeader("Content-Language", acceptLanguage);
        return await this._matchService.reconcileByQueries(acceptLanguage, reconciliationRequest);
    }


    @Post("v2/match")
    @ApiOperation({summary: "Send reconciliation queries to the match service-v2"})
    @ApiHeader({
        name: "accept-language",
        description:
            "Select language for the response. 'en' for English and 'fr' for French. 'en' is the default.",
        required: true,
        enum: ["en", "fr"], // Optional: List of allowed values
        example: "en", // Optional: Example value
    })
    async reconcileByQueriesV2(
        @Headers("accept-language") acceptLanguage: LanguageEnum,
        @Body() reconciliationRequest: ReconciliationRequest,
        @Res({passthrough: true}) response: Response,
    ) {
        acceptLanguage = acceptLanguage || LanguageEnum.ENGLISH;
        response.setHeader("Content-Language", acceptLanguage);
        return await this._matchService.reconcileByQueries(acceptLanguage, reconciliationRequest, 'v2');
    }
}
