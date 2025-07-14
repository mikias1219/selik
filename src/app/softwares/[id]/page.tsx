"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import SoftwareCardGrid from "@/components/software/SoftwareCard";
import { toast } from "react-toastify";

interface SoftwareDetails {
  id: string;
  name: string;
  background_image: string;
  description: string;
  category: string;
  safetyScore: number;
  downloadLink: string;
  platforms: { platform: { name: string } }[];
  developers: { name: string }[];
  publishers: { name: string }[];
}

const fetchSoftwareDetails = async (
  id: string
): Promise<SoftwareDetails | null> => {
  try {
    const res = await fetch(`/api/software/${id}`);
    if (!res.ok) {
      console.error(
        "Software details fetch failed:",
        res.status,
        res.statusText
      );
      return null;
    }
    const data = await res.json();
    console.log("Software details fetched:", data);
    return data;
  } catch (error) {
    console.error(`fetchSoftwareDetails failed for id ${id}:`, error);
    return null;
  }
};

const fetchSimilarSoftware = async (
  category: string | undefined,
  currentId: string
): Promise<SoftwareDetails[]> => {
  if (!category) {
    console.warn("No valid category provided for similar software fetch");
    return [];
  }
  try {
    const res = await fetch(`lib/api/fetchSoftware`);
    if (!res.ok) {
      console.error(
        "Similar software fetch failed:",
        res.status,
        res.statusText
      );
      return [];
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      console.warn("No valid results in similar software API response");
      return [];
    }
    const filteredSoftware = data
      .filter(
        (software: SoftwareDetails) =>
          software.id !== currentId &&
          software.category === category &&
          software.background_image &&
          software.name
      )
      .slice(0, 4);
    console.log("Filtered similar software:", filteredSoftware);
    return filteredSoftware;
  } catch (error) {
    console.error(
      `fetchSimilarSoftware failed for category ${category}:`,
      error
    );
    return [];
  }
};

export default function SoftwareDetails() {
  const [software, setSoftware] = useState<SoftwareDetails | null>(null);
  const [similarSoftware, setSimilarSoftware] = useState<SoftwareDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const loadSoftwareDetails = async () => {
      if (typeof id !== "string") {
        console.warn("Invalid ID:", id);
        setLoading(false);
        return;
      }
      setLoading(true);
      const softwareData = await fetchSoftwareDetails(id);
      if (!softwareData) {
        console.error("No software data fetched for ID:", id);
        setLoading(false);
        return;
      }
      setSoftware(softwareData);

      const similar = await fetchSimilarSoftware(softwareData.category, id);
      console.log("Setting similar software:", similar);
      setSimilarSoftware(similar);
      setLoading(false);
    };

    loadSoftwareDetails();
  }, [id]);

  useEffect(() => {
    console.log("similarSoftware state updated:", similarSoftware);
  }, [similarSoftware]);

  const handleAddToFavorites = () => {
    if (software) {
      window.dispatchEvent(
        new CustomEvent("add-to-cart", {
          detail: {
            id: software.id,
            title: software.name,
            price: 0,
            type: "software",
            thumbnail: software.background_image || "/placeholder.jpg",
          },
        })
      );
      toast.success(`${software.name} added to favorites!`, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        theme: "dark",
        className: "purple-toast",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        <p>Loading...</p>
      </div>
    );
  }

  if (!software) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        <p>Software not found.</p>
      </div>
    );
  }

  const developers =
    software.developers?.map((dev) => dev.name).slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative w-[70vw] h-[80vh] min-h-[600px] overflow-hidden">
        <Image
          src={
            software.background_image !== "N/A"
              ? software.background_image
              : "/placeholder.jpg"
          }
          alt={`${software.name} background`}
          fill
          className="object-cover object-center transition-transform duration-700 ease-in-out hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 z-10 text-white max-w-7xl mx-auto animate-fadeIn">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg mb-4">
            {software.name}
          </h1>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-yellow-400 font-semibold flex items-center">
              <svg
                className="w-5 h-5 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {software.safetyScore || "N/A"}/100
            </span>
            <span className="text-gray-300">{software.category || "N/A"}</span>
            <span className="text-gray-300">
              {software.platforms.map((p) => p.platform.name).join(", ") ||
                "N/A"}
            </span>
          </div>
          <p className="text-sm md:text-sm font-light leading-relaxed drop-shadow-md mb-6 max-w-2xl bg-gradient-to-r from-black/50 to-purple-500/30 p-4 rounded-lg">
            {software.description || "No description available"}
          </p>
          <div className="flex gap-4">
            <button
              className="px-8 py-3 bg-teal-500 text-white font-semibold text-lg rounded-lg shadow-md hover:bg-teal-600 transition-all duration-200"
              onClick={handleAddToFavorites}
            >
              Add to Favorites
            </button>
            <a
              href={software.downloadLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-purple-600 text-white font-semibold text-lg rounded-lg shadow-md hover:bg-purple-700 transition-all duration-200"
            >
              Download Now
            </a>
          </div>
        </div>
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 1s ease-out forwards;
          }
        `}</style>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl px-6 py-12">
        {/* Details Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">About the Software</h2>
          <div className="bg-gradient-to-l from-black/50 to-purple-500/30 rounded-xl p-8 shadow-lg">
            <p className="mb-4">
              <strong>Developers:</strong>{" "}
              {software.developers.map((d) => d.name).join(", ") || "N/A"}
            </p>
            <p className="mb-4">
              <strong>Publishers:</strong>{" "}
              {software.publishers.map((p) => p.name).join(", ") || "N/A"}
            </p>
            <p className="mb-4">
              <strong>Category:</strong> {software.category || "N/A"}
            </p>
            <p className="mb-4">
              <strong>Platforms:</strong>{" "}
              {software.platforms.map((p) => p.platform.name).join(", ") ||
                "N/A"}
            </p>
            <p className="mb-4">
              <strong>Safety Score:</strong> {software.safetyScore || "N/A"}/100
            </p>
          </div>
        </section>

        {/* Developers Section */}
        {developers.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-6 text-purple-300">
              Developers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {developers.map((developer, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur border border-white/40 rounded-2xl shadow-md hover:shadow-xl transition-transform hover:-translate-y-1 overflow-hidden"
                >
                  <div className="relative w-full h-64">
                    <Image
                      src="/avatar.jpg"
                      alt={`Placeholder for ${developer}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-semibold text-purple-100">
                      {developer}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar Software Section */}
        {similarSoftware.length > 0 && (
          <div className="mt-8">
            <h2 className="text-3xl font-semibold mb-6 text-white">
              Similar Software
            </h2>
            <SoftwareCardGrid software={similarSoftware} showHandle={false} />
          </div>
        )}

        {/* Back Button */}
        <Link
          href="/software"
          className="inline-flex items-center px-6 py-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z"
              clipRule="evenodd"
            />
          </svg>
          Back to Software
        </Link>
      </div>
    </div>
  );
}
