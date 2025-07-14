"use client";

import React from "react";

interface ContentMetadata {
  director: string;
  release_year: number | "";
  duration_minutes: number | "";
}

interface ItemMetadata {
  filesize: any;
  resolution: string;
}

interface MovieItem {
  id: any;
  price: number | "";
  path: string;
  item_metadata: ItemMetadata;
}

export interface MovieFormData {
  title: string;
  description: string;
  genre: string[];
  cover_image: string;
  trailer: string;
  content_metadata: ContentMetadata;
  items: MovieItem[];
}

interface MovieFormProps {
  data: MovieFormData;
  onChange: (data: MovieFormData) => void;
}

export default function MovieForm({ data, onChange }: MovieFormProps) {
  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "genre") {
      onChange({ ...data, genre: value.split(",").map((g) => g.trim()) });
    } else {
      onChange({ ...data, [name]: value });
    }
  };

  const handleContentMetadataChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    onChange({
      ...data,
      content_metadata: {
        ...data.content_metadata,
        [name]: name === "director" ? value : value === "" ? "" : Number(value),
      },
    });
  };

  const handleItemChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof MovieItem | keyof ItemMetadata,
    isItemMetadata = false
  ) => {
    const value = e.target.value;
    const updatedItems = [...data.items];

    if (isItemMetadata) {
      updatedItems[index].item_metadata = {
        ...updatedItems[index].item_metadata,
        [field]: value,
      };
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]:
          field === "price" ? (value === "" ? "" : Number(value)) : value,
      };
    }

    onChange({ ...data, items: updatedItems });
  };

  const addItem = () => {
    onChange({
      ...data,
      items: [
        ...data.items,
        { price: "", path: "", item_metadata: { resolution: "" } },
      ],
    });
  };

  const removeItem = (index: number) => {
    const updatedItems = data.items.filter((_, i) => i !== index);
    onChange({ ...data, items: updatedItems });
  };

  return (
    <form
      id="movie-form"
      className="space-y-6"
      onSubmit={(e) => e.preventDefault()}
    >
      <div>
        <label className="block text-cinema-purple font-cinematic mb-1">
          Title
        </label>
        <input
          name="title"
          type="text"
          value={data.title}
          onChange={handleFieldChange}
          required
          placeholder="Movie title"
          className="w-full p-3 bg-gray-800/20 border border-white/30 rounded-lg text-white"
        />
      </div>

      <div>
        <label className="block text-cinema-purple font-cinematic mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={data.description}
          onChange={handleFieldChange}
          required
          placeholder="Brief movie description"
          rows={3}
          className="w-full p-3 bg-gray-800/20 border border-white/30 rounded-lg text-white resize-none"
        />
      </div>

      <div>
        <label className="block text-cinema-purple font-cinematic mb-1">
          Genre (comma separated)
        </label>
        <input
          name="genre"
          type="text"
          value={data.genre.join(", ")}
          onChange={handleFieldChange}
          required
          placeholder="e.g. action, thriller, sci-fi"
          className="w-full p-3 bg-gray-800/20 border border-white/30 rounded-lg text-white"
        />
      </div>

      <div>
        <label className="block text-cinema-purple font-cinematic mb-1">
          Cover Image URL
        </label>
        <input
          name="cover_image"
          type="url"
          value={data.cover_image}
          onChange={handleFieldChange}
          required
          placeholder="https://example.com/cover.jpg"
          className="w-full p-3 bg-gray-800/20 border border-white/30 rounded-lg text-white"
        />
        {data.cover_image && (
          <img
            src={data.cover_image}
            alt="Preview"
            className="mt-2 w-32 rounded shadow border"
          />
        )}
      </div>

      <div>
        <label className="block text-cinema-purple font-cinematic mb-1">
          Trailer URL
        </label>
        <input
          name="trailer"
          type="url"
          value={data.trailer}
          onChange={handleFieldChange}
          placeholder="https://youtube.com/..."
          className="w-full p-3 bg-gray-800/20 border border-white/30 rounded-lg text-white"
        />
      </div>

      <fieldset className="border border-white/30 rounded-lg p-4 space-y-4">
        <legend className="text-cinema-purple font-cinematic font-semibold mb-2">
          Content Metadata
        </legend>
        <input
          name="director"
          type="text"
          value={data.content_metadata.director}
          onChange={handleContentMetadataChange}
          required
          placeholder="Director name"
          className="w-full p-3 bg-gray-800/20 border border-white/30 rounded-lg text-white"
        />
        <input
          name="release_year"
          type="number"
          min={1800}
          max={2100}
          value={data.content_metadata.release_year}
          onChange={handleContentMetadataChange}
          required
          placeholder="2010"
          className="w-full p-3 bg-gray-800/20 border border-white/30 rounded-lg text-white"
        />
        <input
          name="duration_minutes"
          type="number"
          min={1}
          value={data.content_metadata.duration_minutes}
          onChange={handleContentMetadataChange}
          required
          placeholder="148"
          className="w-full p-3 bg-gray-800/20 border border-white/30 rounded-lg text-white"
        />
      </fieldset>

      <fieldset className="border border-white/30 rounded-lg p-4 space-y-6">
        <legend className="text-cinema-purple font-cinematic font-semibold mb-2">
          Items
        </legend>
        {data.items.map((item, index) => (
          <div
            key={index}
            className="border border-gray-700 p-4 rounded-lg space-y-4 bg-gray-800/30"
          >
            <input
              type="number"
              min={0}
              step={0.01}
              placeholder="Price (USD)"
              value={item.price}
              onChange={(e) => handleItemChange(index, e, "price")}
              className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded text-white"
            />
            <input
              type="text"
              placeholder="File Path"
              value={item.path}
              onChange={(e) => handleItemChange(index, e, "path")}
              className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded text-white"
            />
            <input
              type="text"
              placeholder="Resolution (e.g. 1080p)"
              value={item.item_metadata.resolution}
              onChange={(e) => handleItemChange(index, e, "resolution", true)}
              className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded text-white"
            />
            {data.items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-500 hover:text-red-300 text-sm"
              >
                Remove Item
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          + Add another item
        </button>
      </fieldset>
    </form>
  );
}
