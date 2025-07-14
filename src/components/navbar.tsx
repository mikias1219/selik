"use client";

import { Bell, Download, Search, UserCircle, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [showUserModal, setShowUserModal] = useState(false);
  const totalStorageGB = 100;
  const storageData = [
    { type: "Movies", sizeGB: 20, color: "bg-purple-500" },
    { type: "Games", sizeGB: 50, color: "bg-blue-500" },
    { type: "Music", sizeGB: 5, color: "bg-green-500" },
    { type: "Posters", sizeGB: 2, color: "bg-yellow-500" },
  ];
  const usedStorageGB = storageData.reduce((sum, item) => sum + item.sizeGB, 0);
  const freeStorageGB = totalStorageGB - usedStorageGB;
  const usedPercentage = (usedStorageGB / totalStorageGB) * 100;

  const handleToggleModal = () => {
    setShowUserModal((prev) => !prev);
  };

  return (
    <>
      <header className="fixed w-full bg-black/90 shadow-lg z-50 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left spacer for sidebar alignment */}
          <div className="w-20" />

          {/* Center Search */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search movies, music, games..."
                className="w-full px-4 py-2 rounded-lg text-gray-100 placeholder-gray-500 outline-none border border-gray-100 focus:ring-2 focus:ring-purple-500/40 transition"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300" />
            </div>
          </div>

          {/* Right icons */}
          <div className="relative flex items-center gap-5 text-purple-300">
            <button className="relative hover:text-purple-100 transition">
              <Download className="w-5 h-5" />
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] px-1.5 rounded-full">
                2
              </span>
            </button>
            <button className="relative hover:text-purple-100 transition">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] px-1.5 rounded-full">
                5
              </span>
            </button>
            <button
              className="hover:text-purple-100 transition"
              onClick={handleToggleModal}
            >
              <UserCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* User Modal */}
    </>
  );
}
