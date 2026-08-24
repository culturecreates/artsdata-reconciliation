import {EntityClassEnum} from "../../enum";
import {dropGraph, setupExtendService, uploadDataSet} from "../../../test/util/common-util";
import {ExtendService} from "./extend.service";
import {BadRequestException} from "@nestjs/common";

describe('Test Extend by graph URI', () => {

    let extendService: ExtendService;

    const externalGraphData = 'test/fixtures/files/extend-service-external-source-graph.ttl';
    const coreGraphData = 'test/fixtures/files/extend-service-core-graph.ttl';
    const ontologyGraphData = 'test/fixtures/files/extend-service-ontology.ttl';
    const maintenanceGraphData = 'test/fixtures/files/extend-service-maintenance-graph.ttl';

    const externalGraphURI: string = 'http://test.fixtures/external-graph';
    const coreGraphURI: string = 'http://kg.artsdata.ca/core';
    const ontologyGraphURI: string = 'http://test.fixtures/ontology-graph';
    const maintenanceGraphURI: string = 'http://kg.artsdata.ca/maintenance';

    beforeAll(async () => {
        const setup = await setupExtendService();
        extendService = setup.extendService;

        //Upload external graph and core graph
        await uploadDataSet(externalGraphURI, externalGraphData)
        await uploadDataSet(coreGraphURI, coreGraphData)
        await uploadDataSet(ontologyGraphURI, ontologyGraphData)
        await uploadDataSet(maintenanceGraphURI, maintenanceGraphData)

    });

    afterAll(async () => {
        await dropGraph(externalGraphURI);
        await dropGraph(coreGraphURI);
        await dropGraph(ontologyGraphURI);
        await dropGraph(maintenanceGraphURI);
    })

    it('Should return all people from the external graph ', async () => {

        const results = await extendService
            .getExtendDataFromGraph(externalGraphURI, EntityClassEnum.PERSON, [], "", 1, 100);

        const expectedResult = [
            {
                "uri": "http://external-source.com/resource/Person1",
                "artsdata_uri": "http://kg.artsdata.ca/resource/K21",
                "url": "http://person-one.com",
                "name": "Person one - reconciled",
                "isni_uri": "https://isni.org/isni/00000000000000000021",
                "wikidata_uri": "http://www.wikidata.org/entity/Q21",
                "type": "http://schema.org/Person",
                "reconciled": true,
                "is_flagged_for_review": true
            },
            {
                "uri": "http://external-source.com/resource/Person2",
                "name": "Person two - reconciled",
                "artsdata_uri": "http://kg.artsdata.ca/resource/K22",
                "wikidata_uri": "http://www.wikidata.org/entity/Q22",
                "type": "http://schema.org/Person",
                "reconciled": true
            }
        ]
        expect(results).toHaveLength(2);

        const sortByUri = (a: any, b: any) => a.uri.localeCompare(b.uri);
        expect(results.sort(sortByUri)).toEqual(expectedResult.sort(sortByUri));
    });

    it('Should return people from the external graph with filter by a URI', async () => {

        const results = await extendService
            .getExtendDataFromGraph(externalGraphURI, EntityClassEnum.PERSON,
                ["http://external-source.com/resource/Person1"], "", 1, 100);

        const expectedResult = [
            {
                "uri": "http://external-source.com/resource/Person1",
                "artsdata_uri": "http://kg.artsdata.ca/resource/K21",
                "url": "http://person-one.com",
                "name": "Person one - reconciled",
                "isni_uri": "https://isni.org/isni/00000000000000000021",
                "wikidata_uri": "http://www.wikidata.org/entity/Q21",
                "type": "http://schema.org/Person",
                "reconciled": true,
                "is_flagged_for_review": true
            }
        ]
        expect(results).toHaveLength(1);

        const sortByUri = (a: any, b: any) => a.uri.localeCompare(b.uri);
        expect(results.sort(sortByUri)).toEqual(expectedResult.sort(sortByUri));
    });

    it('Should return people from the external graph with filter by URI that do not exist', async () => {

        const results = await extendService
            .getExtendDataFromGraph(externalGraphURI, EntityClassEnum.PERSON,
                ["http://external-source.com/resource/entity-not-exist"], "", 1, 100);

        expect(results).toHaveLength(0);
    });

    it('Should return people from the external graph with filter by URI that is invalid', async () => {

        await expect(extendService
            .getExtendDataFromGraph(externalGraphURI, EntityClassEnum.PERSON,
                ["Invalid URI"], "", 1, 100))
            .rejects.toThrow(BadRequestException);
    });

    it('Should return all organizations from the external graph ', async () => {


        const results = await extendService
            .getExtendDataFromGraph(externalGraphURI, EntityClassEnum.ORGANIZATION, [], "", 1, 100);

        const expectedResult = [
            {
                "uri": "http://external-source.com/resource/Organization1",
                "url": "http://orgnaization-one.com",
                "name": "Organization one - reconciled",
                "isni_uri": "https://isni.org/isni/00000000000000000011",
                "artsdata_uri": "http://kg.artsdata.ca/resource/K11",
                "wikidata_uri": "http://www.wikidata.org/entity/Q11",
                "type": "http://schema.org/Organization",
                "reconciled": true,
                "is_flagged_for_review": true,
            },
            {
                "uri": "http://external-source.com/resource/Organization2",
                "url": "http://orgnaization-two.com",
                "name": "Organization two - non-reconciled",
                "type": "http://schema.org/Organization"
            }
        ]
        const sortByUri = (a: any, b: any) => a.uri.localeCompare(b.uri);
        expect(results.sort(sortByUri)).toEqual(expectedResult.sort(sortByUri));
    });

    it('Should return all agents from the external graph ', async () => {


        const results = await extendService
            .getExtendDataFromGraph(externalGraphURI, EntityClassEnum.AGENT, [], "", 1, 100);

        const expectedResult = [
            {
                "uri": "http://external-source.com/resource/Organization1",
                "url": "http://orgnaization-one.com",
                "name": "Organization one - reconciled",
                "isni_uri": "https://isni.org/isni/00000000000000000011",
                "artsdata_uri": "http://kg.artsdata.ca/resource/K11",
                "wikidata_uri": "http://www.wikidata.org/entity/Q11",
                "type": "http://schema.org/Organization",
                "reconciled": true,
                "is_flagged_for_review": true
            },
            {
                "uri": "http://external-source.com/resource/Organization2",
                "url": "http://orgnaization-two.com",
                "name": "Organization two - non-reconciled",
                "type": "http://schema.org/Organization"
            },
            {
                "uri": "http://external-source.com/resource/Person1",
                "artsdata_uri": "http://kg.artsdata.ca/resource/K21",
                "url": "http://person-one.com",
                "name": "Person one - reconciled",
                "isni_uri": "https://isni.org/isni/00000000000000000021",
                "wikidata_uri": "http://www.wikidata.org/entity/Q21",
                "type": "http://schema.org/Person",
                "reconciled": true,
                "is_flagged_for_review": true
            },
            {
                "uri": "http://external-source.com/resource/Person2",
                "name": "Person two - reconciled",
                "artsdata_uri": "http://kg.artsdata.ca/resource/K22",
                "wikidata_uri": "http://www.wikidata.org/entity/Q22",
                "type": "http://schema.org/Person",
                "reconciled": true
            }
        ]

        const sortByUri = (a: any, b: any) => a.uri.localeCompare(b.uri);
        expect(results.sort(sortByUri)).toEqual(expectedResult.sort(sortByUri));

    });

});
