export interface Item {
  id?: number;
  price: number | "";
  path: string;
  item_metadata: {
    resolution?: string;
    filesize?: string;
    [key: string]: any;
  };
}

export interface Content {
  id: number;
  title: string;
  description?: string;
  type: "movies" | "games" | "music" | "ebooks" | "softwares";
  genre: string[];
  cover_image?: string;
  trailer?: string;
  content_metadata: {
    [key: string]: string | number | undefined;
  };
  created_date: string; // ISO string for DateTime
  updated_date: string; // ISO string for DateTime
  items: Item[];
}

export interface Movie extends Content {
  type: "movies";
  content_metadata: {
    director?: string;
    release_year?: number;
    duration_minutes?: number;
  };
}

export interface Game extends Content {
  type: "games";
  content_metadata: {
    studio?: string;
  };
}

export interface Music extends Content {
  type: "music";
  content_metadata: {
    artist?: string;
  };
}

export interface Ebook extends Content {
  type: "ebooks";
  content_metadata: {
    author?: string;
  };
}

export interface Software extends Content {
  type: "softwares";
  content_metadata: {
    size?: string;
  };
}
