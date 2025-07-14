// components/admin/PosterCard.tsx
import React from "react";
import { motion } from "framer-motion";
import { Poster } from "../types";

interface PosterCardProps {
  poster: Poster;
  onDelete: (id: string, type: string) => void;
  onEdit: (data: any) => void;
}

const PosterCard: React.FC<PosterCardProps> = ({
  poster,
  onDelete,
  onEdit,
}) => {
  return (
    <motion.div
      className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg"
      whileHover={{ y: -5 }}
    >
      <div className="h-48 bg-gradient-to-r from-purple-900 to-red-900 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{poster.title}</h3>
        <p className="text-gray-400 text-sm mb-2">{poster.description}</p>

        <div className="flex justify-between text-sm mb-4">
          <span>{poster.size}</span>
          <span className="font-bold">${poster.price}</span>
        </div>

        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 bg-gray-700 hover:bg-purple-600 py-2 rounded-lg text-center"
            onClick={() => onEdit(poster)}
          >
            Edit
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 bg-gray-700 hover:bg-red-600 py-2 rounded-lg text-center"
            onClick={() => onDelete(poster.id, "poster")}
          >
            Delete
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default PosterCard;
