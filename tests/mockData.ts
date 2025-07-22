// Mock data for testing ValueSerp API responses

export const mockSearchResponse = {
  search_metadata: {
    id: "65c6f6e3e4a3b98cc76e8c9d",
    status: "Success",
    google_url: "https://www.google.com/search?q=test+query&oq=test+query&uule=w+CAIQICIaQXVzdGluLFRleGFzLFVuaXRlZCBTdGF0ZXM",
    total_time_taken: 1.45
  },
  search_parameters: {
    q: "test query",
    location: "Austin, Texas, United States",
    google_domain: "google.com",
    gl: "us",
    hl: "en",
    num: 10,
    start: 0
  },
  organic_results: [
    {
      position: 1,
      title: "Test Query - Wikipedia",
      link: "https://en.wikipedia.org/wiki/Test_query",
      snippet: "A test query is a sample search term used for testing search functionality...",
      displayed_link: "https://en.wikipedia.org › wiki › Test_query",
      snippet_highlighted_words: ["Test", "query"],
      sitelinks: {
        inline: [
          {
            title: "Definition",
            link: "https://en.wikipedia.org/wiki/Test_query#Definition"
          },
          {
            title: "Examples",
            link: "https://en.wikipedia.org/wiki/Test_query#Examples"
          }
        ]
      }
    },
    {
      position: 2,
      title: "Best Practices for Test Queries",
      link: "https://example.com/test-queries",
      snippet: "Learn how to create effective test queries for search engine optimization...",
      displayed_link: "https://example.com › test-queries"
    }
  ],
  people_also_ask: [
    {
      question: "What is a test query?",
      snippet: "A test query is a search term used to validate search functionality...",
      title: "Understanding Test Queries",
      link: "https://searchengineexample.com/what-is-test-query"
    }
  ],
  related_searches: [
    {
      query: "test query examples",
      link: "https://www.google.com/search?q=test+query+examples"
    },
    {
      query: "how to write test queries",
      link: "https://www.google.com/search?q=how+to+write+test+queries"
    }
  ]
};

export const mockNewsResponse = {
  search_metadata: {
    id: "65c6f6e3e4a3b98cc76e8c9e",
    status: "Success",
    google_url: "https://news.google.com/search?q=breaking+news",
    total_time_taken: 0.98
  },
  search_parameters: {
    q: "breaking news",
    search_type: "news",
    sort_by: "date",
    google_domain: "google.com",
    gl: "us",
    hl: "en"
  },
  news_results: [
    {
      position: 1,
      title: "Major Tech Company Announces Revolutionary Product",
      source: "TechNews Daily",
      date: "2 hours ago",
      snippet: "In a surprising announcement today, the company unveiled their latest innovation...",
      link: "https://technews.com/major-announcement-2024",
      thumbnail: "https://technews.com/images/announcement.jpg"
    },
    {
      position: 2,
      title: "Global Climate Summit Reaches Historic Agreement",
      source: "Environment Today",
      date: "4 hours ago",
      snippet: "World leaders gathered to sign a groundbreaking climate accord...",
      link: "https://envtoday.com/climate-summit-agreement",
      thumbnail: "https://envtoday.com/images/summit.jpg"
    }
  ]
};

export const mockImagesResponse = {
  search_metadata: {
    id: "65c6f6e3e4a3b98cc76e8c9f",
    status: "Success",
    google_url: "https://www.google.com/search?q=nature+photos&tbm=isch",
    total_time_taken: 1.12
  },
  search_parameters: {
    q: "nature photos",
    search_type: "images",
    images_color: "green",
    images_size: "large",
    google_domain: "google.com",
    gl: "us",
    hl: "en"
  },
  image_results: [
    {
      position: 1,
      title: "Beautiful Forest Landscape",
      thumbnail: "https://example.com/thumbnails/forest_thumb.jpg",
      original: "https://example.com/images/forest_large.jpg",
      is_product: false,
      link: "https://photographysite.com/forest-landscape",
      source: "Photography Site"
    },
    {
      position: 2,
      title: "Mountain Lake Reflection",
      thumbnail: "https://example.com/thumbnails/lake_thumb.jpg",
      original: "https://example.com/images/lake_large.jpg",
      is_product: false,
      link: "https://naturephotos.com/mountain-lake",
      source: "Nature Photos"
    }
  ]
};

export const mockVideosResponse = {
  search_metadata: {
    id: "65c6f6e3e4a3b98cc76e8ca0",
    status: "Success",
    google_url: "https://www.google.com/search?q=tutorial+videos&tbm=vid",
    total_time_taken: 1.33
  },
  search_parameters: {
    q: "tutorial videos",
    search_type: "videos",
    time_period: "last_week",
    google_domain: "google.com",
    gl: "us",
    hl: "en"
  },
  video_results: [
    {
      position: 1,
      title: "Complete Beginner's Tutorial",
      link: "https://youtube.com/watch?v=abc123",
      duration: "15:30",
      source: "YouTube",
      channel: "Tutorial Channel",
      date: "3 days ago",
      snippet: "Learn everything you need to know in this comprehensive tutorial...",
      thumbnail: "https://i.ytimg.com/vi/abc123/hqdefault.jpg"
    },
    {
      position: 2,
      title: "Advanced Techniques Explained",
      link: "https://vimeo.com/456789",
      duration: "22:45",
      source: "Vimeo",
      channel: "Pro Tutorials",
      date: "5 days ago",
      snippet: "Take your skills to the next level with these advanced techniques...",
      thumbnail: "https://vimeo.com/thumbnails/456789.jpg"
    }
  ]
};

export const mockErrorResponse = {
  error: "Invalid API key provided",
  status: "Error"
};

export const mockRateLimitResponse = {
  error: "Rate limit exceeded. Please wait before making another request.",
  status: "Error"
};