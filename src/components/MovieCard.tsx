"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import { useCallback } from "react";
import { toast } from "react-toastify";

interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Plot?: string;
  imdbRating?: string;
  Type?: string;
  Backdrop?: string;
}

interface MovieCardProps {
  movie: Movie;
  onAddToWatchlist: () => void;
  onSeeDetails: () => void;
}

const MovieCard = ({
  movie,
  onAddToWatchlist,
  onSeeDetails,
}: MovieCardProps) => {
  // Log movie data for debugging
  console.log(
    `Rendering MovieCard for ${movie.Title || "Unknown"} (ID: ${movie.imdbID})`,
    {
      poster: movie.Poster,
      title: movie.Title,
      year: movie.Year,
      imdbRating: movie.imdbRating,
      type: movie.Type,
    }
  );

  // Validate poster URL
  const posterSrc =
    movie.Poster && movie.Poster !== "N/A" && movie.Poster !== ""
      ? movie.Poster
      : "/placeholder-image.jpg";

  // Optimize event handlers
  const handleSeeDetails = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      try {
        onSeeDetails();
      } catch (error) {
        console.error(
          `Failed to navigate to details for ${movie.Title || "Unknown"}:`,
          error
        );
        toast.error("Failed to view details.");
      }
    },
    [onSeeDetails, movie.Title]
  );

  const handleAddToWatchlist = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      try {
        onAddToWatchlist();
      } catch (error) {
        console.error(
          `Failed to add ${movie.Title || "Unknown"} to watchlist:`,
          error
        );
        toast.error("Failed to add to watchlist.");
      }
    },
    [onAddToWatchlist, movie.Title]
  );

  return (
    <div className="relative w-full max-w-sm mx-auto rounded-2xl rounded-tl-none overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] bg-gradient-to-b from-gray-900/10 to-gray-900/5">
      <div className="relative w-full h-[400px] rounded-2xl rounded-tl-none overflow-hidden">
        <Image
          src={posterSrc}
          alt={`${movie.Title || "Untitled"} poster`}
          fill
          className="object-cover transition-transform duration-500 ease-in-out hover:scale-105 brightness-90"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            console.error(
              `Image load error for ${movie.Title || "Unknown"}:`,
              e
            );
            (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

        <div className="absolute top-4 left-4 flex items-center gap-2 p-2 backdrop-blur-lg bg-white/10 rounded-xl border border-white/20">
          <Star fill="#FFD700" stroke="#FFD700" className="w-5 h-5" />
          <p className="text-white font-semibold text-sm">
            {movie.imdbRating || "N/A"}
            <span className="text-xs text-gray-300">/10</span>
          </p>
        </div>

        <div className="absolute top-4 right-4 p-2 backdrop-blur-lg bg-white/10 rounded-xl border border-white/20">
          <p className="text-white font-medium text-sm">
            {movie.Year || "N/A"}
          </p>
        </div>

        <div className="absolute bottom-12 left-4 right-4">
          <h3 className="text-white text-xl font-bold tracking-tight truncate">
            {movie.Title || "Untitled"}
          </h3>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-gray-200 text-sm font-medium capitalize bg-white/10 backdrop-blur-lg rounded-lg px-3 py-1 inline-block">
            {movie.Type || "Movie"}
          </p>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-500 ease-in-out">
          <button
            className="w-48 px-6 py-3 bg-purple-500/80 text-white font-semibold rounded-lg shadow-md hover:bg-purple-500 transition-all duration-300 transform hover:scale-105"
            onClick={handleSeeDetails}
          >
            See Details
          </button>
          <button
            className="w-48 px-6 py-3 bg-teal-500/80 text-white font-semibold rounded-lg shadow-md hover:bg-teal-500 transition-all duration-300 transform hover:scale-105"
            onClick={handleAddToWatchlist}
          >
            Add to Watchlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
