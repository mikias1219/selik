"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";
import { fetcher } from "@/lib/api/auth";

interface CartItem {
  id: string;
  title: string;
  price: number;
  type: "ebook" | "movie" | "game" | "music" | "poster";
  thumbnail?: string;
  [key: string]: any;
}

interface PurchaseItem {
  id: string;
  title: string;
  type: "ebook" | "movie" | "game" | "music" | "poster";
  price: number;
  thumbnail?: string;
  purchaseDate: string;
}

interface PurchaseResponse {
  id: number;
  user_id: number;
  item_id: number;
  price: string;
  purchased_at: string;
}

interface PaginatedPurchaseResponse {
  items: PurchaseResponse[];
  total: number;
}

export default function Orders() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<PurchaseItem[]>([]);
  const {
    user,
    loading: userLoading,
    error: userError,
    setUser,
  } = useCurrentUser();
  const router = useRouter();

  // Fetch recent purchases
  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem("user_token");
      if (!token) {
        console.error("No user token for fetching purchases");
        return;
      }
      const response = await fetcher<PaginatedPurchaseResponse>(
        "/user/contents/item/purchases?limit=10&offset=0",
        { method: "GET" },
        token
      );
      console.log("fetchPurchases: Raw response =", response);

      // Map PurchaseResponse to PurchaseItem
      const purchases: PurchaseItem[] = await Promise.all(
        response.items.map(async (purchase) => {
          try {
            // Try fetching item details
            const item = await fetcher<{
              title: string;
              type: string;
              thumbnail?: string;
            }>(`/items/${purchase.item_id}`, { method: "GET" }, token);
            return {
              id: purchase.id.toString(),
              title: item.title,
              type: item.type as
                | "ebook"
                | "movie"
                | "game"
                | "music"
                | "poster",
              price: parseFloat(purchase.price),
              thumbnail: item.thumbnail || "/placeholder.jpg",
              purchaseDate: purchase.purchased_at,
            };
          } catch (err) {
            // Fallback to minimal data if item fetch fails
            return {
              id: purchase.id.toString(),
              title: `Item ${purchase.item_id}`,
              type: "unknown" as
                | "ebook"
                | "movie"
                | "game"
                | "music"
                | "poster",
              price: parseFloat(purchase.price),
              thumbnail: "/placeholder.jpg",
              purchaseDate: purchase.purchased_at,
            };
          }
        })
      );

      setRecentPurchases(purchases);
    } catch (err: any) {
      console.error("fetchPurchases: Failed =", err.message);
      toast.error("Failed to load recent purchases: " + err.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        theme: "dark",
        className: "purple-toast",
      });
    }
  };

  // Refetch user data to update balance
  const refetchUser = async () => {
    try {
      const token = localStorage.getItem("user_token");
      if (!token) {
        console.error("No user token for refetching user");
        return;
      }
      const response = await fetcher<{
        id: string;
        username: string;
        phonenumber: string;
        balance: number;
      }>("/auth/me", { method: "GET" }, token);
      setUser({
        id: response.id,
        username: response.username || "Unknown",
        phonenumber: response.phonenumber,
        balance:
          typeof response.balance === "number"
            ? response.balance
            : parseFloat(response.balance) || 0,
      });
    } catch (err: any) {
      console.error("refetchUser: Failed =", err.message);
    }
  };

  // Handle checkout: Purchase all cart items
  const handleCheckout = async () => {
    if (!cartItems.length) {
      toast.warn("Cart is empty!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        theme: "dark",
        className: "purple-toast",
      });
      return;
    }

    const token = localStorage.getItem("user_token");
    if (!token) {
      toast.error("Please log in to proceed with checkout", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        theme: "dark",
        className: "purple-toast",
      });
      router.push("/auth/login");
      return;
    }

    let allSuccessful = true;
    for (const item of cartItems) {
      try {
        const response = await fetcher<PurchaseResponse>(
          `/user/contents/item/${item.id}/buy`,
          { method: "POST" },
          token
        );
        toast.success(`${item.title} purchased successfully!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          theme: "dark",
          className: "purple-toast",
        });
      } catch (err: any) {
        allSuccessful = false;
        console.error(
          `handleCheckout: Failed for ${item.title} =`,
          err.message
        );
        toast.error(`Failed to purchase ${item.title}: ${err.message}`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          theme: "dark",
          className: "purple-toast",
        });
      }
    }

    if (allSuccessful) {
      // Clear cart
      setCartItems([]);
      localStorage.removeItem("cart");
      window.dispatchEvent(new CustomEvent("cart-cleared"));
      // Refetch purchases and user
      await Promise.all([fetchPurchases(), refetchUser()]);
    }
  };

  useEffect(() => {
    // Load cart items
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch {
        setCartItems([]);
      }
    }

    // Fetch purchases on mount
    fetchPurchases();

    const handleAdd = (e: Event) => {
      const newItem = (e as CustomEvent<CartItem>).detail;
      setCartItems((prev) => {
        if (prev.some((i) => i.id === newItem.id)) {
          toast.warn(`${newItem.title} is already in cart!`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            theme: "dark",
            className: "purple-toast",
          });
          return prev;
        }
        const updated = [...prev, newItem];
        localStorage.setItem("cart", JSON.stringify(updated));
        return updated;
      });
    };

    const handleRemove = (e: Event) => {
      const remove = (e as CustomEvent<{ id: string }>).detail.id;
      setCartItems((prev) => {
        const item = prev.find((i) => i.id === remove);
        const updated = prev.filter((i) => i.id !== remove);
        localStorage.setItem("cart", JSON.stringify(updated));
        if (item) {
          toast.success(`${item.title} removed from cart!`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            theme: "dark",
            className: "purple-toast",
          });
        }
        return updated;
      });
    };

    window.addEventListener("add-to-cart", handleAdd);
    window.addEventListener("remove-from-cart", handleRemove);
    return () => {
      window.removeEventListener("add-to-cart", handleAdd);
      window.removeEventListener("remove-from-cart", handleRemove);
    };
  }, []);

  const handleRemoveItem = (id: string) =>
    window.dispatchEvent(
      new CustomEvent("remove-from-cart", { detail: { id } })
    );

  const totalPrice = parseFloat(
    cartItems.reduce((sum, item) => sum + (item.price || 0), 0).toFixed(2)
  );

  const typeToEmoji = {
    movie: "🎬",
    ebook: "📖",
    game: "🎮",
    music: "🎵",
    poster: "🖼️",
  };

  const getItemDetails = (item: CartItem) => {
    const extras = {
      ebook: item.pageCount && `Pages: ${item.pageCount}`,
      movie: item.duration && `Duration: ${item.duration}`,
      game: item.platform && `Platform: ${item.platform}`,
      music: item.artist && `Artist: ${item.artist}`,
    };
    return {
      label: item.type.charAt(0).toUpperCase() + item.type.slice(1),
      extra: extras[item.type] ?? "",
    };
  };

  return (
    <div className="max-w-6xl mt-12 p-8 bg-gradient-to-br from-black via-[#1a0e2a] to-black backdrop-blur-md rounded-3xl shadow-xl text-white">
      {/* Profile */}
      <section className="mb-12 flex items-center space-x-6">
        <div className="w-20 h-20 bg-gray-800 rounded-full overflow-hidden relative">
          <Image src="/avatar.jpg" alt="Avatar" fill className="object-cover" />
        </div>
        <div>
          {userLoading ? (
            <p className="text-xl font-medium">Loading profile…</p>
          ) : userError ? (
            <p className="text-xl font-medium text-red-400">
              Error loading profile
            </p>
          ) : (
            <>
              <p className="text-2xl font-bold">
                {user?.username || "Selik Admin"}
              </p>
              <p className="text-gray-400">
                Phone: {user?.phonenumber || "N/A"}
              </p>
              <p className="text-gray-400">
                Balance: ${user?.balance?.toFixed(2) ?? "0.00"}
              </p>
            </>
          )}
        </div>
      </section>

      {/* Cart */}
      <section>
        <h1 className="text-3xl font-bold text-purple-300 mb-6 flex justify-between items-center">
          <span>🛒 Your Cart</span>
          {cartItems.length ? (
            <span className="text-lg px-3 py-1 border border-purple-700 rounded-lg">
              {cartItems.length} {cartItems.length > 1 ? "items" : "item"}
            </span>
          ) : null}
        </h1>
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[40vh] text-center">
            <p className="text-lg text-gray-400 mb-4">Your cart is empty 😢</p>
            <div className="flex flex-wrap gap-4">
              {["ebook", "movies", "games", "music"].map((category) => (
                <button
                  key={category}
                  onClick={() => router.push(`/${category}`)}
                  className="px-6 py-2 rounded-full bg-purple-700 hover:bg-purple-800 text-white shadow-lg hover:shadow-purple-600 transition-transform transform hover:scale-105"
                >
                  Explore {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {cartItems.map((item) => {
              const { label, extra } = getItemDetails(item);
              return (
                <div
                  key={item.id}
                  className="flex items-start bg-black/10 backdrop-blur-md rounded-lg p-3 shadow hover:shadow-lg transition border border-purple-900 hover:border-purple-700"
                >
                  <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={item.thumbnail || "/placeholder.jpg"}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-base font-semibold text-purple-200 truncate flex items-center gap-1">
                      {typeToEmoji[item.type]} {item.title}
                    </h3>
                    <p className="text-sm text-gray-400">{label}</p>
                    {extra && <p className="text-xs text-gray-500">{extra}</p>}
                    <p className="text-sm text-purple-400 font-medium mt-1">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="ml-2 text-red-500 hover:text-red-700 p-1 rounded-full transition-transform hover:scale-110"
                    aria-label={`Remove ${item.title}`}
                  >
                    <X size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end gap-4 items-center border-t border-gray-700 pt-6">
          <span className="text-lg font-bold">
            Total: ${totalPrice.toFixed(2)}
          </span>
          <button
            onClick={handleCheckout}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={userLoading || !!userError || !cartItems.length}
          >
            Checkout
          </button>
        </div>
      </section>

      {/* Recent Purchases */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-purple-300 mb-4">
          Recent Purchases
        </h2>
        {recentPurchases.length === 0 ? (
          <p className="text-gray-500">No recent purchases.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-purple-900">
            <table className="min-w-full divide-y divide-purple-800 text-sm">
              <thead className="bg-purple-950 text-purple-300 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Thumbnail</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Purchase Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-800 text-gray-200">
                {recentPurchases.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-purple-950/40 transition"
                  >
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="w-14 h-14 relative rounded overflow-hidden">
                        <Image
                          src={item.thumbnail || "/placeholder.jpg"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{item.title}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1">
                        {typeToEmoji[item.type]}{" "}
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">${item.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {new Date(item.purchaseDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
