import Image from "next/image";
import { useRouter } from "next/navigation";

interface Ebook {
  id: string;
  title: string;
  authors?: string[];
  publishedDate?: string;
  thumbnail?: string;
  description: string;
  averageRating?: number;
  pageCount?: number;
}

interface HeroProps {
  ebook: Ebook;
}

const Hero = ({ ebook }: HeroProps) => {
  const router = useRouter();

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    router.push(`/ebooks/${ebook.id}`);
  };

  return (
    <div className="relative w-full bg-purple-900 py-12 sm:py-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
      <div className="relative max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="flex flex-col justify-center text-white space-y-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
            {ebook.title || "Untitled"}
          </h1>
          <p className="text-gray-200 text-base sm:text-lg line-clamp-4">
            {ebook.description || "No description available"}
          </p>
          <p className="text-gray-300 text-sm">
            {ebook.authors?.join(", ") || "Unknown Author"} •{" "}
            {ebook.publishedDate
              ? new Date(ebook.publishedDate).getFullYear()
              : "N/A"}
          </p>
          <button
            className="px-6 py-3 bg-purple-500/80 text-white font-semibold rounded-lg shadow-md hover:bg-purple-500 transition-all duration-300 w-fit transform hover:scale-105"
            onClick={handleClick}
          >
            Explore Now
          </button>
        </div>
        {/* Book Cover Image */}
        <div className="relative w-full max-w-sm mx-auto lg:mx-0 h-[350px] sm:h-[400px] rounded-xl overflow-hidden shadow-2xl">
          <Image
            src={
              ebook.thumbnail !== undefined
                ? ebook.thumbnail
                : "/placeholder.jpg"
            }
            alt={ebook.title}
            width={300}
            height={450}
            className="object-cover w-full h-full"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
