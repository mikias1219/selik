"use client";

import { useDroppable } from "@dnd-kit/core";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";
import { fetcher } from "@/lib/api/auth";
import { isValidCartItem, validateToken, showToast } from "@/lib/utils";
import { useDownloadItem } from "@/app/hooks/useDownloadItem";

type CartItem = {
  id: string;
  title: string;
  price: number;
  type: string;
  thumbnail?: string;
};

type PaginatedPurchaseResponse = {
  items: {
    id: number;
    user_id: number;
    item_id: number;
    price: string;
    purchased_at: string;
  }[];
};

type UsbVolume = {
  name: string;
  volume_label: string;
  serial: string;
  total_space: number;
  free_space: number;
  device_type: string;
  is_ready: boolean;
  is_removable: boolean;
};

export default function Cart() {
  const { isOver, setNodeRef } = useDroppable({
    id: "cart-droppable",
    data: { accepts: ["movie", "ebook"] },
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [usbVolumes, setUsbVolumes] = useState<UsbVolume[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [sessionDownloads, setSessionDownloads] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState<string[]>([]);
  const [selectedUsbPath, setSelectedUsbPath] = useState<string>("");
  const [isValidatingToken, setIsValidatingToken] = useState<boolean>(true);
  const { user, loading: userLoading, error: userError } = useCurrentUser();
  const router = useRouter();
  const { downloadItem } = useDownloadItem(
    selectedUsbPath,
    sessionDownloads,
    isDownloading,
    setSessionDownloads,
    setIsDownloading,
    purchasedItems,
    setPurchasedItems // Pass setPurchasedItems
  );

  // Validate token on mount
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("user_token");
      const isValid = await validateToken(token);
      if (!isValid) {
        showToast("Invalid or missing token. Redirecting to login.", "error");
        router.push("http://localhost:3000/");
      }
      setIsValidatingToken(false);
    };
    checkToken();
  }, [router]);

  console.log("Purchased Items:", purchasedItems);
  // Fetch purchased items
  const fetchPurchases = useCallback(async () => {
    const token = localStorage.getItem("user_token");
    if (!token || !(await validateToken(token))) {
      showToast("Invalid token. Redirecting to login.", "error");
      router.push("http://localhost:3000/");
      return;
    }
    try {
      const response = await fetcher<PaginatedPurchaseResponse>(
        "/user/contents/item/purchases?limit=10&offset=0",
        { method: "GET" },
        token
      );
      const purchasedIds = response.items.map((purchase) =>
        purchase.item_id.toString()
      );
      setPurchasedItems(purchasedIds);
    } catch (err: any) {
      console.error("fetchPurchases: Failed =", err.message);
      showToast(`Failed to load purchased items: ${err.message}`, "error");
    }
  }, [router]);

  // Initialize cart and purchases without loading from localStorage
  useEffect(() => {
    if (isValidatingToken) return;
    localStorage.removeItem("cart");
    setCartItems([]);
    setPurchasedItems([]);
    if (user?.id) {
      fetchPurchases();
    }
  }, [user?.id, fetchPurchases, isValidatingToken]);

  // Fetch USB volumes
  useEffect(() => {
    const fetchUsbData = async () => {
      const token = localStorage.getItem("user_token");
      if (!token || !(await validateToken(token))) {
        showToast("Invalid token. Redirecting to login.", "error");
        router.push("http://localhost:3000/");
        return;
      }
      try {
        const response = await fetch("http://127.0.0.1:2025/fs/usbs", {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) {
          throw new Error(
            `HTTP error: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        if (data.volumes && Array.isArray(data.volumes)) {
          setUsbVolumes(data.volumes);
          const removableUsb = data.volumes.find(
            (vol: UsbVolume) => vol.is_removable && vol.is_ready
          );
          if (removableUsb) {
            const usbPath = removableUsb.name.replace(/\\/g, "/");
            setSelectedUsbPath(usbPath);
            localStorage.setItem("selectedUsbPath", usbPath);
          } else {
            showToast(
              "No removable USB drives detected. Using default downloads folder.",
              "warning"
            );
            setSelectedUsbPath("downloads/");
            localStorage.setItem("selectedUsbPath", "downloads/");
          }
        } else {
          showToast(
            "Failed to parse USB data. Using default downloads folder.",
            "error"
          );
          setSelectedUsbPath("downloads/");
          localStorage.setItem("selectedUsbPath", "downloads/");
        }
      } catch (err: any) {
        console.error("Error fetching USB data:", err.message);
        showToast(
          `Failed to fetch USB drives: ${err.message}. Using default downloads folder.`,
          "error"
        );
        setSelectedUsbPath("downloads/");
        localStorage.setItem("selectedUsbPath", "downloads/");
      }
    };

    fetchUsbData();
    const interval = setInterval(fetchUsbData, 5000);
    return () => clearInterval(interval);
  }, [router]);

  // Handle cart events
  useEffect(() => {
    const handleAddToCart = (event: Event) => {
      const customEvent = event as CustomEvent<CartItem>;
      const newItem = customEvent.detail;
      if (!isValidCartItem(newItem)) {
        showToast("Invalid item added to cart", "error");
        return;
      }
      setCartItems((prev) => {
        if (prev.some((item) => item.id === newItem.id)) return prev;
        const updatedCart = [...prev, newItem];
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        return updatedCart;
      });
    };

    const handleRemoveFromCart = (event: Event) => {
      const customEvent = event as CustomEvent<{ id: string }>;
      setCartItems((prev) => {
        const updatedCart = prev.filter(
          (item) => item.id !== customEvent.detail.id
        );
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        return updatedCart;
      });
    };

    window.addEventListener("add-to-cart", handleAddToCart);
    window.addEventListener("remove-from-cart", handleRemoveFromCart);

    return () => {
      window.removeEventListener("add-to-cart", handleAddToCart);
      window.removeEventListener("remove-from-cart", handleRemoveFromCart);
    };
  }, []);

  // Handle item removal on download completion
  const handleDownloadComplete = useCallback((itemId: string) => {
    setCartItems((prev) => {
      const updatedCart = prev.filter((item) => item.id !== itemId);
      try {
        localStorage.setItem("cart", JSON.stringify(updatedCart));
      } catch (err) {
        console.error("localStorage error:", err);
        showToast("Failed to update cart in storage", "error");
      }
      return updatedCart;
    });
    showToast("Item downloaded and removed from cart", "success");
  }, []);

  const handleRemoveItem = (id: string) => {
    const item = cartItems.find((item) => item.id === id);
    window.dispatchEvent(
      new CustomEvent("remove-from-cart", { detail: { id } })
    );
    showToast(`${item?.title || "Item"} removed from cart!`, "warning");
  };

  const handleProceed = async () => {
    if (cartItems.length === 0) {
      showToast("Cart is empty!", "error");
      return;
    }

    const token = localStorage.getItem("user_token");
    if (!token || !(await validateToken(token))) {
      showToast("Invalid token. Redirecting to login.", "error");
      router.push("http://localhost:3000/");
      return;
    }

    try {
      const itemsToPurchase = cartItems.filter(
        (item) => !purchasedItems.includes(item.id)
      );
      if (itemsToPurchase.length === 0) {
        showToast("All items in cart are already purchased!", "warning");
        return;
      }
      const itemIds = itemsToPurchase.map((item) => item.id);
      const purchasePromises = itemIds.map(async (itemId) => {
        const response = await fetch(
          `http://127.0.0.1:8000/user/contents/item/${itemId}/buy`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(
            `Purchase failed for item ${itemId}: ${response.status} ${response.statusText}`
          );
        }
        return response.json();
      });

      await Promise.all(purchasePromises);
      setPurchasedItems((prev) => [...new Set([...prev, ...itemIds])]);
      setCartItems((prev) => prev.filter((item) => !itemIds.includes(item.id)));
      localStorage.setItem(
        "cart",
        JSON.stringify(cartItems.filter((item) => !itemIds.includes(item.id)))
      );
      showToast(
        "Purchase completed! You can now download your items.",
        "success"
      );
      router.push("/orders");
    } catch (error) {
      console.error("Purchase error:", error);
      showToast(`Failed to process purchase: ${error.message}`, "error");
    }
  };

  const handleDownload = async (item: CartItem) => {
    if (!selectedUsbPath) {
      showToast("Please select a USB drive or download folder", "error");
      return;
    }
    try {
      console.log("Initiating download for item:", item.id);
      await downloadItem(item);
      console.log("Download completed for item:", item.id);
      handleDownloadComplete(item.id);
    } catch (error) {
      console.error("Download error:", error);
      showToast(`Failed to download ${item.title}: ${error.message}`, "error");
    }
  };

  // Clear cart and purchased items on session end
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("cart");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const totalPrice = cartItems
    .reduce((sum, item) => sum + item.price, 0)
    .toFixed(2);
  const totalStorageGB = usbVolumes.reduce(
    (sum, vol) => sum + vol.total_space / 1024 ** 3,
    0
  );
  const freeStorageGB = usbVolumes.reduce(
    (sum, vol) => sum + vol.free_space / 1024 ** 3,
    0
  );
  const usedStorageGB = totalStorageGB - freeStorageGB;
  const usedPercentage =
    totalStorageGB === 0 ? 0 : (usedStorageGB / totalStorageGB) * 100;

  const typeToEmoji: { [key: string]: string } = {
    movie: "🎬",
    ebook: "📖",
    game: "🎮",
    music: "🎵",
    poster: "🖼️",
  };

  if (isValidatingToken) {
    return (
      <div className="fixed top-12 right-2 mt-2 w-80 bg-black/80 backdrop-blur rounded-xl p-6 text-white shadow-lg z-50">
        <p className="text-lg font-semibold">Validating session...</p>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={`fixed top-12 right-2 mt-2 w-80 bg-black/80 backdrop-blur rounded-xl p-6 text-white shadow-lg z-50 transition-colors ${
        isOver ? "bg-green-100/80" : "bg-black/80"
      }`}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="relative rounded-full overflow-hidden w-[60px] h-[60px]">
          <Image
            src="/avatar.jpg"
            fill
            alt="User Avatar"
            className="object-cover rounded-full"
          />
        </div>
        <div>
          {userLoading ? (
            <p className="text-lg font-semibold">Loading...</p>
          ) : userError ? (
            <p className="text-lg font-semibold text-red-400">Error</p>
          ) : (
            <p className="text-lg font-semibold">
              {user?.username || "Selik Admin"}
            </p>
          )}
          <p className="text-sm text-gray-400">
            Balance: ${user?.balance != null ? user.balance.toFixed(2) : "0.00"}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-300 mb-2">
          Select USB Drive
        </p>
        <select
          value={selectedUsbPath}
          onChange={(e) => {
            setSelectedUsbPath(e.target.value);
            localStorage.setItem("selectedUsbPath", e.target.value);
          }}
          className="w-full bg-gray-700 text-white rounded-lg p-2 text-sm"
        >
          <option value="">Select a USB drive</option>
          <option value="downloads/">Default Downloads Folder</option>
          {usbVolumes
            .filter((vol) => vol.is_removable && vol.is_ready)
            .map((vol) => (
              <option key={vol.serial} value={vol.name.replace(/\\/g, "/")}>
                {vol.volume_label || vol.name} (
                {(vol.free_space / 1024 ** 3).toFixed(1)} GB free)
              </option>
            ))}
        </select>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-300 mb-2">Cart Items</p>
        <ul className="space-y-2">
          {cartItems.length === 0 ? (
            <p className="text-sm text-gray-400">No items in cart</p>
          ) : (
            cartItems.map((item) => (
              <li
                key={item.id}
                className="bg-gray-100/10 text-sm p-3 rounded-lg flex justify-between items-center"
              >
                <div className="flex-1 mr-2">
                  {typeToEmoji[item.type] || "📦"}{" "}
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}:{" "}
                  {item.title}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 mr-2">
                    ${item.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    aria-label="Remove item"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={() => handleDownload(item)}
                    className={`p-1 ${
                      isDownloading.includes(item.id)
                        ? "text-gray-500 cursor-not-allowed"
                        : "text-purple-500 hover:text-purple-700"
                    }`}
                    aria-label="Download item"
                    title="Download"
                    disabled={isDownloading.includes(item.id)}
                  >
                    <Download size={16} />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="mt-6">
          <p className="text-sm font-medium text-gray-300 mb-2">Storage</p>
          <div className="bg-gray-100/10 rounded-lg p-4">
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
              <div
                className="bg-purple-600 h-2.5 rounded-full"
                style={{ width: `${usedPercentage.toFixed(0)}%` }}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 mb-4">
              {usbVolumes.length === 0 ? (
                <p className="text-xs text-gray-400">No USB drives detected</p>
              ) : (
                usbVolumes.map((usb) => {
                  const totalGB = usb.total_space / 1024 ** 3;
                  const freeGB = usb.free_space / 1024 ** 3;
                  const usedGB = totalGB - freeGB;
                  const percentUsed =
                    totalGB === 0 ? 0 : (usedGB / totalGB) * 100;

                  return (
                    <div
                      key={usb.serial}
                      className="p-2 border border-purple-500/30 rounded-lg"
                    >
                      <p className="text-sm font-semibold mb-1 text-purple-300">
                        🔌 {usb.volume_label || usb.name}
                      </p>
                      <div className="w-full bg-gray-600 rounded-full h-2.5 mb-1">
                        <div
                          className="bg-purple-500 h-2.5 rounded-full"
                          style={{ width: `${percentUsed.toFixed(0)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400">
                        Total: {totalGB.toFixed(1)} GB <br /> Used:{" "}
                        {usedGB.toFixed(1)} GB <br /> Free: {freeGB.toFixed(1)}{" "}
                        GB
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="text-sm text-gray-400">
              <p>Total: {totalStorageGB.toFixed(1)} GB</p>
              <p>Used: {usedStorageGB.toFixed(1)} GB</p>
              <p>Free: {freeStorageGB.toFixed(1)} GB</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center border-t border-purple-300/20 my-2 pt-4">
          <span className="font-semibold text-white">Total: ${totalPrice}</span>
          <button
            onClick={handleProceed}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-1 rounded-lg text-white transition"
            disabled={cartItems.length === 0}
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
