import { toast } from "react-toastify";
import { fetcher } from "@/lib/api/auth";

type CartItem = {
  id: string;
  title: string;
  price: number;
  type: string;
  thumbnail?: string;
};

// Utility to validate token
export const validateToken = async (token: string | null): Promise<boolean> => {
  if (!token) return false;
  try {
    await fetcher("/auth/me", { method: "GET" }, token);
    return true;
  } catch (err) {
    console.error("validateToken: Error:", err);
    return false;
  }
};

// Utility to show toast notifications
export const showToast = (
  message: string,
  type: "success" | "error" | "info" | "warning" = "info",
  options = {}
) => {
  toast[type](message, {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    theme: "dark",
    className: "purple-toast",
    ...options,
  });
};

// Validate cart item schema
export const isValidCartItem = (item: any): item is CartItem => {
  return (
    item &&
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.price === "number" &&
    typeof item.type === "string"
  );
};

// Sanitize filename with server-provided extension
export const sanitizeFilename = (
  name: string,
  itemType: string,
  serverExtension?: string
): string => {
  const typeToExtension: { [key: string]: string } = {
    movie: ".mp4",
    ebook: ".pdf",
    game: ".zip",
    music: ".mp3",
    poster: ".jpg",
  };

  let sanitized =
    name
      .replace(/[<>:"/\\|?*]+/g, "")
      .replace(/\s+/g, "_")
      .trim() || "download";

  const extension = serverExtension || typeToExtension[itemType] || ".bin";
  if (!sanitized.toLowerCase().endsWith(extension.toLowerCase())) {
    sanitized += extension;
  }

  return sanitized;
};
