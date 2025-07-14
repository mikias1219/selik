"use client";

import { toast } from "react-toastify";

interface WatchlistButtonProps {
  id: string;
  title: string;
  type: "movie" | "series" | "episode";
  thumbnail: string;
}

export default function WatchlistButton({
  id,
  title,
  type,
  thumbnail,
}: WatchlistButtonProps) {
  const addToWatchlist = () => {
    window.dispatchEvent(
      new CustomEvent("add-to-cart", {
        detail: {
          id,
          title,
          price: 9.99,
          type,
          thumbnail: thumbnail !== "N/A" ? thumbnail : "/placeholder-image.jpg",
        },
      })
    );
    toast.success(`${title} added to watchlist!`, {
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
    <button
      onClick={addToWatchlist}
      className="inline-flex items-center px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-md text-sm font-medium"
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      Add to Watchlist
    </button>
  );
}
