"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import axios from "axios"; // Added axios import
import GenericTable, { Column } from "./GenericTable";
import GenericCard from "./GenericCard";
import StatsView from "./StatsView";
import ErrorAlert from "./ErrorAlert";
import Modal from "./Modal";
import MediaForm, { MediaFormData } from "./MediaForm";
import AddUserModal from "./AddUserModal";
import { Movie, Game, Music, Ebook, Software } from "../types";
import { useMediaManager } from "../hooks/useMediaData";
import { debounce } from "lodash";

// Unified interface for all media types
interface MediaItem {
  id?: string | number;
  title: string;
  description?: string;
  genre?: string | string[];
  cover_image?: string;
  trailer?: string;
  content_metadata?: Record<string, any>;
  items?: Array<{
    id?: string | number;
    title?: string;
    price?: string | number;
    path?: string;
    item_metadata?: Record<string, any>;
  }>;
}

interface EndUserCreate {
  username?: string | null;
  password?: string | null;
  phonenumber?: string | null;
  balance?: number | null;
}

interface Sale {
  mediaType: string;
  revenue: number;
  date: string;
  id: string;
}

interface ContentAreaProps {
  activeTab: MediaType | "stats";
  movies: Movie[];
  setMovies: (movies: Movie[]) => void;
  games: Game[];
  setGames: (games: Game[]) => void;
  music: Music[];
  setMusic: (music: Music[]) => void;
  ebooks: Ebook[];
  setEbooks: (ebooks: Ebook[]) => void;
  softwares: Software[];
  setSoftwares: (datas: Software[]) => void;
  error: string | null;
  sales?: Sale[];
  token: string;
}

type MediaType = "movies" | "games" | "music" | "ebooks" | "softwares";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const NUMBER_FIELDS = [
  "release_year",
  "duration_minutes",
  "number_of_tracks",
  "pages",
  "episodes",
  "filesize",
];

const emptyMediaData: MediaFormData = {
  title: "",
  description: "",
  genre: [],
  cover_image: "",
  trailer: "",
  content_metadata: { is_series: false, is_album: false },
  items: [
    {
      title: "",
      price: "",
      path: "",
      item_metadata: { resolution: "" },
    },
  ],
};

const getColumns = (
  activeTab: MediaType | "stats",
  viewMode: "table" | "cards"
): Column<MediaItem>[] => {
  const coverColumn: Column<MediaItem>[] =
    viewMode === "table"
      ? [
          {
            header: "Cover",
            accessor: (item: MediaItem) =>
              item.cover_image ? (
                <Image
                  src={item.cover_image}
                  alt={item.title}
                  width={64}
                  height={96}
                  className="rounded-lg shadow-sm"
                  priority
                />
              ) : (
                "—"
              ),
          },
        ]
      : [];

  const genreAccessor = (item: MediaItem) =>
    Array.isArray(item.genre)
      ? item.genre.join(", ")
      : typeof item.genre === "string"
      ? item.genre
      : "—";

  switch (activeTab) {
    case "movies":
      return [
        ...coverColumn,
        { header: "Title", accessor: "title" },
        { header: "Description", accessor: "description" },
        { header: "Genre", accessor: genreAccessor },
        {
          header: "Year",
          accessor: (item: MediaItem) =>
            item.content_metadata?.release_year ?? "—",
        },
        {
          header: "Type",
          accessor: (item: MediaItem) =>
            item.content_metadata?.is_series ? "Series" : "Movie",
        },
      ];
    case "games":
      return [
        ...coverColumn,
        { header: "Title", accessor: "title" },
        { header: "Description", accessor: "description" },
        { header: "Genre", accessor: genreAccessor },
        {
          header: "Studio",
          accessor: (item: MediaItem) => item.content_metadata?.studio ?? "—",
        },
      ];
    case "music":
      return [
        ...coverColumn,
        { header: "Title", accessor: "title" },
        { header: "Description", accessor: "description" },
        { header: "Genre", accessor: genreAccessor },
        {
          header: "Artist",
          accessor: (item: MediaItem) => item.content_metadata?.artist ?? "—",
        },
      ];
    case "ebooks":
      return [
        ...coverColumn,
        { header: "Title", accessor: "title" },
        { header: "Description", accessor: "description" },
        { header: "Genre", accessor: genreAccessor },
        {
          header: "Author",
          accessor: (item: MediaItem) => item.content_metadata?.author ?? "—",
        },
      ];
    case "softwares":
      return [
        ...coverColumn,
        { header: "Title", accessor: "title" },
        { header: "Description", accessor: "description" },
        { header: "Genre", accessor: genreAccessor },
        {
          header: "Version",
          accessor: (item: MediaItem) => item.content_metadata?.version ?? "—",
        },
      ];
    default:
      return [];
  }
};

