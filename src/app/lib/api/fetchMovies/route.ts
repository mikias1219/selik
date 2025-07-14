import { NextResponse } from "next/server";
import { fetchMovieDetails } from "@/lib/api/omdb";
import { fetchCustomContent } from "@/lib/api/customApi";
import { fetchTrailerSmart } from "@/lib/api/trailer";

interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Plot: string;
  imdbRating: string;
  rating: number;
  imdbVotes: string;
  Trailer?: string;
  Released: string;
  Genre: string;
  Type: "movie" | "series" | "documentary";
  Language: string;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get("search") || "";
  const categoriesParam = url.searchParams.get("categories") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 15;
  const offset = (page - 1) * limit;

  const selectedCategories = categoriesParam
    ? categoriesParam.split(",").map((c) => c.trim())
    : [];

  const token =
    request.headers.get("Authorization")?.replace("Bearer ", "") || "";

  console.log("Search query:", searchQuery);
  console.log("Selected categories:", selectedCategories);
  console.log("Page:", page);

  try {
    let omdbMovies: any[] = [];
    if (!navigator.onLine && searchQuery.trim() === "") {
      const cache = require("@/lib/cache/movies-cache.json");
      omdbMovies = cache.defaultMovies || [];
      console.log("Offline mode: Loaded movies from cache");
    } else if (searchQuery.trim() !== "") {
      const response = await fetch(
        `https://www.omdbapi.com/?s=${encodeURIComponent(searchQuery)}&apikey=${
          process.env.NEXT_PUBLIC_OMDB_API_KEY
        }&page=${page}`,
        { cache: "force-cache" }
      );
      const data = await response.json();
      if (data.Response === "True") {
        omdbMovies = data.Search;
      } else {
        console.warn(`No results for term "${searchQuery}": ${data.Error}`);
      }
    } else {
      const defaultTerms = [
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
      for (const term of defaultTerms) {
        const cache = require("@/lib/cache/movies-cache.json");
        if (!navigator.onLine && cache[term]) {
          omdbMovies.push(...cache[term]);
          console.log(`Offline mode: Loaded cached movies for term "${term}"`);
          continue;
        }
        const response = await fetch(
          `https://www.omdbapi.com/?s=${encodeURIComponent(term)}&apikey=${
            process.env.NEXT_PUBLIC_OMDB_API_KEY
          }&page=${page}`,
          { cache: "force-cache" }
        );
        const data = await response.json();
        if (data.Response === "True") {
          omdbMovies.push(...data.Search);
        }
      }
    }

    const contentType = selectedCategories.includes("Series")
      ? "series"
      : "movie";
    const customContent = await fetchCustomContent(
      contentType,
      searchQuery,
      selectedCategories,
      offset,
      limit,
      token
    );

    const uniqueOmdbMovies = Array.from(
      new Map(omdbMovies.map((movie) => [movie.imdbID, movie])).values()
    );

    const omdbMoviesWithDetails = await Promise.all(
      uniqueOmdbMovies.slice(0, 30).map(async (movie: any) => {
        const [details, trailerUrl] = await Promise.all([
          fetchMovieDetails(movie.imdbID),
          navigator.onLine
            ? fetchTrailerSmart(movie.imdbID, movie.Title, movie.Type)
            : null,
        ]);
        if (!details) return null;

        const rating = parseFloat(details.imdbRating) || 0;
        const votes =
          parseInt(details.imdbVotes?.replace(/,/g, "") || "0") || 0;

        return {
          imdbID: movie.imdbID,
          Title: movie.Title,
          Year: movie.Year,
          Poster: movie.Poster !== "N/A" ? movie.Poster : "/placeholder.jpg",
          Plot: details.Plot || "No plot available",
          imdbRating: details.imdbRating || "N/A",
          rating,
          imdbVotes: details.imdbVotes || "0",
          Trailer: trailerUrl,
          Released: details.Released || "N/A",
          Genre: details.Genre || "N/A",
          Type: details.Type || movie.Type || "movie",
          Language: details.Language || "English",
        } as Movie;
      })
    );

    const validOmdbMovies = omdbMoviesWithDetails.filter(
      (m): m is Movie => m !== null
    );

    const customMovies = customContent.results.map(
      (content) =>
        ({
          imdbID: content.id.toString(),
          Title: content.title,
          Year: content.release_date?.slice(0, 4) || "N/A",
          Poster: content.poster_url || "/placeholder.jpg",
          Plot: content.description || "No plot available",
          imdbRating: content.rating.toString() || "N/A",
          rating: content.rating || 0,
          imdbVotes: content.votes.toString() || "0",
          Trailer: content.trailer_url,
          Released: content.release_date || "N/A",
          Genre: content.genres?.join(", ") || "N/A",
          Type: content.content_type || "movie",
          Language: content.language || "English",
        } as Movie)
    );

    const mergedMovies = [...validOmdbMovies, ...customMovies];

    const filteredMovies = mergedMovies.filter((movie) => {
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

    const sortedMovies = filteredMovies.sort((a, b) => {
      const scoreA = a.rating * 1000 + parseInt(a.imdbVotes || "0");
      const scoreB = b.rating * 1000 + parseInt(b.imdbVotes || "0");
      return scoreB - scoreA;
    });

    const topMovies = sortedMovies.slice(0, limit);
    const hasMore =
      omdbMovies.length > limit || customContent.total > offset + limit;

    return NextResponse.json({
      movies: topMovies,
      hasMore,
    });
  } catch (error: any) {
    console.error("Error fetching movies:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch movies", movies: [], hasMore: false },
      { status: 500 }
    );
  }
}
