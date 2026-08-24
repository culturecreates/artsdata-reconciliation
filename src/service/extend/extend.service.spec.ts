import {Test, TestingModule} from '@nestjs/testing';
import {ExtendService} from './extend.service';
import {ArtsdataService} from '../artsdata';
import {EntityClassEnum} from '../../enum/entity-class.enum';

describe('ExtendService', () => {
    let extendService: ExtendService;
    let artsdataService: { executeSparqlQuery: jest.Mock };

    beforeEach(async () => {
        jest.clearAllMocks();

        artsdataService = {
            executeSparqlQuery: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ExtendService,
                {provide: ArtsdataService, useValue: artsdataService},
            ],
        }).compile();

        extendService = module.get<ExtendService>(ExtendService);
    });

    describe('getExtendDataFromGraph', () => {
        it(`reconciled is set to 'true' if the entity is linked to internal entity(core graph)`, async () => {
            artsdataService.executeSparqlQuery.mockResolvedValueOnce({
                "results": {
                    "bindings": [
                        {
                            "uri": {
                                "type": "uri",
                                "value": "http://www.wikidata.org/entity/123"
                            },
                            "name": {
                                "xml:lang": "en",
                                "type": "literal",
                                "value": "Entity Name"
                            },
                            "artsdata_uri": {
                                "type": "uri",
                                "value": "http://kg.artsdata.ca/resource/KX-XXX"
                            },
                            "type": {
                                "type": "literal",
                                "value": "http://schema.org/Person"
                            },
                            "reconciled": {
                                "type": "literal",
                                "value": true
                            }
                        }]
                }
            });

            const result = await extendService.getExtendDataFromGraph(
                'https://kg.artsdata.ca/culture-creates/graph', EntityClassEnum.PERSON, [], "");

            expect(result).toEqual([
                {
                    name: 'Entity Name',
                    uri: 'http://www.wikidata.org/entity/123',
                    artsdata_uri: 'http://kg.artsdata.ca/resource/KX-XXX',
                    reconciled: true,
                    type: 'http://schema.org/Person',
                }
            ]);
            expect(artsdataService.executeSparqlQuery).toHaveBeenCalledWith(expect.any(String), true);
        });

        it('reconciled is set to \'false\' if the entity is not linked to internal entity(core graph)', async () => {
            artsdataService.executeSparqlQuery.mockResolvedValueOnce({
                "results": {
                    "bindings": [
                        {
                            "uri": {
                                "type": "uri",
                                "value": "http://www.wikidata.org/entity/123"
                            },
                            "name": {
                                "xml:lang": "en",
                                "type": "literal",
                                "value": "Entity Name"
                            },
                            "artsdata_uri": {
                                "type": "uri",
                                "value": "http://kg.artsdata.ca/resource/KX-XXX"
                            },
                            "type": {
                                "type": "literal",
                                "value": "http://schema.org/Person"
                            },
                            "reconciled": {
                                "type": "literal",
                                "value": false
                            }
                        }]
                }
            });

            const result = await extendService.getExtendDataFromGraph(
                'https://kg.artsdata.ca/culture-creates/graph', EntityClassEnum.PERSON, [], "");

            expect(result).toEqual([
                {
                    name: 'Entity Name',
                    uri: 'http://www.wikidata.org/entity/123',
                    artsdata_uri: "http://kg.artsdata.ca/resource/KX-XXX",
                    reconciled: false,
                    type: 'http://schema.org/Person',
                },
            ]);
        });

        it('return wikidata id is the entity URI itself is wikidata URI', async () => {
            artsdataService.executeSparqlQuery.mockResolvedValueOnce({
                "results": {
                    "bindings": [
                        {
                            "uri": {
                                "type": "uri",
                                "value": "http://www.wikidata.org/entity/123"
                            },
                            "name": {
                                "xml:lang": "en",
                                "type": "literal",
                                "value": "Entity Name"
                            },
                            "wikidata_uri": {
                                "type": "uri",
                                "value": "http://www.wikidata.org/entity/123"
                            },
                            "type": {
                                "type": "literal",
                                "value": "http://schema.org/Person"
                            }
                        }]
                }
            });

            const result = await extendService.getExtendDataFromGraph(
                'https://kg.artsdata.ca/culture-creates/graph', EntityClassEnum.PERSON, [], "");

            expect(result).toEqual([
                {
                    name: 'Entity Name',
                    uri: 'http://www.wikidata.org/entity/123',
                    wikidata_uri: 'http://www.wikidata.org/entity/123',
                    type: 'http://schema.org/Person'
                },
            ]);
        });
    });
});

