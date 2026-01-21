import { searchPlaces, extractString } from '../src/api/artsdataApi';

// Mock fetch
global.fetch = jest.fn();

describe('artsdataApi', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('searchPlaces', () => {
    it('should return empty array for empty search query', async () => {
      const result = await searchPlaces('');
      expect(result).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should return empty array for whitespace-only search query', async () => {
      const result = await searchPlaces('   ');
      expect(result).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should call API with correct parameters', async () => {
      const mockResponse = [
        {
          results: {
            candidates: [
              {
                id: 'http://example.com/place1',
                name: 'Test Place',
                description: 'A test place',
                score: 100,
              },
            ],
          },
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await searchPlaces('test', 10);

      expect(fetch).toHaveBeenCalledWith(
        'https://recon.artsdata.ca/match',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': 'en',
          },
          body: JSON.stringify({
            queries: [
              {
                type: 'schema:Place',
                limit: 10,
                conditions: [
                  {
                    matchType: 'name',
                    propertyValue: 'test',
                  },
                ],
              },
            ],
          }),
        })
      );
    });

    it('should return candidates from API response', async () => {
      const mockCandidates = [
        {
          id: 'http://example.com/place1',
          name: 'Test Place 1',
          description: 'Description 1',
          score: 100,
        },
        {
          id: 'http://example.com/place2',
          name: 'Test Place 2',
          description: 'Description 2',
          score: 90,
        },
      ];

      const mockResponse = [
        {
          results: {
            candidates: mockCandidates,
          },
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchPlaces('test');
      expect(result).toEqual(mockCandidates);
    });

    it('should return empty array when API response has no candidates', async () => {
      const mockResponse = [
        {
          results: {
            candidates: [],
          },
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchPlaces('test');
      expect(result).toEqual([]);
    });

    it('should throw error when API request fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(searchPlaces('test')).rejects.toThrow('API request failed: 500');
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(searchPlaces('test')).rejects.toThrow('Network error');
    });
  });

  describe('extractString', () => {
    it('should return string as-is when input is a string', () => {
      expect(extractString('test string')).toBe('test string');
    });

    it('should extract string from MultilingualString object', () => {
      const multilingualString = {
        values: [
          { str: 'English text', lang: 'en' },
          { str: 'French text', lang: 'fr' },
        ],
      };
      expect(extractString(multilingualString)).toBe('English text');
    });

    it('should return empty string for null/undefined', () => {
      expect(extractString(null)).toBe('');
      expect(extractString(undefined)).toBe('');
    });

    it('should return empty string for empty values array', () => {
      const multilingualString = {
        values: [],
      };
      expect(extractString(multilingualString)).toBe('');
    });

    it('should return empty string for object without values', () => {
      const obj = { foo: 'bar' };
      expect(extractString(obj)).toBe('');
    });
  });
});
