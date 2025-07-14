import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "m.media-amazon.com",
      "media.rawg.io",
      "cdn-images.dzcdn.net",
      "via.placeholder.com",
      "picsum.photos",
      "books.google.com",
      "www.gimp.org",
      "www.audacityteam.org",
      "images.blackmagicdesign.com",
      "cdn.pixabay.com",
      " https://via.placeholder.com",
      "coverartarchive.org",
      "wallpapercave.com",
      "encrypted-tbn0.gstatic.com",
    ], // Allow images from this domain

    remotePatterns: [
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        port: "",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "**.jamendo.com",
        port: "",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
