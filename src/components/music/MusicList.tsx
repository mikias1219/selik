"use client";

import { Grab, GripVertical, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { useSortable, SortableContext } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "react-toastify";

interface Track {
  id: number;
  title: string;
  artist: { name: string };
  album: { cover_medium: string };
  preview: string;
}

interface MusicListProps {
  tracks: Track[];
  onTrackSelect: (track: Track) => void;
}

const FALLBACK_IMAGE = "https://via.placeholder.com/150?text=No+Cover";

function DraggableTrackCard({
  track,
  isActive,
  onSelect,
}: {
  track: Track;
  isActive: boolean;
  onSelect: (track: Track) => void;
}) {
  const router = useRouter(); // Initialize router
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: track.id,
    data: {
      type: "music",
      music: track,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cartItem = {
      id: track.id,
      title: track.title,
      price: 1.99,
      type: "music",
      thumbnail: track.album.cover_medium || "/placeholder.jpg",
    };
    window.dispatchEvent(
      new CustomEvent("add-to-cart", {
        detail: cartItem,
      })
    );
    toast.success(`${track.title} added to cart!`, {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    });
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(track);
  };

  const handleCardClick = () => {
    router.push(`/musics/${track.id}`); // Navigate to MusicDetail page
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={handleCardClick} // Add click handler for navigation
      className={`relative group overflow-hidden rounded-xl bg-gray-900 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
        isDragging ? "cursor-grabbing" : "cursor-pointer"
      }`}
    >
      <Image
        src={track.album.cover_medium || FALLBACK_IMAGE}
        alt={track.title}
        width={150}
        height={150}
        className="h-auto w-full object-cover rounded-t-xl"
        onError={(e) => {
          console.error("Image load error:", track.album.cover_medium);
          e.currentTarget.src = FALLBACK_IMAGE;
        }}
      />
      <div className="p-4 bg-gradient-to-t from-black/80 via-transparent to-transparent">
        <h3 className="font-semibold text-white text-lg truncate">
          {track.title}
        </h3>
        <p className="text-sm text-gray-300 truncate">{track.artist.name}</p>
      </div>
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex flex-col gap-4">
          <button
            onClick={handlePlayClick}
            className="w-48 px-6 py-3 bg-purple-500/80 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600 transition-all duration-300 transform hover:scale-105"
          >
            Play
          </button>
          <button
            onClick={handleAddToCart}
            className="w-48 px-6 py-3 bg-teal-500/80 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 transition-all duration-300 transform hover:scale-105"
          >
            Add to Cart
          </button>
        </div>
      </div>
      <button
        {...listeners}
        className="absolute top-3 cursor-grab active:cursor-grabbing right-3 z-20 p-2 bg-gray-700/80 rounded-full text-white hover:bg-gray-600 transition-colors group-hover:opacity-100 opacity-0"
        title="Drag to cart"
      >
        <Grab className="w-5 h-5" />
      </button>
      {isActive && (
        <div className="absolute top-3 left-3 z-20 animate-bounce">
          <Play className="w-4 h-4 text-blue-500" fill="teal" />
        </div>
      )}
    </div>
  );
}

export default function MusicList({ tracks, onTrackSelect }: MusicListProps) {
  const [activeTrackId, setActiveTrackId] = useState<number | null>(null);

  const handleTrackClick = (track: Track) => {
    setActiveTrackId(track.id);
    onTrackSelect(track);
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <h2 className="mb-6 text-3xl font-bold text-white">Newest Tracks</h2>
      <SortableContext items={tracks.map((t) => t.id)}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {tracks.map((track) => (
            <DraggableTrackCard
              key={track.id}
              track={track}
              isActive={activeTrackId === track.id}
              onSelect={handleTrackClick}
            />
          ))}
        </div>
      </SortableContext>
    </section>
  );
}
