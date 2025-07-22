export interface ValueSerpConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface SearchParams {
  q: string;
  location?: string;
  google_domain?: string;
  gl?: string;
  hl?: string;
  lr?: string;
  cr?: string;
  time_period?: 'last_hour' | 'last_day' | 'last_week' | 'last_month' | 'last_year' | 'custom';
  time_period_min?: string;
  time_period_max?: string;
  nfpr?: '0' | '1';
  filter?: '0' | '1';
  safe?: 'active' | 'off';
  page?: number;
  max_page?: number;
  num?: number;
  web_filter?: boolean;
  tbs?: string;
  knowledge_graph_id?: string;
  order_online?: boolean;
  flatten_results?: boolean;
  include_answer_box?: boolean;
  ads_optimized?: boolean;
  fields?: string[];
  include_ai_overview?: boolean;
  location_auto?: boolean;
  uule?: string;
}

export interface NewsSearchParams extends Omit<SearchParams, 'include_ai_overview' | 'web_filter' | 'order_online' | 'flatten_results' | 'include_answer_box' | 'ads_optimized' | 'fields' | 'knowledge_graph_id'> {
  search_type: 'news';
  sort_by?: 'relevance' | 'date';
  show_duplicates?: boolean;
  exclude_if_modified?: boolean;
}

export interface ImageSearchParams extends Omit<SearchParams, 'include_ai_overview' | 'web_filter' | 'order_online' | 'flatten_results' | 'include_answer_box' | 'ads_optimized' | 'fields' | 'knowledge_graph_id' | 'nfpr' | 'filter'> {
  search_type: 'images';
  images_page?: number;
  images_color?: 'any' | 'black_and_white' | 'transparent' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'purple' | 'pink' | 'white' | 'gray' | 'black' | 'brown';
  images_size?: 'large' | 'medium' | 'icon';
  images_type?: 'clipart' | 'line_drawing' | 'gif';
  images_usage?: 'non_commercial_reuse_with_modification' | 'non_commercial_reuse';
}

export interface VideoSearchParams extends Omit<SearchParams, 'include_ai_overview' | 'web_filter' | 'order_online' | 'flatten_results' | 'include_answer_box' | 'ads_optimized' | 'fields' | 'knowledge_graph_id'> {
  search_type: 'videos';
}

export interface ValueSerpResponse {
  search_metadata: {
    id: string;
    status: string;
    json_endpoint: string;
    created_at: string;
    processed_at: string;
    google_url: string;
    raw_html_file: string;
    total_time_taken: number;
  };
  search_parameters: Record<string, any>;
  search_information?: {
    total_results?: number;
    time_taken_displayed?: number;
    query_displayed?: string;
  };
  organic_results?: Array<{
    position: number;
    title: string;
    link: string;
    displayed_link: string;
    snippet: string;
  }>;
  news_results?: Array<{
    position: number;
    title: string;
    link: string;
    source: string;
    date: string;
    snippet?: string;
    thumbnail?: string;
  }>;
  images_results?: Array<{
    position: number;
    thumbnail: string;
    original: string;
    title: string;
    link: string;
    source: string;
  }>;
  videos_results?: Array<{
    position: number;
    title: string;
    link: string;
    displayed_link: string;
    thumbnail: string;
    duration: string;
    published_date: string;
    views: string;
    snippet?: string;
  }>;
}