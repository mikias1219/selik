"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Printer } from "lucide-react";

// Define interfaces
interface Movie {
  id: string;
  title: string;
  cover: string;
}

interface GridItem {
  id: string;
  isEmpty: boolean;
  movie?: Movie;
}

interface MovieItemProps {
  movie: Movie;
  id: string;
}

interface MovieListProps {
  movies: Movie[];
  onSearchChange: (query: string) => void;
}

interface GridItemProps {
  item: GridItem;
  id: string;
}

interface MovieGridProps {
  gridItems: GridItem[];
  rows: number;
  cols: number;
  droppedCount: number;
}

interface DragDropContainerProps {
  rows?: number;
  cols?: number;
}

// Sample movie data
const initialMovies: Movie[] = [
  {
    id: "1",
    title: "Movie 1",
    cover: "https://picsum.photos/150/225?random=1",
  },
  {
    id: "2",
    title: "Movie 2",
    cover: "https://picsum.photos/150/225?random=2",
  },
  {
    id: "3",
    title: "Movie 3",
    cover: "https://picsum.photos/150/225?random=3",
  },
  {
    id: "4",
    title: "Movie 4",
    cover: "https://picsum.photos/150/225?random=4",
  },
];

const genres = [
  "Action",
  "Comedy",
  "Drama",
  "Horror",
  "Sci-Fi",
  "Romance",
  "Thriller",
  "Documentary",
];

const countries = [
  "USA",
  "UK",
  "Ethiopia",
  "India",
  "France",
  "Japan",
  "Korea",
  "Nigeria",
];

const gridSizes = [
  { rows: 4, cols: 4 },
  { rows: 3, cols: 4 },
  { rows: 2, cols: 3 },
  { rows: 5, cols: 3 },
];

// MovieItem Component
const MovieItem: React.FC<MovieItemProps> = ({ movie, id }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useDraggable({ id });
  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="mb-2"
    >
      <img
        src={movie.cover}
        alt={movie.title}
        width={200}
        height={250}
        className="rounded-lg shadow-md border-2 border-white/10"
      />
    </div>
  );
};

// MovieList Component
const MovieList: React.FC<MovieListProps> = ({ movies, onSearchChange }) => {
  const { setNodeRef } = useDroppable({ id: "movie-list" });
  const [filterType, setFilterType] = useState<"genre" | "country">("genre");
  const [selectedValue, setSelectedValue] = useState<string>("");

  const handleFilterTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilterType = e.target.value as "genre" | "country";
    setFilterType(newFilterType);
    setSelectedValue("");
    onSearchChange("");
  };

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedValue(value);
    onSearchChange(value);
  };

  return (
    <div
      ref={setNodeRef}
      className="w-[15%] bg-white/5 p-4 rounded-lg shadow-lg mr-4"
    >
      <h2 className="text-xl font-bold text-purple-400 mb-4">Movie Covers</h2>
      <div className="mb-6">
        <label className="block text-purple-200 font-semibold mb-3 tracking-wide">
          Filter By:
        </label>
        <div className="relative">
          <select
            value={filterType}
            onChange={handleFilterTypeChange}
            className="w-full py-1 px-2 rounded-lg bg-gradient-to-r from-purple-700/50 to-purple-900/50 backdrop-blur-md text-white border border-purple-500/70 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300 appearance-none shadow-lg hover:shadow-purple-500/30"
          >
            <option
              value="genre"
              className="bg-purple-800/80 text-white hover:bg-purple-600/80"
            >
              Genre
            </option>
            <option
              value="country"
              className="bg-purple-800/80 text-white hover:bg-purple-600/80"
            >
              Country
            </option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-purple-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-purple-200 font-semibold mb-3 tracking-wide">
          Select {filterType === "genre" ? "Genre" : "Country"}:
        </label>
        <div className="relative">
          <select
            value={selectedValue}
            onChange={handleSelectionChange}
            className="w-full py-1 px-2 rounded-lg bg-gradient-to-r from-purple-700/50 to-purple-900/50 backdrop-blur-md text-white border border-purple-500/70 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300 appearance-none shadow-lg hover:shadow-purple-500/30"
          >
            <option value="" className="bg-purple-800/80 text-white">
              Select an option
            </option>
            {(filterType === "genre" ? genres : countries).map((option) => (
              <option
                key={option}
                value={option}
                className="bg-purple-800/80 text-white hover:bg-purple-600/80"
              >
                {option}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-purple-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
      <SortableContext
        items={movies.map((movie) => `movie-${movie.id}`)}
        strategy={verticalListSortingStrategy}
      >
        {movies.length > 0 ? (
          movies.map((movie) => (
            <MovieItem key={movie.id} id={`movie-${movie.id}`} movie={movie} />
          ))
        ) : (
          <p className="text-gray-400">No movies found</p>
        )}
      </SortableContext>
    </div>
  );
};

// GridItem Component
const GridItem: React.FC<GridItemProps> = ({ item, id }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useDraggable({
      id,
      disabled: false,
    });
  const { setNodeRef: setDroppableNodeRef } = useDroppable({ id });
  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };

  const content = item.isEmpty ? (
    <svg
      className="w-12 h-12 text-purple-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
        d="M12 4v16m8-8H4"
      />
    </svg>
  ) : (
    <img
      src={item.movie!.cover}
      alt={item.movie!.title}
      width={290}
      height={420}
      className="rounded"
    />
  );

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        setDroppableNodeRef(node);
      }}
      style={style}
      {...listeners}
      {...attributes}
      className="aspect-[2/3] bg-gray-700/20 rounded-lg flex items-center justify-center"
    >
      {content}
    </div>
  );
};

