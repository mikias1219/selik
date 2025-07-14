"use client";

import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Hero from "@/components/ebook/hero";
import EbookCard from "@/components/ebook/ebookCard";
import MovieCart from "@/components/CartSideBar";
import { GripVertical } from "lucide-react";
import { toast } from "react-toastify";

interface Ebook {
  id: string;
  title: string;
  authors?: string[];
  publishedDate?: string;
  thumbnail?: string;
  description?: string;
  averageRating?: number;
  pageCount?: number;
}

const storageData = [
  { type: "eBooks", sizeGB: 10, color: "bg-green-600" },
  { type: "Audiobooks", sizeGB: 20, color: "bg-blue-600" },
];
const totalStorageGB = 50;
const usedStorageGB = 30;
const freeStorageGB = totalStorageGB - usedStorageGB;
const usedPercentage = (usedStorageGB / totalStorageGB) * 100;

const placeholderEbooks: Ebook[] = [
  {
    id: "placeholder1",
    title: "The Art of Cinema",
    authors: ["John Doe"],
    publishedDate: new Date().toISOString(),
    thumbnail: "/placeholder.jpg",
    description: "A comprehensive guide to the world of cinema.",
    averageRating: 4.5,
    pageCount: 300,
  },
  {
    id: "placeholder2",
    title: "Film History",
    authors: ["Jane Smith"],
    publishedDate: new Date().toISOString(),
    thumbnail: "/placeholder.jpg",
    description: "Explore the evolution of films through the ages.",
    averageRating: 4.0,
    pageCount: 250,
  },
];

