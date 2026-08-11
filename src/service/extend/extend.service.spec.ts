import {Test, TestingModule} from "@nestjs/testing";
import {ExtendService} from "./extend.service";
import {ArtsdataService} from "../artsdata";
import {EntityClassEnum} from "../../enum/entity-class.enum";

// The `natural` package ships ESM that ts-jest does not transform. It is only
// pulled in transitively via the helper chain and is unused here, so mock it.
jest.mock("natural", () => ({JaroWinklerDistance: jest.fn()}));

describe("ExtendService - getDataFromGraph reconciled flag", () => {
    let service: ExtendService;
    let mockArtsdataService: jest.Mocked<Pick<ArtsdataService, "executeSparqlQuery">>;

    const graphUri = "http://kg.artsdata.ca/culture-creates/artsdata-planet-wikidata/wikidata-interlinking";

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ExtendService,
                {
                    provide: ArtsdataService,
                    useValue: {
                        executeSparqlQuery: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ExtendService>(ExtendService);
        mockArtsdataService = module.get(ArtsdataService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("should set reconciled to false when the Artsdata link is only an external claim", async () => {
        mockArtsdataService.executeSparqlQuery.mockResolvedValue({
            results: {
                bindings: [
                    {
                        uri: {type: "uri", value: "http://www.wikidata.org/entity/Q100328326"},
                        name: {type: "literal", value: "person name"},
                        artsdata_uri: {type: "uri", value: "http://kg.artsdata.ca/resource/K10-184"},
                        reconciled: {
                            type: "literal",
                            datatype: "http://www.w3.org/2001/XMLSchema#boolean",
                            value: "false",
                        },
                    },
                ],
            },
        });

        const result = await service.getDataFromGraph(graphUri, EntityClassEnum.AGENT, "", 1, 10);

        expect(result).toHaveLength(1);
        expect(result[0].artsdata_uri).toBe("http://kg.artsdata.ca/resource/K10-184");
        expect(result[0].reconciled).toBe(false);
    });

    it("should set reconciled to true when Artsdata core asserts the sameAs back-link", async () => {
        mockArtsdataService.executeSparqlQuery.mockResolvedValue({
            results: {
                bindings: [
                    {
                        uri: {type: "uri", value: "http://www.wikidata.org/entity/Q100328326"},
                        name: {type: "literal", value: "person name"},
                        artsdata_uri: {type: "uri", value: "http://kg.artsdata.ca/resource/K10-184"},
                        reconciled: {
                            type: "literal",
                            datatype: "http://www.w3.org/2001/XMLSchema#boolean",
                            value: "true",
                        },
                    },
                ],
            },
        });

        const result = await service.getDataFromGraph(graphUri, EntityClassEnum.AGENT, "", 1, 10);

        expect(result).toHaveLength(1);
        expect(result[0].artsdata_uri).toBe("http://kg.artsdata.ca/resource/K10-184");
        expect(result[0].reconciled).toBe(true);
    });
});
