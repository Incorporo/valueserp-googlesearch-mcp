# ValueSerp MCP Server

A Model Context Protocol (MCP) server that provides access to ValueSerp's Google Search API, enabling Claude to perform Google searches, news searches, image searches, and video searches.

## Features

This MCP server provides the following tools:

- **google_search**: Perform standard Google web searches
- **google_news_search**: Search Google News
- **google_images_search**: Search Google Images
- **google_videos_search**: Search Google Videos

## Prerequisites

- Node.js 18+
- A ValueSerp API key (get one at [valueserp.com](https://valueserp.com))

## Installation

1. Clone or download this module
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the TypeScript:
   ```bash
   npm run build
   ```

## Configuration

### Environment Variable

Set your ValueSerp API key as an environment variable:

```bash
export VALUESERP_API_KEY=your_api_key_here
```

### MCP Server Configuration

To use this server with Claude Desktop or other MCP clients, add it to your MCP configuration:

#### Claude Desktop Configuration

Add the following to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "valueserp": {
      "command": "node",
      "args": ["/path/to/valueserp-mcp/dist/server.js"],
      "env": {
        "VALUESERP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

#### Alternative: Using npm start

If you prefer to use the npm script:

```json
{
  "mcpServers": {
    "valueserp": {
      "command": "npm",
      "args": ["start"],
      "cwd": "/path/to/valueserp-mcp",
      "env": {
        "VALUESERP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

#### Other MCP Clients

For other MCP clients, configure them to run this server using:
- **Command:** `node dist/server.js` (or `npm start`)
- **Working Directory:** Path to this project
- **Environment:** `VALUESERP_API_KEY=your_api_key_here`

## Usage

### Running the Server

```bash
npm start
```

### Tool Descriptions

#### google_search
Perform a Google web search.

**Required Parameters:**
- `q` (string): Search query

**Optional Parameters:**
- `location` (string): Geographic location (e.g., "United States", "New York, NY")
- `google_domain` (string): Google domain to use (default: "google.com")
- `gl` (string): Country code (default: "us")
- `hl` (string): Language code (default: "en")
- `num` (number): Number of results per page (1-100, default: 10)
- `page` (number): Page number for pagination (default: 1)
- `time_period` (string): Filter by time period (last_hour, last_day, last_week, last_month, last_year, custom)
- `safe` (string): Safe search setting ("active" or "off")
- `include_ai_overview` (boolean): Include Google AI Overview in results

#### google_news_search
Search Google News.

**Required Parameters:**
- `q` (string): News search query

**Optional Parameters:**
- Similar to google_search, plus:
- `sort_by` (string): Sort by "relevance" or "date"
- `show_duplicates` (boolean): Show duplicate articles (requires sort_by=date)

#### google_images_search
Search Google Images.

**Required Parameters:**
- `q` (string): Image search query

**Optional Parameters:**
- Similar to google_search, plus:
- `images_page` (number): Page number (Google returns 100 images per page)
- `images_color` (string): Filter by color (any, black_and_white, transparent, red, etc.)
- `images_size` (string): Filter by size (large, medium, icon)
- `images_type` (string): Filter by type (clipart, line_drawing, gif)
- `images_usage` (string): Filter by usage rights

#### google_videos_search
Search Google Videos.

**Required Parameters:**
- `q` (string): Video search query

**Optional Parameters:**
- Similar to google_search

## Example Usage in Claude

```
Search for "latest AI news" in the US:
{
  "tool": "google_news_search",
  "parameters": {
    "q": "latest AI news",
    "location": "United States",
    "num": 5
  }
}
```

## API Documentation

For complete API documentation and parameter details, visit: https://docs.valueserp.com/

## More Information

For a detailed guide on implementing and using the ValueSerp MCP server, see: [ValueSerp MCP Server: Real-time Search for Claude Without the Marketing BS](https://www.incorpo.ro/en-us/articles/valueserp-mcp-server-real-time-search-for-claude-without-the-marketing-bs/)

## Error Handling

The server includes comprehensive error handling and parameter validation:
- Invalid parameters will return clear validation errors
- API errors are properly formatted and returned
- Network issues are handled gracefully

## Development

### Building
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

## License

MIT