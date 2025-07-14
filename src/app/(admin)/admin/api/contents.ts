// File: api/contents.ts

import {
  ContentCreate,
  ContentResponse,
  ContentUpdate,
  PaginatedContentListResponse,
} from "@/app/(admin)/admin/api/types";

const API_BASE = "/api/admin/contents";

export async function fetchContents(
  contentType: string,
  offset = 0,
  limit = 10,
  genres: string[] = [],
  title?: string,
  description?: string
): Promise<PaginatedContentListResponse> {
  const params = new URLSearchParams();
  params.append("offset", offset.toString());
  params.append("limit", limit.toString());
  genres.forEach((g) => params.append("genres", g));
  if (title) params.append("title", title);
  if (description) params.append("description", description);

  const res = await fetch(`${API_BASE}/${contentType}?${params.toString()}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Failed to fetch contents: ${res.statusText}`);
  return res.json();
}

export async function fetchContentById(
  contentType: string,
  id: number
): Promise<ContentResponse> {
  const res = await fetch(`${API_BASE}/${contentType}/${id}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Content not found: ${res.statusText}`);
  return res.json();
}

export async function createContent(
  contentType: string,
  data: ContentCreate
): Promise<ContentResponse> {
  const res = await fetch(`${API_BASE}/${contentType}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateContent(
  contentType: string,
  id: number,
  data: ContentUpdate
): Promise<ContentResponse> {
  const res = await fetch(`${API_BASE}/${contentType}/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteContent(
  contentType: string,
  id: number
): Promise<void> {
  const res = await fetch(`${API_BASE}/${contentType}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Failed to delete: ${res.statusText}`);
}
