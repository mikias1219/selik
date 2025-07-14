import { useState, useEffect, useCallback } from "react";
import { getMe } from "@/app/lib/api/auth";
import { User } from "@/app/lib/types/auth";

export function useAdminAuth() {
  const [admin, setAdmin] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async (overrideToken?: string) => {
    const tokenToUse = overrideToken || localStorage.getItem("admin_token");

    console.log("checkAuth: Starting with token =", tokenToUse);

    if (!tokenToUse) {
      console.warn("checkAuth: No token found, clearing state");
      setAdmin(null);
      setToken(null);
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setToken(tokenToUse);

      const profile = await getMe(tokenToUse);
      console.log("checkAuth: Profile received =", profile);

      if (
        profile &&
        "user_type" in profile &&
        (String(profile.user_type) === "admin" ||
          String(profile.user_type) === "1")
      ) {
        setAdmin(profile);
        setError(null);
      } else {
        console.warn("checkAuth: User is not an admin");
        localStorage.removeItem("admin_token");
        setAdmin(null);
        setToken(null);
        setError("User is not an admin");
      }
    } catch (err: any) {
      console.error("checkAuth: Error fetching profile:", err.message);
      localStorage.removeItem("admin_token");
      setAdmin(null);
      setToken(null);
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }, []);

  // Run on initial mount
  useEffect(() => {
    console.log("useAdminAuth: Initializing auth check");

    const tokenFromStorage = localStorage.getItem("admin_token");

    if (tokenFromStorage) {
      checkAuth(tokenFromStorage);
    } else {
      setLoading(false); // Mark loading as false if no token
    }
  }, [checkAuth]);

  const logout = useCallback(() => {
    console.log("logout: Clearing auth state");
    localStorage.removeItem("admin_token");
    setAdmin(null);
    setToken(null);
    setError(null);
  }, []);

  return {
    admin,
    token,
    loading,
    logout,
    refreshAuth: checkAuth,
    error,
  };
}
