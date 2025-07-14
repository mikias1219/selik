"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Ebook } from "../types";

interface EbookFormProps {
  onSubmit: (data: Ebook) => void;
  initialData?: Ebook;
  onCancel: () => void;
}

export default function EbookForm({
  onSubmit,
  initialData,
  onCancel,
}: EbookFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    authors: initialData?.authors || [""],
    publishedDate: initialData?.publishedDate || "",
    averageRating: initialData?.averageRating || 0,
    thumbnail: initialData?.thumbnail || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "authors"
          ? [value]
          : name === "averageRating"
          ? parseFloat(value) || 0
          : value,
    }));
    // Simplified authors handling for single input; adjust if multiple authors are needed
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, id: initialData?.id || `book${Date.now()}` });
  };

  return (
    <motion.form
      id="ebooks-form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div>
        <label className="block text-cinema-purple font-cinematic mb-1">
          Title
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full p-3 bg-gray-800/50 border border-cinema-purple/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cinema-purple transition-all duration-300"
          placeholder="Enter book title"
        />
      </div>
      <div>
        <label className="block text-cinema-purple font-cinematic mb-1">
          Authors
        </label>
        <input
          type="text"
          name="authors"
          value={formData.authors[0] || ""}
          onChange={handleChange}
          required
          className="w-full p-3 bg-gray-800/50 border border-cinema-purple/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cinema-purple transition-all duration-300"
          placeholder="Enter author name"
        />
      </div>
      <div>
        <label className="block text-cinema-purple font-cinematic mb-1">
          Published Date
        </label>
        <input
          type="date"
          name="publishedDate"
          value={formData.publishedDate}
          onChange={handleChange}
          required
          className="w-full p-3 bg-gray-800/50 border border-cinema-purple/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cinema-purple transition-all duration-300"
        />
      </div>
      <div>
        <label className="block text-cinema-purple font-cinematic mb-1">
          Average Rating
        </label>
        <input
          type="number"
          name="averageRating"
          value={formData.averageRating}
          onChange={handleChange}
          step="0.1"
          min="0"
          max="5"
          required
          className="w-full p-3 bg-gray-800/50 border border-cinema-purple/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cinema-purple transition-all duration-300"
          placeholder="Enter rating (0-5)"
        />
      </div>
      <div>
        <label className="block text-cinema-purple font-cinematic mb-1">
          Thumbnail URL
        </label>
        <input
          type="url"
          name="thumbnail"
          value={formData.thumbnail}
          onChange={handleChange}
          className="w-full p-3 bg-gray-800/50 border border-cinema-purple/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cinema-purple transition-all duration-300"
          placeholder="Enter thumbnail URL (optional)"
        />
      </div>
    </motion.form>
  );
}
