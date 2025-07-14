"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import MovieTrailer from "@/components/MovieTrailer";
import SeriesEpisodes from "@/components/SeriesEpisodes";
import WatchlistButton from "@/components/WatchListButton";
import { fetcher } from "@/lib/api/auth";

const trailerCache = new Map<string, string | null>();

interface Episode {
  Title: string;
  Episode: string;
  imdbID: string;
  Released: string;
  Poster: string;
}

interface Season {
  Season: string;
  Episodes: Episode[];
}

interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Plot?: string;
  imdbRating?: string;
  Trailer?: string;
  Director?: string;
  Actors?: string;
  Genre?: string;
  Runtime?: string;
  Released?: string;
  Type?: "movie" | "series" | "documentary";
  totalSeasons?: string;
  Seasons?: Season[];
  content_id?: number;
  source?: "backend" | "omdb";
}

async function fetchTrailerSmart(
  imdbID: string,
  title: string,
  type: "movie" | "series" | "documentary" = "movie",
  backendTrailer?: string
): Promise<string | null> {
  const cacheKey = `${imdbID}-${type}`;
  if (trailerCache.has(cacheKey)) {
    console.log(
      `Returning cached trailer for ${title} (${imdbID}): ${trailerCache.get(
        cacheKey
      )}`
    );
    return trailerCache.get(cacheKey) || null;
  }

  console.log(`Fetching trailer for ${title} (${imdbID})`);

  // For backend movies, prioritize backend trailer
  if (backendTrailer && backendTrailer.includes("youtube.com")) {
    const videoId = backendTrailer.match(
      /(?:watch\?v=|youtu\.be\/)([^&]+)/
    )?.[1];
    if (videoId) {
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      console.log(`Using backend trailer for ${imdbID}: ${embedUrl}`);
      trailerCache.set(cacheKey, embedUrl);
      return embedUrl;
    }
    console.warn(
      `Invalid backend trailer URL for ${imdbID}: ${backendTrailer}`
    );
  }

  // Use YouTube Data API for OMDB movies
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  if (apiKey) {
    try {
      const query = encodeURIComponent(`${title} official trailer ${type}`);
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${apiKey}`;
      const response = await fetch(searchUrl, {
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) {
        console.warn(
          `YouTube API search failed for ${imdbID}: ${response.status} ${response.statusText}`
        );
        throw new Error(`YouTube API failed: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const videoId = data.items[0].id.videoId;
        if (videoId) {
          const embedUrl = `https://www.youtube.com/embed/${videoId}`;
          console.log(`YouTube API trailer found for ${imdbID}: ${embedUrl}`);
          trailerCache.set(cacheKey, embedUrl);
          return embedUrl;
        }
      }
      console.warn(`No YouTube API trailer found for ${imdbID}`);
    } catch (error) {
      console.error(`YouTube API trailer fetch failed for ${imdbID}:`, error);
    }
  } else {
    console.warn(`YouTube API key missing for ${imdbID}, skipping API search`);
  }

  // Fallback to manual trailer for OMDB movies if API fails or no key
  console.warn(`No trailer found for ${imdbID}`);
  trailerCache.set(cacheKey, null);
  return null;
}

