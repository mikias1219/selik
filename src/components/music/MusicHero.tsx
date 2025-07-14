"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Pause,
  Play,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  Repeat,
  Repeat1,
} from "lucide-react";

interface Track {
  id: number;
  title: string;
  artist: { name: string };
  album: { cover_medium: string };
  preview: string;
}

interface MusicHeroProps {
  currentTrack: Track | null;
  tracks: Track[];
  setCurrentTrack: (track: Track | null) => void;
}

const FALLBACK_IMAGE = "https://via.placeholder.com/200?text=No+Cover";
const FALLBACK_AUDIO =
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

export default function MusicHero({
  currentTrack,
  tracks,
  setCurrentTrack,
}: MusicHeroProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [repeatMode, setRepeatMode] = useState<"none" | "one" | "all">("none");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle audio playback
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      const audioUrl = currentTrack.preview || FALLBACK_AUDIO;
      audioRef.current.src = audioUrl;
      audioRef.current.volume = volume;

      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Playback failed:", error);
            setIsPlaying(false);
          });
        }
      } else {
        audioRef.current.pause();
      }

      audioRef.current.addEventListener("error", () => {
        console.error("Audio error:", audioRef.current?.error);
      });
      audioRef.current.addEventListener("canplay", () => {
        console.log("Audio can play:", audioUrl);
      });
    }
  }, [currentTrack, isPlaying, volume]);

  // Update progress bar and handle repeat
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        setProgress(progressPercent);
      } else {
        setProgress(0);
      }
    };

    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play();
      } else if (repeatMode === "all" && tracks.length > 0) {
        handleNext();
      } else {
        setIsPlaying(false);
        setProgress(0);
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [repeatMode, tracks]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(
      (track) => track.id === currentTrack.id
    );
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(
      (track) => track.id === currentTrack.id
    );
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrack(tracks[prevIndex]);
    setIsPlaying(true);
  };

  const handleShuffle = () => {
    if (tracks.length === 0) return;
    const randomIndex = Math.floor(Math.random() * tracks.length);
    setCurrentTrack(tracks[randomIndex]);
    setIsPlaying(true);
  };

  const handleRepeat = () => {
    setRepeatMode((prev) =>
      prev === "none" ? "one" : prev === "one" ? "all" : "none"
    );
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      audioRef.current &&
      audioRef.current.duration &&
      !isNaN(audioRef.current.duration)
    ) {
      const seekPercent = parseFloat(e.target.value);
      const seekTime = (seekPercent / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
      setProgress(seekPercent);
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <section className="relative flex h-[60vh] w-[80%] flex-col mt-16 items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="h-full w-full animate-pulse bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500" />
      </div>
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-6 px-4  rounded-xl bg-black/15 p-8 shadow-2xl backdrop-blur transition-all duration-300 hover:shadow-purple-700/10">
        {currentTrack && currentTrack.album.cover_medium ? (
          <>
            <div className="relative">
              <Image
                src={currentTrack.album.cover_medium || FALLBACK_IMAGE}
                alt={currentTrack.title || "Track Cover"}
                width={250}
                height={250}
                className="rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white drop-shadow-md">
                {currentTrack.title}
              </h1>
              <p className="text-lg text-gray-300">
                {currentTrack.artist.name}
              </p>
            </div>
            <div className="w-full relative">
              <input
                type="range"
                value={progress}
                onChange={handleSeek}
                min="0"
                max="100"
                className="w-full cursor-pointer accent-purple-600 rounded-full h-2 bg-gray-700 appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-runnable-track]:bg-gradient-to-r [&::-webkit-slider-runnable-track]:from-purple-600 [&::-webkit-slider-runnable-track]:to-blue-500"
              />
              <div className="absolute top-4 left-0 right-0 h-2 rounded-full bg-purple-700/10 -z-10" />
            </div>
            <div className="flex items-center gap-4">
              <div className="group relative">
                <button
                  onClick={handleShuffle}
                  title="Shuffle"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <Shuffle className="h-5 w-5" />
                </button>
                <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2">
                  Shuffle
                </span>
              </div>
              <div className="group relative">
                <button
                  onClick={handlePrevious}
                  title="Previous"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <SkipBack fill="white" className="h-5 w-5" />
                </button>
                <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2">
                  Previous
                </span>
              </div>
              <button
                onClick={togglePlayPause}
                className="rounded-full bg-purple-600/50 p-3 text-white hover:bg-purple-700 shadow-lg hover:shadow-purple-500/10 transition-all duration-200"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" fill="white" />
                ) : (
                  <Play className="h-5 w-5" fill="white" />
                )}
              </button>
              <div className="group relative">
                <button
                  onClick={handleNext}
                  title="Next"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <SkipForward fill="white" className="h-5 w-5" />
                </button>
                <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2">
                  Next
                </span>
              </div>
              <div className="group relative">
                <button
                  onClick={handleRepeat}
                  title={`Repeat: ${repeatMode}`}
                  className={`transition-colors duration-200 ${
                    repeatMode !== "none" ? "text-purple-400" : "text-gray-300"
                  } hover:text-white`}
                >
                  {repeatMode === "one" ? (
                    <Repeat1 className="h-5 w-5" />
                  ) : (
                    <Repeat className="h-5 w-5" />
                  )}
                </button>
                <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2">
                  {repeatMode === "none"
                    ? "No Repeat"
                    : repeatMode === "one"
                    ? "Repeat One"
                    : "Repeat All"}
                </span>
              </div>
              <div className="absolute bottom-1 right-2 flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-gray-300" />
                <input
                  type="range"
                  value={volume}
                  onChange={handleVolume}
                  min="0"
                  max="1"
                  step="0.01"
                  className="w-16 accent-purple-600 rounded-full h-1 bg-gray-700 appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-300">Loading track...</p>
        )}
      </div>
      <audio ref={audioRef} />
    </section>
  );
}
