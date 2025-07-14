"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactPlayer from "react-player";
import GameCard from "@/components/game/GameCard";
import GameCardGrid from "@/components/game/GameCard";
import { toast } from "react-toastify";

interface GameDetails {
  id: number;
  name: string;
  background_image: string;
  description_raw: string;
  genres: { name: string }[];
  rating: number;
  released: string;
  platforms: { platform: { name: string } }[];
  developers: { name: string }[];
  publishers: { name: string }[];
  clip?: { clip: string };
}

const fetchGameDetails = async (id: string): Promise<GameDetails | null> => {
  try {
    const res = await fetch(
      `https://api.rawg.io/api/games/${id}?key=${process.env.NEXT_PUBLIC_RAWG_API_KEY}`
    );
    if (!res.ok) {
      console.error("Game details fetch failed:", res.status, res.statusText);
      return null;
    }
    const data = await res.json();
    console.log("Game details fetched:", data);
    return data;
  } catch (error) {
    console.error(`fetchGameDetails failed for id ${id}:`, error);
    return null;
  }
};

const fetchSimilarGames = async (
  genres: { name: string }[] | undefined,
  currentId: number
): Promise<GameDetails[]> => {
  if (!genres || !Array.isArray(genres) || genres.length === 0) {
    console.warn("No valid genres provided for similar games fetch");
    return [];
  }
  const searchTerms = genres
    .map((genre) => genre.name.toLowerCase().replace(/\s+/g, "-"))
    .join(",");
  console.log("Fetching similar games with genres:", searchTerms);
  try {
    const res = await fetch(
      `https://api.rawg.io/api/games?key=${
        process.env.NEXT_PUBLIC_RAWG_API_KEY
      }&genres=${encodeURIComponent(searchTerms)}&page_size=10`
    );
    if (!res.ok) {
      console.error("Similar games fetch failed:", res.status, res.statusText);
      return [];
    }
    const data = await res.json();
    console.log("Similar games API response:", data.results);
    if (!data.results || !Array.isArray(data.results)) {
      console.warn("No valid results in similar games API response");
      return [];
    }
    const filteredGames = data.results
      .filter(
        (game: GameDetails) =>
          game.id !== currentId && game.background_image && game.name
      )
      .slice(0, 4);
    console.log("Filtered similar games:", filteredGames);
    return filteredGames;
  } catch (error) {
    console.error(`fetchSimilarGames failed for genres ${searchTerms}:`, error);
    return [];
  }
};

