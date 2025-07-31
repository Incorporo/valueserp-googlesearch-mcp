# 🔍 ValueSerp MCP Server

<div align="center">

**Real-time Google Search Integration for Claude AI**

[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue?style=for-the-badge)](https://modelcontextprotocol.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue?style=for-the-badge)](https://www.gnu.org/licenses/gpl-3.0)

*Powered by [ValueSerp API](https://valueserp.com) • Built with [Model Context Protocol](https://modelcontextprotocol.io/)*

</div>

---

## 🌟 **What This Does**

Transform Claude AI into a powerful search engine with real-time access to Google's vast knowledge base. This MCP server enables Claude to perform live Google searches, browse news, discover images, and find videos - all without leaving the conversation.

### ✨ **Key Highlights**

- 🔍 **Live Google Search** - Real-time web, news, image, and video search
- 🖼️ **Smart Image Processing** - Automatic base64 image detection and native display
- 📊 **CSV Output Support** - Structured data extraction with 50+ field options
- 🌍 **Global Localization** - Search in any language, country, or region
- ⚡ **High Performance** - Built with TypeScript, comprehensive error handling
- 🔒 **Production Ready** - Extensive test coverage and security best practices

---

## 🛠️ **Features**

<table>
<tr>
<td width="50%">

### 🔍 **Search Tools**
- **`google_search`** - Web search with AI overviews
- **`google_news_search`** - Latest news with sorting
- **`google_images_search`** - Visual search with filters
- **`google_videos_search`** - Video discovery

</td>
<td width="50%">

### 🎯 **Advanced Capabilities**
- **Base64 Image Processing** - Automatic image extraction
- **Comprehensive CSV Fields** - 50+ structured data fields
- **Geographic Targeting** - Location-based results
- **Time Filtering** - Recent, custom date ranges
- **Safe Search** - Content filtering options

</td>
</tr>
</table>

### 🖼️ **Revolutionary Image Processing**

Our advanced image processing system automatically detects and converts base64 images in API responses to native MCP image resources, providing a seamless visual experience in Claude.

**Features:**
- ✅ Automatic base64 detection (PNG, JPEG, GIF, WebP, SVG)
- ✅ MIME type recognition and validation
- ✅ Size optimization (1MB limit compliance)
- ✅ Circular reference handling
- ✅ User-controllable with `process_images` parameter

---

## 🚀 **Quick Start**

### **Prerequisites**

```bash
# Required
Node.js 18+
ValueSerp API Key (get free at valueserp.com)
```

### **Installation**

```bash
# 1. Clone the repository
git clone <repository-url>
cd valueserp-mcp

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Set your API key
export VALUESERP_API_KEY="your_api_key_here"

# 5. Start the server
npm start
```

### **Claude Desktop Setup**

Add to your Claude Desktop configuration:

**📁 Config Location:**
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

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

---

## 📖 **Usage Guide**

### **Basic Web Search**

```json
{
  "tool": "google_search",
  "parameters": {
    "q": "latest AI developments 2025",
    "location": "United States",
    "num": 10,
    "time_period": "last_week",
    "include_ai_overview": true
  }
}
```

### **News Search with Sorting**

```json
{
  "tool": "google_news_search", 
  "parameters": {
    "q": "climate change",
    "sort_by": "date",
    "location": "United Kingdom",
    "num": 15,
    "time_period": "last_day"
  }
}
```

### **Image Search with Processing**

```json
{
  "tool": "google_images_search",
  "parameters": {
    "q": "modern architecture",
    "images_size": "large",
    "images_color": "any",
    "process_images": true,
    "num": 20
  }
}
```

### **Video Discovery**

```json
{
  "tool": "google_videos_search",
  "parameters": {
    "q": "TypeScript tutorials",
    "time_period": "last_month",
    "safe": "active",
    "num": 10
  }
}
```

---

## ⚙️ **Configuration Options**

<details>
<summary><b>🔧 Complete Parameter Reference</b></summary>

### **Common Parameters (All Tools)**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `q` | string | **Required.** Search query | `"machine learning"` |
| `location` | string | Geographic location | `"New York, NY"` |
| `gl` | string | Country code | `"us"` |
| `hl` | string | Language code | `"en"` |
| `num` | number | Results per page (1-100) | `10` |
| `page` | number | Page number | `1` |
| `safe` | string | Safe search (`active`/`off`) | `"active"` |
| `time_period` | string | Time filter | `"last_week"` |
| `process_images` | boolean | Enable image processing | `true` |

### **News-Specific Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `sort_by` | string | Sort by `relevance` or `date` |
| `show_duplicates` | boolean | Show duplicate articles |

### **Image-Specific Parameters**

| Parameter | Type | Options |
|-----------|------|---------|
| `images_color` | string | `any`, `black_and_white`, `transparent`, `red`, `blue`, etc. |
| `images_size` | string | `large`, `medium`, `icon` |
| `images_type` | string | `clipart`, `line_drawing`, `gif` |
| `images_usage` | string | Usage rights filter |

</details>

---

## 📊 **CSV Fields & Data Structure**

### **Rich Data Extraction**

Each search type supports extensive CSV field extraction for structured data processing:

<details>
<summary><b>📈 Available CSV Fields by Search Type</b></summary>

### **Web Search Fields**
```
organic_results.position, organic_results.title, organic_results.link, 
organic_results.snippet, organic_results.displayed_link, 
search_information.total_results, related_questions.question, 
knowledge_graph.title, local_results.title, local_results.address
```

### **News Search Fields**
```
news_results.position, news_results.title, news_results.source,
news_results.date, news_results.link, news_results.snippet,
news_results.thumbnail, search_information.total_results
```

### **Image Search Fields**
```
image_results.position, image_results.title, image_results.width,
image_results.height, image_results.image, image_results.link,
image_results.source.name, image_results.description
```

### **Video Search Fields**
```
video_results.position, video_results.title, video_results.link,
video_results.length, video_results.source, video_results.date,
video_results.snippet, search_information.total_results
```

</details>

---

## 🧪 **Testing & Quality**

### **Comprehensive Test Suite**

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm test tests/unit/
npm test tests/integration/
```

**Test Coverage:**
- ✅ **56 tests passing** across unit and integration suites
- ✅ **Image processing** - 24 comprehensive tests
- ✅ **API validation** - Parameter validation and error handling
- ✅ **Integration testing** - Real-world scenario validation

### **Code Quality**

- 🔍 **TypeScript** - Full type safety and IntelliSense
- 🛡️ **Error Handling** - Graceful failure recovery
- 📝 **Documentation** - Comprehensive inline documentation
- 🔒 **Security** - No hardcoded secrets, input validation

---

## 🎯 **Advanced Features**

### **🖼️ Base64 Image Processing**

Revolutionary feature that automatically detects base64 images in API responses and converts them to native MCP image resources.

```json
{
  "tool": "google_images_search",
  "parameters": {
    "q": "cats",
    "process_images": true    // Enable automatic image processing
  }
}
```

**How it works:**
1. 🔍 **Detection** - Scans API responses for base64 image data
2. 🔄 **Conversion** - Converts to MCP-compatible image blocks  
3. 🖼️ **Display** - Images render natively in Claude interface
4. ⚡ **Optimization** - Respects 1MB size limits for performance

### **🌍 Global Localization**

Search in any language, country, or region with precise targeting:

```json
{
  "location": "Tokyo, Japan",
  "gl": "jp",
  "hl": "ja",
  "google_domain": "google.co.jp"
}
```

---

## 🚨 **Error Handling**

The server provides comprehensive error handling:

- **🔍 Parameter Validation** - Clear error messages for invalid inputs
- **🌐 Network Resilience** - Automatic retry logic and timeout handling  
- **🔑 API Error Translation** - Human-readable ValueSerp API error messages
- **🛡️ Security** - Input sanitization and rate limiting awareness

---

## 📚 **Resources**

<div align="center">

| Resource | Description |
|----------|-------------|
| 📖 [**Implementation Guide**](https://www.incorpo.ro/en-us/articles/valueserp-mcp-server-real-time-search-for-claude-without-the-marketing-bs/) | Detailed setup and usage tutorial |
| 🔧 [**ValueSerp API Docs**](https://docs.valueserp.com/) | Complete API reference |
| 🏗️ [**MCP Protocol**](https://modelcontextprotocol.io/) | Model Context Protocol specification |
| 💡 [**Get API Key**](https://valueserp.com) | Free ValueSerp API access |

</div>

---

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

```bash
# Development setup
git clone <repo-url>
cd valueserp-mcp
npm install
npm run dev

# Run tests
npm test

# Build
npm run build
```

---

## 📄 **License**

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

**GPL v3** ensures this software remains free and open source. Any derivative works must also be licensed under GPL v3, preserving the freedom for all users to run, study, share, and modify the software.

---

<div align="center">

**Made with ❤️ for the Claude AI community**

*Bringing real-time search capabilities to conversational AI*

[![GitHub](https://img.shields.io/badge/GitHub-000000?style=for-the-badge&logo=github&logoColor=white)](https://github.com)
[![ValueSerp](https://img.shields.io/badge/ValueSerp-API-orange?style=for-the-badge)](https://valueserp.com)
[![Claude](https://img.shields.io/badge/Claude-AI-purple?style=for-the-badge)](https://claude.ai)

</div>