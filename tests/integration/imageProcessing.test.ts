import { describe, it, expect, beforeAll } from 'vitest';
import { formatMCPResponse, processResponseForImages } from '../../src/imageProcessor.js';

describe('Image Processing Integration', () => {
  // Mock response that might come from ValueSerp API
  const mockValueSerpResponse = {
    search_metadata: {
      id: 'test-123',
      status: 'Success',
      created_at: '2025-01-31T15:00:00Z'
    },
    search_parameters: {
      q: 'test query',
      engine: 'google'
    },
    organic_results: [
      {
        position: 1,
        title: 'Test Result',
        link: 'https://example.com',
        snippet: 'Test snippet'
      }
    ],
    // Simulate an image result with base64 data
    image_results: [
      {
        position: 1,
        title: 'Test Image',
        thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        original: 'https://example.com/image.png',
        width: 100,
        height: 100
      }
    ]
  };

  const mockResponseWithMultipleImages = {
    results: [
      {
        id: 1,
        thumbnail: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        title: 'JPEG Image'
      },
      {
        id: 2,
        icon: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        title: 'GIF Icon'
      }
    ],
    metadata: {
      total: 2
    }
  };

  describe('formatMCPResponse', () => {
    it('should process ValueSerp API response with images enabled', () => {
      const content = formatMCPResponse(mockValueSerpResponse, true);
      
      // Should have text response + the base64 image from thumbnail
      expect(content).toHaveLength(2);
      
      // First item should be the text representation
      expect(content[0].type).toBe('text');
      expect(content[0].text).toContain('search_metadata');
      expect(content[0].text).toContain('Test Result');
      
      // Second item should be the extracted image
      expect(content[1].type).toBe('image');
      expect(content[1].mimeType).toBe('image/png');
      expect(content[1].data).toBe('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
    });

    it('should process ValueSerp API response with images disabled', () => {
      const content = formatMCPResponse(mockValueSerpResponse, false);
      
      // Should only have text response
      expect(content).toHaveLength(1);
      expect(content[0].type).toBe('text');
      expect(content[0].text).toContain('search_metadata');
    });

    it('should handle multiple images in response', () => {
      const content = formatMCPResponse(mockResponseWithMultipleImages, true);
      
      // Should have text + 2 images
      expect(content).toHaveLength(3);
      
      expect(content[0].type).toBe('text');
      expect(content[1].type).toBe('image');
      expect(content[1].mimeType).toBe('image/jpeg');
      expect(content[2].type).toBe('image');
      expect(content[2].mimeType).toBe('image/gif');
    });
  });

  describe('processResponseForImages', () => {
    it('should extract images from nested API response structures', () => {
      const content = processResponseForImages(mockValueSerpResponse);
      
      expect(content).toHaveLength(2); // text + 1 image
      
      const textContent = content.find(c => c.type === 'text');
      const imageContent = content.find(c => c.type === 'image');
      
      expect(textContent).toBeDefined();
      expect(imageContent).toBeDefined();
      expect(imageContent?.mimeType).toBe('image/png');
    });

    it('should handle array responses with images', () => {
      const arrayResponse = [
        { text: 'item 1' },
        { 
          image: 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=',
          caption: 'WebP image'
        }
      ];

      const content = processResponseForImages(arrayResponse);
      
      expect(content).toHaveLength(2); // text + 1 image
      
      const imageContent = content.find(c => c.type === 'image');
      expect(imageContent?.mimeType).toBe('image/webp');
    });

    it('should preserve original data structure in text content', () => {
      const response = {
        query: 'test search',
        results_count: 10,
        processing_time: '0.5s'
      };

      const content = processResponseForImages(response);
      
      expect(content).toHaveLength(1); // Only text, no images
      expect(content[0].type).toBe('text');
      
      // Should contain the original structure
      const textContent = JSON.parse(content[0].text);
      expect(textContent.query).toBe('test search');
      expect(textContent.results_count).toBe(10);
      expect(textContent.processing_time).toBe('0.5s');
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle typical Google Images search response format', () => {
      const googleImagesResponse = {
        search_metadata: {
          id: 'search_123',
          status: 'Success'
        },
        search_parameters: {
          q: 'cats',
          engine: 'google_images'
        },
        images_results: [
          {
            position: 1,
            thumbnail: 'data:image/jpeg;base64,/9j/test123==',
            original: 'https://example.com/cat1.jpg',
            title: 'Cute Cat',
            source: {
              name: 'Example Site',
              link: 'https://example.com'
            }
          },
          {
            position: 2,
            thumbnail: 'https://example.com/thumbnail2.jpg', // URL, not base64
            original: 'https://example.com/cat2.jpg',
            title: 'Another Cat'
          }
        ]
      };

      const content = formatMCPResponse(googleImagesResponse, true);
      
      // Should have text + 1 base64 image (the URL thumbnail should be ignored)
      expect(content).toHaveLength(2);
      expect(content.filter(c => c.type === 'image')).toHaveLength(1);
    });

    it('should handle news search with thumbnail images', () => {
      const newsResponse = {
        news_results: [
          {
            position: 1,
            title: 'Breaking News',
            snippet: 'Important news story',
            thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
            source: 'News Site'
          }
        ]
      };

      const content = processResponseForImages(newsResponse);
      
      expect(content).toHaveLength(2); // text + 1 thumbnail
      expect(content[1].type).toBe('image');
      expect(content[1].mimeType).toBe('image/png');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty responses', () => {
      const content = formatMCPResponse({}, true);
      
      expect(content).toHaveLength(1);
      expect(content[0].type).toBe('text');
      expect(content[0].text).toBe('{}');
    });

    it('should handle null responses', () => {
      const content = formatMCPResponse(null, true);
      
      expect(content).toHaveLength(1);
      expect(content[0].type).toBe('text');
      expect(content[0].text).toBe('null');
    });

    it('should handle string responses', () => {
      const content = formatMCPResponse('Simple string response', true);
      
      expect(content).toHaveLength(1);
      expect(content[0].type).toBe('text');
      expect(content[0].text).toBe('Simple string response');
    });

    it('should handle responses with invalid base64 data', () => {
      const invalidResponse = {
        image: 'data:image/png;base64,invalid-base64-data',
        valid_image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
      };

      const content = processResponseForImages(invalidResponse);
      
      // Should detect both data URLs (even with invalid base64 content)
      expect(content).toHaveLength(3); // text + 2 images (including invalid one)
      expect(content.filter(c => c.type === 'image')).toHaveLength(2);
    });
  });
});