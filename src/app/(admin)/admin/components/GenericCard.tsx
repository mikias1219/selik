"use client";

import React from "react";
import { motion } from "framer-motion";
import { Movie, Game, Music, Ebook, Poster } from "../types";

export interface Column {
  header: string;
  accessor: string | ((item: any) => React.ReactNode);
}

interface GenericCardProps<T> {
  item: T;
  columns: Column[];
  type: string;
  onEdit: (item: T) => void;
  onDelete: (id: string, type: string) => void;
  onPreview: (item: T) => void;
}

const GenericCard = <T extends Movie | Game | Music | Ebook | Poster>({
  item,
  columns,
  type,
  onEdit,
  onDelete,
  onPreview,
}: GenericCardProps<T>) => {
  const getImageUrl = () => {
    // Assume cover_image is the standard field across all media types
    const coverImage = (item as any).cover_image || "/placeholder.jpg";
    return coverImage;
  };

  const renderContent = (accessor: Column["accessor"]) => {
    let value =
      typeof accessor === "function" ? accessor(item) : (item as any)[accessor];

    if (value === null || value === undefined) return "—";
    if (React.isValidElement(value)) return value;

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }

    try {
      return JSON.stringify(value);
    } catch {
      return "Invalid Data";
    }
  };

  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden shadow-lg border border-purple-500/10 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${getImageUrl()})`,
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 p-6 text-white space-y-4">
        {columns.map((column) => (
          <div key={column.accessor.toString()} className="text-sm">
            <span className="font-semibold text-cinema-purple">
              {column.header}:
            </span>{" "}
            {renderContent(column.accessor)}
          </div>
        ))}

        <div className="flex justify-end space-x-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPreview(item)}
            className="p-2 bg-gray-800/70 hover:bg-blue-600 rounded-md transition-colors"
            aria-label="Preview"
          >
            {/* Eye Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(item)}
            className="p-2 bg-gray-800/70 hover:bg-purple-600 rounded-md transition-colors"
            aria-label="Edit"
          >
            {/* Edit Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(item.id.toString(), type)}
            className="p-2 bg-gray-800/70 hover:bg-red-600 rounded-md transition-colors"
            aria-label="Delete"
          >
            {/* Delete Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default GenericCard;