export default function GameDetails() {
  const [game, setGame] = useState<GameDetails | null>(null);
  const [similarGames, setSimilarGames] = useState<GameDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const loadGameDetails = async () => {
      if (typeof id !== "string") {
        console.warn("Invalid ID:", id);
        setLoading(false);
        return;
      }
      setLoading(true);
      const gameData = await fetchGameDetails(id);
      if (!gameData) {
        console.error("No game data fetched for ID:", id);
        setLoading(false);
        return;
      }
      setGame(gameData);

      const similar = await fetchSimilarGames(gameData.genres, gameData.id);
      console.log("Setting similar games:", similar);
      setSimilarGames(similar);
      setLoading(false);
    };

    loadGameDetails();
  }, [id]);

  // Debug similarGames state changes
  useEffect(() => {
    console.log("similarGames state updated:", similarGames);
  }, [similarGames]);

  const handleAddToWatchlist = () => {
    if (game) {
      window.dispatchEvent(
        new CustomEvent("add-to-cart", {
          detail: {
            id: game.id,
            title: game.name,
            price: 14.99,
            type: "game",
          },
        })
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        <p>Loading...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        <p>Game not found.</p>
      </div>
    );
  }

  const developers = game.developers?.map((dev) => dev.name).slice(0, 4) || [];

  return (
    <div className="min-h-screen w-[78%] bg-black text-white">
      {/* Hero Section */}
      <div className="relative w-full h-[80vh] min-h-[600px] overflow-hidden">
        {/* Background Video or Image */}
        {game.clip?.clip ? (
          <ReactPlayer
            url={game.clip.clip}
            width="100%"
            height="100%"
            playing={true}
            muted={true}
            loop={true}
            controls={false}
            config={{
              youtube: {
                playerVars: { showinfo: 0, rel: 0 },
              },
            }}
            className="absolute inset-0"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        ) : (
          <Image
            src={
              game.background_image !== "N/A"
                ? game.background_image
                : "/placeholder.jpg"
            }
            alt={`${game.name} background`}
            fill
            className="object-cover object-center transition-transform duration-700 ease-in-out hover:scale-105"
            priority
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 z-10 text-white max-w-7xl mx-auto animate-fadeIn">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg mb-4">
            {game.name}{" "}
            <span className="text-gray-400">
              ({game.released.split("-")[0]})
            </span>
          </h1>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-yellow-400 font-semibold flex items-center">
              <svg
                className="w-5 h-5 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {game.rating || "N/A"}/10
            </span>
            <span className="text-gray-300">{game.released || "N/A"}</span>
            <span className="text-gray-300">
              {game.genres.map((g) => g.name).join(", ") || "N/A"}
            </span>
            <span className="text-gray-300">
              {game.platforms.map((p) => p.platform.name).join(", ") || "N/A"}
            </span>
          </div>
          <p className="text-sm md:text-sm font-light leading-relaxed drop-shadow-md mb-6 max-w-2xl bg-gradient-to-r from-black/50 to-purple-500/30 p-4 rounded-lg">
            {game.description_raw || "No description available"}
          </p>
          <div className="flex gap-4">
            <button
              className="px-8 py-3 bg-teal-500 text-white font-semibold text-lg rounded-lg shadow-md hover:bg-teal-600 transition-all duration-200"
              onClick={handleAddToWatchlist}
            >
              Add to Watchlist
            </button>
            <button
              className="px-8 py-3 bg-red-600 text-white font-semibold text-lg rounded-lg hover:bg-red-700 hover:scale-105 transition-all duration-200 shadow-lg"
              onClick={() => router.push(`/games/${game.id}/play`)}
            >
              Play Now
            </button>
          </div>
        </div>

        {/* Animation for fade-in effect */}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Details Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">About the Game</h2>
          <div className="bg-gradient-to-l from-black/50 to-purple-500/30 rounded-xl p-8 shadow-lg">
            <p className="mb-4">
              <strong>Developers:</strong>{" "}
              {game.developers.map((d) => d.name).join(", ") || "N/A"}
            </p>
            <p className="mb-4">
              <strong>Publishers:</strong>{" "}
              {game.publishers.map((p) => p.name).join(", ") || "N/A"}
            </p>
            <p className="mb-4">
              <strong>Genres:</strong>{" "}
              {game.genres.map((g) => g.name).join(", ") || "N/A"}
            </p>
            <p className="mb-4">
              <strong>Platforms:</strong>{" "}
              {game.platforms.map((p) => p.platform.name).join(", ") || "N/A"}
            </p>
            <p className="mb-4">
              <strong>Released:</strong> {game.released || "N/A"}
            </p>
          </div>
        </section>

        {/* Developers Section */}
        {developers.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-6 text-purple-300">
              Developers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {developers.map((developer, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur border border-white/40 rounded-2xl shadow-md hover:shadow-xl transition-transform hover:-translate-y-1 overflow-hidden"
                >
                  <div className="relative w-full h-64">
                    <Image
                      src="/avatar.jpg"
                      alt={`Placeholder for ${developer}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-semibold text-purple-100">
                      {developer}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar Games Section */}
        {similarGames.length > 0 && (
          <div className="mt-8">
            <h2 className="text-3xl font-semibold mb-6 text-white">
              Similar Games
            </h2>
            <GameCardGrid games={similarGames} showHandle={false} />
          </div>
        )}

        {/* Back Button */}
        <Link
          href="/gaming"
          className="inline-flex items-center px-6 py-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z"
              clipRule="evenodd"
            />
          </svg>
          Back to Games
        </Link>
      </div>
    </div>
  );
}
