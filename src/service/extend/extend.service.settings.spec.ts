import {ExtendService} from './extend.service';
import {DataExtensionQueryDTO} from "../../dto/extend";
import {dropGraph, setupExtendService, uploadDataSet} from "../../../test/util/common-util";
import {ExtendPropertySettingsEnum} from "../../enum";

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

    })
})

