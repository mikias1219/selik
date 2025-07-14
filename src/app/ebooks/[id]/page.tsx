"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Ebook {
  id: string;
  title: string;
  authors?: string[];
  publishedDate?: string;
  thumbnail?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
}

export default function EbookDetails({ params }: { params: { id?: string } }) {
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarBooks, setSimilarBooks] = useState<any[]>([]);
  const router = useRouter();
  const id = params?.id;

  useEffect(() => {
    if (!id) {
      setError("Invalid eBook ID");
      setLoading(false);
      return;
    }

    const fetchEbookDetails = async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes/${id}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data = await res.json();
        const info = data.volumeInfo;

        const ebookData: Ebook = {
          id,
          title: info.title || "Untitled",
          authors: info.authors || ["Unknown Author"],
          publishedDate: info.publishedDate || "Unknown Date",
          thumbnail: info.imageLinks?.thumbnail || "/placeholder.jpg",
          description: info.description || "No description available",
          pageCount: info.pageCount || 0,
          categories: info.categories || [],
        };

        setEbook(ebookData);
        if (info.categories?.length > 0) {
          fetchSimilarBooks(info.categories, id);
        }
      } catch (e: any) {
        setError(`Error fetching eBook: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    const fetchSimilarBooks = async (
      categories: string[],
      currentBookId: string
    ) => {
      try {
        // Use the first category or a fallback, and encode it properly
        const categoryQuery = categories[0]?.replace(/ & /g, " ") || "fiction";
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(
            categoryQuery
          )}&maxResults=6` // Increased to 6 to account for filtering
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data = await res.json();

        // Filter out the current ebook and limit to 5 results
        const filteredBooks = (data.items || [])
          .filter((book: any) => book.id !== currentBookId)
          .slice(0, 5);

        setSimilarBooks(filteredBooks);
      } catch (e: any) {
        console.error(`Error fetching similar books: ${e.message}`);
        setSimilarBooks([]); // Clear similar books on error
      }
    };

    fetchEbookDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (ebook) {
      window.dispatchEvent(
        new CustomEvent("add-to-cart", {
          detail: {
            id: ebook.id,
            title: ebook.title,
            price: 4.99,
            type: "ebook",
          },
        })
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-[80%] bg-purple-950 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !ebook) {
    return (
      <div className="min-h-screen w-[80%] bg-purple-950 text-white flex items-center justify-center">
        <p>{error || "eBook not found."}</p>
      </div>
    );
  }

  return (
    <div className="w-[80%] bg-purple-950/20 mt-12 text-white min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <Image
              src={ebook.thumbnail || "/placeholder.jpg"}
              alt={ebook.title}
              width={300}
              height={450}
              className="object-cover w-full h-auto rounded-lg shadow-lg"
              priority
            />
          </div>
          <div className="w-full md:w-2/3 flex flex-col space-y-4">
            <h1 className="text-3xl font-bold text-purple-100">
              {ebook.title}
            </h1>
            <p className="text-purple-300 text-sm">
              {ebook.authors?.join(", ") || "Unknown Author"}
            </p>
            <p className="text-purple-200 text-sm">{ebook.publishedDate}</p>
            <div
              className="text-gray-200 text-base sm:text-lg space-y-4 [&_p]:mb-2"
              dangerouslySetInnerHTML={{
                __html: ebook.description || "<p>No description available</p>",
              }}
            />

            {ebook.pageCount && (
              <p className="text-sm text-purple-300">
                Pages: {ebook.pageCount}
              </p>
            )}
            {ebook.categories && (
              <p className="text-sm text-purple-300">
                Categories: {ebook.categories.join(", ")}
              </p>
            )}
            <div className="flex gap-4">
              <button
                className="px-6 py-2 bg-purple-700 hover:bg-purple-600 rounded shadow-md"
                onClick={() => router.push("/ebooks")}
              >
                Back
              </button>
              <button
                className="px-6 py-2 bg-teal-600 hover:bg-teal-500 rounded shadow-md"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {similarBooks.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-purple-100 mb-4">
              Similar Books
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {similarBooks.map((book) => (
                <div key={book.id} className="bg-purple-800 p-4 rounded shadow">
                  <Image
                    src={
                      book.volumeInfo.imageLinks?.thumbnail ||
                      "/placeholder.jpg"
                    }
                    alt={book.volumeInfo.title}
                    width={100}
                    height={150}
                    className="w-full h-40 object-cover rounded"
                  />
                  <h3 className="mt-2 text-lg font-bold text-white truncate">
                    {book.volumeInfo.title}
                  </h3>
                  <p className="text-sm text-purple-200 truncate">
                    {book.volumeInfo.authors?.join(", ") || "Unknown Author"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
