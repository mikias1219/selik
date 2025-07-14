"use client";

import StatsView from "../../admin/components/StatsView";
import { Movie, Game, Music, Ebook, Poster } from "../types";

interface StatsPageProps {
  movies: Movie[];
  games: Game[];
  music: Music[];
  ebooks: Ebook[];
  posters: Poster[];
  sales?: { mediaType: string; revenue: number; date: string; id: string }[];
}

export default function StatsPage({
  movies,
  games,
  music,
  ebooks,
  posters,
  sales,
}: StatsPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-cinema-gray/50 p-8">
      <StatsView
        movies={movies}
        games={games}
        music={music}
        ebooks={ebooks}
        posters={posters}
        sales={sales}
        viewMode="cards" // Default to cards for standalone
      />
    </div>
  );
}
