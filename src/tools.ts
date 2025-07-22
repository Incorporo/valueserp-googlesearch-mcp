import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ValueSerpClient } from './client.js';
import { 
  validateSearchParams, 
  validateNewsSearchParams, 
  validateImageSearchParams, 
  validateVideoSearchParams,
  ValidationError 
} from './validation.js';

// Parameter schemas
const searchParamsSchema = z.object({
  q: z.string().describe("Search query (required)"),
  location: z.string().optional().describe("Geographic location for search (e.g., 'United States', 'New York, NY')"),
  google_domain: z.string().optional().default("google.com").describe("Google domain to use (e.g., 'google.com', 'google.co.uk')"),
  gl: z.string().optional().default("us").describe("Country code for search (e.g., 'us', 'uk')"),
  hl: z.string().optional().default("en").describe("Language code for results (e.g., 'en', 'es')"),
  num: z.number().min(1).max(100).default(10).optional().describe("Number of results per page (1-100)"),
  page: z.number().min(1).default(1).optional().describe("Page number for pagination"),
  time_period: z.enum(["last_hour", "last_day", "last_week", "last_month", "last_year", "custom"]).optional().describe("Filter results by when they were published or indexed"),
  safe: z.enum(["active", "off"]).optional().describe("Safe search setting"),
  include_ai_overview: z.boolean().optional().describe("Include Google AI Overview in results"),
  nfpr: z.enum(["0", "1"]).optional().describe("Exclude auto-corrected results"),
  filter: z.enum(["0", "1"]).optional().describe("Enable/disable Similar Results filter"),
  web_filter: z.boolean().optional().describe("Return more organic results"),
  tbs: z.string().optional().describe("Custom tbs parameter"),
  knowledge_graph_id: z.string().optional().describe("Prompt a specific knowledge graph"),
  order_online: z.boolean().optional().describe("Return pickup/delivery info for restaurants"),
  flatten_results: z.boolean().optional().describe("Flatten inline results with organic results"),
  include_answer_box: z.boolean().optional().describe("Include answer box in organic results"),
  ads_optimized: z.boolean().optional().describe("Optimize ad return rate"),
  fields: z.array(z.string()).optional().describe("Select top-level objects to parse"),
  location_auto: z.boolean().optional().describe("Auto-update domain/gl/hl from location"),
  uule: z.string().optional().describe("Custom uule parameter")
});

const newsSearchParamsSchema = z.object({
  q: z.string().describe("News search query (required)"),
  location: z.string().optional().describe("Geographic location for news search"),
  google_domain: z.string().optional().default("google.com").describe("Google domain to use"),
  gl: z.string().optional().default("us").describe("Country code"),
  hl: z.string().optional().default("en").describe("Language code"),
  num: z.number().min(1).max(100).default(10).optional().describe("Number of results (max 100)"),
  page: z.number().min(1).default(1).optional().describe("Page number"),
  time_period: z.enum(["last_hour", "last_day", "last_week", "last_month", "last_year", "custom"]).optional().describe("Filter results by when they were published or indexed"),
  sort_by: z.enum(["relevance", "date"]).optional().describe("Sort results by relevance or date"),
  show_duplicates: z.boolean().optional().describe("Show duplicate articles (requires sort_by=date)"),
  safe: z.enum(["active", "off"]).optional().describe("Safe search setting"),
  nfpr: z.enum(["0", "1"]).optional().describe("Exclude auto-corrected results"),
  filter: z.enum(["0", "1"]).optional().describe("Enable/disable Similar Results filter"),
  exclude_if_modified: z.boolean().optional().describe("Exclude results when Google modifies query"),
  location_auto: z.boolean().optional().describe("Auto-update domain/gl/hl from location"),
  uule: z.string().optional().describe("Custom uule parameter"),
  lr: z.string().optional().describe("Limit results by language"),
  cr: z.string().optional().describe("Limit results by country"),
  tbs: z.string().optional().describe("Custom tbs parameter")
});

