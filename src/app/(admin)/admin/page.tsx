"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/hooks/useAdminAuth";
import Sidebar from "./components/Sidebar";
import ContentArea from "./components/ContentArea";
import { useMediaManager } from "./hooks/useMediaData"; // renamed file
import { Movie, Game, Music, Ebook, Software } from "./types";

// Define MediaType to match your media categories
type MediaType =
  | "movies"
  | "games"
  | "music"
  | "ebooks"
  | "softwares"
  | "stats";

export default function AdminPanel() {
  const router = useRouter();
  const { admin, token, loading, logout, error } = useAdminAuth();

  const [activeTab, setActiveTab] = useState<MediaType | "stats">("movies");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  // Hook for each media type with full CRUD
  const moviesData = useMediaManager<Movie>("movies", token || "");
  const gamesData = useMediaManager<Game>("games", token || "");
  const musicData = useMediaManager<Music>("music", token || "");
  const ebooksData = useMediaManager<Ebook>("ebooks", token || "");
  const softwaresData = useMediaManager<Software>("softwares", token || "");

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && (!admin || !token)) {
      console.log("AdminPanel: Redirecting due to auth failure:", {
        admin,
        token,
        error,
      });
      router.replace("/");
    }
  }, [loading, admin, token, error, router]);

  // Show loading or error state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-black">
        <span className="animate-spin border-4 border-purple-500 border-t-transparent rounded-full h-12 w-12" />
      </div>
    );
  }

  if (!admin || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-black">
        <p className="text-red-500">
          {error || "Authentication failed. Please log in again."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white font-cinematic">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
        onLogout={logout}
      />
      <ContentArea
        activeTab={activeTab}
        movies={moviesData.data}
        setMovies={moviesData.setData}
        games={gamesData.data}
        setGames={gamesData.setData}
        music={musicData.data}
        setMusic={musicData.setData}
        ebooks={ebooksData.data}
        setEbooks={ebooksData.setData}
        softwares={softwaresData.data}
        setSoftwares={softwaresData.setData}
        error={
          moviesData.error ||
          gamesData.error ||
          musicData.error ||
          ebooksData.error ||
          softwaresData.error ||
          null
        }
      />
    </div>
  );
}
