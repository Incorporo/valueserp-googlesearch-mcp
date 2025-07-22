import { SearchParams, NewsSearchParams, ImageSearchParams, VideoSearchParams } from './types.js';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateSearchParams(params: any): SearchParams {
  if (!params.q || typeof params.q !== 'string' || params.q.trim() === '') {
    throw new ValidationError('Query parameter "q" is required and must be a non-empty string');
  }

  if (params.num !== undefined) {
    const num = Number(params.num);
    if (isNaN(num) || num < 1 || num > 100) {
      throw new ValidationError('Parameter "num" must be a number between 1 and 100');
    }
    params.num = num;
  }

  if (params.page !== undefined) {
    const page = Number(params.page);
    if (isNaN(page) || page < 1) {
      throw new ValidationError('Parameter "page" must be a positive number');
    }
    params.page = page;
  }

  if (params.max_page !== undefined) {
    const maxPage = Number(params.max_page);
    if (isNaN(maxPage) || maxPage < 1) {
      throw new ValidationError('Parameter "max_page" must be a positive number');
    }
    params.max_page = maxPage;
  }

  if (params.time_period === 'custom') {
    if (!params.time_period_min && !params.time_period_max) {
      throw new ValidationError('When time_period is "custom", either time_period_min or time_period_max must be provided');
    }
    if (params.time_period_min && !isValidDateFormat(params.time_period_min)) {
      throw new ValidationError('time_period_min must be in MM/DD/YYYY format');
    }
    if (params.time_period_max && !isValidDateFormat(params.time_period_max)) {
      throw new ValidationError('time_period_max must be in MM/DD/YYYY format');
    }
  }

  if (params.safe && !['active', 'off'].includes(params.safe)) {
    throw new ValidationError('Parameter "safe" must be either "active" or "off"');
  }

  if (params.time_period && !['last_hour', 'last_day', 'last_week', 'last_month', 'last_year', 'custom'].includes(params.time_period)) {
    throw new ValidationError('Parameter "time_period" must be one of: last_hour, last_day, last_week, last_month, last_year, custom');
  }

  if (params.nfpr !== undefined) {
    params.nfpr = String(params.nfpr);
    if (!['0', '1'].includes(params.nfpr)) {
      throw new ValidationError('Parameter "nfpr" must be either "0" or "1"');
    }
  }

  if (params.filter !== undefined) {
    params.filter = String(params.filter);
    if (!['0', '1'].includes(params.filter)) {
      throw new ValidationError('Parameter "filter" must be either "0" or "1"');
    }
  }

  if (params.time_period_min !== undefined) {
    if (!isValidDateFormat(params.time_period_min)) {
      throw new ValidationError('time_period_min must be in MM/DD/YYYY format');
    }
  }

  if (params.time_period_max !== undefined) {
    if (!isValidDateFormat(params.time_period_max)) {
      throw new ValidationError('time_period_max must be in MM/DD/YYYY format');
    }
  }

  return params as SearchParams;
}

export function validateNewsSearchParams(params: any): NewsSearchParams {
  const baseParams = validateSearchParams(params);
  
  if (params.sort_by && !['relevance', 'date'].includes(params.sort_by)) {
    throw new ValidationError('Parameter "sort_by" must be either "relevance" or "date"');
  }

  if (params.show_duplicates !== undefined && params.sort_by !== 'date') {
    throw new ValidationError('Parameter "show_duplicates" can only be used when sort_by is set to "date"');
  }

  if (params.num !== undefined) {
    const num = Number(params.num);
    if (num > 100) {
      throw new ValidationError('Maximum number of news results is 100');
    }
  }

  return {
    ...baseParams,
    search_type: 'news',
    sort_by: params.sort_by,
    show_duplicates: params.show_duplicates,
    exclude_if_modified: params.exclude_if_modified
  } as NewsSearchParams;
}

export function validateImageSearchParams(params: any): ImageSearchParams {
  const baseParams = validateSearchParams(params);

  if (params.images_page !== undefined) {
    const imagesPage = Number(params.images_page);
    if (isNaN(imagesPage) || imagesPage < 1) {
      throw new ValidationError('Parameter "images_page" must be a positive number');
    }
    params.images_page = imagesPage;
  }

  const validColors = ['any', 'black_and_white', 'transparent', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink', 'white', 'gray', 'black', 'brown'];
  if (params.images_color && !validColors.includes(params.images_color)) {
    throw new ValidationError(`Parameter "images_color" must be one of: ${validColors.join(', ')}`);
  }

  const validSizes = ['large', 'medium', 'icon'];
  if (params.images_size && !validSizes.includes(params.images_size)) {
    throw new ValidationError(`Parameter "images_size" must be one of: ${validSizes.join(', ')}`);
  }

  const validTypes = ['clipart', 'line_drawing', 'gif'];
  if (params.images_type && !validTypes.includes(params.images_type)) {
    throw new ValidationError(`Parameter "images_type" must be one of: ${validTypes.join(', ')}`);
  }

  const validUsage = ['non_commercial_reuse_with_modification', 'non_commercial_reuse'];
  if (params.images_usage && !validUsage.includes(params.images_usage)) {
    throw new ValidationError(`Parameter "images_usage" must be one of: ${validUsage.join(', ')}`);
  }

  return {
    ...baseParams,
    search_type: 'images',
    images_page: params.images_page,
    images_color: params.images_color,
    images_size: params.images_size,
    images_type: params.images_type,
    images_usage: params.images_usage
  } as ImageSearchParams;
}

export function validateVideoSearchParams(params: any): VideoSearchParams {
  const baseParams = validateSearchParams(params);

  return {
    ...baseParams,
    search_type: 'videos'
  } as VideoSearchParams;
}

function isValidDateFormat(dateString: string): boolean {
  const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  const [month, day, year] = dateString.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day;
}