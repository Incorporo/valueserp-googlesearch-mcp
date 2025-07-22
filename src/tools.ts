import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ValueSerpClient } from './client.js';

// Complete search parameters schema with all ValueSerp options
const searchParamsSchema = z.object({
  // Required parameters
  q: z.string().describe("The keyword you want to use to perform the search"),
  
  // Output format (our addition for CSV support)
  output: z.enum(["csv", "json"]).default("csv").optional().describe("Output format: csv (compact) or json (full data)"),
  csv_fields: z.string().optional().describe("Comma-separated CSV fields for output selection"),
  
  // Core optional parameters
  include_ai_overview: z.boolean().optional().describe("Adds Google's AI Overview content to the response (costs 1 additional credit if returned)"),
  location: z.string().optional().describe("Determines the geographic location in which the query is executed. You can enter any location as free-text, or use lat:43.437677,lon:-3.8392765 format for coordinates"),
  location_auto: z.boolean().optional().describe("If location is set to a built-in location, automatically updates google_domain, gl and hl parameters. Defaults to true"),
  uule: z.string().optional().describe("The Google UULE parameter - use to pass through a custom uule parameter to Google"),
  
  // Domain and language parameters
  google_domain: z.string().optional().describe("The Google domain to use to run the search query. Defaults to google.com"),
  gl: z.string().optional().describe("The gl parameter determines the Google country to use for the query. Defaults to us"),
  hl: z.string().optional().describe("The hl parameter determines the Google UI language to return results. Defaults to en"),
  lr: z.string().optional().describe("The lr parameter limits the results to websites containing the specified language"),
  cr: z.string().optional().describe("The cr parameter instructs Google to limit the results to websites in the specified country"),
  
  // Time filtering parameters  
  time_period: z.enum(["last_hour", "last_day", "last_week", "last_month", "last_year", "custom"]).optional().describe("Determines the time period of the results shown"),
  time_period_min: z.string().optional().describe("Minimum time when time_period is custom. Format: MM/DD/YYYY (e.g. 12/31/2018)"),
  time_period_max: z.string().optional().describe("Maximum time when time_period is custom. Format: MM/DD/YYYY (e.g. 12/31/2018)"),
  
  // Search behavior parameters
  nfpr: z.enum(["0", "1"]).optional().describe("Determines whether to exclude results from auto-corrected queries. 1 to exclude, 0 (default) to include"),
  filter: z.enum(["0", "1"]).optional().describe("Determines if filters for Similar Results and Omitted Results are on or off. 1 (default) to enable, 0 to disable"),
  safe: z.enum(["active", "off"]).optional().describe("Determines whether Safe Search is enabled. 'active' to enable, 'off' to disable"),
  
  // Pagination parameters
  page: z.number().min(1).optional().describe("Determines the page of results to return, defaults to 1. Use with num parameter for pagination"),
  max_page: z.number().min(1).optional().describe("Get multiple pages of results in one request. API will automatically paginate and concatenate results"),
  num: z.number().min(1).max(100).optional().describe("Number of results to show per page. Use with page parameter for pagination. Values above 10 may return fewer results due to Google changes"),
  web_filter: z.boolean().optional().describe("Use with num param to return more organic results. Excludes rich SERP elements like knowledge_graph, local_pack, etc"),
  
  // Advanced parameters
  tbs: z.string().optional().describe("Sets a specific string to be added to the Google tbs parameter in the underlying Google query"),
  knowledge_graph_id: z.string().optional().describe("Sets the kgmid Google parameter to prompt a specific knowledge graph (e.g. /m/0jg24)"),
  order_online: z.boolean().optional().describe("Returns pickup and delivery information for restaurant businesses. Costs 2 credits instead of 1"),
  flatten_results: z.boolean().optional().describe("Flattens inline_videos, inline_images, inline_tweets, top_stories and local_results inline with organic_results"),
  include_answer_box: z.boolean().optional().describe("Include the answer box (featured snippet) in the organic_results array as the first result"),
  ads_optimized: z.boolean().optional().describe("Optimize the rate that ads are returned in the search results"),
  fields: z.array(z.string()).optional().describe("Selection of top-level objects to parse (e.g. ['organic_results', 'top_sights']). If not provided, all fields are parsed")
});

