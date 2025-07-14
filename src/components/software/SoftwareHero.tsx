import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

interface Software {
  id: string;
  name: string;
  background_image: string;
  category: string;
  description: string;
  downloadLink: string;
  safetyScore: number;
}

interface SoftwareHeroProps {
  software: Software;
}

export default function SoftwareHero({ software }: SoftwareHeroProps) {
  if (!software) return null;

  return (
    <div className="relative w-[80%] h-80 md:h-96 my-10">
      <Image
        src={
          software.background_image !== "N/A"
            ? software.background_image
            : "/placeholder.jpg"
        }
        alt={software.name}
        layout="fill"
        className="object-cover brightness-50 rounded-lg"
        style={{ objectFit: "cover", objectPosition: "top" }}
        priority
      />
      <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {software.name}
        </h1>
        <p className="text-sm text-gray-300 mb-2">
          {software.category} | Safety Score: {software.safetyScore}/100
        </p>
        <p className="text-sm text-gray-200 line-clamp-2 mb-4">
          {software.description}
        </p>
        <Link
          href={`/software/${software.id}`}
          className="w-48 text-center px-6 py-3 bg-purple-500/80 text-white font-semibold rounded-lg shadow-md hover:bg-purple-500 transition-all duration-300 transform hover:scale-105"
        >
          View Details
        </Link>
      </div>
      <div className="absolute top-4 left-4 flex items-center gap-2 p-2 backdrop-blur-lg bg-white/10 rounded-xl border border-white/20">
        <Star fill="#FFD700" stroke="#FFD700" className="w-5 h-5" />
        <p className="text-white font-semibold text-sm">
          {software.safetyScore}/100
        </p>
      </div>
    </div>
  );
}
