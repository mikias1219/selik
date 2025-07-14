"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import Link from "next/link";
import { Star, Grab } from "lucide-react";
import { toast } from "react-toastify";

interface Software {
  id: string;
  name: string;
  background_image: string;
  category: string;
  description: string;
  downloadLink: string;
  safetyScore: number;
}

interface SoftwareCardGridProps {
  software: Software[];
  showHandle?: boolean;
}

function DraggableSoftwareCard({
  software,
  showHandle,
}: {
  software: Software;
  showHandle?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: software.id,
    data: { type: "software", software },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAddToFavorites = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent("add-to-cart", {
        detail: {
          id: software.id,
          title: software.name,
          price: 0,
          type: "software",
          thumbnail: software.background_image || "/placeholder.jpg",
        },
      })
    );
    toast.success(`${software.name} added to favorites!`, {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      theme: "dark",
      className: "purple-toast",
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative p-4 border border-purple-400/20 rounded-lg shadow-md ${
        isDragging ? "pointer-events-none z-50" : ""
      }`}
    >
      {showHandle && (
        <div
          className="absolute top-4 right-4 z-10 border border-black rounded-full bg-gray-800/20 backdrop-blur cursor-grab active:cursor-grabbing hover:bg-gray-700 transition-colors"
          {...attributes}
          {...listeners}
        >
          <Grab className="w-5 h-5 text-gray-300" />
        </div>
      )}
      <div className="relative w-full max-w-sm mx-auto rounded-2xl rounded-tl-none overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] bg-gradient-to-b from-gray-900/10 to-gray-900/5">
        <div className="relative w-full h-[400px] rounded-2xl rounded-tl-none overflow-hidden">
          <Image
            src={
              software.background_image !== "N/A"
                ? software.background_image
                : "/placeholder.jpg"
            }
            alt={software.name}
            fill
            className="object-cover object-top transition-transform duration-500 ease-in-out hover:scale-105 brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          <div className="absolute top-4 left-4 flex items-center gap-2 p-2 backdrop-blur-lg bg-white/10 rounded-xl border border-white/20">
            <Star fill="#FFD700" stroke="#FFD700" className="w-5 h-5" />
            <p className="text-white font-semibold text-sm">
              {software.safetyScore || "N/A"}
              <span className="text-xs text-gray-300">/100</span>
            </p>
          </div>
          <div className="absolute top-4 right-4 p-2 backdrop-blur-lg bg-white/10 rounded-xl border border-white/20">
            <p className="text-white font-medium text-sm">
              {software.category}
            </p>
          </div>
          <div className="absolute bottom-12 left-4 right-4">
            <h3 className="text-white text-xl font-bold tracking-tight truncate">
              {software.name || "Untitled"}
            </h3>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-gray-200 text-sm font-medium capitalize bg-white/10 backdrop-blur-lg rounded-lg px-3 py-1 inline-block">
              {software.category || "Software"}
            </p>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-500 ease-in-out">
            <Link
              href={`/softwares/${software.id}`}
              className="w-48 text-center px-6 py-3 bg-purple-500/80 text-white font-semibold rounded-lg shadow-md hover:bg-purple-500 transition-all duration-300 transform hover:scale-105"
            >
              View Details
            </Link>
            <button
              className="w-48 px-6 py-3 bg-teal-500/80 text-white font-semibold rounded-lg shadow-md hover:bg-teal-500 transition-all duration-300 transform hover:scale-105"
              onClick={handleAddToFavorites}
            >
              Add to Favorites
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SoftwareCardGrid({ software }: SoftwareCardGridProps) {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
      {software.map((item) => (
        <DraggableSoftwareCard key={item.id} software={item} showHandle />
      ))}
    </section>
  );
}
