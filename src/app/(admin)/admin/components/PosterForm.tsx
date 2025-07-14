import { useState } from "react";
import { Poster, Movie } from "../types";

interface FormProps<T> {
  onSubmit: (data: T) => void;
  initialData?: T;
  onCancel: () => void;
  movies?: Movie[];
}

export default function PosterForm({
  onSubmit,
  initialData,
  onCancel,
  movies,
}: FormProps<Poster> & { movies?: Movie[] }) {
  const [formData, setFormData] = useState<Poster>(
    initialData || { id: 0, movieId: 0, imageUrl: "" }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4 text-white">
        {initialData ? "Edit Poster" : "Add Poster"}
      </h3>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="movieId"
            className="block text-sm font-medium text-gray-100"
          >
            Movie
          </label>
          <select
            id="movieId"
            value={formData.movieId}
            onChange={(e) =>
              setFormData({ ...formData, movieId: Number(e.target.value) })
            }
            className="mt-1 block w-full border border-purple-500 rounded-md shadow-sm p-2 bg-gray-800 text-white"
            required
          >
            <option value={0}>Select a movie</option>
            {movies?.map((movie) => (
              <option
                key={movie.id}
                value={Number(movie.id.replace("movie", ""))}
              >
                {movie.Title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="imageUrl"
            className="block text-sm font-medium text-gray-100"
          >
            Image URL
          </label>
          <input
            id="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={(e) =>
              setFormData({ ...formData, imageUrl: e.target.value })
            }
            className="mt-1 block w-full border border-purple-500 rounded-md shadow-sm p-2 bg-gray-800 text-white"
            required
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-purple-500 rounded-md text-gray-100 hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Submit
          </button>
        </div>
      </div>
    </form>
  );
}
