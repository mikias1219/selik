"use client";

import { useState, useEffect } from "react";
import WatchlistButton from "./WatchListButton";

interface Episode {
  Title: string;
  Episode: string;
  imdbID: string;
  Released: string;
  Poster: string;
}

interface Season {
  Season: string;
  Episodes: Episode[];
}

interface SeriesEpisodesProps {
  imdbID: string;
  seasons: Season[];
}

export default function SeriesEpisodes({
  imdbID,
  seasons,
}: SeriesEpisodesProps) {
  const [selectedSeason, setSelectedSeason] = useState<string>(
    seasons[0]?.Season || "1"
  );
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    const selected = seasons.find((s) => s.Season === selectedSeason);
    setEpisodes(selected?.Episodes || []);
  }, [selectedSeason, seasons]);

  if (seasons.length === 0) {
    return <p className="text-gray-400 italic">No episodes available</p>;
  }

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-semibold mb-6">Episodes</h2>
      <div className="mb-6">
        <label htmlFor="season-select" className="text-lg font-medium mr-4">
          Select Season:
        </label>
        <select
          id="season-select"
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {seasons.map((season) => (
            <option key={season.Season} value={season.Season}>
              Season {season.Season}
            </option>
          ))}
        </select>
      </div>
      {episodes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {episodes.map((episode) => (
            <div
              key={episode.imdbID}
              className="bg-white/5 backdrop-blur border border-white/40 rounded-2xl shadow-md hover:shadow-xl transition-transform hover:-translate-y-1 overflow-hidden"
            >
              <img
                src={
                  episode.Poster !== "N/A"
                    ? episode.Poster
                    : "/placeholder-image.jpg"
                }
                alt={episode.Title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold truncate">
                  {episode.Title}
                </h3>
                <p className="text-sm text-gray-400">
                  Episode {episode.Episode}
                </p>
                <p className="text-sm text-gray-400">
                  {episode.Released || "N/A"}
                </p>
                <div className="mt-4">
                  <WatchlistButton
                    id={episode.imdbID}
                    title={`${episode.Title} (S${selectedSeason}E${episode.Episode})`}
                    type="episode"
                    thumbnail={episode.Poster}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic">
          No episodes found for this season
        </p>
      )}
    </section>
  );
}