// MovieGrid Component
const MovieGrid: React.FC<MovieGridProps> = ({
  gridItems,
  rows,
  cols,
  droppedCount,
}) => {
  const { setNodeRef } = useDroppable({ id: "grid" });

  return (
    <div
      ref={setNodeRef}
      className="w-full bg-white/5 p-4 rounded-lg shadow-lg"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-purple-400">
          Movie Grid ({rows}x{cols}) - {droppedCount} posters
        </h2>
        <button
          className="flex items-center ml-4 gap-2 p-2 bg-purple-500/50 text-white rounded pointer hover:bg-purple-600"
          onClick={() => window.print()}
        >
          <span>Print</span>
          <Printer className="w-6 h-6" />
        </button>
      </div>
      <SortableContext
        items={gridItems.map((item) => `grid-${item.id}`)}
        strategy={rectSortingStrategy}
      >
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {gridItems.map((item) => (
            <GridItem key={item.id} id={`grid-${item.id}`} item={item} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

// DragDropContainer Component
const DragDropContainer: React.FC<DragDropContainerProps> = ({
  rows = 4,
  cols = 4,
}) => {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  const [selectedGridSize, setSelectedGridSize] = useState<{
    rows: number;
    cols: number;
  }>({ rows, cols });
  const [droppedCount, setDroppedCount] = useState<number>(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Initialize grid items based on selected grid size
  const initializeGrid = (r: number, c: number) => {
    const newGridItems = Array.from({ length: r * c }, (_, index) => ({
      id: `${index}`,
      isEmpty: true,
    }));
    setGridItems(newGridItems);
    setDroppedCount(0); // Reset count when grid size changes
  };

  // Handle grid size change
  const handleGridSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [r, c] = e.target.value.split("x").map(Number);
    setSelectedGridSize({ rows: r, cols: c });
    initializeGrid(r, c);
  };

  // Fetch movies from OMDB API
  const fetchMovies = async (query: string) => {
    if (!query) {
      setMovies(initialMovies);
      return;
    }

    try {
      const response = await fetch(
        `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${
          process.env.NEXT_PUBLIC_OMDB_API_KEY || "your_api_key"
        }`
      );
      const data = await response.json();

      if (data.Response === "True") {
        const moviesWithDetails: Movie[] = data.Search.map((movie: any) => ({
          id: movie.imdbID,
          title: movie.Title,
          cover:
            movie.Poster !== "N/A"
              ? movie.Poster
              : "https://picsum.photos/150/225",
        }));
        setMovies(moviesWithDetails);
      } else {
        setMovies([]);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      setMovies([]);
    }
  };

  const handleSearchChange = (query: string) => {
    fetchMovies(query);
  };

  // Handle drag end event
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!active || !over) {
      console.warn("Drag end event missing active or over:", { active, over });
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    const getId = (id: string) => id.split("-")[1];
    const sourceType = activeId.startsWith("movie") ? "movie-list" : "grid";
    const destType = overId.startsWith("movie") ? "movie-list" : "grid";

    if (sourceType === "movie-list" && destType === "grid") {
      const movieId = getId(activeId);
      const movieIndex = movies.findIndex((movie) => movie.id === movieId);
      if (movieIndex === -1) {
        console.warn("Movie not found:", movieId);
        return;
      }

      const newMovies = [...movies];
      const [movedMovie] = newMovies.splice(movieIndex, 1);

      const gridIndex = gridItems.findIndex(
        (item) => `grid-${item.id}` === overId
      );
      if (gridIndex === -1) {
        console.warn("Grid item not found:", overId);
        return;
      }

      const newGridItems = [...gridItems];
      const wasEmpty = newGridItems[gridIndex].isEmpty;
      newGridItems[gridIndex] = {
        id: getId(overId),
        isEmpty: false,
        movie: movedMovie,
      };

      setMovies(newMovies);
      setGridItems(newGridItems);
      if (wasEmpty) setDroppedCount((prev) => prev + 1); // Increment count only if slot was empty
    } else if (sourceType === "grid" && destType === "movie-list") {
      const gridIndex = gridItems.findIndex(
        (item) => `grid-${item.id}` === activeId
      );
      if (gridIndex === -1 || gridItems[gridIndex].isEmpty) {
        console.warn("Invalid grid item or empty:", activeId);
        return;
      }

      const newMovies = [...movies, gridItems[gridIndex].movie!];
      const newGridItems = [...gridItems];
      newGridItems[gridIndex] = {
        id: newGridItems[gridIndex].id,
        isEmpty: true,
        movie: undefined,
      };

      setMovies(newMovies);
      setGridItems(newGridItems);
      setDroppedCount((prev) => prev - 1); // Decrement count
    } else if (sourceType === "grid" && destType === "grid") {
      const activeIndex = gridItems.findIndex(
        (item) => `grid-${item.id}` === activeId
      );
      const overIndex = gridItems.findIndex(
        (item) => `grid-${item.id}` === overId
      );
      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
        console.warn("Invalid grid indices or same position:", {
          activeIndex,
          overIndex,
        });
        return;
      }

      const newGridItems = [...gridItems];
      [newGridItems[activeIndex], newGridItems[overIndex]] = [
        newGridItems[overIndex],
        newGridItems[activeIndex],
      ];

      setGridItems(newGridItems);
    }
  };

  // Initialize grid on mount
  useState(() => {
    initializeGrid(selectedGridSize.rows, selectedGridSize.cols);
  });

  return (
    <div className="flex mt-16 min-h-screen">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <MovieList movies={movies} onSearchChange={handleSearchChange} />
        <div className="flex flex-col w-[60%]">
          <div className="mb-4 ml-4">
            <label className="text-purple-200 font-semibold mr-2">
              Select Grid Size:
            </label>
            <select
              value={`${selectedGridSize.rows}x${selectedGridSize.cols}`}
              onChange={handleGridSizeChange}
              className="py-1 px-2 rounded-lg bg-purple-700 text-white border border-purple-500/70"
            >
              {gridSizes.map(({ rows, cols }) => (
                <option key={`${rows}x${cols}`} value={`${rows}x${cols}`}>
                  {rows}x{cols}
                </option>
              ))}
            </select>
          </div>
          <MovieGrid
            gridItems={gridItems}
            rows={selectedGridSize.rows}
            cols={selectedGridSize.cols}
            droppedCount={droppedCount}
          />
        </div>
      </DndContext>
    </div>
  );
};

export default DragDropContainer;
