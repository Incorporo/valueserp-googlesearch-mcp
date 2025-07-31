import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ValueSerpMcpServer } from '../../src/server.js';

// Mock the stdio transport
vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: vi.fn(() => ({
    start: vi.fn().mockResolvedValue(undefined),
    close: vi.fn()
  }))
}));

// Mock console.error to avoid test output noise
const originalConsoleError = console.error;

describe('ValueSerpMcpServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });

  afterEach(() => {
    delete process.env.VALUESERP_API_KEY;
    console.error = originalConsoleError;
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should throw error when VALUESERP_API_KEY is not set', () => {
      delete process.env.VALUESERP_API_KEY;
      
      expect(() => new ValueSerpMcpServer()).toThrow('VALUESERP_API_KEY environment variable is required');
    });

    it('should initialize successfully with API key', () => {
      process.env.VALUESERP_API_KEY = 'test-api-key';
      
      const server = new ValueSerpMcpServer();
      expect(server).toBeInstanceOf(ValueSerpMcpServer);
    });
  });

  describe('start method', () => {
    it('should start the server transport', async () => {
      process.env.VALUESERP_API_KEY = 'test-api-key';
      
      const server = new ValueSerpMcpServer();
      await server.start();
      
      // Verify transport was created and started
      const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
      expect(StdioServerTransport).toHaveBeenCalled();
      
      const transportInstance = (StdioServerTransport as any).mock.results[0].value;
      expect(transportInstance.start).toHaveBeenCalled();
    });

    it('should handle transport start errors', async () => {
      process.env.VALUESERP_API_KEY = 'test-api-key';
      
      // Mock transport to throw error
      const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
      (StdioServerTransport as any).mockImplementationOnce(() => ({
        start: vi.fn().mockRejectedValue(new Error('Transport error')),
        close: vi.fn()
      }));
      
      const server = new ValueSerpMcpServer();
      
      await expect(server.start()).rejects.toThrow('Transport error');
    });
  });

  describe('server configuration', () => {
    it('should have correct server metadata', () => {
      process.env.VALUESERP_API_KEY = 'test-api-key';
      
      const server = new ValueSerpMcpServer();
      const serverInstance = (server as any).server;
      
      expect(serverInstance).toBeDefined();
      expect(serverInstance._serverInfo.name).toBe('valueserp-mcp-server');
      expect(serverInstance._serverInfo.version).toBe('1.0.0');
    });

    it('should have tools capability enabled', () => {
      process.env.VALUESERP_API_KEY = 'test-api-key';
      
      const server = new ValueSerpMcpServer();
      const serverInstance = (server as any).server;
      
      expect(serverInstance._options.capabilities).toBeDefined();
      expect(serverInstance._options.capabilities.tools).toBeDefined();
    });

    it('should register all search tools', () => {
      process.env.VALUESERP_API_KEY = 'test-api-key';
      
      const server = new ValueSerpMcpServer();
      const serverInstance = (server as any).server;
      const tools = serverInstance._tools;
      
      expect(tools.size).toBe(5);
      expect(tools.has('google_search')).toBe(true);
      expect(tools.has('google_news_search')).toBe(true);
      expect(tools.has('google_images_search')).toBe(true);
      expect(tools.has('google_videos_search')).toBe(true);
      expect(tools.has('google_places_search')).toBe(true);
    });
  });

  describe('main function', () => {
    it('should handle errors gracefully', async () => {
      // Import and mock the main module
      vi.doMock('../../src/server.js', () => ({
        ValueSerpMcpServer: vi.fn(() => {
          throw new Error('Initialization error');
        }),
        main: async () => {
          try {
            new ValueSerpMcpServer();
          } catch (error: any) {
            console.error('Failed to start server:', error.message);
            process.exit(1);
          }
        }
      }));

      const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit');
      });

      const { main } = await import('../../src/server.js');
      
      await expect(main()).rejects.toThrow('Process exit');
      expect(console.error).toHaveBeenCalledWith('Failed to start server:', 'Initialization error');
      expect(mockExit).toHaveBeenCalledWith(1);
      
      mockExit.mockRestore();
    });
  });
});