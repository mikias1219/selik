"use client";

import { useEffect, useState } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import MusicHero from "@/components/music/MusicHero";
import MusicList from "@/components/music/MusicList";
import CartSidebar from "@/components/CartSideBar";
import { toast } from "react-toastify";

interface Track {
  id: number;
  title: string;
  artist: { name: string };
  album: { cover_medium: string };
  preview: string;
}

const storageData = [{ type: "Music", sizeGB: 10, color: "bg-pink-600" }];
const totalStorageGB = 100;
const usedStorageGB = 20;
const freeStorageGB = totalStorageGB - usedStorageGB;
const usedPercentage = (usedStorageGB / totalStorageGB) * 100;

export default function MusicPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch("lib/api/deezer");
        const data = await response.json();
        setTracks(data.data || []);
        setCurrentTrack(data.data[0] || null);
      } catch (error) {
        console.error("Error fetching tracks:", error);
        toast.error("Failed to fetch tracks", { theme: "dark" });
      }
    };
    fetchTracks();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (
      over &&
      over.id === "cart-droppable" &&
      active.data.current?.type === "music"
    ) {
      const track = active.data.current.music;
      window.dispatchEvent(
        new CustomEvent("add-to-cart", {
          detail: {
            id: track.id,
            title: track.title,
            price: 1.99,
            type: "music",
          },
        })
      );
      toast.error(`${track.title} added to cart!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        className: "purple-toast",
      });
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="min-h-screen flex text-white bg-gray-900">
        <div className="flex-1">
          <MusicHero
            currentTrack={currentTrack}
            tracks={tracks}
            setCurrentTrack={setCurrentTrack}
          />
          <MusicList tracks={tracks} onTrackSelect={setCurrentTrack} />
        </div>
        <CartSidebar />
      </div>
    </DndContext>
  );
}