async function fetchBackendMovieDetails(id: string): Promise<Movie | null> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const token =
    typeof window !== "undefined" &&
    (localStorage.getItem("user_token") || localStorage.getItem("admin_token"));

  if (!token) {
    console.warn("No authentication token found for backend fetch");
    return null;
  }

  try {
    const response = await fetcher(
      `/user/contents/movie/${id}`,
      { method: "GET" },
      token
    );
    const data = response as {
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
    };

    const trailerUrl = await fetchTrailerSmart(
      id,
      data.title || "Unknown",
      data.type || "movie",
      data.trailer
    );

    return {
      imdbID: data.id.toString(),
      content_id: data.id,
      Title: data.title || "Unknown Title",
      Year: data.content_metadata.release_year.toString() || "N/A",
      Poster: data.cover_image || "/placeholder-image.jpg",
      Plot: data.description || "No plot available",
      imdbRating: "N/A",
      Director: data.content_metadata.director || "N/A",
      Actors: "N/A",
      Genre: data.genre.join(", ") || "N/A",
      Runtime: `${data.content_metadata.duration_minutes} min` || "N/A",
      Released: data.content_metadata.release_year.toString() || "N/A",
      Type: (data.type || "movie") as "movie" | "series" | "documentary",
      totalSeasons: data.content_metadata.is_series ? "1" : undefined,
      Seasons: data.content_metadata.is_series
        ? [{ Season: "1", Episodes: [] }]
        : [],
      Trailer: trailerUrl,
      source: "backend",
    };
  } catch (error) {
    console.error(`Backend movie fetch failed for ID ${id}:`, error);
    return null;
  }
}

async function fetchOmdbMovieDetails(imdbID: string): Promise<Movie | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(
      `https://www.omdbapi.com/?i=${imdbID}&apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(
        `OMDB API fetch failed for imdbID ${imdbID}: ${response.statusText}`
      );
      return null;
    }
    const data = await response.json();
    if (data.Response === "False") {
      console.error(`OMDB API error for imdbID ${imdbID}: ${data.Error}`);
      return null;
    }

    const trailerUrl = await fetchTrailerSmart(
      imdbID,
      data.Title || "Unknown",
      data.Type || "movie"
    );

    const seasons: Season[] = [];
    if (data.Type === "series" && data.totalSeasons) {
      for (let s = 1; s <= parseInt(data.totalSeasons); s++) {
        const seasonRes = await fetch(
          `https://www.omdbapi.com/?i=${imdbID}&Season=${s}&apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}`,
          { signal: AbortSignal.timeout(10000) }
        );
        const seasonData = await seasonRes.json();
        if (seasonData.Response === "True" && seasonData.Episodes) {
          seasons.push({
            Season: s.toString(),
            Episodes: seasonData.Episodes.map((ep: any) => ({
              Title: ep.Title || "Untitled Episode",
              Episode: ep.Episode || "N/A",
              imdbID: ep.imdbID || `${imdbID}-S${s}E${ep.Episode}`,
              Released: ep.Released || "N/A",
              Poster:
                data.Poster && data.Poster !== "N/A"
                  ? data.Poster
                  : "/placeholder-image.jpg",
            })),
          });
        }
      }
    }

    return {
      imdbID,
      Title: data.Title || "Unknown Title",
      Year: data.Year || "N/A",
      Poster:
        data.Poster && data.Poster !== "N/A"
          ? data.Poster
          : "/placeholder-image.jpg",
      Plot: data.Plot || "No plot available",
      imdbRating: data.imdbRating || "N/A",
      Director: data.Director || "N/A",
      Actors: data.Actors || "N/A",
      Genre: data.Genre || "N/A",
      Runtime: data.Runtime || "N/A",
      Released: data.Released || "N/A",
      Type: (data.Type || "movie") as "movie" | "series" | "documentary",
      totalSeasons: data.totalSeasons,
      Seasons: seasons,
      Trailer: trailerUrl,
      source: "omdb",
    };
  } catch (err) {
    console.error(`OMDB fetch failed for ${imdbID}:`, err);
    return null;
  }
}

