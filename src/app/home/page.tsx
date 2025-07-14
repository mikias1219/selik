"use client";

import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Hero from "@/components/Hero";
import MovieCard from "@/components/MovieCard";
import MovieCart from "@/components/CartSideBar";
import { Grab } from "lucide-react";
import { toast } from "react-toastify";
import { useMoviesAndContent } from "@/app/hooks/useMoviesAndContent";

// Import fetchTrailerSmart from MovieDetailsPage
async function fetchTrailerSmart(
  imdbID: string,
  title: string,
  type: "movie" | "series" | "documentary" = "movie",
  backendTrailer?: string
): Promise<string | null> {
  const cacheKey = `${imdbID}-${type}`;
  const trailerCache = new Map<string, string | null>();
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

  console.warn(`No trailer found for ${imdbID}`);
  trailerCache.set(cacheKey, null);
  return null;
}

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
  content_id?: number;
}

// Error Boundary Component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <div className="min-h-screen text-white bg-black flex items-center justify-center">
        <p className="text-red-400 text-center">
          An error occurred: {error}. Please refresh the page or try again
          later.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const router = useRouter();

  const { movies, hasMore, loading, error } = useMoviesAndContent(
    searchQuery,
    selectedCategories,
    page
  );

  // Fetch trailers for movies if missing
  const [moviesWithTrailers, setMoviesWithTrailers] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchTrailers = async () => {
      const updatedMovies = await Promise.all(
        movies.map(async (movie) => {
          if (
            movie.Trailer &&
            movie.Trailer.startsWith("https://www.youtube.com/embed/")
          ) {
            return movie;
          }
          const trailer = await fetchTrailerSmart(
            movie.imdbID,
            movie.Title,
            movie.Type,
            movie.source === "backend" ? movie.Trailer : undefined
          );
          return { ...movie, Trailer: trailer };
        })
      );
      setMoviesWithTrailers(updatedMovies);
    };

    fetchTrailers();
  }, [movies]);

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setPage(1);
    },
    []
  );

  const handleSearch = useCallback(() => {
    setPage(1);
  }, []);

  const onSearchInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch]
  );

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category];
      setPage(1);
      return newCategories;
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategories([]);
    setPage(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, loading]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (
      over &&
      over.id === "cart-droppable" &&
      active.data.current?.type === "movie"
    ) {
      const movie = active.data.current.movie as Movie;
      addToCart(movie);
    }
  }, []);

  const addToCart = useCallback((movie: Movie) => {
    try {
      window.dispatchEvent(
        new CustomEvent("add-to-cart", {
          detail: {
            id: movie.imdbID,
            title: movie.Title,
            price: 9.99,
            type: movie.Type,
            thumbnail:
              movie.Poster !== "N/A" ? movie.Poster : "/placeholder.jpg",
          },
        })
      );
      toast.success(`${movie.Title} added to watchlist!`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add to watchlist.");
    }
  }, []);

  const handleMovieClick = useCallback(
    (id: string, source: "backend" | "omdb", content_id?: number) => {
      const route =
        source === "backend" && content_id
          ? `/movies/${content_id}`
          : `/movies/${id}`;
      console.log(
        `Navigating to ${route} for movie ID ${id} (source: ${source}, content_id: ${content_id})`
      );
      router.push(route);
    },
    [router]
  );

  function DraggableMovieCard({ movie }: { movie: Movie }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: movie.imdbID,
      data: { type: "movie", movie },
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.7 : 1,
    };

    // Validate movie data
    const movieProps: Movie = {
      imdbID: movie.imdbID || `fallback-${Date.now()}`,
      content_id: movie.content_id,
      Title: movie.Title || "Untitled",
      Year: movie.Year || "N/A",
      Poster: movie.Poster || "/placeholder-image.jpg",
      Plot: movie.Plot || "No plot available",
      imdbRating: movie.imdbRating || "N/A",
      rating: movie.rating || 0,
      imdbVotes: movie.imdbVotes || "",
      Trailer: movie.Trailer || "",
      Released: movie.Released || "",
      Genre: movie.Genre || "",
      Type: movie.Type || "movie",
      Language: movie.Language || "English",
      source: movie.source || "backend",
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="relative p-4 rounded-lg shadow-md"
      >
        <div
          className="absolute top-5 right-5 z-10 p-2 border border-black rounded-full cursor-grab active:cursor-grabbing hover:bg-gray-700"
          {...attributes}
          {...listeners}
        >
          <Grab className="w-4 h-4 text-gray-300" />
        </div>
        <MovieCard
          movie={movieProps}
          onAddToWatchlist={() => addToCart(movie)}
          onSeeDetails={() =>
            handleMovieClick(movie.imdbID, movie.source, movie.content_id)
          }
        />
      </div>
    );
  }

  // Log movies for debugging
  useEffect(() => {
    console.log("Movies with trailers:", moviesWithTrailers);
  }, [moviesWithTrailers]);

  // Memoized mapped movies for Hero
  const mappedMovies = useMemo(
    () =>
      moviesWithTrailers.map((m) => ({
        imdbID: m.imdbID,
        Title: m.Title,
        Poster: m.Poster,
        Plot: m.Plot || "No plot available",
        Year: m.Year || "N/A",
        imdbRating: m.imdbRating || "N/A",
        Type: m.Type || "movie",
        Trailer: m.Trailer,
        Genre: m.Genre,
      })),
    [moviesWithTrailers]
  );

  return (
    <ErrorBoundary>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="min-h-screen text-white bg-black flex">
          <div className="flex-1 container">
            {isInitialLoad && loading ? (
              <HeroLoading />
            ) : (
              mappedMovies.length > 0 && (
                <Hero movies={mappedMovies} type="movie" />
              )
            )}
            <section className="py-8 w-full max-w-4xl bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-xl mb-10 px-6">
              {/* Search */}
              <div className="relative mb-6 flex justify-center sm:flex-row sm:items-center gap-4">
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={onSearchInputKeyDown}
                  placeholder="🔍 Search by title..."
                  className="flex-1 p-3 pl-4 pr-12 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  disabled={loading}
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm transition duration-200"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>

              {/* Category Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                {["Series", "Documentary", "Translated Movies"].map(
                  (category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                        selectedCategories.includes(category)
                          ? "bg-purple-600 text-white border-purple-500"
                          : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      {category}
                    </button>
                  )
                )}
              </div>

              {/* Clear Filters */}
              {(searchQuery || selectedCategories.length > 0) && (
                <div className="text-center">
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm shadow-lg transition duration-200"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Clear Filters
                  </button>
                </div>
              )}
            </section>

            {error && (
              <p className="px-6 text-center text-red-400 mb-6">{error}</p>
            )}

            <section className="px-6 py-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
              {loading ? (
                Array(10)
                  .fill(0)
                  .map((_, i) => <MovieCardLoading key={i} />)
              ) : (
                <SortableContext items={movies.map((m) => m.imdbID)}>
                  {moviesWithTrailers.map((m) => (
                    <DraggableMovieCard key={m.imdbID} movie={m} />
                  ))}
                </SortableContext>
              )}
            </section>

            {!loading && moviesWithTrailers.length === 0 && !isInitialLoad && (
              <p className="px-6 text-center text-gray-400">
                No content matches your filters. Try adjusting your search or
                categories.
              </p>
            )}

            {hasMore && !loading && (
              <div className="px-6 py-4 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
          <MovieCart />
        </div>
      </DndContext>
    </ErrorBoundary>
  );
}

function HeroLoading() {
  return (
    <div className="w-full h-[400px] bg-gray-700 rounded-lg animate-pulse" />
  );
}

function MovieCardLoading() {
  return (
    <div className="p-4 rounded-lg shadow-md bg-gray-900/80 animate-pulse">
      <div className="w-full h-64 bg-gray-700 rounded-md" />
      <div className="h-6 w-3/4 bg-gray-700 mt-4 rounded" />
      <div className="h-4 w-full bg-gray-700 mt-2 rounded" />
      <div className="h-4 w-1/2 bg-gray-700 mt-2 rounded" />
    </div>
  );
}
