import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Music } from "../types";

interface MusicFormProps {
  onSubmit: (data: Music) => void;
  initialData?: Music;
  onCancel: () => void;
}

export default function MusicForm({
  onSubmit,
  initialData,
  onCancel,
}: MusicFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    artist: initialData?.artist || "",
    album: initialData?.album || "",
  });

  useEffect(() => {
    setFormData({
      title: initialData?.title || "",
      artist: initialData?.artist || "",
      album: initialData?.album || "",
    });
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, id: initialData?.id || Date.now() });
  };

  return (
    <motion.form
      id="music-form"
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
          placeholder="Enter song title"
        />
      </div>
      <div>
        <label className="block text-cinema-purple font-cinematic mb-1">
          Artist
        </label>
        <input
          type="text"
          name="artist"
          value={formData.artist}
          onChange={handleChange}
          required
          className="w-full p-3 bg-gray-800/50 border border-cinema-purple/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cinema-purple transition-all duration-300"
          placeholder="Enter artist name"
        />
      </div>
      <div>
        <label className="block text-cinema-purple font-cinematic mb-1">
          Album
        </label>
        <input
          type="text"
          name="album"
          value={formData.album}
          onChange={handleChange}
          required
          className="w-full p-3 bg-gray-800/50 border border-cinema-purple/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cinema-purple transition-all duration-300"
          placeholder="Enter album name"
        />
      </div>
    </motion.form>
  );
}
