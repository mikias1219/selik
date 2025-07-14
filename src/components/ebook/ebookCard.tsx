import { Star } from "lucide-react";
import Image from "next/image";
import "react";

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

interface EbookCardProps {
  ebook: Ebook;
  onAddToCart: () => void;
  onSeeDetails: () => void;
}

const EbookCard = ({ ebook, onAddToCart, onSeeDetails }: EbookCardProps) => {
  return (
    <div className="relative w-full max-w-sm mx-auto rounded-2xl rounded-tl-none overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] bg-gradient-to-b from-gray-900/10 to-gray-900/5">
      <div className="relative w-full h-[400px] rounded-2xl rounded-tl-none overflow-hidden">
        <Image
          src={
            ebook.thumbnail !== undefined ? ebook.thumbnail : "/placeholder.jpg"
          }
          alt={ebook.title}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-500 ease-in-out hover:scale-105 brightness-90"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

        {ebook.averageRating && (
          <div className="absolute top-4 left-4 flex items-center gap-2 p-2 backdrop-blur-lg bg-white/10 rounded-xl border border-white/20">
            <Star fill="#FFD700" stroke="#FFD700" className="w-5 h-5" />
            <p className="text-white font-semibold text-sm">
              {(ebook.averageRating * 2).toFixed(1) || "N/A"}
              <span className="text-xs text-gray-300">/10</span>
            </p>
          </div>
        )}

        <div className="absolute top-4 right-4 p-2 backdrop-blur-lg bg-white/10 rounded-xl border border-white/20">
          <p className="text-white font-medium text-sm">
            {ebook.publishedDate
              ? new Date(ebook.publishedDate).getFullYear()
              : "N/A"}
          </p>
        </div>

        <div className="absolute bottom-12 left-4 right-4">
          <h3 className="text-white text-xl font-bold tracking-tight truncate">
            {ebook.title || "Untitled"}
          </h3>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-gray-200 text-sm font-medium capitalize bg-white/10 backdrop-blur-lg rounded-lg px-3 py-1 inline-block">
            eBook
          </p>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-500 ease-in-out">
          <button
            className="w-48 px-6 py-3 bg-purple-500/80 text-white font-semibold rounded-lg shadow-md hover:bg-purple-500 transition-all duration-300 transform hover:scale-105"
            onClick={(e) => {
              e.stopPropagation();
              onSeeDetails();
            }}
          >
            See Details
          </button>
          <button
            className="w-48 px-6 py-3 bg-teal-500/80 text-white font-semibold rounded-lg shadow-md hover:bg-teal-500 transition-all duration-300 transform hover:scale-105"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default EbookCard;