const newsSearchParamsSchema = z.object({
  q: z.string().describe("News search query (required)"),
  output: z.enum(["csv", "json"]).default("csv").optional().describe("Output format: csv (compact) or json (full data)"),
  csv_fields: z.string().optional().describe("Comma-separated CSV fields for output selection"),
  
  // Location and domain parameters
  location: z.string().optional().describe("Geographic location for news search"),
  location_auto: z.boolean().optional().describe("Auto-update domain/gl/hl from location"),
  uule: z.string().optional().describe("Custom uule parameter"),
  google_domain: z.string().optional().describe("Google domain to use"),
  gl: z.string().optional().describe("Country code"),
  hl: z.string().optional().describe("Language code"),
  lr: z.string().optional().describe("Limit results by language"),
  cr: z.string().optional().describe("Limit results by country"),
  
  // News-specific parameters
  time_period: z.enum(["last_hour", "last_day", "last_week", "last_month", "last_year", "custom"]).optional().describe("Filter results by when they were published"),
  time_period_min: z.string().optional().describe("Minimum time when time_period is custom. Format: MM/DD/YYYY"),
  time_period_max: z.string().optional().describe("Maximum time when time_period is custom. Format: MM/DD/YYYY"),
  sort_by: z.enum(["relevance", "date"]).optional().describe("Sort results by relevance or date"),
  show_duplicates: z.boolean().optional().describe("Show duplicate articles (requires sort_by=date)"),
  
  // Search behavior
  safe: z.enum(["active", "off"]).optional().describe("Safe search setting"),
  nfpr: z.enum(["0", "1"]).optional().describe("Exclude auto-corrected results"),
  filter: z.enum(["0", "1"]).optional().describe("Enable/disable Similar Results filter"),
  exclude_if_modified: z.boolean().optional().describe("Exclude results when Google modifies query"),
  
  // Pagination
  num: z.number().min(1).max(100).optional().describe("Number of results (max 100)"),
  page: z.number().min(1).optional().describe("Page number"),
  max_page: z.number().min(1).optional().describe("Get multiple pages in one request"),
  
  // Advanced
  tbs: z.string().optional().describe("Custom tbs parameter"),
  fields: z.array(z.string()).optional().describe("Select top-level objects to parse")
});

const imageSearchParamsSchema = z.object({
  q: z.string().describe("Image search query (required)"),
  output: z.enum(["csv", "json"]).default("csv").optional().describe("Output format: csv (compact) or json (full data)"),
  csv_fields: z.string().optional().describe("Comma-separated CSV fields for output selection"),
  
  // Location and domain parameters
  location: z.string().optional().describe("Geographic location for image search"),
  location_auto: z.boolean().optional().describe("Auto-update domain/gl/hl from location"),
  uule: z.string().optional().describe("Custom uule parameter"),
  google_domain: z.string().optional().describe("Google domain to use"),
  gl: z.string().optional().describe("Country code"),
  hl: z.string().optional().describe("Language code"),
  lr: z.string().optional().describe("Limit results by language"),
  cr: z.string().optional().describe("Limit results by country"),
  
  // Image-specific parameters
  images_page: z.number().min(1).optional().describe("Page number for images (Google returns 100 images per page)"),
  images_color: z.enum(["any", "black_and_white", "transparent", "red", "orange", "yellow", "green", "teal", "blue", "purple", "pink", "white", "gray", "black", "brown"]).optional().describe("Filter by image color"),
  images_size: z.enum(["large", "medium", "icon"]).optional().describe("Filter by image size"),
  images_type: z.enum(["clipart", "line_drawing", "gif"]).optional().describe("Filter by image type"),
  images_usage: z.enum(["non_commercial_reuse_with_modification", "non_commercial_reuse"]).optional().describe("Filter by usage rights"),
  
  // Time filtering
  time_period: z.enum(["last_hour", "last_day", "last_week", "last_month", "last_year", "custom"]).optional().describe("Filter results by when they were published"),
  time_period_min: z.string().optional().describe("Minimum time when time_period is custom. Format: MM/DD/YYYY"),
  time_period_max: z.string().optional().describe("Maximum time when time_period is custom. Format: MM/DD/YYYY"),
  
  // Search behavior
  safe: z.enum(["active", "off"]).optional().describe("Safe search setting"),
  nfpr: z.enum(["0", "1"]).optional().describe("Exclude auto-corrected results"),
  filter: z.enum(["0", "1"]).optional().describe("Enable/disable Similar Results filter"),
  
  // Advanced
  tbs: z.string().optional().describe("Custom tbs parameter"),
  fields: z.array(z.string()).optional().describe("Select top-level objects to parse")
});