const imageSearchParamsSchema = z.object({
  q: z.string().describe("Image search query (required)"),
  location: z.string().optional().describe("Geographic location for image search"),
  google_domain: z.string().optional().default("google.com").describe("Google domain to use"),
  gl: z.string().optional().default("us").describe("Country code"),
  hl: z.string().optional().default("en").describe("Language code"),
  images_page: z.number().min(1).default(1).optional().describe("Page number for images (Google returns 100 images per page)"),
  images_color: z.enum(["any", "black_and_white", "transparent", "red", "orange", "yellow", "green", "teal", "blue", "purple", "pink", "white", "gray", "black", "brown"]).optional().describe("Filter by image color"),
  images_size: z.enum(["large", "medium", "icon"]).optional().describe("Filter by image size"),
  images_type: z.enum(["clipart", "line_drawing", "gif"]).optional().describe("Filter by image type"),
  images_usage: z.enum(["non_commercial_reuse_with_modification", "non_commercial_reuse"]).optional().describe("Filter by usage rights"),
  time_period: z.enum(["last_hour", "last_day", "last_week", "last_month", "last_year", "custom"]).optional().describe("Filter results by when they were published or indexed"),
  safe: z.enum(["active", "off"]).optional().describe("Safe search setting"),
  location_auto: z.boolean().optional().describe("Auto-update domain/gl/hl from location"),
  uule: z.string().optional().describe("Custom uule parameter"),
  lr: z.string().optional().describe("Limit results by language"),
  cr: z.string().optional().describe("Limit results by country"),
  tbs: z.string().optional().describe("Custom tbs parameter")
});

const videoSearchParamsSchema = z.object({
  q: z.string().describe("Video search query (required)"),
  location: z.string().optional().describe("Geographic location for video search"),
  google_domain: z.string().optional().default("google.com").describe("Google domain to use"),
  gl: z.string().optional().default("us").describe("Country code"),
  hl: z.string().optional().default("en").describe("Language code"),
  num: z.number().min(1).default(10).optional().describe("Number of results per page"),
  page: z.number().min(1).default(1).optional().describe("Page number"),
  time_period: z.enum(["last_hour", "last_day", "last_week", "last_month", "last_year", "custom"]).optional().describe("Filter results by when they were published or indexed"),
  safe: z.enum(["active", "off"]).optional().describe("Safe search setting"),
  nfpr: z.enum(["0", "1"]).optional().describe("Exclude auto-corrected results"),
  filter: z.enum(["0", "1"]).optional().describe("Enable/disable Similar Results filter"),
  location_auto: z.boolean().optional().describe("Auto-update domain/gl/hl from location"),
  uule: z.string().optional().describe("Custom uule parameter"),
  lr: z.string().optional().describe("Limit results by language"),
  cr: z.string().optional().describe("Limit results by country"),
  tbs: z.string().optional().describe("Custom tbs parameter")
});

export function registerSearchTools(server: McpServer, client: ValueSerpClient) {
  // Google Search Tool - searches web pages, websites, and general information
  server.tool(
    "google_search",
    searchParamsSchema.shape,
    async (args: any, _extra: any) => {
      try {
        const validatedParams = validateSearchParams(args);
        const result = await client.search(validatedParams);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error performing search: ${error.message}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Google News Search Tool - searches recent news articles and headlines
  server.tool(
    "google_news_search",
    newsSearchParamsSchema.shape,
    async (args: any, _extra: any) => {
      try {
        const validatedParams = validateNewsSearchParams(args);
        const result = await client.searchNews(validatedParams);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error performing news search: ${error.message}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Google Images Search Tool - searches for images and visual content
  server.tool(
    "google_images_search",
    imageSearchParamsSchema.shape,
    async (args: any, _extra: any) => {
      try {
        const validatedParams = validateImageSearchParams(args);
        const result = await client.searchImages(validatedParams);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error performing image search: ${error.message}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Google Videos Search Tool - searches for video content and clips
  server.tool(
    "google_videos_search",
    videoSearchParamsSchema.shape,
    async (args: any, _extra: any) => {
      try {
        const validatedParams = validateVideoSearchParams(args);
        const result = await client.searchVideos(validatedParams);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error performing video search: ${error.message}`
            }
          ],
          isError: true
        };
      }
    }
  );
}