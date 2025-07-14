import { fetcher } from "./auth";

interface CustomContentResponse {
  results: Array<{
    id: number;
    title: string;
    release_date: string;
    poster_url: string;
    description: string;
    rating: number;
    votes: number;
    trailer_url: string;
    genres: string[];
    content_type: string;
    language: string;
  }>;
  total: number;
}

export async function fetchCustomContent(
  contentType: "movie" | "series",
  searchQuery: string,
  selectedCategories: string[],
  offset: number,
  limit: number,
  token: string
): Promise<CustomContentResponse> {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not set, skipping custom API fetch");
    return { results: [], total: 0 };
  }

  if (!token) {
    console.warn("No access token provided, skipping custom API fetch");
    return { results: [], total: 0 };
  }

  try {
    const queryParams = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
      title: searchQuery,
      genres: selectedCategories.join(","),
    });
    const endpoint = `/user/contents/${contentType}?${queryParams}`;
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
    console.log(
      `Fetching custom content from: ${fullUrl} with token: ${token}`
    );
    const response = await fetcher<CustomContentResponse>(
      endpoint,
      {
        method: "GET",
      },
      token
    );
    return response;
  } catch (error: any) {
    console.error(`Error fetching custom content: ${error.message}`);
    return { results: [], total: 0 };
  }
}
