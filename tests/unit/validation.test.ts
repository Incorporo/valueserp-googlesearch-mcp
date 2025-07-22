import { describe, it, expect } from 'vitest';
import {
  validateSearchParams,
  validateNewsSearchParams,
  validateImageSearchParams,
  validateVideoSearchParams,
  ValidationError
} from '../../src/validation.js';

describe('validateSearchParams', () => {
  it('should require query parameter', () => {
    expect(() => validateSearchParams({})).toThrow(ValidationError);
    expect(() => validateSearchParams({ q: '' })).toThrow(ValidationError);
    expect(() => validateSearchParams({ q: '  ' })).toThrow(ValidationError);
  });

  it('should accept valid search parameters', () => {
    const params = validateSearchParams({
      q: 'test query',
      location: 'United States',
      num: 20,
      page: 2
    });
    expect(params.q).toBe('test query');
    expect(params.location).toBe('United States');
    expect(params.num).toBe(20);
    expect(params.page).toBe(2);
  });

  it('should validate num parameter range', () => {
    expect(() => validateSearchParams({ q: 'test', num: 0 })).toThrow(ValidationError);
    expect(() => validateSearchParams({ q: 'test', num: 101 })).toThrow(ValidationError);
    expect(() => validateSearchParams({ q: 'test', num: 'abc' })).toThrow(ValidationError);
    
    const params = validateSearchParams({ q: 'test', num: 50 });
    expect(params.num).toBe(50);
  });

  it('should validate page parameter', () => {
    expect(() => validateSearchParams({ q: 'test', page: 0 })).toThrow(ValidationError);
    expect(() => validateSearchParams({ q: 'test', page: -1 })).toThrow(ValidationError);
    expect(() => validateSearchParams({ q: 'test', page: 'abc' })).toThrow(ValidationError);
    
    const params = validateSearchParams({ q: 'test', page: 3 });
    expect(params.page).toBe(3);
  });

  it('should validate safe parameter', () => {
    expect(() => validateSearchParams({ q: 'test', safe: 'invalid' })).toThrow(ValidationError);
    
    const params1 = validateSearchParams({ q: 'test', safe: 'active' });
    expect(params1.safe).toBe('active');
    
    const params2 = validateSearchParams({ q: 'test', safe: 'off' });
    expect(params2.safe).toBe('off');
  });

  it('should validate time_period parameter', () => {
    expect(() => validateSearchParams({ q: 'test', time_period: 'invalid' })).toThrow(ValidationError);
    
    const validPeriods = ['last_hour', 'last_day', 'last_week', 'last_month', 'last_year'];
    for (const period of validPeriods) {
      const params = validateSearchParams({ q: 'test', time_period: period });
      expect(params.time_period).toBe(period);
    }
    
    // Test custom period with dates
    const customParams = validateSearchParams({ 
      q: 'test', 
      time_period: 'custom',
      time_period_min: '01/01/2023'
    });
    expect(customParams.time_period).toBe('custom');
  });

  it('should validate custom time period dates', () => {
    expect(() => validateSearchParams({
      q: 'test',
      time_period: 'custom'
    })).toThrow('When time_period is "custom", either time_period_min or time_period_max must be provided');

    expect(() => validateSearchParams({
      q: 'test',
      time_period: 'custom',
      time_period_min: 'invalid-date'
    })).toThrow('time_period_min must be in MM/DD/YYYY format');

    expect(() => validateSearchParams({
      q: 'test',
      time_period: 'custom',
      time_period_max: '13/01/2023'
    })).toThrow('time_period_max must be in MM/DD/YYYY format');

    const params = validateSearchParams({
      q: 'test',
      time_period: 'custom',
      time_period_min: '01/01/2023',
      time_period_max: '12/31/2023'
    });
    expect(params.time_period_min).toBe('01/01/2023');
    expect(params.time_period_max).toBe('12/31/2023');
  });

  it('should convert nfpr parameter to string', () => {
    const params1 = validateSearchParams({ q: 'test', nfpr: 0 });
    expect(params1.nfpr).toBe('0');
    
    const params2 = validateSearchParams({ q: 'test', nfpr: 1 });
    expect(params2.nfpr).toBe('1');
    
    const params3 = validateSearchParams({ q: 'test', nfpr: '1' });
    expect(params3.nfpr).toBe('1');
    
    expect(() => validateSearchParams({ q: 'test', nfpr: 2 })).toThrow(ValidationError);
  });

  it('should convert filter parameter to string', () => {
    const params1 = validateSearchParams({ q: 'test', filter: 0 });
    expect(params1.filter).toBe('0');
    
    const params2 = validateSearchParams({ q: 'test', filter: 1 });
    expect(params2.filter).toBe('1');
    
    const params3 = validateSearchParams({ q: 'test', filter: '1' });
    expect(params3.filter).toBe('1');
    
    expect(() => validateSearchParams({ q: 'test', filter: 2 })).toThrow(ValidationError);
  });
});

