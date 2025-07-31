import { describe, it, expect } from 'vitest';
import {
  isBase64Image,
  extractMimeType,
  getBase64Data,
  estimateBase64Size,
  isWithinSizeLimit,
  createImageContent,
  processResponseForImages,
  formatMCPResponse
} from '../../src/imageProcessor.js';

describe('isBase64Image', () => {
  it('should detect data URL format images', () => {
    expect(isBase64Image('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==')).toBe(true);
    expect(isBase64Image('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=')).toBe(true);
    expect(isBase64Image('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7')).toBe(true);
    expect(isBase64Image('data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=')).toBe(true);
    expect(isBase64Image('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNEOUQ5RDkiLz48L3N2Zz4K')).toBe(true);
  });

  it('should detect standalone base64 strings that look like images', () => {
    // Long base64 string (over 80 chars) should be detected
    expect(isBase64Image('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==')).toBe(true);
    expect(isBase64Image('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=')).toBe(true);
  });

  it('should not detect non-base64 strings', () => {
    expect(isBase64Image('hello world')).toBe(false);
    expect(isBase64Image('https://example.com/image.jpg')).toBe(false);
    expect(isBase64Image('not-base64-at-all')).toBe(false);
    expect(isBase64Image('')).toBe(false);
    expect(isBase64Image('123')).toBe(false); // Too short (under 80 chars)
  });

  it('should not detect invalid data URLs', () => {
    expect(isBase64Image('data:text/plain;base64,SGVsbG8gd29ybGQ=')).toBe(false);
    expect(isBase64Image('data:application/json;base64,eyJrZXkiOiJ2YWx1ZSJ9')).toBe(false);
  });
});

describe('extractMimeType', () => {
  it('should extract MIME type from data URLs', () => {
    expect(extractMimeType('data:image/png;base64,iVBOR...')).toBe('image/png');
    expect(extractMimeType('data:image/jpeg;base64,/9j/4AAQ...')).toBe('image/jpeg');
    expect(extractMimeType('data:image/gif;base64,R0lGOD...')).toBe('image/gif');
    expect(extractMimeType('data:image/webp;base64,UklGR...')).toBe('image/webp');
    expect(extractMimeType('data:image/svg+xml;base64,PHN2Z...')).toBe('image/svg+xml');
  });

  it('should return default MIME type for non-data URLs', () => {
    expect(extractMimeType('iVBORw0KGgoAAAANSUhEUgAAAAE...')).toBe('image/png');
    expect(extractMimeType('not-a-data-url')).toBe('image/png');
  });
});

describe('getBase64Data', () => {
  it('should extract base64 data from data URLs', () => {
    expect(getBase64Data('data:image/png;base64,iVBORw0KGgo')).toBe('iVBORw0KGgo');
    expect(getBase64Data('data:image/jpeg;base64,/9j/4AAQSkZJ')).toBe('/9j/4AAQSkZJ');
  });

  it('should return the input if not a data URL', () => {
    expect(getBase64Data('iVBORw0KGgo')).toBe('iVBORw0KGgo');
    expect(getBase64Data('standalone-base64')).toBe('standalone-base64');
  });
});

describe('estimateBase64Size', () => {
  it('should estimate size correctly', () => {
    // Base64 "AAAA" decodes to 3 bytes
    expect(estimateBase64Size('AAAA')).toBe(3);
    
    // Base64 "AAAAA" with padding would be 3 bytes (floor of 5 * 0.75)
    expect(estimateBase64Size('AAAAA')).toBe(3);
    
    // Test with padding characters
    expect(estimateBase64Size('AAAA=')).toBe(3);
    expect(estimateBase64Size('AAAA==')).toBe(3);
  });

  it('should handle empty strings', () => {
    expect(estimateBase64Size('')).toBe(0);
  });
});

describe('isWithinSizeLimit', () => {
  it('should return true for small images', () => {
    // Small base64 string
    expect(isWithinSizeLimit('iVBORw0KGgoAAAANSUhEUgAAAAE')).toBe(true);
  });

  it('should return false for large images', () => {
    // Create a base64 string that would exceed 1MB when decoded
    // 1MB = 1,048,576 bytes, so we need ~1,398,101 base64 chars
    const largeBase64 = 'A'.repeat(1500000);
    expect(isWithinSizeLimit(largeBase64)).toBe(false);
  });
});

