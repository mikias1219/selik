"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Game } from "../types";

interface GameFormProps {
  onSubmit: (data: Game) => void;
  initialData?: Game;
  onCancel: () => void;
}

export default function GameForm({
  onSubmit,
  initialData,
  onCancel,
}: GameFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    genres: initialData?.genres || [{ name: "" }],
    rating: initialData?.rating || 0,
    released: initialData?.released || "",
    background_image: initialData?.background_image || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "rating"
          ? parseFloat(value) || 0
          : name === "genres"
          ? [{ name: value }]
          : value,
    }));
    // Simplified genres handling for single input; adjust if multiple genres are needed
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, id: initialData?.id || Date.now() });
  };

  return (
    <motion.form
      id="games-form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div>
        <label className="block text-cinema-purple font-cinematic mb-1">
          Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-3 bg-gray-800/50 border border-cinema-purple/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cinema-purple transition-all duration-300"
          placeholder="Enter game name"
        />
      </div>
      <div>
        <label className="block text-cinema-purple font-cinematic mb-1">
          Genres
        </label>
        <input
          type="text"
          name="genres"
          value={formData.genres[0]?.name || ""}
          onChange={handleChange}
          required
          className="w-full p-3 bg-gray-800/50 border border-cinema-purple/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cinema-purple transition-all duration-300"
          placeholder="Enter genres (e.g., Action, RPG)"
        />
      </div>
      <div>
        <label className="block text-cinema-purple font-cinematic mb-1">
          Rating
        </label>
        <input
          type="number"
          name="rating"
          value={formData.rating}
          onChange={handleChange}
          step="0.1"
          min="0"
          max="100"
          required
          className="w-full p-3 bg-gray-800/50 border border-cinema-purple/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cinema-purple transition-all duration-300"
          placeholder="Enter rating (0-100)"
        />
      </div>
      <div>
        <label className="block text-cinema-purple font-cinematic mb-1">
          Release Date
        </label>
        <input
          type="date"
          name="released"
          value={formData.released}
          onChange={handleChange}
          required
          className="w-full p-3 bg-gray-800/50 border border-cinema-purple/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cinema-purple transition-all duration-300"
        />
      </div>
      <div>
        <label className="block text-cinema-purple font-cinematic mb-1">
          Background Image URL
        </label>
        <input
          type="url"
          name="background_image"
          value={formData.background_image}
          onChange={handleChange}
          required
          className="w-full p-3 bg-gray-800/50 border border-cinema-purple/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cinema-purple transition-all duration-300"
          placeholder="Enter background image URL"
        />
      </div>
    </motion.form>
  );
}
