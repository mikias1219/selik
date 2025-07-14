"use client";

import ReactPlayer from "react-player/youtube";
import { useState } from "react";

interface MovieTrailerProps {
  trailerUrl: string | undefined;
  title: string;
}

export default function MovieTrailer({ trailerUrl, title }: MovieTrailerProps) {
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted for reliable autoplay

  if (!trailerUrl) {
    return <p className="text-gray-400 italic mb-6">Trailer not available</p>;
  }

  return (
    <div className="relative aspect-video mb-6">
      {!hasError ? (
        <>
          <ReactPlayer
            url={trailerUrl}
            width="100%"
            height="100%"
            controls
            playing={true} // Autoplay enabled
            muted={false} // Sound ON
            config={{
              playerVars: {
                autoplay: 1,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
              },
            }}
            onError={(e) => {
              console.error(`ReactPlayer error for ${title}:`, e);
              setHasError(true);
            }}
            className="rounded-lg"
          />
        </>
      ) : (
        <p className="text-gray-400 italic">Trailer failed to load</p>
      )}
      <p className="text-sm text-gray-400 mt-2">
        Trouble viewing?{" "}
        <a
          href={trailerUrl.replace("/embed/", "/watch?v=")}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:underline"
        >
          Watch on YouTube
        </a>
      </p>
    </div>
  );
}