export default function EbookSection() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [featuredEbook, setFeaturedEbook] = useState<Ebook | null>(null);
  const router = useRouter();

  const fetchEbooks = async () => {
    try {
      const keywords = [
        "movies",
        "cinema",
        "film",
        "movie history",
        "film studies",
        "filmmaking",
        "screenwriting",
        "cinematography",
      ];
      let allEbooks: Ebook[] = [];
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || "";
      if (!apiKey) {
        console.warn(
          "No Google Books API key provided; results may be limited."
        );
      }

      for (const keyword of keywords) {
        let attempts = 0;
        const maxAttempts = 2;
        let success = false;

        while (attempts < maxAttempts && !success) {
          attempts++;
          try {
            const response = await fetch(
              `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
                keyword
              )}&maxResults=40&orderBy=relevance&printType=books${
                apiKey ? `&key=${apiKey}` : ""
              }`,
              { cache: "no-store" }
            );
            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
            }
            const data = await response.json();
            console.log(`API response for ${keyword}:`, {
              totalItems: data.totalItems,
              items: data.items?.length || 0,
            });

            if (data.items) {
              const books = data.items.map((item: any) => ({
                id: item.id,
                title: item.volumeInfo.title,
                authors: item.volumeInfo.authors,
                publishedDate: item.volumeInfo.publishedDate,
                thumbnail: item.volumeInfo.imageLinks?.thumbnail,
                description: item.volumeInfo.description,
                averageRating: item.volumeInfo.averageRating,
                pageCount: item.volumeInfo.pageCount,
              }));
              allEbooks = [...allEbooks, ...books];
              success = true;
            } else {
              console.warn(`No eBooks found for ${keyword}`);
            }
          } catch (error) {
            console.error(
              `Fetch attempt ${attempts} for ${keyword} failed:`,
              error
            );
            if (attempts >= maxAttempts) {
              console.warn(`Max attempts reached for ${keyword}`);
            }
          }
        }
      }

      console.log("All eBooks before deduplication:", allEbooks.length);
      const uniqueEbooks = Array.from(
        new Map(allEbooks.map((b) => [b.id, b])).values()
      );
      console.log("Unique eBooks:", uniqueEbooks.length);

      const currentYear = new Date().getFullYear();
      let yearRange = 7;
      let minRating = 3.5;

      let validEbooks = uniqueEbooks
        .filter((book) => {
          const year = book.publishedDate
            ? new Date(book.publishedDate).getFullYear()
            : null;
          const rating = book.averageRating || 0;
          return year && year >= currentYear - yearRange && rating >= minRating;
        })
        .sort((a, b) => {
          const ratingA = a.averageRating || 0;
          const ratingB = b.averageRating || 0;
          return ratingB - ratingA;
        });

      // Relax filters further if still too few results
      if (validEbooks.length < 3) {
        console.warn("Still too few eBooks, removing rating filter...");
        yearRange = 10;
        validEbooks = uniqueEbooks
          .filter((book) => {
            const year = book.publishedDate
              ? new Date(book.publishedDate).getFullYear()
              : null;
            return year && year >= currentYear - yearRange;
          })
          .sort((a, b) => {
            const ratingA = a.averageRating || 0;
            const ratingB = b.averageRating || 0;
            return ratingB - ratingA;
          });
      }

      console.log("Valid eBooks:", validEbooks);

      const finalEbooks =
        validEbooks.length > 0 ? validEbooks : placeholderEbooks;

      const ebookWithThumbnail =
        finalEbooks.find((book) => book.thumbnail && book.thumbnail !== "") ||
        finalEbooks[0] ||
        null;
      console.log("Ebook with thumbnail:", ebookWithThumbnail);

      setEbooks(finalEbooks.slice(0, 6));
      setFeaturedEbook(ebookWithThumbnail);
    } catch (error) {
      console.error("Error fetching eBooks:", error);
      setEbooks(placeholderEbooks);
      setFeaturedEbook(placeholderEbooks[0]);
    }
  };

  useEffect(() => {
    fetchEbooks();
  }, []);

  const addToCart = (ebook: Ebook) => {
    console.log("Dispatching add-to-cart for ebook:", ebook.id);
    window.dispatchEvent(
      new CustomEvent("add-to-cart", {
        detail: {
          id: ebook.id,
          title: ebook.title,
          price: 4.99,
          type: "ebook",
          thumbnail: ebook.thumbnail || "/placeholder.jpg",
        },
      })
    );
    toast.success(`${ebook.title} added to cart!`, {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log("Drag end event:", { active, over });
    if (
      over &&
      over.id === "cart-droppable" &&
      active.data.current?.type === "ebook"
    ) {
      const ebook = active.data.current.ebook;
      addToCart(ebook);
    }
  };

  function DraggableEbookCard({ ebook }: { ebook: Ebook }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: ebook.id,
      data: { type: "ebook", ebook },
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`relative p-4 rounded-lg shadow-md ${
          isDragging ? "pointer-events-none z-50 opacity-70" : ""
        }`}
      >
        <div
          className="absolute top-5 right-5 z-10 p-2 rounded-full bg-gray-800/80 backdrop-blur cursor-grab active:cursor-grabbing hover:bg-gray-700 transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-gray-300" />
        </div>
        <EbookCard
          ebook={{
            ...ebook,
            description: ebook.description ?? "No description available",
          }}
          onAddToCart={() => addToCart(ebook)}
          onSeeDetails={() => {
            console.log(`Navigating to /ebooks/${ebook.id}`);
            router.push(`/ebooks/${ebook.id}`);
          }}
        />
      </div>
    );
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="min-h-screen w-[80%] text-white flex">
        <div className="flex-1 rounded-lg">
          {featuredEbook && (
            <Hero
              ebook={{
                ...featuredEbook,
                description:
                  featuredEbook.description || "No description available",
              }}
            />
          )}
          <section className="px-4 py-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <SortableContext items={ebooks.map((ebook) => ebook.id)}>
              {ebooks.map((ebook) => (
                <DraggableEbookCard key={ebook.id} ebook={ebook} />
              ))}
            </SortableContext>
          </section>
        </div>
        <MovieCart />
      </div>
    </DndContext>
  );
}
