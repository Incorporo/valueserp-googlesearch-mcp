import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ValueSerpClient } from '../../src/client.js';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ValueSerpClient', () => {
  let client: ValueSerpClient;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    client = new ValueSerpClient({ apiKey: mockApiKey });
  });

  afterEach(() => {
    // Don't restore all mocks as it would restore fetch and cause real API calls
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with API key', () => {
      expect(client).toBeInstanceOf(ValueSerpClient);
    });
  });

  describe('search', () => {
    it('should make a search request with correct parameters', async () => {
      const mockResponse = { 
        search_metadata: { status: 'Success' },
        organic_results: [{ title: 'Test Result' }]
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const params = { q: 'test query', num: 10, location: 'United States' };
      const result = await client.search(params);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.valueserp.com/search'),
        expect.any(Object)
      );

      const fetchCall = mockFetch.mock.calls[0];
      const url = new URL(fetchCall[0]);
      
      expect(url.searchParams.get('api_key')).toBe(mockApiKey);
      expect(url.searchParams.get('q')).toBe('test query');
      expect(url.searchParams.get('num')).toBe('10');
      expect(url.searchParams.get('location')).toBe('United States');
      
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const errorResponse = {
        error: 'Invalid API key',
        status: 'Error'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => errorResponse
      });

      await expect(client.search({ q: 'test' })).rejects.toThrow('ValueSerp API error: 401');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.search({ q: 'test' })).rejects.toThrow('Network error');
    });

    it('should exclude undefined parameters from URL', async () => {
      const mockResponse = { search_metadata: { status: 'Success' } };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await client.search({ q: 'test', location: undefined, num: 10 });

      const fetchCall = mockFetch.mock.calls[0];
      const url = new URL(fetchCall[0]);
      
      expect(url.searchParams.has('location')).toBe(false);
      expect(url.searchParams.get('num')).toBe('10');
    });
  });

  describe('searchNews', () => {
    it('should make a news search request with search_type=news', async () => {
      const mockResponse = { 
        search_metadata: { status: 'Success' },
        news_results: [{ title: 'News Result' }]
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const params = { 
        q: 'breaking news', 
        search_type: 'news' as const,
        sort_by: 'date' as const 
      };
      const result = await client.searchNews(params);

      const fetchCall = mockFetch.mock.calls[0];
      const url = new URL(fetchCall[0]);
      
      expect(url.searchParams.get('search_type')).toBe('news');
      expect(url.searchParams.get('sort_by')).toBe('date');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('searchImages', () => {
    it('should make an image search request with search_type=images', async () => {
      const mockResponse = { 
        search_metadata: { status: 'Success' },
        image_results: [{ title: 'Image Result' }]
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const params = { 
        q: 'nature photos', 
        search_type: 'images' as const,
        images_color: 'green' as const,
        images_size: 'large' as const
      };
      const result = await client.searchImages(params);

      const fetchCall = mockFetch.mock.calls[0];
      const url = new URL(fetchCall[0]);
      
      expect(url.searchParams.get('search_type')).toBe('images');
      expect(url.searchParams.get('images_color')).toBe('green');
      expect(url.searchParams.get('images_size')).toBe('large');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('searchVideos', () => {
    it('should make a video search request with search_type=videos', async () => {
      const mockResponse = { 
        search_metadata: { status: 'Success' },
        video_results: [{ title: 'Video Result' }]
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const params = { 
        q: 'tutorial videos', 
        search_type: 'videos' as const,
        time_period: 'last_week' as const
      };
      const result = await client.searchVideos(params);

      const fetchCall = mockFetch.mock.calls[0];
      const url = new URL(fetchCall[0]);
      
      expect(url.searchParams.get('search_type')).toBe('videos');
      expect(url.searchParams.get('time_period')).toBe('last_week');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('searchPlaces', () => {
    it('should make a places search request with search_type=places', async () => {
      const mockResponse = { 
        search_metadata: { status: 'Success' },
        places_results: [{ title: 'Coffee Shop', rating: 4.5 }],
        local_results: [{ title: 'Local Business' }]
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const params = { 
        q: 'coffee shops', 
        search_type: 'places' as const,
        location: 'San Francisco, CA',
        num: 20
      };
      const result = await client.searchPlaces(params);

      const fetchCall = mockFetch.mock.calls[0];
      const url = new URL(fetchCall[0]);
      
      expect(url.searchParams.get('search_type')).toBe('places');
      expect(url.searchParams.get('location')).toBe('San Francisco, CA');
      expect(url.searchParams.get('num')).toBe('20');
      expect(result).toEqual(mockResponse);
    });

    it('should handle location coordinates format', async () => {
      const mockResponse = { 
        search_metadata: { status: 'Success' },
        places_results: []
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const params = { 
        q: 'restaurants', 
        search_type: 'places' as const,
        location: 'lat:43.437677,lon:-3.8392765'
      };
      await client.searchPlaces(params);

      const fetchCall = mockFetch.mock.calls[0];
      const url = new URL(fetchCall[0]);
      
      expect(url.searchParams.get('location')).toBe('lat:43.437677,lon:-3.8392765');
    });
  });

  describe('makeRequest with retries', () => {
    it('should handle rate limiting with retry', async () => {
      const mockResponse = { search_metadata: { status: 'Success' } };
      
      // First call returns 429 (rate limited)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Rate limited' })
      });

      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Mock setTimeout to avoid actual delay
      vi.useFakeTimers();
      const promise = client.search({ q: 'test' });
      
      // Fast-forward the timer
      vi.advanceTimersByTime(1000);
      
      const result = await promise;
      
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResponse);
      
      vi.useRealTimers();
    });

    it('should respect max retries for rate limiting', async () => {
      // Always return 429
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Rate limited' })
      });

      vi.useFakeTimers();
      const promise = client.search({ q: 'test' });
      
      // Fast-forward through all retries
      for (let i = 0; i < 3; i++) {
        vi.advanceTimersByTime(1000 * Math.pow(2, i));
      }
      
      await expect(promise).rejects.toThrow('ValueSerp API error: 429');
      expect(mockFetch).toHaveBeenCalledTimes(3);
      
      vi.useRealTimers();
    });

    it('should handle invalid JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      await expect(client.search({ q: 'test' })).rejects.toThrow('Invalid JSON');
    });

    it('should handle timeout parameter', async () => {
      const mockResponse = { search_metadata: { status: 'Success' } };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await client.search({ q: 'test', timeout: 5000 });

      const fetchCall = mockFetch.mock.calls[0];
      const options = fetchCall[1];
      
      expect(options.signal).toBeDefined();
    });
  });
});