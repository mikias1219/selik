import { useState, useEffect } from "react";
import { fetcher } from "@/lib/api/auth";

interface User {
  id?: string;
  username?: string;
  phonenumber?: string;
  balance?: number;
  voucher_id?: number | null;
  created_date?: string;
  updated_date?: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);

      const token =
        localStorage.getItem("user_token") ||
        localStorage.getItem("admin_token");
      if (!token) {
        console.error("No authentication token found in localStorage");
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      try {
        const endpoint = "/auth/me";
        console.log("useCurrentUser: Fetching endpoint =", endpoint);
        console.log("useCurrentUser: Using token =", token);

        const response = await fetcher<User>(
          endpoint,
          { method: "GET" },
          token
        );
        console.log("useCurrentUser: Raw /auth/me response =", response);

        const userData: User = {
          id: response.id?.toString(),
          username: response.username || "Unknown",
          phonenumber: response.phonenumber,
          balance:
            typeof response.balance === "number"
              ? response.balance
              : parseFloat(response.balance) || 0,
          voucher_id: response.voucher_id,
          created_date: response.created_date,
          updated_date: response.updated_date,
        };

        // Check stored username for fallback
        const storedName = localStorage.getItem("username");
        if (storedName) {
          userData.username = storedName;
          console.log("useCurrentUser: Using stored username =", storedName);
        }

        console.log("useCurrentUser: Processed user data =", userData);
        setUser(userData);
      } catch (err: any) {
        console.error("useCurrentUser: Failed to fetch /auth/me:", err.message);
        setError(`Failed to load user information: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}