describe('validateNewsSearchParams', () => {
  it('should validate sort_by parameter', () => {
    expect(() => validateNewsSearchParams({ q: 'test', sort_by: 'invalid' })).toThrow(ValidationError);
    
    const params1 = validateNewsSearchParams({ q: 'test', sort_by: 'relevance' });
    expect(params1.sort_by).toBe('relevance');
    expect(params1.search_type).toBe('news');
    
    const params2 = validateNewsSearchParams({ q: 'test', sort_by: 'date' });
    expect(params2.sort_by).toBe('date');
  });

  it('should validate show_duplicates requires sort_by=date', () => {
    expect(() => validateNewsSearchParams({
      q: 'test',
      sort_by: 'relevance',
      show_duplicates: true
    })).toThrow('Parameter "show_duplicates" can only be used when sort_by is set to "date"');
    
    const params = validateNewsSearchParams({
      q: 'test',
      sort_by: 'date',
      show_duplicates: true
    });
    expect(params.show_duplicates).toBe(true);
  });

  it('should enforce max 100 results for news', () => {
    expect(() => validateNewsSearchParams({ q: 'test', num: 101 })).toThrow('Parameter "num" must be a number between 1 and 100');
    
    const params = validateNewsSearchParams({ q: 'test', num: 100 });
    expect(params.num).toBe(100);
  });

  it('should include news-specific parameters', () => {
    const params = validateNewsSearchParams({
      q: 'test',
      exclude_if_modified: true
    });
    expect(params.exclude_if_modified).toBe(true);
    expect(params.search_type).toBe('news');
  });
});

describe('validateImageSearchParams', () => {
  it('should validate images_page parameter', () => {
    expect(() => validateImageSearchParams({ q: 'test', images_page: 0 })).toThrow(ValidationError);
    expect(() => validateImageSearchParams({ q: 'test', images_page: -1 })).toThrow(ValidationError);
    expect(() => validateImageSearchParams({ q: 'test', images_page: 'abc' })).toThrow(ValidationError);
    
    const params = validateImageSearchParams({ q: 'test', images_page: 3 });
    expect(params.images_page).toBe(3);
    expect(params.search_type).toBe('images');
  });

  it('should validate images_color parameter', () => {
    expect(() => validateImageSearchParams({ q: 'test', images_color: 'invalid' })).toThrow(ValidationError);
    
    const validColors = ['any', 'black_and_white', 'transparent', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink', 'white', 'gray', 'black', 'brown'];
    for (const color of validColors) {
      const params = validateImageSearchParams({ q: 'test', images_color: color });
      expect(params.images_color).toBe(color);
    }
  });

  it('should validate images_size parameter', () => {
    expect(() => validateImageSearchParams({ q: 'test', images_size: 'invalid' })).toThrow(ValidationError);
    
    const validSizes = ['large', 'medium', 'icon'];
    for (const size of validSizes) {
      const params = validateImageSearchParams({ q: 'test', images_size: size });
      expect(params.images_size).toBe(size);
    }
  });

  it('should validate images_type parameter', () => {
    expect(() => validateImageSearchParams({ q: 'test', images_type: 'invalid' })).toThrow(ValidationError);
    
    const validTypes = ['clipart', 'line_drawing', 'gif'];
    for (const type of validTypes) {
      const params = validateImageSearchParams({ q: 'test', images_type: type });
      expect(params.images_type).toBe(type);
    }
  });

  it('should validate images_usage parameter', () => {
    expect(() => validateImageSearchParams({ q: 'test', images_usage: 'invalid' })).toThrow(ValidationError);
    
    const validUsage = ['non_commercial_reuse_with_modification', 'non_commercial_reuse'];
    for (const usage of validUsage) {
      const params = validateImageSearchParams({ q: 'test', images_usage: usage });
      expect(params.images_usage).toBe(usage);
    }
  });
});

describe('validateVideoSearchParams', () => {
  it('should set search_type to videos', () => {
    const params = validateVideoSearchParams({
      q: 'test video',
      num: 20,
      safe: 'active'
    });
    expect(params.search_type).toBe('videos');
    expect(params.q).toBe('test video');
    expect(params.num).toBe(20);
    expect(params.safe).toBe('active');
  });

  it('should inherit base search validation', () => {
    expect(() => validateVideoSearchParams({})).toThrow(ValidationError);
    expect(() => validateVideoSearchParams({ q: '' })).toThrow(ValidationError);
    
    const params = validateVideoSearchParams({
      q: 'test',
      time_period: 'last_week'
    });
    expect(params.time_period).toBe('last_week');
  });
});