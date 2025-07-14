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

async function fetcher<T>(
  endpoint: string,
  options: { method?: string; body?: string } = {},
  token?: string
): Promise<T> {
  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: options.body,
    timeout: 5000,
  };

  try {
    const response = await axios({
      method: config.method,
      url: `${API_URL}${endpoint}`,
      headers: config.headers,
      data: config.body ? JSON.parse(config.body) : undefined,
      timeout: config.timeout,
    });
    console.log(`fetcher: ${endpoint} response =`, response.data);
    return response.data as T;
  } catch (error: any) {
    console.error(
      `fetcher: ${endpoint} error =`,
      error.response?.data || error.message
    );
    throw error.response?.data || new Error(`Failed to fetch ${endpoint}`);
  }
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
  return fetcher<TokenResponse>("/auth/user/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
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
