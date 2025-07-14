import axios from "axios";
import {
  AdminLogin,
  AdminCreate,
  TokenResponse,
  User,
  EndUserLogin,
  EndUserCreate,
  EndUserOut,
} from "@/app/lib/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetcher<T>(
  endpoint: string,
  options: { method?: string; body?: string } = {},
  token?: string,
  retries: number = 2
): Promise<T> {
  // Remove trailing slashes from API_URL and ensure endpoint starts with /
  const baseUrl = API_URL.replace(/\/+$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${cleanEndpoint}`;

  // Log raw environment variable and constructed URL
  console.log(
    "fetcher: NEXT_PUBLIC_API_URL =",
    process.env.NEXT_PUBLIC_API_URL
  );
  console.log(
    `fetcher: Constructed ${options.method || "GET"} URL = ${fullUrl}`
  );

  // Validate URL
  try {
    new URL(fullUrl);
  } catch (err) {
    console.error("fetcher: Invalid URL:", fullUrl, err);
    throw new Error(`Invalid URL: ${fullUrl}`);
  }

  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: options.body,
    timeout: 10000,
  };

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const response = await axios({
        method: config.method,
        url: fullUrl,
        headers: config.headers,
        data: config.body ? JSON.parse(config.body) : undefined,
        timeout: config.timeout,
      });
      console.log(`fetcher: ${endpoint} response =`, response.data);
      return response.data as T;
    } catch (error: any) {
      const errorMessage =
        error.code === "ECONNABORTED"
          ? `Request to ${fullUrl} timed out after ${config.timeout}ms`
          : error.response?.status === 404
          ? `Endpoint ${endpoint} not found on ${baseUrl}. Verify backend server and route configuration.`
          : error.response?.data?.detail ||
            error.message ||
            `Failed to fetch ${endpoint}`;
      console.error(
        `fetcher: ${endpoint} error (attempt ${attempt}/${retries + 1}) =`,
        errorMessage
      );

      if (attempt === retries + 1 || error.response?.status !== 503) {
        throw new Error(errorMessage);
      }
      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw new Error(`Failed to fetch ${endpoint} after ${retries + 1} attempts`);
}

export async function loginAdmin(data: AdminLogin): Promise<TokenResponse> {
  console.log("loginAdmin: Attempting with data =", data);
  return fetcher<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: EndUserLogin): Promise<TokenResponse> {
  console.log("loginUser: Attempting with data =", data);
  try {
    const response = await fetcher<TokenResponse>("/auth/user/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    console.log("loginUser: Storing user_token =", response.access_token);
    localStorage.setItem("user_token", response.access_token);
    return response;
  } catch (error: any) {
    console.error("loginUser: Failed with error =", error.message);
    throw new Error("Authentication failed: " + error.message);
  }
}

export async function getMe(token: string): Promise<User | EndUserOut> {
  console.log("getMe: Fetching with token =", token);
  return fetcher<User | EndUserOut>("/auth/me", {}, token);
}

export async function registerAdmin(
  data: AdminCreate,
  token: string
): Promise<User> {
  console.log("registerAdmin: Attempting with data =", data);
  return fetcher<User>(
    "/auth/register",
    { method: "POST", body: JSON.stringify(data) },
    token
  );
}

export async function registerUser(
  data: EndUserCreate,
  token: string
): Promise<EndUserOut> {
  console.log("registerUser: Attempting with data =", data);
  return fetcher<EndUserOut>(
    "/auth/register-user",
    { method: "POST", body: JSON.stringify(data) },
    token
  );
}