async function fetchSimilarMovies(
  genre: string | undefined,
  currentImdbID: string,
  type: "movie" | "series" | "documentary" = "movie"
) {
  if (!genre) {
    console.warn(
      `No genre provided for similar movies, falling back for ${currentImdbID}`
    );
    return await fetchFallbackSimilarMovies(currentImdbID);
  }
  const searchTerms = genre
    .split(",")
    .map((g) => g.trim())
    .slice(0, 2);
  let similarMovies: Movie[] = [];

  for (const searchTerm of searchTerms) {
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?s=${encodeURIComponent(
          searchTerm
        )}&type=${type}&apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (!response.ok) {
        console.warn(
          `OMDB API fetch failed for genre ${searchTerm}: ${response.statusText}`
        );
        continue;
      }
      const data = await response.json();
      if (data.Response === "True") {
        const filteredMovies = (data.Search || [])
          .filter((movie: Movie) => movie.imdbID !== currentImdbID)
          .map((movie: Movie) => ({
            ...movie,
            Poster:
              movie.Poster && movie.Poster !== "N/A"
                ? movie.Poster
                : "/placeholder-image.jpg",
            Type: (movie.Type || "movie") as "movie" | "series" | "documentary",
          }))
          .slice(0, 4 - similarMovies.length);
        similarMovies.push(...filteredMovies);
      } else {
        console.warn(`No results for genre ${searchTerm}: ${data.Error}`);
      }
    } catch (error) {
      console.error(
        `fetchSimilarMovies failed for genre ${searchTerm}:`,
        error
      );
    }
    if (similarMovies.length >= 4) break;
  }

  if (similarMovies.length < 4) {
    console.log(`Fetching fallback similar movies for ${currentImdbID}`);
    const fallbackMovies = await fetchFallbackSimilarMovies(
      currentImdbID,
      similarMovies.map((m) => m.imdbID)
    );
    similarMovies.push(...fallbackMovies);
  }

  return similarMovies.slice(0, 4);
}

async function fetchFallbackSimilarMovies(
  currentImdbID: string,
  excludeIds: string[] = []
) {
  const fallbackTerms = ["popular", "recommended", "new release"];
  let fallbackMovies: Movie[] = [];

  for (const term of fallbackTerms) {
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?s=${encodeURIComponent(
          term
        )}&type=movie&apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (!response.ok) {
        console.warn(
          `OMDB API fetch failed for term ${term}: ${response.statusText}`
        );
        continue;
      }
      const data = await response.json();
      if (data.Response === "True") {
        const filteredMovies = (data.Search || [])
          .filter(
            (movie: Movie) =>
              movie.imdbID !== currentImdbID &&
              !excludeIds.includes(movie.imdbID)
          )
          .map((movie: Movie) => ({
            ...movie,
            Poster:
              movie.Poster && movie.Poster !== "N/A"
                ? movie.Poster
                : "/placeholder-image.jpg",
            Type: (movie.Type || "movie") as "movie" | "series" | "documentary",
          }))
          .slice(0, 4 - fallbackMovies.length);
        fallbackMovies.push(...filteredMovies);
      } else {
        console.warn(`No results for term ${term}: ${data.Error}`);
      }
    } catch (error) {
      console.error(
        `fetchFallbackSimilarMovies failed for term ${term}:`,
        error
      );
    }
    if (fallbackMovies.length >= 4) break;
  }

  return fallbackMovies.slice(0, 4);
}

