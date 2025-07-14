// components/DragDropWrapper.tsx
"use client";

import { useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import MovieCart from "@/components/CartSideBar";

type Movie = {
  rating: number;
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Plot?: string;
  imdbRating?: string;
};

export default function DragDropWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cartItems, setCartItems] = useState<Movie[]>([]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;

    if (over?.id === "movie-cart") {
      const draggedMovie = JSON.parse(active.data.current?.movie || "{}");
      const alreadyInCart = cartItems.some(
        (item) => item.imdbID === draggedMovie.imdbID
      );

      if (!alreadyInCart) {
        setCartItems((prev) => [...prev, draggedMovie]);
      }
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {children}
      <MovieCart
        id="movie-cart"
        usedPercentage={0}
        storageData={[]}
        totalStorageGB={100}
        usedStorageGB={0}
        freeStorageGB={100}
        cartItems={cartItems.map((movie) => ({
          id: movie.imdbID ?? "unknown-id",
          name: movie.Title ?? "Untitled Movie",
          price: typeof movie.rating === "number" ? movie.rating * 1.5 : 5,
          icon: "🎬", // optional
        }))}
      />
    </DndContext>
  );
}
