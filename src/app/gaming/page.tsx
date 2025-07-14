"use client";

import { useEffect, useState } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import HeroSection from "@/components/game/HeroSection";
import GenreFilter from "@/components/game/GenreFilter";
import MovieCart from "@/components/CartSideBar"; // Universal Cart
import GameCardGrid from "@/components/game/GameCard"; // Already has DraggableGameCard inside
import { toast } from "react-toastify";

interface Game {
  id: number;
  name: string;
  background_image: string;
  genres: { name: string }[];
  rating: number;
  released: string;
  clip?: {
    clip: string; // URL to video clip
  };
}

const storageData = [
  { type: "Games", sizeGB: 60, color: "bg-green-600" },
  { type: "DLCs", sizeGB: 10, color: "bg-indigo-600" },
];

const totalStorageGB = 100;
const usedStorageGB = 70;
const freeStorageGB = totalStorageGB - usedStorageGB;
const usedPercentage = (usedStorageGB / totalStorageGB) * 100;

export default function GamingPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch(
          `https://api.rawg.io/api/games?key=${process.env.NEXT_PUBLIC_RAWG_API_KEY}&page_size=20`
        );
        if (!res.ok) {
          console.error("API request failed:", res.status, res.statusText);
          return;
        }
        const data = await res.json();
        console.log("API response:", data);
        if (!data.results) {
          console.warn("No results in API response");
          return;
        }
        setGames(data.results);

        const genreSet = new Set<string>();
        data.results.forEach((game: Game) => {
          game.genres.forEach((g) => genreSet.add(g.name));
        });
        setGenres([...genreSet]);
        console.log("Games set:", data.results);
        console.log("Genres set:", [...genreSet]);
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };

    fetchGames();
  }, []);

  const filteredGames = selectedGenre
    ? games.filter((game) => game.genres.some((g) => g.name === selectedGenre))
    : games;

  const topGame = games[7];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (
      over &&
      over.id === "cart-droppable" &&
      active.data.current?.type === "game"
    ) {
      const game = active.data.current.game;
      window.dispatchEvent(
        new CustomEvent("add-to-cart", {
          detail: {
            id: game.id,
            title: game.name,
            price: 14.99,
            type: "game",
            thumbnail: game.background_image || "/placeholder.jpg",
          },
        })
      );
      toast.success(`${game.name} added to watchlist!`, {
        position: "bottom-right", // Align with other components
        autoClose: 3000,
        hideProgressBar: true, // Ensure progress bar is hidden
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false, // Consistent with other toasts
        theme: "dark",
        className: "purple-toast", // Apply purple theme
      });
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="min-h-screen text-white flex">
        {/* Main Content */}
        <div className="flex-1">
          {topGame ? (
            <HeroSection game={topGame} />
          ) : (
            <div className="text-red-500 p-4">DEBUG: No topGame available</div>
          )}
          <GenreFilter
            genres={genres}
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
          />
          <SortableContext items={filteredGames.map((game) => game.id)}>
            <GameCardGrid games={filteredGames} />
          </SortableContext>
        </div>

        {/* Sidebar Cart */}
        <MovieCart />
      </div>
    </DndContext>
  );
}
