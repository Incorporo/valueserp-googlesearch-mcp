/**
 * Image processing utilities for MCP server
 * Handles base64 image detection, conversion, and optimization
 */

export interface ImageContent {
  [x: string]: unknown;
  type: 'image';
  data: string;
  mimeType: string;
  _meta?: { [x: string]: unknown } | undefined;
}

export interface TextContent {
  [x: string]: unknown;
  type: 'text';
  text: string;
  _meta?: { [x: string]: unknown } | undefined;
}

export type ContentBlock = ImageContent | TextContent;

/**
 * Detects if a string contains base64 image data
 */
export function isBase64Image(str: string): boolean {
  // Check for data URL format: data:image/[format];base64,[data]
  const dataUrlRegex = /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/i;
  
  if (dataUrlRegex.test(str)) {
    return true;
  }
  
  // Check for standalone base64 that looks like image data
  const base64Regex = /^[A-Za-z0-9+/]+=*$/;
  
  // Must be valid base64 and reasonably long to be an image (small images can be ~90+ chars)
  return base64Regex.test(str) && str.length > 80;
}

/**
 * Extracts MIME type from base64 data URL
 */
export function extractMimeType(dataUrl: string): string {
  const match = dataUrl.match(/^data:image\/([^;]+);base64,/i);
  if (match) {
    return `image/${match[1]}`;
  }
  return 'image/png'; // Default fallback
}

/**
 * Gets base64 data without the data URL prefix
 */
export function getBase64Data(input: string): string {
  if (input.startsWith('data:image/')) {
    return input.split(',')[1];
  }
  return input;
}

/**
 * Estimates the size of base64 encoded data in bytes
 */
export function estimateBase64Size(base64Data: string): number {
  // Base64 encoding increases size by ~33%
  // Remove padding characters for more accurate estimate
  const cleanData = base64Data.replace(/[=]/g, '');
  return Math.floor(cleanData.length * 0.75);
}

/**
 * Checks if base64 image is within MCP size limits (1MB)
 */
export function isWithinSizeLimit(base64Data: string): boolean {
  const sizeInBytes = estimateBase64Size(base64Data);
  const maxSizeInBytes = 1024 * 1024; // 1MB
  return sizeInBytes <= maxSizeInBytes;
}

/**
 * Converts a base64 image string to MCP image content block
 */
export function createImageContent(base64Input: string): ImageContent {
  const mimeType = extractMimeType(base64Input);
  const data = getBase64Data(base64Input);
  
  return {
    type: 'image',
    data,
    mimeType
  };
}

/**
 * Processes a response object and converts base64 images to MCP image content blocks
 */
export function processResponseForImages(response: any): ContentBlock[] {
  const content: ContentBlock[] = [];
  
  // Add main response as text, handling circular references
  let responseText: string;
  try {
    responseText = typeof response === 'string' ? response : JSON.stringify(response, null, 2);
  } catch (error) {
    // Handle circular references by creating a safe representation
    responseText = typeof response === 'string' ? response : '[Complex object with circular references]';
  }
  
  content.push({
    type: 'text',
    text: responseText
  });
  
  // Recursively search for base64 images in the response
  const images = findBase64Images(response);
  
  for (const imageData of images) {
    if (isWithinSizeLimit(imageData)) {
      content.push(createImageContent(imageData));
    } else {
      console.warn('Base64 image exceeds 1MB limit, skipping');
    }
  }
  
  return content;
}

/**
 * Recursively searches for base64 image data in an object
 */
function findBase64Images(obj: any, visited = new Set()): string[] {
  if (obj === null || obj === undefined) {
    return [];
  }
  
  // Prevent circular references
  if (typeof obj === 'object' && visited.has(obj)) {
    return [];
  }
  
  if (typeof obj === 'object') {
    visited.add(obj);
  }
  
  const images: string[] = [];
  
  if (typeof obj === 'string') {
    if (isBase64Image(obj)) {
      images.push(obj);
    }
  } else if (Array.isArray(obj)) {
    for (const item of obj) {
      images.push(...findBase64Images(item, visited));
    }
  } else if (typeof obj === 'object') {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        images.push(...findBase64Images(obj[key], visited));
      }
    }
  }
  
  return images;
}

/**
 * Enhanced response formatter that handles both text and images
 */
export function formatMCPResponse(response: any, includeImages: boolean = true): ContentBlock[] {
  if (!includeImages) {
    return [{
      type: 'text',
      text: typeof response === 'string' ? response : JSON.stringify(response, null, 2)
    }];
  }
  
  return processResponseForImages(response);
}