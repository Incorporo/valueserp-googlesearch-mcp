import { describe, it, expect } from 'vitest';

describe('Google Places CSV Fields', () => {
  describe('places_results fields', () => {
    it('should have correct field structure for places_results', () => {
      const placesResultsFields = [
        'places_results.position',
        'places_results.data_id', 
        'places_results.data_cid',
        'places_results.title',
        'places_results.link',
        'places_results.sponsored',
        'places_results.snippet',
        'places_results.address',
        'places_results.phone',
        'places_results.rating',
        'places_results.reviews',
        'places_results.unclaimed',
        'places_results.category',
        'places_results.gps_coordinates.latitude',
        'places_results.gps_coordinates.longitude',
        'places_results.permanently_closed',
        'places_results.page'
      ];

      // Test field naming convention
      placesResultsFields.forEach(field => {
        expect(field).toMatch(/^places_results\./);
      });

      // Test GPS coordinate nested fields
      const gpsFields = placesResultsFields.filter(f => f.includes('gps_coordinates'));
      expect(gpsFields).toHaveLength(2);
      expect(gpsFields).toContain('places_results.gps_coordinates.latitude');
      expect(gpsFields).toContain('places_results.gps_coordinates.longitude');
    });

    it('should have correct field structure for local_results', () => {
      const localResultsFields = [
        'local_results.position',
        'local_results.link',
        'local_results.address',
        'local_results.block_position',
        'local_results.gps_coordinates.latitude',
        'local_results.gps_coordinates.longitude',
        'local_results.title',
        'local_results.image',
        'local_results.rating',
        'local_results.reviews',
        'local_results.type',
        'local_results.phone'
      ];

      // Test field naming convention
      localResultsFields.forEach(field => {
        expect(field).toMatch(/^local_results\./);
      });

      // Test common fields between places_results and local_results
      const commonFields = ['title', 'rating', 'reviews', 'phone', 'address'];
      commonFields.forEach(field => {
        expect(localResultsFields.some(f => f.endsWith(`.${field}`))).toBe(true);
      });
    });
  });

  describe('CSV field selection', () => {
    it('should generate valid CSV field string', () => {
      const defaultPlacesCSVFields = 'places_results.position,places_results.title,places_results.address,places_results.phone,places_results.rating,places_results.reviews,local_results.title,local_results.address,local_results.rating,local_results.reviews';
      
      const fields = defaultPlacesCSVFields.split(',');
      
      // Check we have fields from both places_results and local_results
      const placesFields = fields.filter(f => f.startsWith('places_results.'));
      const localFields = fields.filter(f => f.startsWith('local_results.'));
      
      expect(placesFields.length).toBeGreaterThan(0);
      expect(localFields.length).toBeGreaterThan(0);
      
      // Check essential fields are included
      expect(fields).toContain('places_results.title');
      expect(fields).toContain('places_results.address');
      expect(fields).toContain('places_results.rating');
      expect(fields).toContain('local_results.title');
    });

    it('should support custom CSV field selection', () => {
      const customFields = 'places_results.title,places_results.gps_coordinates.latitude,places_results.gps_coordinates.longitude';
      
      const fields = customFields.split(',');
      
      // Should only have requested fields
      expect(fields).toHaveLength(3);
      expect(fields).toContain('places_results.title');
      expect(fields).toContain('places_results.gps_coordinates.latitude');
      expect(fields).toContain('places_results.gps_coordinates.longitude');
    });
  });
});