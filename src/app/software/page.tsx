"use client";

import { useEffect, useState } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import SoftwareHero from "@/components/software/SoftwareHero";
import GenreFilter from "@/components/game/GenreFilter";
import MovieCart from "@/components/CartSideBar";
import SoftwareCardGrid from "@/components/software/SoftwareCard";
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

export default function SoftwarePage() {
  const [software, setSoftware] = useState<Software[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchSoftware = async () => {
      try {
        const res = await fetch("lib/api/fetchSoftware");
        if (!res.ok) {
          console.error("API request failed:", res.status, res.statusText);
          toast.error(`Failed to load software: ${res.statusText}`, {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            theme: "dark",
            className: "purple-toast",
          });
          return;
        }
        const data = await res.json();
        console.log("API response:", data);
        setSoftware(data);

        const categorySet = new Set<string>();
        data.forEach((item: Software) => {
          categorySet.add(item.category);
        });
        setCategories([...categorySet]);
        console.log("Software set:", data);
        console.log("Categories set:", [...categorySet]);
      } catch (error) {
        console.error("Error fetching software:", error);
        toast.error("Failed to load software", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          theme: "dark",
          className: "purple-toast",
        });
      }
    };

    fetchSoftware();
  }, []);

  const filteredSoftware = selectedCategory
    ? software.filter((item) => item.category === selectedCategory)
    : software;

  const topSoftware = filteredSoftware[0]; // First item for hero

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (
      over &&
      over.id === "cart-droppable" &&
      active.data.current?.type === "software"
    ) {
      const software = active.data.current.software;
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
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="min-h-screen text-white bg-black flex mt-10">
        <div className="flex-1 container mx-auto px-4">
          {topSoftware ? (
            <SoftwareHero software={topSoftware} />
          ) : (
            <div className="text-red-500 p-4">
              DEBUG: No top software available
            </div>
          )}
          <GenreFilter
            genres={categories}
            selectedGenre={selectedCategory}
            setSelectedGenre={setSelectedCategory}
          />
          <SortableContext items={filteredSoftware.map((item) => item.id)}>
            <SoftwareCardGrid software={filteredSoftware} />
          </SortableContext>
        </div>
        <MovieCart />
      </div>
    </DndContext>
  );
}
