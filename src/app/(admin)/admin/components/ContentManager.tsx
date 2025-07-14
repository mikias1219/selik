"use client";

import React, { useState } from "react";
import MediaForm, { MediaFormData } from "./MediaForm";
import { useMediaManager } from "../hooks/useMediaData";

interface ContentManagerProps {
  mediaType: "movies" | "games" | "music" | "ebooks" | "posters";
  token?: string;
}

export default function ContentManager({
  mediaType,
  token,
}: ContentManagerProps) {
  const [formData, setFormData] = useState<MediaFormData>({
    title: "",
    description: "",
    genre: [],
    cover_image: "",
    trailer: "",
    content_metadata: { is_series: false, is_album: false },
    items: [],
  });

  const isSeries =
    mediaType === "movies" && formData.content_metadata.is_series;
  const { data, error, loading, createContent, updateContent, deleteContent } =
    useMediaManager<MediaFormData>(mediaType, token, isSeries);

  const handleFormChange = (data: MediaFormData) => {
    setFormData(data);
  };

  const handleFormSubmit = async (data: MediaFormData, contentType: string) => {
    try {
      if (data.id) {
        await updateContent(data.id, data);
      } else {
        await createContent({ ...data, type: contentType });
      }
      alert("Content saved successfully!");
    } catch (err: any) {
      alert(`Failed to save content: ${err.message}`);
    }
  };

  return (
    <div className="p-4 bg-gray-950 min-h-screen">
      <h1 className="text-2xl text-cinema-purple font-cinematic mb-4">
        Manage{" "}
        {isSeries
          ? "Series"
          : mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}
      </h1>
      {loading && <p className="text-white">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <MediaForm
        data={formData}
        onChange={handleFormChange}
        onSubmit={handleFormSubmit}
        mediaType={mediaType}
      />
      <div className="mt-6">
        <h2 className="text-xl text-cinema-purple font-cinematic mb-2">
          Existing Content
        </h2>
        {data.length === 0 && (
          <p className="text-gray-400">No content available.</p>
        )}
        <ul className="space-y-2">
          {data.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between bg-gray-800/20 p-3 rounded-lg"
            >
              <span className="text-white">{item.title}</span>
              <div>
                <button
                  onClick={() =>
                    setFormData({
                      ...item,
                      content_metadata: { ...item.content_metadata },
                    })
                  }
                  className="text-blue-400 hover:text-blue-300 mr-4"
                  aria-label={`Edit ${item.title}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete ${item.title}?`)) {
                      deleteContent(Number(item.id));
                    }
                  }}
                  className="text-red-400 hover:text-red-300"
                  aria-label={`Delete ${item.title}`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