describe('createImageContent', () => {
  it('should create image content from data URL', () => {
    const content = createImageContent('data:image/png;base64,iVBORw0KGgo');
    
    expect(content.type).toBe('image');
    expect(content.data).toBe('iVBORw0KGgo');
    expect(content.mimeType).toBe('image/png');
  });

  it('should create image content from standalone base64', () => {
    const content = createImageContent('iVBORw0KGgo');
    
    expect(content.type).toBe('image');
    expect(content.data).toBe('iVBORw0KGgo');
    expect(content.mimeType).toBe('image/png'); // Default
  });
});

describe('processResponseForImages', () => {
  it('should process response with base64 images', () => {
    const response = {
      data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      text: 'Some text'
    };

    const content = processResponseForImages(response);
    
    expect(content).toHaveLength(2); // Text + image
    expect(content[0].type).toBe('text');
    expect(content[1].type).toBe('image');
    expect(content[1].mimeType).toBe('image/png');
  });

  it('should process nested objects with images', () => {
    const response = {
      results: [
        {
          thumbnail: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
          title: 'Test'
        }
      ]
    };

    const content = processResponseForImages(response);
    
    expect(content).toHaveLength(2); // Text + image
    expect(content[0].type).toBe('text');
    expect(content[1].type).toBe('image');
    expect(content[1].mimeType).toBe('image/jpeg');
  });

  it('should handle arrays with images', () => {
    const response = [
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'regular text'
    ];

    const content = processResponseForImages(response);
    
    expect(content).toHaveLength(2); // Text + image
    expect(content[0].type).toBe('text');
    expect(content[1].type).toBe('image');
    expect(content[1].mimeType).toBe('image/gif');
  });

  it('should skip oversized images', () => {
    // Mock console.warn to avoid output during tests
    const originalWarn = console.warn;
    console.warn = () => {};

    const largeBase64 = 'A'.repeat(1500000); // Would exceed 1MB
    const response = {
      image: `data:image/png;base64,${largeBase64}`
    };

    const content = processResponseForImages(response);
    
    expect(content).toHaveLength(1); // Only text, image skipped
    expect(content[0].type).toBe('text');

    console.warn = originalWarn;
  });

  it('should handle responses without images', () => {
    const response = {
      text: 'Just some text',
      numbers: [1, 2, 3],
      nested: { data: 'more text' }
    };

    const content = processResponseForImages(response);
    
    expect(content).toHaveLength(1); // Only text
    expect(content[0].type).toBe('text');
  });

  it('should handle circular references', () => {
    const response: any = { text: 'test' };
    response.self = response; // Create circular reference

    const content = processResponseForImages(response);
    
    expect(content).toHaveLength(1); // Should not crash
    expect(content[0].type).toBe('text');
    expect(content[0].text).toBe('[Complex object with circular references]');
  });
});

describe('formatMCPResponse', () => {
  it('should format response with image processing enabled', () => {
    const response = {
      image: 'data:image/png;base64,iVBORw0KGgo',
      text: 'test'
    };

    const content = formatMCPResponse(response, true);
    
    expect(content).toHaveLength(2); // Text + image
    expect(content[1].type).toBe('image');
  });

  it('should format response with image processing disabled', () => {
    const response = {
      image: 'data:image/png;base64,iVBORw0KGgo',
      text: 'test'
    };

    const content = formatMCPResponse(response, false);
    
    expect(content).toHaveLength(1); // Only text
    expect(content[0].type).toBe('text');
  });

  it('should handle string responses', () => {
    const response = 'Simple string response';

    const content = formatMCPResponse(response, true);
    
    expect(content).toHaveLength(1);
    expect(content[0].type).toBe('text');
    expect(content[0].text).toBe('Simple string response');
  });
});

// Test the private findBase64Images function indirectly through processResponseForImages
describe('findBase64Images integration', () => {
  it('should find images in complex nested structures', () => {
    const response = {
      level1: {
        level2: {
          images: [
            'data:image/png;base64,iVBORw0KGgo',
            'regular text',
            'data:image/jpeg;base64,/9j/4AAQ'
          ]
        },
        directImage: 'data:image/gif;base64,R0lGOD'
      },
      topLevel: 'data:image/webp;base64,UklGR'
    };

    const content = processResponseForImages(response);
    
    // Should find: text + 4 images
    expect(content).toHaveLength(5);
    expect(content.filter(c => c.type === 'image')).toHaveLength(4);
    expect(content.filter(c => c.type === 'text')).toHaveLength(1);
  });
});