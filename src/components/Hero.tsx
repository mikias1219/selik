"use client";

import Image from "next/image";
import ReactPlayer from "react-player";
import { useState } from "react";
import { Play, ArrowRight, Film } from "lucide-react";

interface Movie {
  Poster: string;
  Title: string;
  Plot: string;
  Backdrop?: string;
  Trailer?: string;
  imdbID: string;
  Year?: string;
  Type?: string;
  Genre?: string;
}

interface HeroProps {
  movies: Movie[];
  type?: string;
}

const Hero = ({ movies, type }: HeroProps) => {
  const [currentTrailerIndex, setCurrentTrailerIndex] = useState(0);

  // Debug movies array
  console.log("Hero movies:", movies);

  // Filter movies with valid YouTube embed URLs
  const validMovies = movies.filter((movie) => {
    const isValid =
      movie.Trailer &&
      movie.Trailer.startsWith("https://www.youtube.com/embed/");
    if (!isValid && movie.Trailer) {
      console.warn(
        `Invalid trailer URL for ${movie.Title} (${movie.imdbID}): ${movie.Trailer}`
      );
    }
    return isValid;
  });

  const handleTrailerEnd = () => {
    setCurrentTrailerIndex((prev) =>
      prev + 1 < validMovies.length ? prev + 1 : 0
    );
  };

  const handleNext = () => {
    setCurrentTrailerIndex((prev) =>
      prev + 1 < validMovies.length ? prev + 1 : 0
    );
  };

  const currentMovie =
    validMovies.length > 0
      ? validMovies[currentTrailerIndex]
      : {
          Poster: "/placeholder.jpg",
          Title: "No Movies Available",
          Plot: "No plot available",
          imdbID: "",
        };

  console.log("Current movie trailer:", currentMovie.Trailer);

  return (
    <div className="relative w-full xl:w-[80%] h-[600px] rounded-3xl overflow-hidden mb-12 shadow-2xl group border border-white/10">
      {/* Background Trailer or Poster */}
      {currentMovie.Trailer ? (
        <ReactPlayer
          url={currentMovie.Trailer}
          width="100%"
          height="100%"
          playing
          loop={validMovies.length === 1} // Loop only if one trailer
          muted // Mute to avoid autoplay sound issues
          controls={false}
          onEnded={handleTrailerEnd}
          onError={(e) =>
            console.error(`ReactPlayer error for ${currentMovie.Title}:`, e)
          }
          className="absolute top-0 left-0 transition-transform duration-700 ease-in-out group-hover:scale-105"
        />
      ) : (
        <Image
          src={
            currentMovie.Backdrop ||
            (currentMovie.Poster !== "N/A" ? currentMovie.Poster : "/hero.jpg")
          }
          alt={`${currentMovie.Title} background`}
          fill
          style={{ objectFit: "cover", objectPosition: "top" }}
          className="transition-transform duration-700 ease-in-out group-hover:scale-105"
          priority
        />
      )}

      {/* Glass overlay */}
      {/* <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent backdrop-blur-sm" /> */}

      {/* Trailer indicator badge */}
      {currentMovie.Trailer && (
        <div className="absolute top-4 left-4 z-20 bg-white/10 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10">
          Now Playing Trailer
        </div>
      )}

      {/* Content */}
      <div className="absolute flex flex-col justify-end gap-6 bottom-10 left-14 z-20 text-white max-w-3xl animate-fadeIn">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow tracking-tight leading-tight">
            {currentMovie.Title}
            {currentMovie.Year && (
              <span className="ml-2 text-purple-300 text-2xl font-medium">
                ({currentMovie.Year})
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-gray-300">
            {currentMovie.Type?.toUpperCase() || type?.toUpperCase() || "MEDIA"}
            {currentMovie.Genre ? ` • ${currentMovie.Genre}` : ""}
          </p>
          <p className="mt-3 text-base md:text-lg text-gray-200 font-light leading-relaxed drop-shadow-md line-clamp-3">
            {currentMovie.Plot}
          </p>
        </div>

        <div className="flex gap-4 flex-wrap">
          <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-lg shadow-lg transition-all">
            <Play size={18} />
            Watch Now
          </button>

          {currentMovie.imdbID && (
            <a
              href={`https://www.imdb.com/title/${currentMovie.imdbID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-white/40 text-white hover:bg-purple-600 hover:scale-105 text-sm rounded-lg transition-all"
            >
              <Film size={18} />
              IMDb Page
            </a>
          )}

          {validMovies.length > 1 && (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-all"
            >
              <ArrowRight size={18} />
              Next Trailer
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Hero;
