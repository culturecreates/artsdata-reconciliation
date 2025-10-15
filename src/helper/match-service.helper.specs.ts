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
});