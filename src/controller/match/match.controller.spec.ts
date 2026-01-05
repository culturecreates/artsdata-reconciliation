import {Test, TestingModule} from "@nestjs/testing";
import {MatchController} from "./match.controller";
import {ArtsdataService, HttpService, ManifestService, MatchService} from "../../service";
import {LanguageEnum, MatchQuantifierEnum, MatchTypeEnum} from "../../enum";
import {ReconciliationRequest} from "../../dto";
import {INestApplication, ValidationPipe} from "@nestjs/common";
import {plainToInstance} from "class-transformer";
import {validate} from "class-validator";

describe('MatchController', () => {
    let matchController: MatchController;
    let app: INestApplication;
    const mockResponse: any = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis()
    };

    beforeAll(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            controllers: [MatchController],
            providers: [HttpService, ArtsdataService, ManifestService, MatchService]
        }).compile();
        app = moduleRef.createNestApplication();

        app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true,}));
        await app.init();
        matchController = app.get<MatchController>(MatchController);
    });

    describe("Test Match API", () => {

        it("Match service should return result", async () => {
            const matchRequest: ReconciliationRequest = {
                "queries": [
                    {
                        "conditions": [
                            {
                                "matchType": MatchTypeEnum.NAME,
                                "propertyValue": "Old-Aylmer",
                                "required": true,
                                "matchQuantifier": MatchQuantifierEnum.ANY
                            },
                            {
                                "matchType": MatchTypeEnum.PROPERTY,
                                "propertyId": "<http://schema.org/address>/<http://schema.org/postalCode>",
                                "propertyValue": "J9H",
                                "required": false,
                                "matchQuantifier": MatchQuantifierEnum.ANY
                            }
                        ],
                        type: "schema:Place",
                        limit: 5
                    }
                ]
            }

            const dto = plainToInstance(ReconciliationRequest, matchRequest);
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

    });
});