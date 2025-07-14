interface GenreFilterProps {
  genres: string[];
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
}

export default function GenreFilter({
  genres,
  selectedGenre,
  setSelectedGenre,
}: GenreFilterProps) {
  return (
    <div className="p-4 flex flex-wrap gap-2 justify-start">
      <button
        onClick={() => setSelectedGenre("")}
        className={`px-4 py-1 rounded-full ${
          selectedGenre === "" ? "bg-purple-600" : "bg-purple-800"
        } text-white text-sm`}
      >
        All
      </button>
      {genres.map((genre) => (
        <button
          key={genre}
          onClick={() => setSelectedGenre(genre)}
          className={`px-4 py-1 rounded-full ${
            selectedGenre === genre ? "bg-purple-600" : "bg-purple-800"
          } text-white text-sm`}
        >
          {genre}
        </button>
      ))}
    </div>
  );
}
