"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAdminAuth } from "@/app/hooks/useAdminAuth";
import { useEndUserAuth } from "@/app/hooks/useUserAuth";
import { loginAdmin, loginUser } from "./lib/api/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";

export default function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<"admin" | "user">("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    admin,
    loading: adminLoading,
    logout: adminLogout,
    refreshAuth: adminRefreshAuth,
    error: adminError,
  } = useAdminAuth();

  const {
    user,
    loading: userLoading,
    refreshAuth: userRefreshAuth,
    error: userError,
  } = useEndUserAuth();

  const handleRedirect = useCallback(() => {
    if (adminLoading || userLoading) return;

    if (loginType === "admin" && admin && !adminError) {
      router.push("/admin");
    } else if (loginType === "user" && user && !userError) {
      router.push("/home");
    }
  }, [
    admin,
    user,
    adminLoading,
    userLoading,
    adminError,
    userError,
    loginType,
    router,
  ]);

  useEffect(() => {
    handleRedirect();
  }, [handleRedirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loginFn = loginType === "admin" ? loginAdmin : loginUser;
      const tokenKey = loginType === "admin" ? "admin_token" : "user_token";
      const refreshFn =
        loginType === "admin" ? adminRefreshAuth : userRefreshAuth;

      const response = await loginFn({ username, password });

      if (!response.access_token) {
        throw new Error("No access_token received");
      }

      localStorage.setItem(tokenKey, response.access_token);
      localStorage.setItem("username", username);
      await refreshFn(response.access_token);

      // Ensure state is updated before redirect
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (
        (loginType === "admin" && adminError) ||
        (loginType === "user" && userError)
      ) {
        throw new Error("Authentication failed");
      }

      router.push(loginType === "admin" ? "/admin" : "/home");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "Invalid username or password";
      setError(`❌ ${errorMessage}`);
      console.error("Login failed:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isCheckingAuth = loginType === "admin" ? adminLoading : userLoading;
  const isAlreadyLoggedIn =
    (loginType === "admin" && admin && !adminError) ||
    (loginType === "user" && user && !userError);

  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <p className="text-white text-lg animate-pulse">
          Checking authentication...
        </p>
      </div>
    );
  }

  if (isAlreadyLoggedIn) {
    return null;
  }

  const movieBgUrl = "https://wallpapercave.com/uwp/uwp4300500.jpeg";

  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url("${movieBgUrl}")` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-l from-black/90 via-black/70 to-transparent" />

      <div className="relative z-10 w-full md:w-1/2 flex items-center justify-center ml-auto p-6">
        <div className="w-full max-w-md p-8 bg-transparent backdrop-blur-md border border-purple-500/20 rounded-2xl shadow-2xl animate-slide-up">
          <div className="flex items-center justify-center mb-6 gap-3">
            <Image
              src="/selik-01.png"
              alt="Selik Movies Logo"
              width={50}
              height={50}
              className="drop-shadow"
            />
            <span className="text-xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text drop-shadow">
              Welcome to Selik Movies
            </span>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => setLoginType("admin")}
              className={`px-4 py-2 rounded-md font-medium ${
                loginType === "admin"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              Admin Login
            </button>
            <button
              type="button"
              onClick={() => setLoginType("user")}
              className={`px-4 py-2 rounded-md font-medium ${
                loginType === "user"
                  ? "bg-pink-600 text-white"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              User Login
            </button>
          </div>

          <p className="text-center text-sm text-gray-400 mb-2">
            Logging in as:{" "}
            <span className="font-semibold text-purple-300">{loginType}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              {
                id: "username",
                type: "text",
                value: username,
                setter: setUsername,
                label: "Username",
              },
              {
                id: "password",
                type: "password",
                value: password,
                setter: setPassword,
                label: "Password",
              },
            ].map((field) => (
              <div className="relative" key={field.id}>
                <input
                  id={field.id}
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  required
                  placeholder={field.label}
                  disabled={loading}
                  className="peer w-full px-4 py-3 bg-gray-900/60 border border-purple-600/20 text-white rounded-md placeholder-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
                <label
                  htmlFor={field.id}
                  className={`absolute left-4 transition-all text-sm text-gray-400 ${
                    field.value
                      ? "-top-5 text-purple-400"
                      : "peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-5 peer-focus:text-purple-400 peer-focus:text-sm"
                  }`}
                >
                  {field.label}
                </label>
              </div>
            ))}

            {error && (
              <p className="text-red-400 text-center text-sm animate-pulse">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-700 text-white font-semibold rounded-md shadow-lg hover:scale-105 transition-transform duration-300 hover:shadow-purple-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex justify-center items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
