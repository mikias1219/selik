import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { ContentResponse, ContentCreate, ContentUpdate } from "../api/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/admin";

export function getApiContentType(contentTypePlural: string): string {
  const mapping: Record<string, string> = {
    series: "series",
    movies: "movie",
    games: "game",
    music: "music",
    ebooks: "book",
    softwares: "software",
  };
  return mapping[contentTypePlural] || contentTypePlural.slice(0, -1);
}

export interface MediaFormData {
  id?: number | string;
  title: string;
  description?: string;
  genre: string[];
  cover_image?: string;
  trailer?: string;
  content_metadata: {
    [key: string]: string | number | boolean | undefined;
    director?: string;
    release_year?: number | "";
    duration_minutes?: number | "";
    is_series?: boolean;
    episodes?: number | "";
    studio?: string;
    artist?: string;
    is_album?: boolean;
    number_of_tracks?: number | "";
    author?: string;
    language?: string;
    pages?: number | "";
    version?: string;
    developer?: string;
    os_compatibility?: string;
    engine?: string;
    platform?: string;
  };
  items: Array<{
    id?: number;
    title?: string;
    price?: number | "";
    path?: string;
    item_metadata?: {
      resolution?: string;
      duration?: string;
      bitrate?: string;
      filesize?: number;
    };
  }>;
}

