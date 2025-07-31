import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSearchTools } from '../../src/tools.js';
import { ValueSerpClient } from '../../src/client.js';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock stdio transport
vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: vi.fn(() => ({
    start: vi.fn(),
    close: vi.fn()
  }))
}));

describe('MCP Server Tools Integration', () => {
  let server: McpServer;
  let client: ValueSerpClient;
  const mockApiKey = 'test-mock-api-key-12345';

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    
    // Set environment variable
    process.env.VALUESERP_API_KEY = mockApiKey;
    
    // Create server and client
    server = new McpServer(
      {
        name: 'valueserp-test-server',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );
    
    client = new ValueSerpClient({ apiKey: mockApiKey });
    registerSearchTools(server, client);
  });

  afterEach(() => {
    delete process.env.VALUESERP_API_KEY;
    vi.restoreAllMocks();
  });

  describe('google_search tool', () => {
    it('should execute search and return results', async () => {
      const mockResponse = {
        search_metadata: { 
          status: 'Success',
          google_url: 'https://www.google.com/search?q=test',
          total_time_taken: 1.5
        },
        search_parameters: {
          q: 'test query',
          location: 'United States'
        },
        organic_results: [
          {
            position: 1,
            title: 'Test Result 1',
            link: 'https://example.com/1',
            snippet: 'This is a test result'
          },
          {
            position: 2,
            title: 'Test Result 2',
            link: 'https://example.com/2',
            snippet: 'Another test result'
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Get the tool handler directly from server internals
      const tools = (server as any)._toolHandlers;
      const searchTool = tools.get('google_search');
      expect(searchTool).toBeDefined();

      // Execute the tool
      const result = await searchTool({
        q: 'test query',
        location: 'United States',
        num: 10
      }, {});

      // Verify the result
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      
      const resultData = JSON.parse(result.content[0].text);
      expect(resultData).toEqual(mockResponse);
      expect(result.isError).toBeUndefined();
    });

    it('should handle validation errors', async () => {
      const tools = (server as any)._toolHandlers;
      const searchTool = tools.get('google_search');

      // Missing required query
      const result = await searchTool({}, {});
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error performing search:');
      expect(result.content[0].text).toContain('Query parameter "q" is required');
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid API key' })
      });

      const tools = (server as any)._toolHandlers;
      const searchTool = tools.get('google_search');

      const result = await searchTool({ q: 'test' }, {});
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error performing search:');
      expect(result.content[0].text).toContain('ValueSerp API error: 401');
    });
  });

  describe('google_news_search tool', () => {
    it('should execute news search with specific parameters', async () => {
      const mockResponse = {
        search_metadata: { status: 'Success' },
        news_results: [
          {
            position: 1,
            title: 'Breaking News',
            source: 'News Source',
            date: '2 hours ago',
            snippet: 'Important news story'
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const tools = (server as any)._toolHandlers;
      const newsTool = tools.get('google_news_search');
      expect(newsTool).toBeDefined();

      const result = await newsTool({
        q: 'breaking news',
        sort_by: 'date',
        show_duplicates: true,
        num: 50
      }, {});

      const fetchCall = mockFetch.mock.calls[0];
      const url = new URL(fetchCall[0]);
      
      expect(url.searchParams.get('search_type')).toBe('news');
      expect(url.searchParams.get('sort_by')).toBe('date');
      expect(url.searchParams.get('show_duplicates')).toBe('true');
      
      const resultData = JSON.parse(result.content[0].text);
      expect(resultData).toEqual(mockResponse);
    });

    it('should validate news-specific constraints', async () => {
      const tools = (server as any)._toolHandlers;
      const newsTool = tools.get('google_news_search');

      // show_duplicates without sort_by=date
      const result = await newsTool({
        q: 'test',
        sort_by: 'relevance',
        show_duplicates: true
      }, {});
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('show_duplicates');
      expect(result.content[0].text).toContain('sort_by is set to "date"');
    });
  });

  describe('google_images_search tool', () => {
    it('should execute image search with filters', async () => {
      const mockResponse = {
        search_metadata: { status: 'Success' },
        image_results: [
          {
            position: 1,
            thumbnail: 'https://example.com/thumb1.jpg',
            original: 'https://example.com/image1.jpg',
            title: 'Test Image'
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const tools = (server as any)._toolHandlers;
      const imageTool = tools.get('google_images_search');
      expect(imageTool).toBeDefined();

      const result = await imageTool({
        q: 'nature photos',
        images_color: 'green',
        images_size: 'large',
        images_type: 'clipart',
        images_page: 2
      }, {});

      const fetchCall = mockFetch.mock.calls[0];
      const url = new URL(fetchCall[0]);
      
      expect(url.searchParams.get('search_type')).toBe('images');
      expect(url.searchParams.get('images_color')).toBe('green');
      expect(url.searchParams.get('images_size')).toBe('large');
      expect(url.searchParams.get('images_type')).toBe('clipart');
      expect(url.searchParams.get('images_page')).toBe('2');
      
      const resultData = JSON.parse(result.content[0].text);
      expect(resultData).toEqual(mockResponse);
    });

    it('should validate image-specific parameters', async () => {
      const tools = (server as any)._toolHandlers;
      const imageTool = tools.get('google_images_search');

      const result = await imageTool({
        q: 'test',
        images_color: 'invalid_color'
      }, {});
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('images_color');
    });
  });

  describe('google_videos_search tool', () => {
    it('should execute video search', async () => {
      const mockResponse = {
        search_metadata: { status: 'Success' },
        video_results: [
          {
            position: 1,
            title: 'Test Video',
            link: 'https://youtube.com/watch?v=123',
            duration: '10:30',
            source: 'YouTube'
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const tools = (server as any)._toolHandlers;
      const videoTool = tools.get('google_videos_search');
      expect(videoTool).toBeDefined();

      const result = await videoTool({
        q: 'tutorial videos',
        time_period: 'last_month',
        safe: 'active'
      }, {});

      const fetchCall = mockFetch.mock.calls[0];
      const url = new URL(fetchCall[0]);
      
      expect(url.searchParams.get('search_type')).toBe('videos');
      expect(url.searchParams.get('time_period')).toBe('last_month');
      expect(url.searchParams.get('safe')).toBe('active');
      
      const resultData = JSON.parse(result.content[0].text);
      expect(resultData).toEqual(mockResponse);
    });
  });

  describe('google_places_search tool', () => {
    it('should execute places search with location', async () => {
      const mockResponse = {
        search_metadata: { status: 'Success' },
        places_results: [
          {
            position: 1,
            title: 'Best Coffee Shop',
            address: '123 Main St, San Francisco, CA',
            rating: 4.5,
            reviews: 250,
            phone: '+1 415-555-0123'
          }
        ],
        local_results: [
          {
            title: 'Local Cafe',
            address: '456 Market St',
            rating: 4.2
          }
        ]
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const tools = (server as any)._toolHandlers;
      const placesTool = tools.get('google_places_search');

      const result = await placesTool({
        q: 'coffee shops',
        location: 'San Francisco, CA',
        num: 20
      }, {});

      const fetchCall = mockFetch.mock.calls[0];
      const url = new URL(fetchCall[0]);
      
      expect(url.searchParams.get('search_type')).toBe('places');
      expect(url.searchParams.get('location')).toBe('San Francisco, CA');
      expect(url.searchParams.get('num')).toBe('20');
      
      const resultData = JSON.parse(result.content[0].text);
      expect(resultData).toEqual(mockResponse);
    });

    it('should validate places-specific parameters', async () => {
      const tools = (server as any)._toolHandlers;
      const placesTool = tools.get('google_places_search');

      // Test max results limit
      const mockResponse = {
        search_metadata: { status: 'Success' },
        places_results: []
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await placesTool({
        q: 'restaurants',
        num: 20, // Max for places
        order_online: true
      }, {});

      const fetchCall = mockFetch.mock.calls[0];
      const url = new URL(fetchCall[0]);
      
      expect(url.searchParams.get('num')).toBe('20');
      expect(url.searchParams.get('order_online')).toBe('true');
    });

    it('should handle coordinate-based location search', async () => {
      const mockResponse = {
        search_metadata: { status: 'Success' },
        places_results: [{
          title: 'Restaurant',
          gps_coordinates: {
            latitude: 43.437677,
            longitude: -3.8392765
          }
        }]
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const tools = (server as any)._toolHandlers;
      const placesTool = tools.get('google_places_search');

      const result = await placesTool({
        q: 'restaurants',
        location: 'lat:43.437677,lon:-3.8392765'
      }, {});

      const fetchCall = mockFetch.mock.calls[0];
      const url = new URL(fetchCall[0]);
      
      expect(url.searchParams.get('location')).toBe('lat:43.437677,lon:-3.8392765');
    });
  });

  describe('Tool Registration', () => {
    it('should register all five tools', () => {
      const tools = (server as any)._toolHandlers;
      
      expect(tools.has('google_search')).toBe(true);
      expect(tools.has('google_news_search')).toBe(true);
      expect(tools.has('google_images_search')).toBe(true);
      expect(tools.has('google_videos_search')).toBe(true);
      expect(tools.has('google_places_search')).toBe(true);
      expect(tools.size).toBe(5);
    });

    it('should have proper tool schemas', () => {
      const toolRegistry = (server as any)._toolRegistry;
      
      // Check google_search schema
      const searchTool = toolRegistry.get('google_search');
      expect(searchTool).toBeDefined();
      expect(searchTool.inputSchema).toBeDefined();
      expect(searchTool.inputSchema.properties.q).toBeDefined();
      expect(searchTool.inputSchema.properties.location).toBeDefined();
      expect(searchTool.inputSchema.properties.num).toBeDefined();
      
      // Check google_images_search schema
      const imageTool = toolRegistry.get('google_images_search');
      expect(imageTool).toBeDefined();
      expect(imageTool.inputSchema.properties.images_color).toBeDefined();
      expect(imageTool.inputSchema.properties.images_size).toBeDefined();
    });
  });
});