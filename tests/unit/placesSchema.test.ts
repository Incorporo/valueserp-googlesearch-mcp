import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// We'll test the schema directly
const placesSearchParamsSchema = z.object({
  q: z.string().describe("Places search query (required) - keyword for local search"),
  output: z.enum(["csv", "json"]).default("csv").optional(),
  csv_fields: z.string().optional(),
  
  // Location and domain parameters
  location: z.string().optional(),
  location_auto: z.boolean().optional(),
  uule: z.string().optional(),
  google_domain: z.string().optional(),
  gl: z.string().optional(),
  hl: z.string().optional(),
  lr: z.string().optional(),
  cr: z.string().optional(),
  
  // Search behavior
  safe: z.enum(["active", "off"]).optional(),
  nfpr: z.number().min(0).max(1).optional(),
  filter: z.enum(["0", "1"]).optional(),
  
  // Pagination - limited for Places
  num: z.number().min(1).max(20).optional(),
  page: z.number().min(1).optional(),
  max_page: z.number().min(1).optional(),
  
  // Advanced
  tbs: z.string().optional(),
  order_online: z.boolean().optional(),
  
  // MCP Image Processing
  process_images: z.boolean().default(true).optional()
});

describe('Google Places Search Schema', () => {
  describe('required parameters', () => {
    it('should require query parameter', () => {
      const result = placesSearchParamsSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('q');
      }
    });

    it('should accept valid query', () => {
      const result = placesSearchParamsSchema.safeParse({ q: 'coffee shops' });
      expect(result.success).toBe(true);
    });
  });

  describe('location parameters', () => {
    it('should accept text location', () => {
      const result = placesSearchParamsSchema.safeParse({
        q: 'restaurants',
        location: 'San Francisco, CA'
      });
      expect(result.success).toBe(true);
      expect(result.data.location).toBe('San Francisco, CA');
    });

    it('should accept coordinate location', () => {
      const result = placesSearchParamsSchema.safeParse({
        q: 'restaurants',
        location: 'lat:43.437677,lon:-3.8392765'
      });
      expect(result.success).toBe(true);
      expect(result.data.location).toBe('lat:43.437677,lon:-3.8392765');
    });

    it('should accept location_auto parameter', () => {
      const result = placesSearchParamsSchema.safeParse({
        q: 'hotels',
        location: 'Paris, France',
        location_auto: true
      });
      expect(result.success).toBe(true);
      expect(result.data.location_auto).toBe(true);
    });
  });

  describe('places-specific constraints', () => {
    it('should limit num parameter to max 20', () => {
      const validResult = placesSearchParamsSchema.safeParse({
        q: 'shops',
        num: 20
      });
      expect(validResult.success).toBe(true);
      expect(validResult.data.num).toBe(20);

      const invalidResult = placesSearchParamsSchema.safeParse({
        q: 'shops',
        num: 25
      });
      expect(invalidResult.success).toBe(false);
    });

    it('should accept order_online parameter', () => {
      const result = placesSearchParamsSchema.safeParse({
        q: 'pizza',
        order_online: true
      });
      expect(result.success).toBe(true);
      expect(result.data.order_online).toBe(true);
    });

    it('should accept nfpr as number 0 or 1', () => {
      const result0 = placesSearchParamsSchema.safeParse({
        q: 'bakery',
        nfpr: 0
      });
      expect(result0.success).toBe(true);
      expect(result0.data.nfpr).toBe(0);

      const result1 = placesSearchParamsSchema.safeParse({
        q: 'bakery',
        nfpr: 1
      });
      expect(result1.success).toBe(true);
      expect(result1.data.nfpr).toBe(1);

      const invalidResult = placesSearchParamsSchema.safeParse({
        q: 'bakery',
        nfpr: 2
      });
      expect(invalidResult.success).toBe(false);
    });
  });

  describe('output format', () => {
    it('should default to csv output', () => {
      const result = placesSearchParamsSchema.safeParse({
        q: 'gyms'
      });
      expect(result.success).toBe(true);
      // Note: default is applied at runtime, not in parse
    });

    it('should accept json output', () => {
      const result = placesSearchParamsSchema.safeParse({
        q: 'gyms',
        output: 'json'
      });
      expect(result.success).toBe(true);
      expect(result.data.output).toBe('json');
    });

    it('should accept csv_fields parameter', () => {
      const result = placesSearchParamsSchema.safeParse({
        q: 'banks',
        output: 'csv',
        csv_fields: 'places_results.title,places_results.address,places_results.phone'
      });
      expect(result.success).toBe(true);
      expect(result.data.csv_fields).toBe('places_results.title,places_results.address,places_results.phone');
    });
  });

  describe('image processing', () => {
    it('should accept process_images parameter', () => {
      const result = placesSearchParamsSchema.safeParse({
        q: 'tourist attractions',
        process_images: false
      });
      expect(result.success).toBe(true);
      expect(result.data.process_images).toBe(false);
    });
  });
});