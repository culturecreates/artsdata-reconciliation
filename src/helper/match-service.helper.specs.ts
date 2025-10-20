import { MatchServiceHelper } from './match-service.helper';
import { ReconciliationQuery } from '../dto';
import { Entities } from '../constant';

describe('isAutoMatch', () => {
  it('returns true when names are very close and postal codes match exactly', () => {
    const recordFetched = { name: 'Example Name' };
    const reconciliationQuery: ReconciliationQuery = {
      type: Entities.PLACE,
      conditions: [
        { matchType: "name", propertyValue: "example name" },
        {
          propertyId: "postalCode",
          propertyValue: "12345",
          matchType: "property",
        },
      ],
    };
    const additionalProperties = { postalCode: '12345' };

    const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);

    expect(result).toBe(true);
  });

  it('returns false when names are not similar and postal codes do not match', () => {
    const recordFetched = { name: 'Different Name' };
    const reconciliationQuery: ReconciliationQuery = {
      type: Entities.PLACE,
      conditions: [
        { matchType: "name", propertyValue: "example name" },
        {
          propertyId: "postalCode",
          propertyValue: "12345",
          matchType: "property",
        },
      ],
    };
    const additionalProperties = { postalCode: '54321' };

    const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);

    expect(result).toBe(false);
  });

  it('returns true when names are close and URLs match exactly for a PLACE entity', () => {
    const recordFetched = { name: 'Example Name' };
    const reconciliationQuery: ReconciliationQuery = {
      type: Entities.PLACE,
      conditions: [
        { matchType: "name", propertyValue: "example name" },
        {
          propertyId: "url",
          propertyValue: "http://example.com",
          matchType: "property",
        },
      ],
    };
    const additionalProperties = { url: 'http://example.com' };

    const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);

    expect(result).toBe(true);
  });

  it('returns false when URLs do not match for a PLACE entity', () => {
    const recordFetched = { name: 'Example Name' };
    const reconciliationQuery: ReconciliationQuery = {
      type: Entities.PLACE,
      conditions: [
        { matchType: "name", propertyValue: "example name" },
        {
          propertyId: "url",
          propertyValue: "http://example.com",
          matchType: "property",
        },
      ],
    };
    const additionalProperties = { url: 'http://different.com' };

    const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);

    expect(result).toBe(false);
  });

  it('returns true when ISNI and Wikidata IDs match exactly', () => {
    const recordFetched = { name: 'Example Name' };
    const reconciliationQuery: ReconciliationQuery = {
      type: Entities.PLACE,
      conditions: [
        {
          propertyId: "sameAs",
          propertyValue: "https://isni.org/isni/0000000123456789",
          matchType: "property",
        },
        {
          propertyId: "sameAs",
          propertyValue: "http://www.wikidata.org/entity/Q12345",
          matchType: "property",
        },
      ],
    };
    const additionalProperties = { isni: 'https://isni.org/isni/0000000123456789', wikidata: 'http://www.wikidata.org/entity/Q12345' };

    const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);

    expect(result).toBe(true);
  });

  it('returns true when names are very close and start dates match exactly for an EVENT entity', () => {
    const recordFetched = { name: 'Event Name' };
    const reconciliationQuery: ReconciliationQuery = {
      type: Entities.EVENT,
      conditions: [
        { matchType: "name", propertyValue: "event name" },
        {
          propertyId: "startDate",
          propertyValue: "2023-01-01",
          matchType: "property",
        },
      ],
    };
    const additionalProperties = { startDate: '2023-01-01' };

    const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);

    expect(result).toBe(true);
  });

  it('returns false when names are very close but start dates do not match for an EVENT entity', () => {
    const recordFetched = { name: 'Event Name' };
    const reconciliationQuery: ReconciliationQuery = {
      type: Entities.EVENT,
      conditions: [
        { matchType: "name", propertyValue: "event name" },
        {
          propertyId: "startDate",
          propertyValue: "2023-01-01",
          matchType: "property",
        },
      ],
    };
    const additionalProperties = { startDate: '2023-02-01' };

    const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);

    expect(result).toBe(false);
  });

  it('returns true when names, start date, end date, and locationUri all match for EVENT entity', () => {
    const recordFetched = { name: 'Event Name' };
    const reconciliationQuery = {
      type: Entities.EVENT,
      conditions: [
        { matchType: 'name', propertyValue: 'event name' },
        { propertyId: 'startDate', propertyValue: '2023-01-01', matchType: 'property' },
        { propertyId: 'endDate', propertyValue: '2023-01-02', matchType: 'property' },
        { propertyId: 'locationUri', propertyValue: 'http://example.com/location', matchType: 'property' },
      ],
    };
    const additionalProperties = {
      startDate: '2023-01-01',
      endDate: '2023-01-02',
      locationUri: 'http://example.com/location',
    };
    const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);
    expect(result).toBe(true);
  });

  it('returns false when names match but locationUri does not for EVENT entity', () => {
    const recordFetched = { name: 'Event Name' };
    const reconciliationQuery = {
      type: Entities.EVENT,
      conditions: [
        { matchType: 'name', propertyValue: 'event name' },
        { propertyId: 'locationUri', propertyValue: 'http://example.com/location', matchType: 'property' },
      ],
    };
    const additionalProperties = { locationUri: 'http://wrong.com/location' };
    const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);
    expect(result).toBe(false);
  });

  it('returns true when names, start date, end date, locationName, and postalCode all match for EVENT entity', () => {
    const recordFetched = { name: 'Event Name' };
    const reconciliationQuery = {
      type: Entities.EVENT,
      conditions: [
        { matchType: 'name', propertyValue: 'event name' },
        { propertyId: 'startDate', propertyValue: '2023-01-01', matchType: 'property' },
        { propertyId: 'endDate', propertyValue: '2023-01-02', matchType: 'property' },
        { propertyId: 'locationName', propertyValue: 'Venue A', matchType: 'property' },
        { propertyId: 'postalCode', propertyValue: '12345', matchType: 'property' },
      ],
    };
    const additionalProperties = {
      startDate: '2023-01-01',
      endDate: '2023-01-02',
      locationName: 'Venue A',
      postalCode: '12345',
    };
    const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);
    expect(result).toBe(true);
  });

  it('returns false when names, start date, end date match but postalCode does not for EVENT entity', () => {
    const recordFetched = { name: 'Event Name' };
    const reconciliationQuery = {
      type: Entities.EVENT,
      conditions: [
        { matchType: 'name', propertyValue: 'event name' },
        { propertyId: 'startDate', propertyValue: '2023-01-01', matchType: 'property' },
        { propertyId: 'endDate', propertyValue: '2023-01-02', matchType: 'property' },
        { propertyId: 'postalCode', propertyValue: '12345', matchType: 'property' },
      ],
    };
    const additionalProperties = {
      startDate: '2023-01-01',
      endDate: '2023-01-02',
      postalCode: '54321',
    };
    const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);
    expect(result).toBe(false);
  });

  it('returns true when names, start date match and endDate is empty for EVENT entity', () => {
    const recordFetched = { name: 'Event Name' };
    const reconciliationQuery = {
      type: Entities.EVENT,
      conditions: [
        { matchType: 'name', propertyValue: 'event name' },
        { propertyId: 'startDate', propertyValue: '2023-01-01', matchType: 'property' }
      ],
    };
    const additionalProperties = {
      startDate: '2023-01-01'
    };
    const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);
    expect(result).toBe(true);
  });

  it('returns true when startDate and endDate are dateTime strings and match for EVENT entity', () => {
    const recordFetched = { name: 'Event Name' };
    const reconciliationQuery = {
      type: Entities.EVENT,
      conditions: [
        { matchType: 'name', propertyValue: 'event name' },
        { propertyId: 'startDate', propertyValue: '2023-01-01T10:00:00Z', matchType: 'property' },
        { propertyId: 'endDate', propertyValue: '2023-01-02T18:00:00Z', matchType: 'property' },
      ],
    };
    const additionalProperties = {
      startDate: '2023-01-01T10:00:00Z',
      endDate: '2023-01-02T18:00:00Z',
    };
    const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);
    expect(result).toBe(true);
  });

  it('returns false when startDate matches but no endDate in query and empty in additionalProperties for EVENT entity', () => {
    const recordFetched = { name: 'Event Name' };
    const reconciliationQuery = {
      type: Entities.EVENT,
      conditions: [
        { matchType: 'name', propertyValue: 'event name' },
        { propertyId: 'startDate', propertyValue: '2023-01-01', matchType: 'property' }
      ],
    };
    const additionalProperties = {
      startDate: '2023-01-01',
      endDate: '2023-01-02',
    };
    const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);
    expect(result).toBe(false);
  });

  it('returns true when startDate and endDate are dateTime strings and only startDate matches for EVENT entity', () => {
    const recordFetched = { name: 'Event Name' };
    const reconciliationQuery = {
      type: Entities.EVENT,
      conditions: [
        { matchType: 'name', propertyValue: 'event name' },
        { propertyId: 'startDate', propertyValue: '2023-01-01T10:00:00Z', matchType: 'property' }
      ],
    };
    const additionalProperties = {
      startDate: '2023-01-01T10:00:00Z'
    };
    const result = MatchServiceHelper.isAutoMatch(recordFetched, reconciliationQuery, additionalProperties);
    expect(result).toBe(true);
  });
});

