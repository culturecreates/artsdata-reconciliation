import {DataExtensionQueryDTO} from "../../dto/extend";
import {dropGraph, setupExtendService, uploadDataSet} from "../../../test/util/common-util";
import {ExtendPropertySettingsEnum} from "../../enum";
import {ExtendService} from "./extend.service";

/**
 * The order of the values of a property follows the order of the SPARQL solutions, which the
 * store does not guarantee, so the tests that expect more than one value sort them first.
 */
const getValues = (result: any, propertyId: string, rowIndex: number = 0) =>
    result.rows[rowIndex].properties.find((property: any) => property.id === propertyId)?.values;

const byLang = (a: any, b: any) => a.lang < b.lang ? -1 : 1;

describe('ExtendService', () => {
    let extendService: ExtendService;

    const maintenanceGraphData = 'test/fixtures/files/extend-service-settings.ttl';
    const externalGraphURI: string = 'http://test.fixtures/extend-service-settings';

    beforeAll(async () => {
        const setup = await setupExtendService();
        extendService = setup.extendService;
        await uploadDataSet(externalGraphURI, maintenanceGraphData)
    });

    afterAll(async () => {
        await dropGraph(externalGraphURI);
    })

    describe('Test Extend data Service with settings', () => {

        it(`Extend data for an Event with content id and literal`, async () => {

            const extendRequest: DataExtensionQueryDTO = {
                ids: ["KP-1-event"],
                properties: [
                    {id: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"},
                    {id: "name"},
                    {id: "startDate"},
                    {id: "performer", settings: {content: ExtendPropertySettingsEnum.ID}},
                    {id: "organizer", settings: {content: ExtendPropertySettingsEnum.LITERAL}},
                ]
            }
            const result = await extendService.getDataExtension(extendRequest);

            const expectedResult = {
                "meta": [
                    {
                        "id": "type",
                        "name": "type"
                    },
                    {
                        "id": "name",
                        "name": "name"
                    },
                    {
                        "id": "startDate",
                        "name": "startDate"
                    },
                    {
                        "id": "performer",
                        "name": "performer"
                    },
                    {
                        "id": "organizer",
                        "name": "organizer"
                    }
                ],
                "rows": [
                    {
                        "id": "KP-1-event",
                        "properties": [
                            {
                                "id": "type",
                                "values": [
                                    {
                                        "id": "http://schema.org/Event"
                                    }
                                ]
                            },
                            {
                                "id": "name",
                                "values": [
                                    {
                                        "str": "Event Bell"
                                    }
                                ]
                            },
                            {
                                "id": "startDate",
                                "values": [
                                    {
                                        "str": "2018-01-01"
                                    }
                                ]
                            },
                            {
                                "id": "performer",
                                "values": [
                                    {
                                        "id": "KP-1-performer"
                                    }
                                ]
                            },
                            {
                                "id": "organizer",
                                "values": [
                                    {
                                        "str": "Organizer Bell"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
            expect(result).toEqual(expectedResult);
        });

        it(`Extend property organizer`, async () => {

            const extendRequest: DataExtensionQueryDTO = {
                ids: ["KP-1-event"],
                properties: [
                    {id: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"},
                    {id: "name"},
                    {id: "organizer", settings: {content: ExtendPropertySettingsEnum.EXPAND}},
                ]
            }
            const result = await extendService.getDataExtension(extendRequest);

            const expectedResult = {
                "meta": [
                    {
                        "id": "type",
                        "name": "type"
                    },
                    {
                        "id": "name",
                        "name": "name"
                    },
                    {
                        "id": "organizer",
                        "name": "organizer"
                    }
                ],
                "rows": [
                    {
                        "id": "KP-1-event",
                        "properties": [
                            {
                                "id": "type",
                                "values": [
                                    {
                                        "id": "http://schema.org/Event"
                                    }
                                ]
                            },
                            {
                                "id": "name",
                                "values": [
                                    {
                                        "str": "Event Bell"
                                    }
                                ]
                            },
                            {
                                "id": "organizer",
                                "values": [
                                    {
                                        "id": "KP-1-organizer",
                                        "properties": [
                                            {
                                                "id": "name",
                                                "values": [
                                                    {
                                                        "str": "Organizer Bell"
                                                    }
                                                ]
                                            },
                                            {
                                                "id": "type",
                                                "values": [
                                                    {
                                                        "id": "http://schema.org/Organization"
                                                    }
                                                ]
                                            },
                                            {
                                                "id": "disambiguatingDescription",
                                                "values": [
                                                    {
                                                        "str": "Org description"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }]
            }
            expect(result).toEqual(expectedResult);
        });

        it(`Extend data with content id falls back to the literal of a literal only property`, async () => {

            const extendRequest: DataExtensionQueryDTO = {
                ids: ["KP-1-event"],
                properties: [
                    {id: "name", settings: {content: ExtendPropertySettingsEnum.ID}},
                ]
            }
            const result = await extendService.getDataExtension(extendRequest);

            expect(result).toEqual({
                "meta": [{"id": "name", "name": "name"}],
                "rows": [
                    {
                        "id": "KP-1-event",
                        "properties": [
                            {
                                "id": "name",
                                "values": [{"str": "Event Bell"}]
                            }
                        ]
                    }
                ]
            });
        });

        it(`Extend data with content literal returns the name of a linked entity and the value of a literal only property`, async () => {

            const extendRequest: DataExtensionQueryDTO = {
                ids: ["KP-1-event"],
                properties: [
                    {id: "name", settings: {content: ExtendPropertySettingsEnum.LITERAL}},
                    {id: "startDate", settings: {content: ExtendPropertySettingsEnum.LITERAL}},
                    {id: "location", settings: {content: ExtendPropertySettingsEnum.LITERAL}},
                ]
            }
            const result = await extendService.getDataExtension(extendRequest);

            expect(result).toEqual({
                "meta": [
                    {"id": "name", "name": "name"},
                    {"id": "startDate", "name": "startDate"},
                    {"id": "location", "name": "location"}
                ],
                "rows": [
                    {
                        "id": "KP-1-event",
                        "properties": [
                            {
                                "id": "name",
                                "values": [{"str": "Event Bell"}]
                            },
                            {
                                "id": "startDate",
                                "values": [{"str": "2018-01-01"}]
                            },
                            {
                                "id": "location",
                                "values": [{"str": "Place Bell"}]
                            }
                        ]
                    }
                ]
            });
        });

        it(`Extend data with content literal returns the name of a linked entity in every language`, async () => {

            const extendRequest: DataExtensionQueryDTO = {
                ids: ["KP-2-event"],
                properties: [
                    {id: "performer", settings: {content: ExtendPropertySettingsEnum.LITERAL}},
                ]
            }
            const result = await extendService.getDataExtension(extendRequest);

            expect(getValues(result, "performer").sort(byLang)).toEqual([
                {"str": "Performer Two", "lang": "en"},
                {"str": "Interprete Deux", "lang": "fr"}
            ]);
        });

        it(`Extend data with content literal returns no value when the linked entity has no name`, async () => {

            const extendRequest: DataExtensionQueryDTO = {
                ids: ["KP-2-event"],
                properties: [
                    {id: "name"},
                    {id: "organizer", settings: {content: ExtendPropertySettingsEnum.LITERAL}},
                ]
            }
            const result = await extendService.getDataExtension(extendRequest);

            // The property stays in the meta of the response even though it has no literal to return.
            expect(result).toEqual({
                "meta": [
                    {"id": "name", "name": "name"},
                    {"id": "organizer", "name": "organizer"}
                ],
                "rows": [
                    {
                        "id": "KP-2-event",
                        "properties": [
                            {
                                "id": "name",
                                "values": [{"str": "Event Two"}]
                            }
                        ]
                    }
                ]
            });
        });


        it(`Extend data with content expand falls back to the literal of a literal only property`, async () => {

            const extendRequest: DataExtensionQueryDTO = {
                ids: ["KP-1-event"],
                properties: [
                    {id: "name", settings: {content: ExtendPropertySettingsEnum.EXPAND}},
                ]
            }
            const result = await extendService.getDataExtension(extendRequest);

            expect(result).toEqual({
                "meta": [{"id": "name", "name": "name"}],
                "rows": [
                    {
                        "id": "KP-1-event",
                        "properties": [
                            {
                                "id": "name",
                                "values": [{"str": "Event Bell"}]
                            }
                        ]
                    }
                ]
            });
        });

        it(`Extend data without settings returns the URI of a linked entity`, async () => {

            const extendRequest: DataExtensionQueryDTO = {
                ids: ["KP-1-event"],
                properties: [
                    {id: "performer"},
                    {id: "location"},
                ]
            }
            const result = await extendService.getDataExtension(extendRequest);

            expect(getValues(result, "performer")).toEqual([{"id": "KP-1-performer"}]);
            expect(getValues(result, "location")).toEqual([{"id": "KP-1"}]);
        });

        it(`Extend data with settings returns the rows in the order of the requested ids`, async () => {

            const extendRequest: DataExtensionQueryDTO = {
                ids: ["KP-2-event", "KP-1-event"],
                properties: [
                    {id: "name"},
                    {id: "location", settings: {content: ExtendPropertySettingsEnum.LITERAL}},
                ]
            }
            const result = await extendService.getDataExtension(extendRequest);

            expect(result.rows).toEqual([
                {
                    "id": "KP-2-event",
                    "properties": [
                        {
                            "id": "name",
                            "values": [{"str": "Event Two"}]
                        },
                        {
                            "id": "location",
                            "values": [{"str": "Place Two"}]
                        }
                    ]
                },
                {
                    "id": "KP-1-event",
                    "properties": [
                        {
                            "id": "name",
                            "values": [{"str": "Event Bell"}]
                        },
                        {
                            "id": "location",
                            "values": [{"str": "Place Bell"}]
                        }
                    ]
                }
            ]);
        });

    })
})