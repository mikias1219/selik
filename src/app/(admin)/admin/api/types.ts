export type ContentType =
  | "movies"
  | "games"
  | "music"
  | "ebooks"
  | "softwares"
  | "stats";

// Item corresponds to your Items table
export interface Item {
  id?: number;
  content_id?: number;
  title?: string;
  price?: number | "";
  path?: string;
  item_metadata?: {
    resolution?: string;
    duration?: string;
    bitrate?: string;
    filesize?: number;
  } | null;
  allow_preview?: boolean;
  created_date?: string; // ISO string datetime
  updated_date?: string;
}

// Contents corresponds to your Contents table
export interface ContentResponse {
  id: number;
  title: string;
  description?: string | null;
  type: ContentType | string; // your model uses string for type
  genre: string[]; // JSON stored array of strings
  cover_image?: string | null;
  trailer?: string | null;
  content_metadata?: {
    director?: string;
    release_year?: number | "";
    duration_minutes?: number | "";
    is_series?: boolean;
    episodes?: number | "";
    studio?: string;
    engine?: string;
    platform?: string;
    artist?: string;
    is_album?: boolean;
    number_of_tracks?: number | "";
    author?: string;
    language?: string;
    pages?: number | "";
    version?: string;
    developer?: string;
    os_compatibility?: string;
  } | null;
  created_date: string; // ISO string datetime
  updated_date: string;
  items: Item[]; // related items loaded via relationship
}

export interface Movie extends ContentResponse {
  type: "movies";
  content_metadata?: {
    director?: string;
    release_year?: number | "";
    duration_minutes?: number | "";
    is_series?: boolean;
    episodes?: number | "";
  };
}

export interface Game extends ContentResponse {
  type: "games";
  content_metadata?: {
    studio?: string;
    engine?: string;
    platform?: string;
  };
}

export interface Music extends ContentResponse {
  type: "music";
  content_metadata?: {
    artist?: string;
    is_album?: boolean;
    number_of_tracks?: number | "";
  };
}

export interface Ebook extends ContentResponse {
  type: "ebooks";
  content_metadata?: {
    author?: string;
    language?: string;
    pages?: number | "";
  };
}

export interface Software extends ContentResponse {
  type: "softwares";
  content_metadata?: {
    version?: string;
    developer?: string;
    os_compatibility?: string;
  };
}

// For creating a content, omit id and dates, items might be separately handled
export interface ContentCreate {
  title: string;
  description?: string;
  type: ContentType | string;
  genre: string[]; // genre is required in your model
  cover_image?: string;
  trailer?: string;
  content_metadata?: {
    director?: string;
    release_year?: number | "";
    duration_minutes?: number | "";
    is_series?: boolean;
    episodes?: number | "";
    studio?: string;
    engine?: string;
    platform?: string;
    artist?: string;
    is_album?: boolean;
    number_of_tracks?: number | "";
    author?: string;
    language?: string;
    pages?: number | "";
    version?: string;
    developer?: string;
    os_compatibility?: string;
  };
}

// Partial fields allowed for update
export interface ContentUpdate {
  title?: string;
  description?: string;
  type?: ContentType | string;
  genre?: string[];
  cover_image?: string;
  trailer?: string;
  content_metadata?: {
    director?: string;
    release_year?: number | "";
    duration_minutes?: number | "";
    is_series?: boolean;
    episodes?: number | "";
    studio?: string;
    engine?: string;
    platform?: string;
    artist?: string;
    is_album?: boolean;
    number_of_tracks?: number | "";
    author?: string;
    language?: string;
    pages?: number | "";
    version?: string;
    developer?: string;
    os_compatibility?: string;
  };
}

// Pagination info
export interface PaginationMeta {
  total: number;
  offset: number;
  limit: number;
}

export interface PaginatedContentListResponse {
  items: ContentResponse[];
  meta: PaginationMeta;
}
