"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface User {
  username: string;
}

export function useEndUserAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAuth = async (token?: string) => {
    setLoading(true);
    setError(null);
    try {
      const authToken = token || localStorage.getItem("user_token");
      if (!authToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to verify user token");
      }

      const data = await response.json();
      setUser({ username: data.username });
    } catch (err: any) {
      setError(err.message);
      setUser(null);
      localStorage.removeItem("user_token");
      toast.error("User authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user_token");
    localStorage.removeItem("username");
    toast.info("Logged out successfully");
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return { user, loading, error, refreshAuth, logout };
}
