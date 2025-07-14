"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Film,
  GamepadIcon,
  Music,
  FilmIcon,
  BookAIcon,
  NotepadTextDashed,
  Moon,
  Sun,
  AppWindow,
  LayoutGrid,
} from "lucide-react";

const navItems = [
  { name: "Movies", href: "/home", icon: <Film className="w-5 h-5" /> },
  {
    name: "Gaming",
    href: "/gaming",
    icon: <GamepadIcon className="w-5 h-5" />,
  },
  { name: "Music", href: "/music", icon: <Music className="w-5 h-5" /> },
  { name: "Ebook", href: "/ebook", icon: <BookAIcon className="w-5 h-5" /> },
  {
    name: "Software",
    href: "/software",
    icon: <LayoutGrid className="w-5 h-5" />,
  },
  { name: "Poster", href: "/poster", icon: <FilmIcon className="w-5 h-5" /> },
  {
    name: "Orders",
    href: "/orders",
    icon: <NotepadTextDashed className="w-5 h-5" />,
  },
];

export default function Sidebar() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <aside
      className={`
        fixed z-10 w-16 h-screen bg-white/5 rounded-xl flex flex-col items-center text-white 
        shadow-xl transition-all duration-300 bg-gray-100/90
      `}
    >
      {" "}
      <style jsx global>{`
        aside::before {
          content: "";
          position: absolute;
          top: 24vh;
          left: 0;
          width: 100%;
          height: 48vh;
          background-color: #6b21a8;
          border-radius: 80% 20% 20% 80% / 50% 30% 70% 50%;
          z-index: 0;
          animation: floating 6s ease-in-out infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 15px 3px rgba(168, 85, 247, 0.6);
          }
          50% {
            box-shadow: 0 0 20px 5px rgba(168, 85, 247, 0.8);
          }
          100% {
            box-shadow: 0 0 15px 3px rgba(168, 85, 247, 0.6);
          }
        }

        @media (max-height: 600px) {
          aside::before {
            height: 30vh;
            top: 15rem;
          }
        }
      `}</style>
      {/* Top content */}
      <div className="relative z-20 mt-24 flex flex-col items-center gap-8">
        <div className="relative w-16 h-16">
          <svg viewBox="0 0 100 100" className="absolute w-full h-full">
            <path
              d="M50 2 
                L93 25 
                L93 75 
                L50 98 
                L7 75 
                L7 25 
                Z"
              fill="rgba(147, 51, 234, 0.1)"
              stroke="#9333ea"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>

          <div className="absolute w-[85%] h-[85%] overflow-hidden top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Image
              src="/selik-01.png"
              alt="Logo"
              width={60}
              height={60}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        <nav className="flex flex-col self-center mt-12 gap-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex flex-col items-center gap-1 group relative 
                hover:scale-110 hover:text-purple-300 focus:text-purple-300 
                transition-all duration-200 focus:outline-none
              `}
              aria-label={`Navigate to ${item.name}`}
            >
              <span
                className={`
                  p-2 rounded-full
                  group-hover:bg-purple-700 group-focus:bg-white group-focus:text-purple-700
                `}
              >
                {item.icon}
              </span>
              <span className="text-[10px] text-center">{item.name}</span>
              {/* Tooltip */}
              <span className="absolute left-16 hidden group-hover:block text-xs bg-gray-800 text-white px-2 py-1 rounded">
                {item.name}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