const ContentArea = ({
  activeTab,
  movies,
  setMovies,
  games,
  setGames,
  music,
  setMusic,
  ebooks,
  setEbooks,
  softwares,
  setSoftwares,
  error,
  sales,
  token: tokenFromProps,
}: ContentAreaProps) => {
  const [showForm, setShowForm] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [mediaFormData, setMediaFormData] =
    useState<MediaFormData>(emptyMediaData);
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [formError, setFormError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    search: string;
    genres: string[];
  }>({
    search: "",
    genres: [],
  });
  const [searchInput, setSearchInput] = useState<string>("");
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const isSeries =
    activeTab === "movies" && mediaFormData.content_metadata.is_series;

  const {
    data,
    error: apiError,
    loading,
    genres,
    createContent,
    updateContent,
    deleteContent,
  } = useMediaManager<MediaItem>(activeTab, tokenFromProps, filters);

  const token =
    tokenFromProps ||
    (typeof window !== "undefined" ? localStorage.getItem("admin_token") : "");

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  const handleAddUser = useCallback(
    async (data: EndUserCreate) => {
      if (!token) {
        console.warn("handleAddUser: No authentication token found");
        throw new Error("No authentication token found. Please log in.");
      }

      try {
        console.log("handleAddUser: Sending request with token:", token);
        console.log("handleAddUser: Request payload:", data);
        const response = await axios.post(
          "http://127.0.0.1:8000/auth/register-user",
          data,
          {
            headers: getHeaders(),
          }
        );
        console.log("handleAddUser: Response:", response.data);
        return response.data;
      } catch (err: any) {
        console.error("handleAddUser: Error:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        const errorMessage =
          err.response?.data?.detail || err.message || "Failed to create user";
        throw new Error(errorMessage);
      }
    },
    [token]
  );

  useEffect(() => {
    console.log("ContentArea: activeTab =", activeTab, "data =", data);
    switch (activeTab) {
      case "movies":
        setMovies(data as Movie[]);
        break;
      case "games":
        setGames(data as Game[]);
        break;
      case "music":
        setMusic(data as Music[]);
        break;
      case "ebooks":
        setEbooks(data as Ebook[]);
        break;
      case "softwares":
        setSoftwares(data as Software[]);
        break;
    }
  }, [data, activeTab, setMovies, setGames, setMusic, setEbooks, setSoftwares]);

  useEffect(() => {
    if (activeTab === "stats") return;

    if (!editingItem) {
      setMediaFormData((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(emptyMediaData)) {
          return emptyMediaData;
        }
        return prev;
      });
      return;
    }

    const metadata = editingItem.content_metadata || {};
    const items =
      Array.isArray(editingItem.items) && editingItem.items.length
        ? editingItem.items.map((item) => ({
            id: item.id,
            title: item.title || "",
            price: item.price ?? "",
            path: item.path || "",
            item_metadata: {
              resolution: item.item_metadata?.resolution || "",
              duration: item.item_metadata?.duration || "",
              bitrate: item.item_metadata?.bitrate || "",
              filesize: item.item_metadata?.filesize || undefined,
            },
          }))
        : [emptyMediaData.items[0]];

    const formData: MediaFormData = {
      id: editingItem.id,
      title: editingItem.title || "",
      description: editingItem.description || "",
      genre: Array.isArray(editingItem.genre)
        ? editingItem.genre
        : typeof editingItem.genre === "string"
        ? editingItem.genre.split(",").map((g) => g.trim())
        : [],
      cover_image: editingItem.cover_image || "",
      trailer: editingItem.trailer || "",
      content_metadata: {},
      items,
    };

    switch (activeTab) {
      case "movies":
        formData.content_metadata = {
          director: metadata.director || "",
          release_year: metadata.release_year ?? "",
          duration_minutes: metadata.duration_minutes ?? "",
          is_series: metadata.is_series || false,
          episodes: metadata.episodes ?? "",
        };
        break;
      case "games":
        formData.content_metadata = {
          developer: metadata.developer || "",
          release_year: metadata.release_year ?? "",
          platform: metadata.platform || "",
        };
        break;
      case "music":
        formData.content_metadata = {
          artist: metadata.artist || "",
          album: metadata.album || "",
          release_year: metadata.release_year ?? "",
          is_album: metadata.is_album || false,
        };
        break;
      case "ebooks":
        formData.content_metadata = {
          author: metadata.author || "",
          publisher: metadata.publisher || "",
          publication_year: metadata.publication_year ?? "",
        };
        break;
      case "softwares":
        formData.content_metadata = {
          version: metadata.version || "",
          release_year: metadata.release_year ?? "",
        };
        break;
    }

    setMediaFormData((prev) => {
      const prevStr = JSON.stringify(prev);
      const nextStr = JSON.stringify(formData);
      if (prevStr !== nextStr) {
        return formData;
      }
      return prev;
    });
  }, [editingItem, activeTab]);

  const handleDelete = useCallback(
    async (id: string | number, type: MediaType) => {
      if (!confirm("Are you sure you want to delete this item?")) return;
      try {
        await deleteContent(Number(id));
        switch (type) {
          case "movies":
            setMovies(movies.filter((m) => String(m.id) !== String(id)));
            break;
          case "games":
            setGames(games.filter((g) => String(g.id) !== String(id)));
            break;
          case "music":
            setMusic(music.filter((m) => String(m.id) !== String(id)));
            break;
          case "ebooks":
            setEbooks(ebooks.filter((e) => String(e.id) !== String(id)));
            break;
          case "softwares":
            setSoftwares(softwares.filter((s) => String(s.id) !== String(id)));
            break;
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete content";
        setFormError(errorMessage);
        console.error("handleDelete: Error:", err);
      }
    },
    [
      movies,
      games,
      music,
      ebooks,
      softwares,
      deleteContent,
      setMovies,
      setGames,
      setMusic,
      setEbooks,
      setSoftwares,
    ]
  );

  const handleSubmit = useCallback(
    async (data: MediaFormData) => {
      if (activeTab === "stats") return;

      if (!data.title.trim()) {
        setFormError("Title is required");
        return;
      }

      if (
        !data.genre ||
        !Array.isArray(data.genre) ||
        data.genre.length === 0
      ) {
        setFormError("At least one genre is required");
        return;
      }

      if (
        data.items.some(
          (item) =>
            !item.id &&
            (!item.path?.trim() ||
              item.price === "" ||
              isNaN(Number(item.price)))
        )
      ) {
        setFormError("New items must have a valid path and price");
        return;
      }

      const payload: Partial<MediaFormData> = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        genre: data.genre.map((g) => g.trim()).filter((g) => g),
        cover_image: data.cover_image?.trim() || undefined,
        trailer:
          activeTab === "movies"
            ? data.trailer?.trim() || undefined
            : undefined,
        content_metadata: {},
        items: data.items
          .map((item) => ({
            id: item.id,
            title: item.title?.trim() || undefined,
            price:
              item.price === "" ? undefined : Number(item.price) || undefined,
            path: item.id ? undefined : item.path?.trim() || undefined,
            item_metadata:
              Object.fromEntries(
                Object.entries(item.item_metadata || {})
                  .filter(([_, value]) => value !== "" && value !== undefined)
                  .map(([key, value]) => [
                    key,
                    typeof value === "string" && key === "filesize"
                      ? Number(value) || undefined
                      : value,
                  ])
              ) || undefined,
          }))
          .filter((item) => item.title || item.price || item.path),
      };

      const cm = data.content_metadata;
      if (Object.values(cm).some((v) => v !== "" && v !== undefined)) {
        payload.content_metadata = {};
        for (const [key, value] of Object.entries(cm)) {
          if (value !== "" && value !== undefined) {
            payload.content_metadata[key] =
              typeof value === "string" && NUMBER_FIELDS.includes(key)
                ? Number(value) || undefined
                : value;
          }
        }
      } else {
        delete payload.content_metadata;
      }

      if (payload.items) {
        payload.items = payload.items.map((item) => ({
          ...item,
          item_metadata: Object.values(item.item_metadata || {}).some((v) => v)
            ? item.item_metadata
            : undefined,
        }));
      }

      try {
        let result: MediaItem;
        if (editingItem && data.id) {
          result = await updateContent(Number(data.id), payload);
          switch (activeTab) {
            case "movies":
              setMovies(
                movies.map((m) => (m.id === data.id ? (result as Movie) : m))
              );
              break;
            case "games":
              setGames(
                games.map((g) => (g.id === data.id ? (result as Game) : g))
              );
              break;
            case "music":
              setMusic(
                music.map((m) => (m.id === data.id ? (result as Music) : m))
              );
              break;
            case "ebooks":
              setEbooks(
                ebooks.map((e) => (e.id === data.id ? (result as Ebook) : e))
              );
              break;
            case "softwares":
              setSoftwares(
                softwares.map((s) =>
                  s.id === data.id ? (result as Software) : s
                )
              );
              break;
          }
        } else {
          result = await createContent(payload);
          switch (activeTab) {
            case "movies":
              setMovies([...movies, result as Movie]);
              break;
            case "games":
              setGames([...games, result as Game]);
              break;
            case "music":
              setMusic([...music, result as Music]);
              break;
            case "ebooks":
              setEbooks([...ebooks, result as Ebook]);
              break;
            case "softwares":
              setSoftwares([...softwares, result as Software]);
              break;
          }
        }

        setShowForm(false);
        setEditingItem(null);
        setFormError(null);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to save content";
        setFormError(errorMessage);
        console.error("handleSubmit: Error:", err, "Payload:", payload);
      }
    },
    [
      activeTab,
      movies,
      games,
      music,
      ebooks,
      softwares,
      editingItem,
      createContent,
      updateContent,
      setMovies,
      setGames,
      setMusic,
      setEbooks,
      setSoftwares,
    ]
  );

  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setIsFilterLoading(true);
      setFilters((prev) => {
        const newFilters = { ...prev, search: value.trim() };
        console.log("debouncedSetSearch: Updated filters:", newFilters);
        return newFilters;
      });
      setIsFilterLoading(false);
    }, 300),
    []
  );

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, selectedOptions } = e.target as HTMLSelectElement & {
        selectedOptions: HTMLCollectionOf<HTMLOptionElement>;
      };
      if (name === "genres") {
        const selectedGenres = Array.from(selectedOptions).map(
          (option) => option.value
        );
        setFilters((prev) => {
          const newGenres = selectedGenres.includes("All")
            ? []
            : selectedGenres;
          const newFilters = { ...prev, genres: newGenres };
          console.log("handleFilterChange: Updated filters:", newFilters);
          return newFilters;
        });
      } else if (name === "search") {
        setSearchInput(value);
        if (value.trim().length >= 2 || value.trim().length === 0) {
          debouncedSetSearch(value);
        }
      }
    },
    [debouncedSetSearch]
  );

  const handleClearFilters = useCallback(() => {
    setFilters({ search: "", genres: [] });
    setSearchInput("");
    debouncedSetSearch.cancel();
    console.log("handleClearFilters: Filters cleared");
  }, [debouncedSetSearch]);

  const getData = useMemo(() => {
    switch (activeTab) {
      case "movies":
        return movies;
      case "games":
        return games;
      case "music":
        return music;
      case "ebooks":
        return ebooks;
      case "softwares":
        return softwares;
      default:
        return [];
    }
  }, [activeTab, movies, games, music, ebooks, softwares]);

  if (error || apiError) {
    return (
      <ErrorAlert
        message={error || apiError || "An error occurred"}
        className="max-w-2xl mx-auto mt-6"
      />
    );
  }

  return (
    <motion.div
      className="flex-1 p-6 overflow-auto bg-gradient-to-b from-gray-900 to-cinema-gray/50 backdrop-blur-md to-gray-800 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-2xl font-cinematic text-purple-300 capitalize mb-4 tracking-wide text-center">
          {activeTab === "movies" && isSeries ? "Series" : activeTab}
        </h2>
        <div className="flex flex-col sm:flex-row justify-end gap-3 p-3 rounded-xl shadow-md">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <input
              type="text"
              name="search"
              value={searchInput}
              onChange={handleFilterChange}
              className="w-full bg-gray-700 text-white px-4 py-2 pl-10 rounded-lg border border-gray-600 focus:outline-none focus:border-purple-400 transition-all"
              placeholder="Search by title..."
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
              />
            </svg>
          </div>
          {activeTab !== "stats" && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-all font-cinematic shadow-sm"
              >
                Add New
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddUserModal(true)}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-all font-cinematic shadow-sm"
              >
                Add New User
              </motion.button>
            </>
          )}
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as "table" | "cards")}
            className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-purple-400 transition-all sm:w-32"
          >
            <option value="cards">Cards</option>
            <option value="table">Table</option>
          </select>
          {activeTab !== "stats" && (
            <>
              <select
                name="genres"
                value={filters.genres[0] || "All"}
                onChange={handleFilterChange}
                className="bg-gray-700 p-2 rounded-md"
                size={1}
              >
                <option value="All">All Genres</option>
                {genres.sort().map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearFilters}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all shadow-sm"
              >
                Clear
              </motion.button>
            </>
          )}
        </div>
        {(filters.search || filters.genres.length > 0) && (
          <motion.div
            className="mt-3 text-sm text-gray-300 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p>
              Current filters: Search: "{filters.search || "None"}", Genres:{" "}
              {filters.genres.length > 0 ? filters.genres.join(", ") : "All"}
            </p>
          </motion.div>
        )}
      </div>

      {(formError || apiError) && (
        <ErrorAlert
          message={formError || apiError || "An error occurred"}
          className="max-w-2xl mx-auto mt-6"
        />
      )}
      {(loading || isFilterLoading) && (
        <p className="text-gray-300 text-center text-lg">Loading...</p>
      )}

      {showForm && activeTab !== "stats" ? (
        <Modal
          title={
            editingItem
              ? `Edit ${isSeries ? "Series" : activeTab.slice(0, -1)}`
              : `Add New ${isSeries ? "Series" : activeTab.slice(0, -1)}`
          }
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
            setFormError(null);
          }}
          footer={
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                  setFormError(null);
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit(mediaFormData)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
              >
                Save
              </button>
            </div>
          }
        >
          {mediaFormData ? (
            <MediaForm
              data={mediaFormData}
              onChange={setMediaFormData}
              onSubmit={handleSubmit}
              mediaType={activeTab}
            />
          ) : (
            <p className="text-red-500">Error: Form data is not initialized</p>
          )}
        </Modal>
      ) : null}

      {showAddUserModal && (
        <AddUserModal
          isOpen={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          onSubmit={handleAddUser}
          token={token}
        />
      )}

      {activeTab === "stats" ? (
        <StatsView
          movies={movies}
          games={games}
          music={music}
          ebooks={ebooks}
          softwares={softwares}
          sales={sales}
          viewMode={viewMode}
        />
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {getData.map((item) => (
            <GenericCard
              key={item.id}
              item={item}
              columns={getColumns(activeTab, viewMode)}
              type={activeTab}
              onEdit={(item) => {
                setEditingItem(item);
                setTimeout(() => setShowForm(true), 0);
              }}
              onDelete={(id) => handleDelete(id, activeTab)}
              onPreview={() => {}}
            />
          ))}
        </div>
      ) : (
        <GenericTable
          data={getData}
          columns={getColumns(activeTab, viewMode)}
          type={activeTab}
          onEdit={(item) => {
            setEditingItem(item);
            setTimeout(() => setShowForm(true), 0);
          }}
          onDelete={(id) => handleDelete(id, activeTab)}
          onPreview={() => {}}
          className="max-w-7xl mx-auto"
        />
      )}
    </motion.div>
  );
};

export default ContentArea;