export function useMediaManager<T extends ContentResponse>(
  contentTypePlural: string,
  tokenFromProps?: string,
  filters?: {
    search?: string;
    genres?: string[];
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const contentType = getApiContentType(contentTypePlural);

  const token =
    tokenFromProps ||
    (typeof window !== "undefined" ? localStorage.getItem("admin_token") : "");

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  const fallbackGenres = useMemo(
    () => ({
      movie: [
        "Action",
        "Comedy",
        "Drama",
        "Horror",
        "Sci-Fi",
        "Romance",
        "Thriller",
        "Adventure",
        "Fantasy",
        "Mystery",
      ],
      series: [
        "Action",
        "Comedy",
        "Drama",
        "Horror",
        "Sci-Fi",
        "Romance",
        "Thriller",
        "Adventure",
        "Fantasy",
        "Mystery",
      ],
      game: [
        "Action",
        "Adventure",
        "RPG",
        "Strategy",
        "Simulation",
        "Sports",
        "Puzzle",
        "Shooter",
        "Racing",
      ],
      music: [
        "Rock",
        "Pop",
        "Jazz",
        "Classical",
        "Hip-Hop",
        "Electronic",
        "Country",
        "Blues",
        "Folk",
      ],
      book: [
        "Fiction",
        "Non-Fiction",
        "Mystery",
        "Sci-Fi",
        "Fantasy",
        "Romance",
        "Thriller",
        "Biography",
        "History",
      ],
      software: [
        "Productivity",
        "Creative",
        "Utility",
        "Educational",
        "Entertainment",
      ],
    }),
    []
  );

  const fetchContent = async () => {
    if (!token) {
      setError("No authentication token found. Please log in.");
      setData([]);
      setGenres(fallbackGenres[contentType] || []);
      setLoading(false);
      console.warn("fetchContent: No token provided");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params: Record<string, any> = {
        offset: 0,
        limit: 50,
      };

      if (filters?.search?.trim() && filters.search.trim().length >= 2) {
        params.search = filters.search.trim();
        console.log("fetchContent: Search param:", params.search);
      }

      if (filters?.genres?.length) {
        params.genres = filters.genres
          .filter((g) => g.trim())
          .map((g) => g.charAt(0).toUpperCase() + g.slice(1).toLowerCase())
          .join(",");
        console.log("fetchContent: Genres filter:", params.genres);
      }

      console.log("fetchContent: Fetching content with params:", {
        contentTypePlural,
        contentType,
        params,
      });

      let unfilteredItems: T[] = [];
      if (contentTypePlural === "movies") {
        let movieItems: T[] = [];
        let seriesItems: T[] = [];

        const [moviesRes, seriesRes] = await Promise.all([
          axios
            .get(`${API_URL}/contents/movie`, {
              headers: getHeaders(),
              params,
            })
            .catch((err: any) => {
              console.error("fetchContent: Failed to fetch movies:", err);
              return { data: { items: [] } };
            }),
          axios
            .get(`${API_URL}/contents/series`, {
              headers: getHeaders(),
              params,
            })
            .catch((err: any) => {
              console.error("fetchContent: Failed to fetch series:", err);
              return { data: { items: [] } };
            }),
        ]);

        movieItems = Array.isArray(moviesRes.data?.items)
          ? moviesRes.data.items
          : [];
        seriesItems = Array.isArray(seriesRes.data?.items)
          ? seriesRes.data.items
          : [];

        unfilteredItems = [...movieItems, ...seriesItems];
        console.log(
          "fetchContent: Combined items (movies + series):",
          unfilteredItems.length
        );
      } else {
        const res = await axios.get(`${API_URL}/contents/${contentType}`, {
          headers: getHeaders(),
          params,
        });
        unfilteredItems = Array.isArray(res.data?.items) ? res.data.items : [];
        console.log(
          `fetchContent: ${contentType} items:`,
          unfilteredItems.length
        );
      }

      const allGenres = unfilteredItems
        .filter((item: any) => Array.isArray(item.genre))
        .flatMap((item: any) => item.genre)
        .filter(
          (genre): genre is string => typeof genre === "string" && !!genre
        )
        .map((g) => g.charAt(0).toUpperCase() + g.slice(1).toLowerCase());
      const uniqueGenres = [...new Set(allGenres)];
      setGenres(
        uniqueGenres.length > 0
          ? uniqueGenres
          : fallbackGenres[contentType] || []
      );

      const filteredItems = unfilteredItems.filter((item: any) => {
        if (!filters?.genres?.length) return true;
        const itemGenres = Array.isArray(item.genre)
          ? item.genre.map(
              (g: string) =>
                g.charAt(0).toUpperCase() + g.slice(1).toLowerCase()
            )
          : [];
        return filters.genres.every((genre) => itemGenres.includes(genre));
      });

      setData(filteredItems);
    } catch (err: any) {
      console.error("fetchContent: Error:", err);
      setError(
        err.response?.data?.detail || err.message || "Failed to load content."
      );
      setData([]);
      setGenres(fallbackGenres[contentType] || []);
    } finally {
      setLoading(false);
    }
  };

  const memoizedFetchContent = useCallback(fetchContent, [
    contentTypePlural,
    token,
    filters?.search,
    filters?.genres,
  ]);

  const createContent = async (payload: ContentCreate) => {
    try {
      const endpointType =
        contentTypePlural === "movies" && payload.content_metadata?.is_series
          ? "series"
          : contentType;

      const normalizedPayload = {
        ...payload,
        genre: payload.genre
          .filter((g) => g.trim())
          .map((g) => g.charAt(0).toUpperCase() + g.slice(1).toLowerCase()),
        content_metadata: payload.content_metadata
          ? Object.fromEntries(
              Object.entries(payload.content_metadata).filter(
                ([_, value]) => value !== undefined && value !== ""
              )
            )
          : undefined,
        items: payload.items
          ?.map((item) => ({
            ...item,
            price: item.price === "" ? undefined : item.price,
            item_metadata: item.item_metadata
              ? Object.fromEntries(
                  Object.entries(item.item_metadata).filter(
                    ([_, value]) => value !== undefined && value !== ""
                  )
                )
              : undefined,
          }))
          .filter((item) => item.title || item.price || item.path),
      };

      console.log("createContent: Sending payload:", normalizedPayload);
      const res = await axios.post(
        `${API_URL}/contents/${endpointType}`,
        normalizedPayload,
        { headers: getHeaders() }
      );
      console.log("createContent: Response:", res.data);
      setData((prev) => [...prev, res.data as T]);
      if (Array.isArray(res.data.genre)) {
        setGenres((prev) => {
          const newGenres = [
            ...new Set([
              ...prev,
              ...res.data.genre.map(
                (g: string) =>
                  g.charAt(0).toUpperCase() + g.slice(1).toLowerCase()
              ),
            ]),
          ];
          return newGenres.length > 0
            ? newGenres
            : fallbackGenres[contentType] || [];
        });
      }
      return res.data;
    } catch (err: any) {
      console.error("createContent: Error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      const errorMessage =
        err.response?.data?.detail || err.message || "Failed to create content";
      throw new Error(errorMessage);
    }
  };

  const updateContent = async (
    id: number | string,
    payload: Partial<ContentUpdate>
  ) => {
    try {
      const endpointType =
        contentTypePlural === "movies" && payload.content_metadata?.is_series
          ? "series"
          : contentType;

      const normalizedPayload = {
        ...payload,
        genre: payload.genre
          ? payload.genre
              .filter((g) => g.trim())
              .map((g) => g.charAt(0).toUpperCase() + g.slice(1).toLowerCase())
          : undefined,
        content_metadata: payload.content_metadata
          ? Object.fromEntries(
              Object.entries(payload.content_metadata).filter(
                ([_, value]) => value !== undefined && value !== ""
              )
            )
          : undefined,
        items: payload.items
          ?.map((item) => ({
            ...item,
            price: item.price === "" ? undefined : item.price,
            item_metadata: item.item_metadata
              ? Object.fromEntries(
                  Object.entries(item.item_metadata).filter(
                    ([_, value]) => value !== undefined && value !== ""
                  )
                )
              : undefined,
          }))
          .filter((item) => item.title || item.price || item.path),
      };

      console.log(
        "updateContent: Sending payload for id",
        id,
        ":",
        normalizedPayload
      );
      const res = await axios.patch(
        `${API_URL}/contents/${endpointType}/${id}`,
        normalizedPayload,
        { headers: getHeaders() }
      );
      console.log("updateContent: Response:", res.data);
      setData((prev) =>
        prev.map((item) => (item.id === id ? (res.data as T) : item))
      );
      if (Array.isArray(res.data.genre)) {
        setGenres((prev) => {
          const allGenres = [
            ...prev,
            ...res.data.genre.map(
              (g: string) =>
                g.charAt(0).toUpperCase() + g.slice(1).toLowerCase()
            ),
            ...data
              .filter((item) => item.id !== id)
              .filter((item: any) => Array.isArray(item.genre))
              .flatMap((item: any) => item.genre)
              .map(
                (g: string) =>
                  g.charAt(0).toUpperCase() + g.slice(1).toLowerCase()
              ),
          ];
          const newGenres = [...new Set(allGenres)];
          return newGenres.length > 0
            ? newGenres
            : fallbackGenres[contentType] || [];
        });
      }
      return res.data;
    } catch (err: any) {
      console.error("updateContent: Error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      const errorMessage =
        err.response?.data?.detail || err.message || "Failed to update content";
      throw new Error(errorMessage);
    }
  };

  const deleteContent = async (id: number | string) => {
    try {
      const itemToDelete = data.find((item) => item.id === id) as
        | ContentResponse
        | undefined;
      const isSeries =
        contentTypePlural === "movies" &&
        itemToDelete?.content_metadata?.is_series;

      const endpointType = isSeries ? "series" : contentType;

      console.log("deleteContent: Deleting id", id, "from", endpointType);
      await axios.delete(`${API_URL}/contents/${endpointType}/${id}`, {
        headers: getHeaders(),
      });
      console.log("deleteContent: Success for id", id);
      setData((prev) => prev.filter((item) => item.id !== id));
      const remainingGenres = data
        .filter((item) => item.id !== id)
        .filter((item: any) => Array.isArray(item.genre))
        .flatMap((item: any) => item.genre)
        .filter(
          (genre): genre is string => !!genre && typeof genre === "string"
        )
        .map((g) => g.charAt(0).toUpperCase() + g.slice(1).toLowerCase());
      const uniqueGenres = [...new Set(remainingGenres)];
      setGenres(
        uniqueGenres.length > 0
          ? uniqueGenres
          : fallbackGenres[contentType] || []
      );
    } catch (err: any) {
      console.error("deleteContent: Error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      const errorMessage =
        err.response?.data?.detail || err.message || "Failed to delete content";
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    console.log("useMediaManager: Triggering fetchContent with", {
      contentTypePlural,
      contentType,
      token: token ? "[present]" : "[missing]",
      filters,
    });
    memoizedFetchContent();
  }, [memoizedFetchContent]);

  return {
    data,
    setData,
    genres,
    error,
    loading,
    reload: memoizedFetchContent,
    createContent,
    updateContent,
    deleteContent,
  };
}
