"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAdminAuth } from "@/app/hooks/useAdminAuth";
import { useRouter } from "next/navigation";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  onLogout: () => void;
}

interface Tab {
  id: string;
  label: string;
  icon: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  toggleCollapse,
  onLogout,
}) => {
  const tabs: Tab[] = [
    { id: "movies", label: "Movies", icon: "🎬" },
    { id: "games", label: "Games", icon: "🎮" },
    { id: "music", label: "Music", icon: "🎵" },
    { id: "ebooks", label: "Ebooks", icon: "📚" },
    { id: "softwares", label: "Softwares", icon: "💻" }, // updated icon
    { id: "stats", label: "Stats", icon: "📊" },
  ];

  const { admin } = useAdminAuth();
  const router = useRouter();

  const handleLogout = () => {
    onLogout();
    router.replace("/");
  };

  return (
    <motion.div
      className={`relative min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-cinema-gray/50 backdrop-blur-md border-r border-purple-800/30 ${
        isCollapsed ? "w-20" : "w-72"
      } shadow-2xl overflow-hidden`}
      initial={{ width: isCollapsed ? 80 : 288 }}
      animate={{ width: isCollapsed ? 80 : 288 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-cinema-purple/10 to-gray-900/10" />

      {/* Top Section with Collapse */}
      <div className="relative p-4 flex items-center justify-between">
        <Image
          src="/selik-01.png"
          alt="Logo"
          width={isCollapsed ? 30 : 60}
          height={isCollapsed ? 40 : 60}
          className="rounded-full"
        />

        {/* Collapse Button on Top */}
        <motion.button
          onClick={toggleCollapse}
          className="text-gray-300 hover:text-white p-2 rounded-md hover:bg-purple-700/40 transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
            />
          </svg>
        </motion.button>
      </div>

      {/* Nav Tabs */}
      <nav className="relative flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-2">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <motion.button
                className={`w-full flex items-center rounded-lg p-3 transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-cinema-purple to-purple-600 text-white shadow-md"
                    : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                }`}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 10px rgba(168, 85, 247, 0.3)",
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(tab.id)}
                aria-label={`Navigate to ${tab.label}`}
              >
                <span className="text-xl">{tab.icon}</span>
                {!isCollapsed && (
                  <motion.span
                    className="ml-3 font-cinematic text-sm tracking-wide"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {tab.label}
                  </motion.span>
                )}
              </motion.button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="relative p-4 space-y-3 border-t border-purple-800/40">
        {!isCollapsed && admin && (
          <p className="text-sm text-gray-400">
            Logged in as:{" "}
            <span className="text-white font-semibold">{admin.username}</span>
          </p>
        )}

        {/* Logout Button */}
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-purple-700 text-white hover:bg-purple-800 transition-all duration-300"
          whileHover={{
            scale: 1.03,
            boxShadow: "0 0 12px rgba(168, 85, 247, 0.6)",
          }}
          whileTap={{ scale: 0.97 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
            />
          </svg>
          {!isCollapsed && (
            <span className="font-cinematic text-sm">Logout</span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
