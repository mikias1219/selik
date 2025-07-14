import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "./ClientLayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Selik Movies",
  description: "Your favorite movie app",
  icons: {
    icon: [
      { url: "/log_favicon.ico" },
      { url: "/log_favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/log_favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      {
        url: "/logo_apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable}`}>
      <body className="antialiased bg-gray-100 text-gray-900">
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