export default function MovieDetailsPage() {
  const router = useRouter();
  const { imdbID } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!imdbID) return;

    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        console.log(`Fetching details for ID: ${imdbID}`);

        // Check if imdbID is a backend content_id (integer string)
        const isBackendId = /^\d+$/.test(imdbID as string);
        let movieData: Movie | null = null;

        if (isBackendId) {
          movieData = await fetchBackendMovieDetails(imdbID as string);
        }

        if (!movieData) {
          movieData = await fetchOmdbMovieDetails(imdbID as string);
        }

        if (!movieData) {
          console.error(`Content not found for ID ${imdbID}`);
          toast.error("Movie or series not found.");
          router.push("/");
          return;
        }

        setMovie(movieData);

        // Fetch similar movies
        const similar = await fetchSimilarMovies(
          movieData.Genre,
          movieData.imdbID,
          movieData.Type || "movie"
        );
        setSimilarMovies(similar);
      } catch (error) {
        console.error(`Failed to fetch movie details for ${imdbID}:`, error);
        toast.error("Failed to load movie details.");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [imdbID, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white text-center p-6">
        Loading...
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black text-white text-center p-6">
        Content not found.
      </div>
    );
  }

  console.log("Movie trailer:", movie.Trailer); // Debug trailer URL

  const actors =
    movie.Actors?.split(",")
      .map((actor) => actor.trim())
      .slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative max-w-7xl bg-gradient-to-r from-black to-purple-500/30 py-16">
        <div className="px-6 flex flex-col md:flex-row gap-8 items-center">
          <img
            src={movie.Poster}
            alt={movie.Title || "Content Poster"}
            className="w-full md:w-1/3 rounded-lg shadow-2xl object-cover max-h-[600px] transform hover:scale-105 transition-transform duration-300"
          />
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              {movie.Title || "Unknown Title"}{" "}
              <span className="text-gray-400">({movie.Year || "N/A"})</span>
            </h1>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-yellow-400 font-semibold flex items-center">
                <svg
                  className="w-5 h-5 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {movie.imdbRating || "N/A"}/10
              </span>
              <span className="text-gray-300">{movie.Runtime || "N/A"}</span>
              <span className="text-gray-300">{movie.Released || "N/A"}</span>
              <span className="text-gray-300">{movie.Genre || "N/A"}</span>
            </div>
            <p className="text-lg mb-6 leading-relaxed">
              {movie.Plot || "No plot available"}
            </p>
            <div className="mb-6">
              <WatchlistButton
                id={movie.imdbID}
                title={movie.Title || "Unknown Title"}
                type={movie.Type || "movie"}
                thumbnail={movie.Poster}
              />
            </div>
            <MovieTrailer
              trailerUrl={movie.Trailer}
              title={movie.Title || "Content"}
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-black/50 z-[-1]"></div>
      </div>

      <div className="max-w-7xl px-6 py-12">
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">About the Content</h2>
          <div className="bg-gradient-to-b from-black to-purple-500/30 rounded-xl p-8 shadow-lg">
            <p className="mb-4">
              <strong>Director:</strong> {movie.Director || "N/A"}
            </p>
            <p className="mb-4">
              <strong>Actors:</strong> {movie.Actors || "N/A"}
            </p>
            <p className="mb-4">
              <strong>Genre:</strong> {movie.Genre || "N/A"}
            </p>
            <p className="mb-4">
              <strong>Runtime:</strong> {movie.Runtime || "N/A"}
            </p>
            <p className="mb-4">
              <strong>Released:</strong> {movie.Released || "N/A"}
            </p>
            <p className="mb-4">
              <strong>Type:</strong> {movie.Type || "movie"}
            </p>
            {movie.Type === "series" && (
              <p className="mb-4">
                <strong>Total Seasons:</strong> {movie.totalSeasons || "N/A"}
              </p>
            )}
          </div>
        </section>

        {movie.Type === "series" && (
          <SeriesEpisodes imdbID={movie.imdbID} seasons={movie.Seasons || []} />
        )}

        {actors.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-6 text-purple-300">
              Cast
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {actors.map((actor, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur border border-white/40 rounded-2xl shadow-md hover:shadow-xl transition-transform hover:-translate-y-1 overflow-hidden"
                >
                  <div className="relative w-full h-64">
                    <Image
                      src="/avatar.jpg"
                      alt={`Placeholder for ${actor}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-semibold text-purple-100">
                      {actor}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">You Might Also Like</h2>
          {similarMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {similarMovies.map((similarMovie: Movie) => (
                <Link
                  key={similarMovie.imdbID}
                  href={`/movies/${similarMovie.imdbID}`}
                  className="relative bg-purple-500/80 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-1"
                >
                  <img
                    src={similarMovie.Poster}
                    alt={similarMovie.Title || "Content Poster"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute my-2 bottom-0 left-2 right-2 p-2 bg-black/50 backdrop-blur-md rounded-lg">
                    <h3 className="text-lg font-semibold truncate">
                      {similarMovie.Title || "Unknown Title"}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {similarMovie.Year || "N/A"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">
              No similar content found. Try exploring other categories!
            </p>
          )}
        </section>

        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors shadow-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z"
              clipRule="evenodd"
            />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
