"use client";

import { useState, useEffect, useCallback } from "react";
import { fetcher } from "../../lib/api/auth";

interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Plot?: string;
  imdbRating?: string;
  rating: number;
  imdbVotes?: string;
  Trailer?: string;
  Released?: string;
  Genre: string;
  Type: "movie" | "series" | "documentary";
  Language?: string;
  source: "backend" | "omdb";
  content_id?: number; // Add for backend movies
}

interface PaginatedContentListResponse {
  items: Array<{
    id: number;
    title: string;
    description: string;
    type: string;
    genre: string[];
    cover_image: string;
    trailer: string;
    content_metadata: {
      director: string;
      release_year: number;
      duration_minutes: number;
      is_series?: boolean;
    };
    created_date: string;
    updated_date: string;
    items: Array<{
      id: number;
      content_id: number;
      price: string;
      path: string;
      item_metadata: {
        resolution: string;
        filesize: number;
      };
      allow_preview: boolean;
      created_date: string;
      updated_date: string;
    }>;
  }>;
  total_items: number;
  total_pages: number;
}

export function useMoviesAndContent(
  searchQuery: string,
  selectedCategories: string[],
  page: number
) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const OMDB_API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY;

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    let backendMovies: Movie[] = [];
    let omdbMovies: Movie[] = [];
    let hasMoreBackend = false;
    let hasMoreOmdb = false;

    // 1. Fetch from backend
    try {
      const limit = 10;
      const offset = (page - 1) * limit;
      const token =
        (typeof window !== "undefined" &&
          (localStorage.getItem("user_token") ||
            localStorage.getItem("admin_token"))) ||
        "";

      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const queryParams = new URLSearchParams({
        offset: offset.toString(),
        limit: limit.toString(),
        ...(searchQuery && { title: searchQuery }),
        ...(selectedCategories.length > 0 && {
          genres: selectedCategories.join(","),
        }),
      });

      const endpoint = `/user/contents/movie?${queryParams}`;
      console.log(
        `Fetching movies from: ${API_URL}${endpoint} with token: ${token.slice(
          0,
          10
        )}...`
      );

      const data: PaginatedContentListResponse =
        await fetcher<PaginatedContentListResponse>(
          endpoint,
          { method: "GET" },
          token
        );

      backendMovies = data.items.map((item) => {
        console.log(`Backend movie: ${item.title} (ID: ${item.id})`);
        return {
          imdbID: item.id.toString(), // Use content_id as imdbID for routing compatibility
          content_id: item.id, // Store actual content_id
          Title: item.title,
          Year: item.content_metadata.release_year.toString(),
          Poster: item.cover_image || "/placeholder-image.jpg",
          Plot: item.description,
          imdbRating: "",
          rating: 0,
          imdbVotes: "",
          Trailer: item.trailer,
          Released: item.content_metadata.release_year.toString(),
          Genre: item.genre.join(", "),
          Type: item.type as "movie" | "series" | "documentary",
          Language: "",
          source: "backend" as const,
        };
      });

      hasMoreBackend = page < data.total_pages;
      console.log(
        `Backend movies fetched: ${backendMovies.length}, hasMore: ${hasMoreBackend}`
      );
    } catch (error: any) {
      const errorMessage = error.message.includes("timed out")
        ? `Backend request to ${API_URL}/user/contents/movie timed out. Check server availability or increase timeout.`
        : error.message || "Failed to fetch movies from backend";
      console.error(
        `Error fetching movies from ${API_URL}/user/contents/movie:`,
        errorMessage
      );
      setError(errorMessage);
    }

    // 2. Fetch from OMDB API
    if (OMDB_API_KEY) {
      try {
        console.log("Fetching from OMDB API for search:", searchQuery);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const searchTerms = searchQuery
          ? [searchQuery.trim()]
          : [
              "Star Wars",
              "Avengers",
              "Inception",
              "The Godfather",
              "Titanic",
              "Breaking Bad",
              "Stranger Things",
              "Planet Earth",
              "Parasite",
              "Chernobyl",
            ];

        let allOmdbMovies: any[] = [];

        for (const term of searchTerms) {
          const response = await fetch(
            `https://www.omdbapi.com/?s=${encodeURIComponent(
              term
            )}&type=movie&page=${page}&apikey=${OMDB_API_KEY}`,
            { signal: controller.signal }
          );

          if (!response.ok) {
            throw new Error(`OMDB API fetch failed: ${response.statusText}`);
          }

          const data = await response.json();
          console.log(`OMDB API response for term "${term}":`, data);

          if (data.Response === "True" && Array.isArray(data.Search)) {
            allOmdbMovies.push(...data.Search);
            const totalResults = parseInt(data.totalResults || "0", 10);
            hasMoreOmdb = page * 10 < totalResults;
          } else {
            console.warn(
              `No results for term "${term}": ${data.Error || "Unknown error"}`
            );
          }
        }

        clearTimeout(timeoutId);

        const uniqueOmdbMovies = Array.from(
          new Map(allOmdbMovies.map((movie) => [movie.imdbID, movie])).values()
        );

        omdbMovies = await Promise.all(
          uniqueOmdbMovies.slice(0, 15).map(async (movie: any) => {
            try {
              const detailsResponse = await fetch(
                `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${OMDB_API_KEY}`,
                { signal: controller.signal }
              );
              const details = await detailsResponse.json();

              if (details.Response === "False") {
                console.warn(
                  `No details for movie ${movie.imdbID}: ${details.Error}`
                );
                return null;
              }

              const rating = parseFloat(details.imdbRating) || 0;
              const votes =
                parseInt(details.imdbVotes?.replace(/,/g, "") || "0") || 0;

              const movieData = {
                imdbID: movie.imdbID,
                Title: movie.Title,
                Year: movie.Year,
                Poster:
                  details.Poster !== "N/A" && details.Poster
                    ? details.Poster
                    : "/placeholder-image.jpg",
                Plot: details.Plot || "",
                imdbRating: details.imdbRating || "",
                rating: rating,
                imdbVotes: details.imdbVotes || "",
                Trailer: "",
                Released: details.Released || "",
                Genre: details.Genre || "",
                Type: (details.Type || movie.Type || "movie") as
                  | "movie"
                  | "series"
                  | "documentary",
                Language: details.Language || "English",
                source: "omdb" as const,
              };
              console.log(
                `OMDB movie fetched: ${movieData.Title} (${movieData.imdbID})`
              );
              return movieData;
            } catch (error: any) {
              console.warn(
                `Error fetching details for movie ${movie.imdbID}:`,
                error.message
              );
              return null;
            }
          })
        );

        omdbMovies = omdbMovies.filter((m): m is Movie => m !== null);
        console.log(
          `OMDB movies fetched: ${omdbMovies.length}, hasMore: ${hasMoreOmdb}`
        );
      } catch (omdbError: any) {
        clearTimeout(timeoutId);
        const omdbErrorMessage =
          omdbError.name === "AbortError"
            ? "OMDB request timed out after 10 seconds. Check network or API availability."
            : omdbError.message.includes("Invalid API key")
            ? "Invalid OMDB API key. Please check NEXT_PUBLIC_OMDB_API_KEY configuration."
            : omdbError.message || "Failed to fetch OMDB movies";
        console.error("OMDB fetch failed:", omdbErrorMessage);
        if (!error) {
          setError(omdbErrorMessage);
        }
      }
    } else {
      console.warn("OMDB API key not set, skipping OMDB fetch");
      if (!error) {
        setError(
          "OMDB API key is missing. Please configure NEXT_PUBLIC_OMDB_API_KEY."
        );
      }
    }

    // 3. Merge movies, prioritizing backend data for duplicates
    const combinedMovies = [...backendMovies, ...omdbMovies].reduce(
      (acc, movie) => {
        const existing = acc.find((m) => m.imdbID === movie.imdbID);
        if (!existing) {
          acc.push(movie);
        } else if (movie.source === "backend") {
          acc = acc.filter((m) => m.imdbID !== movie.imdbID);
          acc.push(movie);
        }
        return acc;
      },
      [] as Movie[]
    );

    // 4. Filter by categories
    const filteredMovies = combinedMovies.filter((movie) => {
      if (selectedCategories.length === 0) return true;

      const isSeries =
        selectedCategories.includes("Series") && movie.Type === "series";
      const isDocumentary =
        selectedCategories.includes("Documentary") &&
        movie.Genre.toLowerCase().includes("documentary");
      const isTranslated =
        selectedCategories.includes("Translated Movies") &&
        movie.Type === "movie" &&
        movie.Language &&
        !movie.Language.toLowerCase().includes("english");

      return isSeries || isDocumentary || isTranslated;
    });

    // 5. Sort by rating and votes
    const sortedMovies = filteredMovies.sort((a, b) => {
      const scoreA =
        (a.rating || 0) * 1000 +
        (parseInt(a.imdbVotes?.replace(/,/g, "") || "0") || 0);
      const scoreB =
        (b.rating || 0) * 1000 +
        (parseInt(b.imdbVotes?.replace(/,/g, "") || "0") || 0);
      return scoreB - scoreA;
    });

    setMovies((prev) =>
      page === 1 ? sortedMovies : [...prev, ...sortedMovies]
    );
    setHasMore(hasMoreBackend || hasMoreOmdb);
    setLoading(false);
  }, [searchQuery, selectedCategories, page, API_URL, OMDB_API_KEY]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  return { movies, hasMore, loading, error };
}
