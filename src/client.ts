import fetch from 'node-fetch';
import { ValueSerpConfig, ValueSerpResponse, SearchParams, NewsSearchParams, ImageSearchParams, VideoSearchParams } from './types.js';

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

  private async makeRequest(endpoint: string, params: Record<string, any>): Promise<ValueSerpResponse> {
    const url = this.buildUrl(endpoint, params);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ValueSerp-MCP-Server/1.0.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ValueSerp API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json() as ValueSerpResponse;
    return data;
  }

  async search(params: SearchParams): Promise<ValueSerpResponse> {
    return this.makeRequest('/search', params);
  }

  async searchNews(params: NewsSearchParams): Promise<ValueSerpResponse> {
    return this.makeRequest('/search', params);
  }

  async searchImages(params: ImageSearchParams): Promise<ValueSerpResponse> {
    return this.makeRequest('/search', params);
  }

  async searchVideos(params: VideoSearchParams): Promise<ValueSerpResponse> {
    return this.makeRequest('/search', params);
  }
}