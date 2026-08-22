import {EntityClassEnum} from "../../enum";
import {dropGraph, setupExtendService, uploadDataSet} from "../../../test/util/common-util";
import {ExtendService} from "./extend.service";

describe('Test Extend by graph URI', () => {

    let extendService: ExtendService;

    const externalGraphData = 'test/fixtures/files/extend-service-external-source-graph.ttl';
    const coreGraphData = 'test/fixtures/files/extend-service-core-graph.ttl';
    const ontologyGraphData = 'test/fixtures/files/extend-service-ontology.ttl';

    const externalGraphURI: string = 'http://test.fixtures/external-graph';
    const coreGraphURI: string = 'http://kg.artsdata.ca/core';
    const ontologyGraphURI: string = 'http://test.fixtures/ontology-graph';

    beforeAll(async () => {
        const setup = await setupExtendService();
        extendService = setup.extendService;

        //Upload external graph and core graph
        await uploadDataSet(externalGraphURI, externalGraphData)
        await uploadDataSet(coreGraphURI, coreGraphData)
        await uploadDataSet(ontologyGraphURI, ontologyGraphData)

    });

    afterAll(async () => {
        await dropGraph(externalGraphURI);
        await dropGraph(coreGraphURI);
        await dropGraph(ontologyGraphURI);
    })

    it('Should return all people from the external graph ', async () => {

        const results = await extendService
            .getExtendDataFromGraph(externalGraphURI, EntityClassEnum.PERSON, "", 1, 100);

        const expectedResult = [
            {
                "uri": "http://external-source.com/resource/Person1",
                "url": "http://person-one.com",
                "name": "Person one - reconciled",
                "isni_uri": "https://isni.org/isni/00000000000000000021",
                "wikidata_uri": "http://www.wikidata.org/entity/Q21",
                "type": "http://schema.org/Person",
                "reconciled": true
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

        const sortByUri = (a:any, b:any) => a.uri.localeCompare(b.uri);
        expect(results.sort(sortByUri)).toEqual(expectedResult.sort(sortByUri));
    });

    it('Should return all organizations from the external graph ', async () => {


        const results = await extendService
            .getExtendDataFromGraph(externalGraphURI, EntityClassEnum.ORGANIZATION, "", 1, 100);

        const expectedResult = [
            {
                "uri": "http://external-source.com/resource/Organization1",
                "url": "http://orgnaization-one.com",
                "name": "Organization one - reconciled",
                "isni_uri": "https://isni.org/isni/00000000000000000011",
                "artsdata_uri": "http://kg.artsdata.ca/resource/K11",
                "wikidata_uri": "http://www.wikidata.org/entity/Q11",
                "type": "http://schema.org/Organization",
                "reconciled": true
            },
            {
                "uri": "http://external-source.com/resource/Organization2",
                "url": "http://orgnaization-two.com",
                "name": "Organization two - non-reconciled",
                "type": "http://schema.org/Organization"
            }
        ]
        const sortByUri = (a:any, b:any) => a.uri.localeCompare(b.uri);
        expect(results.sort(sortByUri)).toEqual(expectedResult.sort(sortByUri));
    });

    it('Should return all agents from the external graph ', async () => {


        const results = await extendService
            .getExtendDataFromGraph(externalGraphURI, EntityClassEnum.AGENT, "", 1, 100);

        const expectedResult =[
            {
                "uri": "http://external-source.com/resource/Organization1",
                "url": "http://orgnaization-one.com",
                "name": "Organization one - reconciled",
                "isni_uri": "https://isni.org/isni/00000000000000000011",
                "artsdata_uri": "http://kg.artsdata.ca/resource/K11",
                "wikidata_uri": "http://www.wikidata.org/entity/Q11",
                "type": "http://schema.org/Organization",
                "reconciled": true
            },
            {
                "uri": "http://external-source.com/resource/Organization2",
                "url": "http://orgnaization-two.com",
                "name": "Organization two - non-reconciled",
                "type": "http://schema.org/Organization"
            },
            {
                "uri": "http://external-source.com/resource/Person1",
                "url": "http://person-one.com",
                "name": "Person one - reconciled",
                "isni_uri": "https://isni.org/isni/00000000000000000021",
                "wikidata_uri": "http://www.wikidata.org/entity/Q21",
                "type": "http://schema.org/Person",
                "reconciled": true
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

        const sortByUri = (a:any, b:any) => a.uri.localeCompare(b.uri);
        expect(results.sort(sortByUri)).toEqual(expectedResult.sort(sortByUri));

    });

});
