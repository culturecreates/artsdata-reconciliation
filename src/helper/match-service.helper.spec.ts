import {MatchServiceHelper} from './match-service.helper';
import {ReconciliationQuery} from '../dto';
import {Entities} from '../constant';

describe('isAutoMatch', () => {
    it('returns true when names are very close and postal codes match exactly', () => {
        const recordFetched = {name: 'Place Bell'};
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [
                {matchType: "name", propertyValue: "Place Beell"},
                {
                    propertyId: "<http://schema.org/postalCode>",
                    propertyValue: "H7N 0E4",
                    matchType: "property",
                },
            ],
        };
        const additionalProperties = {postalCode: 'H7N 0E4'};

        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);

        expect(result).toBe(true);
    });

    it('returns false when names are not similar and postal codes do not match', () => {
        const recordFetched = {name: 'Different Name'};
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [
                {matchType: "name", propertyValue: "Place Bbell"},
                {
                    propertyId: "<http://schema.org/postalCode>",
                    propertyValue: "H7N 0E4",
                    matchType: "property",
                },
            ],
        };
        const additionalProperties = {postalCode: 'H7N 055'};

        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);

        expect(result).toBe(false);
    });

    it('returns true when names, address Locality are close match and postal codes is exact', () => {
        const recordFetched = {name: 'Place Bell'};
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [
                {matchType: "name", propertyValue: "Place Bell"},
                {
                    propertyId: "<http://schema.org/postalCode>",
                    propertyValue: "H7N 0E4",
                    matchType: "property",
                },{
                    propertyId: "<http://schema.org/address>/<http://schema.org/addressLocality>",
                    propertyValue: "Lavel",
                    matchType: "property",
                },
            ],
        };
        const additionalProperties = {postalCode: 'H7N 0E4', addressLocality: 'Laval'};

        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);

        expect(result).toBe(true);
    });

    it('returns false when names and address locality are close match and postal codes is different', () => {
        const recordFetched = {name: 'Place Bell'};
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [
                {matchType: "name", propertyValue: "Place Bell"},
                {
                    propertyId: "<http://schema.org/address>/<http://schema.org/addressLocality>",
                    propertyValue: "Laval",
                    matchType: "property",
                },{
                    propertyId: "<http://schema.org/postalCode>",
                    propertyValue: "H7N 0E5",
                    matchType: "property",
                }
            ],
        };
        const additionalProperties = {postalCode: 'H7N 0E4', addressLocality: 'Laval'};

        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);

        expect(result).toBe(false);
    });
    it('returns true when names and address locality are close match but postal codes exists only in source', () => {
        const recordFetched = {name: 'Place Bell'};
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [
                {matchType: "name", propertyValue: "Place Bell"},
                {
                    propertyId: "<http://schema.org/address>/<http://schema.org/addressLocality>",
                    propertyValue: "Laval",
                    matchType: "property",
                },{
                    propertyId: "<http://schema.org/postalCode>",
                    propertyValue: "H7N 0E5",
                    matchType: "property",
                }
            ],
        };
        const additionalProperties = { addressLocality: 'Laval'};

        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);

        expect(result).toBe(true);
    });
    it('returns true when names amd address locality are close match but postal codes exists only in query', () => {
        const recordFetched = {name: 'Place Bell'};
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [
                {matchType: "name", propertyValue: "Place Bell"},
                {
                    propertyId: "<http://schema.org/address>/<http://schema.org/addressLocality>",
                    propertyValue: "Laval",
                    matchType: "property",
                }
            ],
        };
        const additionalProperties = {postalCode: 'H7N 0E4', addressLocality: 'Laval'};

        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);

        expect(result).toBe(true);
    });

    it('returns true when names and address Locality are close match but postal codes exists neither in query nor source', () => {
        const recordFetched = {name: 'Place Bell'};
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [
                {matchType: "name", propertyValue: "Place Bell"},
                {
                    propertyId: "<http://schema.org/address>/<http://schema.org/addressLocality>",
                    propertyValue: "Laval",
                    matchType: "property",
                }
            ],
        };
        const additionalProperties = {postalCode: 'H7N 0E4', addressLocality: 'Laval'};

        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);

        expect(result).toBe(true);
    });
    it('returns true when names, adddress Locality are close match and postal code not exist in both query and source', () => {
        const recordFetched = {name: 'Place Bell'};
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [
                {matchType: "name", propertyValue: "Place Bell"},
                {
                    propertyId: "<http://schema.org/address>/<http://schema.org/addressLocality>",
                    propertyValue: "Laval",
                    matchType: "property",
                }
            ],
        };
        const additionalProperties = {addressLocality: 'Laval'};

        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);

        expect(result).toBe(true);
    });

    it('returns true when names are close and URLs match exactly for a PLACE entity and postal code do not exist in both', () => {
        const recordFetched = {name: 'Place Bell'};
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [
                {matchType: "name", propertyValue: "Place bbell"},
                {
                    propertyId: "<http://schema.org/url>",
                    propertyValue: "http://www.placebell.ca/fr",
                    matchType: "property",
                },
            ],
        };
        const additionalProperties = {url: "http://www.placebell.ca/fr"};

        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);

        expect(result).toBe(true);
    });

    it('returns true when names are close match and URLs match exactly for a PLACE entity', () => {
        const recordFetched = {name: 'Place Bell'};
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [
                {matchType: "name", propertyValue: "Place bbell"},
                {
                    propertyId: "<http://schema.org/url>",
                    propertyValue: "http://www.placebell.ca/fr",
                    matchType: "property",
                },
            ],
        };
        const additionalProperties = {url: 'http://www.placebell.ca/fr'};

        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);

        expect(result).toBe(true);
    });

    it('returns false when URLs do not match for a PLACE entity', () => {
        const recordFetched = {name: 'Place Bell'};
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [
                {matchType: "name", propertyValue: "place bell"},
                {
                    propertyId: "<http://schema.org/url>",
                    propertyValue: "http://www.placebell.ca/fr",
                    matchType: "property",
                },
            ],
        };
        const additionalProperties = {url: 'http://www.placebell.ca/wrong-url'};

        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);

        expect(result).toBe(false);
    });

    it('returns true when ISNI and Wikidata IDs match exactly', () => {
        const recordFetched = {name: 'Place Bell'};
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.PLACE,
            conditions: [
                {
                    propertyId: "<http://schema.org/sameAs>",
                    propertyValue: "https://isni.org/isni/0000000123456789",
                    matchType: "property",
                },
                {
                    propertyId: "<http://schema.org/sameAs>",
                    propertyValue: "http://www.wikidata.org/entity/Q12345",
                    matchType: "property",
                },
            ],
        };
        const additionalProperties = {
            isni: 'https://isni.org/isni/0000000123456789',
            wikidata: 'http://www.wikidata.org/entity/Q12345'
        };

        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);

        expect(result).toBe(true);
    });

    it('returns false when names are very close and start dates match exactly but not location uri matching' +
        ' for an EVENT entity', () => {
        const recordFetched = {name: 'Eros Ramazzotti'};
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {matchType: "name", propertyValue: "eros ramazzotti"},
                {
                    propertyId: "<http://schema.org/startDate>",
                    propertyValue: "2023-01-01",
                    matchType: "property",
                },
            ],
        };
        const additionalProperties = {startDate: '2023-01-01'};

        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);

        expect(result).toBe(false);
    });

    it('returns false when names are very close but start dates do not match for an EVENT entity', () => {
        const recordFetched = {name: 'Eros Ramazzotti'};
        const reconciliationQuery: ReconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {matchType: "name", propertyValue: "eros ramazzotti"},
                {
                    propertyId: "<http://schema.org/startDate>",
                    propertyValue: "2023-01-01",
                    matchType: "property",
                },
            ],
        };
        const additionalProperties = {startDate: '2023-02-01'};

        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);

        expect(result).toBe(false);
    });

    it('returns true when names, start date, end date, and locationUri all match for EVENT entity', () => {
        const recordFetched = {name: 'Eros Ramazzotti'};
        const reconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {matchType: 'name', propertyValue: 'Eros Ramazzotti'},
                {propertyId: '<http://schema.org/startDate>', propertyValue: '2023-01-01', matchType: 'property'},
                {propertyId: '<http://schema.org/endDate>', propertyValue: '2023-01-02', matchType: 'property'},
                {
                    propertyId: '<http://schema.org/location>',
                    propertyValue: 'http://kg.artsdata.ca/resource/K11-240',
                    matchType: 'property'
                },
            ],
        };
        const additionalProperties = {
            startDate: '2023-01-01',
            endDate: '2023-01-02',
            locationUri: 'http://kg.artsdata.ca/resource/K11-240',
        };
        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);
        expect(result).toBe(true);
    });

    it('returns false when names match but locationUri does not for EVENT entity', () => {
        const recordFetched = {name: 'Eros Ramazzotti'};
        const reconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {matchType: 'name', propertyValue: 'Eros Ramazzotti'},
                {
                    propertyId: '<http://schema.org/location>',
                    propertyValue: 'http://kg.artsdata.ca/resource/K11-240',
                    matchType: 'property'
                },
            ],
        };
        const additionalProperties = {locationUri: 'http://kg.artsdata.ca/resource/K22-240'};
        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);
        expect(result).toBe(false);
    });

    it('returns true when names, start date, end date, locationName, and postalCode all match for EVENT entity', () => {
        const recordFetched = {name: 'Eros Ramazzotti'};
        const reconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {matchType: 'name', propertyValue: 'Eros Ramazzotti'},
                {propertyId: 'startDate', propertyValue: '2023-01-01', matchType: 'property'},
                {propertyId: 'endDate', propertyValue: '2023-01-02', matchType: 'property'},
                {
                    propertyId: '<http://schema.org/location>/<http://schema.org/name>',
                    propertyValue: 'Place Bell',
                    matchType: 'property'
                },
                {propertyId: 'postalCode', propertyValue: 'H7N 0E4', matchType: 'property'},
            ],
        };
        const additionalProperties = {
            startDate: '2023-01-01',
            endDate: '2023-01-02',
            locationName: 'Place Bell',
            postalCode: 'H7N 0E4',
        };
        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);
        expect(result).toBe(true);
    });

    it('returns false when names, start date, end date match but postalCode does not for EVENT entity', () => {
        const recordFetched = {name: 'Eros Ramazzotti'};
        const reconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {matchType: 'name', propertyValue: 'Eros Ramazzotti'},
                {propertyId: '<http://schema.org/startDate>', propertyValue: '2023-01-01', matchType: 'property'},
                {propertyId: '<http://schema.org/endDate>', propertyValue: '2023-01-02', matchType: 'property'},
                {propertyId: '<http://schema.org/postalCode>', propertyValue: 'H7N 0E4', matchType: 'property'},
            ],
        };
        const additionalProperties = {
            startDate: '2023-01-01',
            endDate: '2023-01-02',
            postalCode: '77N 0E4',
        };
        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);
        expect(result).toBe(false);
    });

    it('returns true when names, start date match and endDate is empty for EVENT entity', () => {
        const recordFetched = {name: 'Eros Ramazzotti'};
        const reconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {matchType: 'name', propertyValue: 'Eros Ramazzotti'},
                {propertyId: '<http://schema.org/startDate>', propertyValue: '2023-01-01', matchType: 'property'},
                {
                    propertyId: '<http://schema.org/location>',
                    propertyValue: 'http://kg.artsdata.ca/resource/K11-240',
                    matchType: 'property'
                }
            ],
        };
        const additionalProperties = {
            startDate: '2023-01-01',
            locationUri: 'http://kg.artsdata.ca/resource/K11-240'
        };
        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);
        expect(result).toBe(true);
    });

    it('returns true when startDate and endDate are dateTime strings and match for EVENT entity', () => {
        const recordFetched = {name: 'Eros Ramazzotti'};
        const reconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {matchType: 'name', propertyValue: 'Eros Ramazzotti'},
                {
                    propertyId: '<http://schema.org/startDate>',
                    propertyValue: '2023-01-01T10:00:00Z',
                    matchType: 'property'
                },
                {
                    propertyId: '<http://schema.org/endDate>',
                    propertyValue: '2023-01-02T18:00:00Z',
                    matchType: 'property'
                },
                {
                    propertyId: '<http://schema.org/location>',
                    propertyValue: 'http://kg.artsdata.ca/resource/K11-240',
                    matchType: 'property'
                }
            ],
        };
        const additionalProperties = {
            startDate: '2023-01-01T10:00:00Z',
            endDate: '2023-01-02T18:00:00Z',
            locationUri: 'http://kg.artsdata.ca/resource/K11-240'
        };
        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);
        expect(result).toBe(true);
    });

    it('returns false when startDate matches but no endDate in query and empty in additionalProperties for EVENT entity', () => {
        const recordFetched = {name: 'Eros Ramazzotti'};
        const reconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {matchType: 'name', propertyValue: 'Eros Ramazzotti'},
                {propertyId: '<http://schema.org/startDate>', propertyValue: '2023-01-01', matchType: 'property'}
            ],
        };
        const additionalProperties = {
            startDate: '2023-01-01',
            endDate: '2023-01-02',
        };
        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);
        expect(result).toBe(false);
    });

    it('returns true when startDate and endDate are dateTime strings and name, startDate and location matches for EVENT entity', () => {
        const recordFetched = {name: 'Eros Ramazzotti'};
        const reconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {matchType: 'name', propertyValue: 'Eros Ramazzotti'},
                {
                    propertyId: '<http://schema.org/startDate>',
                    propertyValue: '2023-01-01T10:00:00Z',
                    matchType: 'property'
                },
                {
                    propertyId: '<http://schema.org/location>',
                    propertyValue: 'http://kg.artsdata.ca/resource/K11-240',
                    matchType: 'property'
                }
            ],
        };
        const additionalProperties = {
            startDate: '2023-01-01T10:00:00Z',
            locationUri:'http://kg.artsdata.ca/resource/K11-240'
        };
        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);
        expect(result).toBe(true);
    });

    it('returns true ', () => {
        const recordFetched = {name: 'Eros Ramazzotti'};
        const reconciliationQuery = {
            type: Entities.EVENT,
            conditions: [
                {matchType: 'name', propertyValue: 'Eros Ramazzotti'},
                {
                    propertyId: '<http://schema.org/startDate>',
                    propertyValue: '2023-01-01T10:00:00Z',
                    matchType: 'property'
                },
                {
                    propertyId: '<http://schema.org/location>',
                    propertyValue: 'http://kg.artsdata.ca/resource/K11-240',
                    matchType: 'property'
                }
            ],
        };
        const additionalProperties = {
            startDate: '2023-01-01T10:00:00Z',
            locationUri:'http://kg.artsdata.ca/resource/K11-240'
        };
        const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);
        expect(result).toBe(true);
    });
});

