import fetch from 'node-fetch';
import { ValueSerpConfig, ValueSerpResponse, SearchParams, NewsSearchParams, ImageSearchParams, VideoSearchParams, PlacesSearchParams } from './types.js';

export class ValueSerpClient {
  private config: ValueSerpConfig;
  private baseUrl: string;

  constructor(config: ValueSerpConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.valueserp.com';
  }

  private buildUrl(endpoint: string, params: Record<string, any>): string {
    const url = new URL(endpoint, this.baseUrl);
    url.searchParams.set('api_key', this.config.apiKey);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          url.searchParams.set(key, value.join(','));
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    });

    return url.toString();
  }

  private async makeRequest(endpoint: string, params: Record<string, any>): Promise<ValueSerpResponse | string> {
    const url = this.buildUrl(endpoint, params);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': params.output === 'csv' ? 'text/csv' : 'application/json',
        'User-Agent': 'ValueSerp-MCP-Server/1.0.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ValueSerp API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Return CSV as string if output=csv, otherwise parse JSON
    if (params.output === 'csv') {
      return await response.text();
    }
    
    const data = await response.json() as ValueSerpResponse;
    return data;
  }

  async search(params: SearchParams): Promise<ValueSerpResponse | string> {
    return this.makeRequest('/search', params);
  }

  async searchNews(params: NewsSearchParams): Promise<ValueSerpResponse | string> {
    return this.makeRequest('/search', params);
  }

  async searchImages(params: ImageSearchParams): Promise<ValueSerpResponse | string> {
    return this.makeRequest('/search', params);
  }

  async searchVideos(params: VideoSearchParams): Promise<ValueSerpResponse | string> {
    return this.makeRequest('/search', params);
  }

  async searchPlaces(params: PlacesSearchParams): Promise<ValueSerpResponse | string> {
    return this.makeRequest('/search', params);
  }
}