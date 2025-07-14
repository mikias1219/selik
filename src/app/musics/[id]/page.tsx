"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";
import { Play, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface Track {
  id: number;
  title: string;
  artist: { name: string; id?: number };
  album: { cover_medium: string; title: string };
  preview: string;
  duration: number;
  release_date: string;
}

interface MusicVideo {
  id: string;
  title: string;
  url: string;
}

const FALLBACK_IMAGE = "https://via.placeholder.com/300?text=No+Cover";
const FALLBACK_VIDEO = "https://www.youtube.com/embed/dQw4w9WgXcQ";

export default function MusicDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [track, setTrack] = useState<Track | null>(null);
  const [similarTracks, setSimilarTracks] = useState<Track[]>([]);
  const [musicVideo, setMusicVideo] = useState<MusicVideo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/lib/api/deezer/track/${id}`);
        const data = await res.json();
        setTrack(data);

        const similarRes = await fetch(`/lib/api/deezer/similar/${id}`);
        const similarData = await similarRes.json();
        setSimilarTracks(similarData.data || []);

        const key = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
        if (key) {
          const query = encodeURIComponent(
            `${data.title} ${data.artist.name} music video`
          );
          const ytRes = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&key=${key}&maxResults=1`
          );
          const ytData = await ytRes.json();
          if (ytData.items?.length > 0) {
            const videoId = ytData.items[0].id.videoId;
            setMusicVideo({
              id: videoId,
              title: ytData.items[0].snippet.title,
              url: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`,
            });
          }
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load music data", { theme: "dark" });
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (!track) return;
    window.dispatchEvent(
      new CustomEvent("add-to-cart", {
        detail: {
          id: track.id,
          title: track.title,
          price: 1.99,
          type: "music",
          thumbnail: track.album.cover_medium,
        },
      })
    );
    toast.success(`${track.title} added to cart`, { theme: "dark" });
  };

  const handlePlayTrack = () => {
    if (!track) return;
    window.dispatchEvent(new CustomEvent("play-track", { detail: track }));
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading || !track) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 🎬 Hero Section with Video Background */}
      <section className="relative h-[80vh] w-[80%] overflow-hidden">
        {musicVideo ? (
          <iframe
            src={`${musicVideo.url}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${musicVideo.id}`}
            title={musicVideo.title}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 bg-gray-900" />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm" />
        <div className="relative z-10 container mx-auto px-6 py-20 flex flex-col lg:flex-row items-center justify-between h-full">
          {/* <Image
            src={track.album.cover_medium || FALLBACK_IMAGE}
            alt={track.title}
            width={300}
            height={300}
            className="rounded-2xl shadow-lg mb-6 lg:mb-0"
          /> */}
          <div className=" absolute right-5 bottom-14 max-w-md text-center lg:text-left backdrop-blur p-4 bg-black/40 rounded-md shadow-md">
            <h1 className="text-xl font-bold text-white drop-shadow mb-1">
              {track.title}
            </h1>
            <p className="text-sm text-purple-300 font-medium mb-3">
              {track.artist.name}
            </p>
            <p className="text-sm text-gray-300 mb-1">
              <strong>Album:</strong> {track.album.title}
            </p>
            <p className="text-sm text-gray-300 mb-1">
              <strong>Duration:</strong> {formatDuration(track.duration)}
            </p>
            <p className="text-sm text-gray-300 mb-4">
              <strong>Released:</strong> {track.release_date}
            </p>
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              <button
                onClick={handlePlayTrack}
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-sm text-white font-semibold px-4 py-2 rounded hover:scale-105 shadow transition"
              >
                <Play className="inline w-4 h-4 mr-1" />
                Play
              </button>
              <button
                onClick={handleAddToCart}
                className="bg-gradient-to-r from-cyan-600 to-teal-500 text-sm text-white font-semibold px-4 py-2 rounded hover:scale-105 shadow transition"
              >
                <Plus className="inline w-4 h-4 mr-1" />
                Add
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 🎵 Similar Tracks Section */}
      {similarTracks.length > 0 && (
        <section className="relative container px-4 py-16 overflow-hidden rounded-xl">
          {/* Background Gradient & Animated Blob */}
          <div className="absolute inset-0 z-0 opacity-70 bg-gradient-to-br from-purple-700 to-pink-600 rounded-xl filter blur-3xl" />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, type: "spring", stiffness: 50 }}
            className="absolute top-1/4 left-1/4 w-48 h-48 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.2,
              duration: 1,
              type: "spring",
              stiffness: 50,
            }}
            className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"
          />

          <h2 className="relative z-10 text-4xl font-extrabold text-white mb-12 text-center lg:text-left drop-shadow-lg">
            🎧 Similar Tracks You Might{" "}
            <span className="text-pink-300">Love</span>
          </h2>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {similarTracks.slice(0, 8).map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.4)" }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => router.push(`/musics/${item.id}`)}
                className="relative cursor-pointer overflow-hidden rounded-2xl shadow-xl group transition-all duration-300 bg-gray-900 border border-gray-800"
              >
                {/* Album Cover */}
                <Image
                  src={item.album.cover_medium || FALLBACK_IMAGE}
                  alt={item.title}
                  width={400}
                  height={400}
                  className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />

                {/* Gradient Overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 via-black/70 to-transparent z-10" />

                {/* Text Overlay */}
                <div className="absolute bottom-4 left-4 right-4 z-20">
                  <h3 className="text-white text-xl font-bold truncate drop-shadow-lg">
                    {item.title}
                  </h3>
                  <p className="text-purple-300 text-sm mt-1 truncate drop-shadow-md">
                    {item.artist.name}
                  </p>
                </div>

                {/* Hover Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-100 scale-0 transition-transform duration-300"
                  >
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.button>
                </div>

                {/* Subtle Border Glow on Hover */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-50 blur transition-all duration-300 z-0" />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