const videoSearchParamsSchema = z.object({
  q: z.string().describe("Video search query (required)"),
  output: z.enum(["csv", "json"]).default("csv").optional().describe("Output format: csv (compact) or json (full data)"),
  csv_fields: z.string().optional().describe("Comma-separated CSV fields for output selection"),
  
  // Location and domain parameters
  location: z.string().optional().describe("Geographic location for video search"),
  location_auto: z.boolean().optional().describe("Auto-update domain/gl/hl from location"),
  uule: z.string().optional().describe("Custom uule parameter"),
  google_domain: z.string().optional().describe("Google domain to use"),
  gl: z.string().optional().describe("Country code"),
  hl: z.string().optional().describe("Language code"),
  lr: z.string().optional().describe("Limit results by language"),
  cr: z.string().optional().describe("Limit results by country"),
  
  // Time filtering
  time_period: z.enum(["last_hour", "last_day", "last_week", "last_month", "last_year", "custom"]).optional().describe("Filter results by when they were published"),
  time_period_min: z.string().optional().describe("Minimum time when time_period is custom. Format: MM/DD/YYYY"),
  time_period_max: z.string().optional().describe("Maximum time when time_period is custom. Format: MM/DD/YYYY"),
  
  // Search behavior
  safe: z.enum(["active", "off"]).optional().describe("Safe search setting"),
  nfpr: z.enum(["0", "1"]).optional().describe("Exclude auto-corrected results"),
  filter: z.enum(["0", "1"]).optional().describe("Enable/disable Similar Results filter"),
  
  // Pagination
  num: z.number().min(1).optional().describe("Number of results per page"),
  page: z.number().min(1).optional().describe("Page number"),
  max_page: z.number().min(1).optional().describe("Get multiple pages in one request"),
  
  // Advanced
  tbs: z.string().optional().describe("Custom tbs parameter"),
  fields: z.array(z.string()).optional().describe("Select top-level objects to parse")
});

export function registerSearchTools(server: McpServer, client: ValueSerpClient) {
  // Default CSV fields for each search type
  const DEFAULT_CSV_FIELDS = {
    search: 'organic_results.position,organic_results.title,organic_results.link,organic_results.snippet',
    news: 'news_results.title,news_results.source,news_results.date,news_results.link,news_results.snippet',
    images: 'images_results.title,images_results.original,images_results.thumbnail,images_results.source',
    videos: 'video_results.title,video_results.link,video_results.duration,video_results.source,video_results.date,video_results.views'
  };

  // Google Search Tool
  server.tool(
    "google_search",
    searchParamsSchema.shape,
    async (args: any, _extra: any) => {
      try {
        const params = { output: 'csv', ...args };
        
        if (params.output === 'csv' && !params.csv_fields) {
          params.csv_fields = DEFAULT_CSV_FIELDS.search;
        }
        
        const result = await client.search(params);
        const resultText = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
        
        return {
          content: [{ type: "text", text: resultText }]
        };
      } catch (error: any) {
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  // Google News Search Tool
  server.tool(
    "google_news_search",
    newsSearchParamsSchema.shape,
    async (args: any, _extra: any) => {
      try {
        const params = { output: 'csv', ...args };
        
        if (params.output === 'csv' && !params.csv_fields) {
          params.csv_fields = DEFAULT_CSV_FIELDS.news;
        }
        
        const result = await client.searchNews(params);
        const resultText = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
        
        return {
          content: [{ type: "text", text: resultText }]
        };
      } catch (error: any) {
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  // Google Images Search Tool
  server.tool(
    "google_images_search",
    imageSearchParamsSchema.shape,
    async (args: any, _extra: any) => {
      try {
        const params = { output: 'csv', ...args };
        
        if (params.output === 'csv' && !params.csv_fields) {
          params.csv_fields = DEFAULT_CSV_FIELDS.images;
        }
        
        const result = await client.searchImages(params);
        const resultText = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
        
        return {
          content: [{ type: "text", text: resultText }]
        };
      } catch (error: any) {
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  // Google Videos Search Tool
  server.tool(
    "google_videos_search",
    videoSearchParamsSchema.shape,
    async (args: any, _extra: any) => {
      try {
        const params = { output: 'csv', ...args };
        
        if (params.output === 'csv' && !params.csv_fields) {
          params.csv_fields = DEFAULT_CSV_FIELDS.videos;
        }
        
        const result = await client.searchVideos(params);
        const resultText = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
        
        return {
          content: [{ type: "text", text: resultText }]
        };
      } catch (error: any) {
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
          isError: true
        };
      }
    }
  );
}