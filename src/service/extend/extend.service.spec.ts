import {ExtendService} from './extend.service';
import {DataExtensionQueryDTO} from "../../dto/extend";
import {dropGraph, setupExtendService, uploadDataSet} from "../../../test/util/common-util";

describe('ExtendService', () => {
    let extendService: ExtendService;

    const maintenanceGraphData = 'test/fixtures/files/extend-service.ttl';
    const externalGraphURI: string = 'http://test.fixtures/extend-test-graph';

    beforeAll(async () => {
        const setup = await setupExtendService();
        extendService = setup.extendService;
        await uploadDataSet(externalGraphURI, maintenanceGraphData)
    });

    afterAll(async () => {
        await dropGraph(externalGraphURI);
    })

    describe('Test Extend data Service', () => {

        it(`Extend data for an Event `, async () => {

            const extendRequest: DataExtensionQueryDTO = {
                ids: ["Event1"],
                properties: [
                    {id: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"},
                    {id: "name"},
                    {id: "startDate"}
                ]
            }
            const result = await extendService.getDataExtension(extendRequest);

            const expectedResult ={
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
                    }
                ],
                "rows": [
                    {
                        "id": "Event1",
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
                                        "str": "Event One"}
                                ]
                            },
                            {
                                "id": "startDate",
                                "values": [
                                    {
                                        "str": "2020-01-01"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
            expect(result).toEqual(expectedResult);
        });

        it(`Should return extend data for an Place request`, async () => {

            const extendRequest: DataExtensionQueryDTO = {
                ids: ["Place1"],
                properties: [
                    {id: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"},
                    {id: "sameAs"}
                ]
            }
            const result = await extendService.getDataExtension(extendRequest);

            const expectedResult = [
                {
                    "id": "Place1",
                    "properties": [
                        {
                            "id": "type",
                            "values": [
                                {
                                    "id": "http://schema.org/Place"
                                }
                            ]
                        },
                        {
                            "id": "sameAs",
                            "values": [
                                {
                                    "str": "http://www.place-one.com"
                                }
                            ]
                        }
                    ]
                }
            ]
            expect(result.rows).toEqual(expectedResult);
        });

        it(`Extend data for an Organization`, async () => {

            const extendRequest: DataExtensionQueryDTO = {
                ids: ["Organization1"],
                properties: [
                    {id: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"},
                    {id: "name"},
                    {id: "url"}
                ]
            }
            const result = await extendService.getDataExtension(extendRequest);

            const expectedResult = [
                {
                    "id": "Organization1",
                    "properties": [
                        {
                            "id": "type",
                            "values": [
                                {
                                    "id": "http://schema.org/Organization"
                                }
                            ]
                        },
                        {
                            "id": "name",
                            "values": [
                                {
                                    "str": "Organization One"
                                }
                            ]
                        },
                        {
                            "id": "url",
                            "values": [
                                {
                                    "str": "http://www.organization-one.com"
                                }
                            ]
                        }
                    ]
                }
            ]
            expect(result.rows).toEqual(expectedResult);
        });

    })
})

