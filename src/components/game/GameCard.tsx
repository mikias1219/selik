"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { Star, GripVertical, Grab } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface Game {
  id: number;
  name: string;
  background_image: string;
  genres: { name: string }[];
  rating: number;
  released: string;
}

interface GameCardGridProps {
  games: Game[];
  showHandle?: boolean;
}

function DraggableGameCard({
  game,
  showHandle,
}: {
  game: Game;
  showHandle?: boolean;
}) {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: game.id,
    data: { type: "game", game },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAddToWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
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
  };

  const handleSeeDetails = () => {
    router.push(`/games/${game.id}`);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative p4 rounded-lg shadow-md ${
        isDragging ? "pointer-events-none z-50" : ""
      }`}
    >
      {showHandle && (
        <div
          className="absolute top-2 right-2 z-10 border border-black rounded-full bg-gray-800/20 backdrop-blur cursor-grab active:cursor-grabbing hover:bg-gray-700 transition-colors"
          {...attributes}
          {...listeners}
        >
          <Grab className="w-4 h-4 text-gray-300" />
        </div>
      )}

      {/* Card content remains unchanged */}
      <div className="relative w-full max-w-sm mx-auto rounded-2xl rounded-tl-none overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] bg-gradient-to-b from-gray-900/10 to-gray-900/5">
        {/* ...Image, text, overlay... */}
        <div className="relative w-full h-[400px] rounded-2xl rounded-tl-none overflow-hidden">
          <Image
            src={
              game.background_image !== "N/A"
                ? game.background_image
                : "/placeholder.jpg"
            }
            alt={game.name}
            fill
            className="object-cover object-top transition-transform duration-500 ease-in-out hover:scale-105 brightness-90"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

          <div className="absolute top-4 left-4 flex items-center gap-2 p-2 backdrop-blur-lg bg-white/10 rounded-xl border border-white/20">
            <Star fill="#FFD700" stroke="#FFD700" className="w-5 h-5" />
            <p className="text-white font-semibold text-sm">
              {game.rating || "N/A"}
              <span className="text-xs text-gray-300">/10</span>
            </p>
          </div>

          <div className="absolute top-4 right-4 p-2 backdrop-blur-lg bg-white/10 rounded-xl border border-white/20">
            <p className="text-white font-medium text-sm">
              {game.released || "N/A"}
            </p>
          </div>

          <div className="absolute bottom-12 left-4 right-4">
            <h3 className="text-white text-xl font-bold tracking-tight truncate">
              {game.name || "Untitled"}
            </h3>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-gray-200 text-sm font-medium capitalize bg-white/10 backdrop-blur-lg rounded-lg px-3 py-1 inline-block">
              {game.genres.map((genre) => genre.name).join(", ") || "Game"}
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
    </div>
  );
}

export default function GameCardGrid({ games }: GameCardGridProps) {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
      {games.map((game) => (
        <DraggableGameCard key={game.id} game={game} />
      ))}
    </section>
  );
}
