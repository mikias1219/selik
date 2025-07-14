import { load } from "cheerio";

const trailerCache = new Map<string, string | null>();

export async function fetchTrailerSmart(
  imdbID: string,
  title: string,
  type: "movie" | "series" = "movie"
): Promise<string | null> {
  const cacheKey = `${imdbID}-${type}`;
  if (trailerCache.has(cacheKey)) {
    console.log(`Returning cached trailer for ${title} (${imdbID})`);
    return trailerCache.get(cacheKey) || null;
  }

  if (!navigator.onLine) {
    console.warn(
      `Offline mode, skipping trailer fetch for ${title} (${imdbID})`
    );
    trailerCache.set(cacheKey, null);
    return null;
  }

  console.log(`Fetching trailer for ${title} (${imdbID})`);

  if (type === "movie") {
    try {
      const kinoURL = `https://www.kinocheck.com/movie/${imdbID.toLowerCase()}`;
      const response = await fetch(kinoURL, { cache: "force-cache" });
      if (!response.ok) {
        console.warn(`Kinocheck failed: ${response.statusText}`);
        return null;
      }
      const text = await response.text();
      const match = text.match(/https:\/\/www\.youtube\.com\/embed\/[^"']+/);
      if (match) {
        trailerCache.set(cacheKey, match[0]);
        return match[0];
      }
    } catch (err) {
      console.warn("Kinocheck failed, falling back to YouTube", err);
    }
  }

  try {
    const query = encodeURIComponent(`${title} official trailer ${type}`);
    const searchUrl = `https://www.youtube.com/results?search_query=${query}`;
    const response = await fetch(searchUrl, { cache: "force-cache" });
    if (!response.ok) {
      console.warn(`YouTube search failed: ${response.statusText}`);
      return null;
    }
    const html = await response.text();
    const $ = load(html);
    const scripts = $("script");
    for (const script of scripts) {
      const text = $(script).text() || "";
      if (text.includes("videoRenderer")) {
        const videoIdMatch = text.match(/"videoId":"(.*?)"/);
        if (videoIdMatch) {
          const embedUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`;
          trailerCache.set(cacheKey, embedUrl);
          return embedUrl;
        }
      }
    }
    trailerCache.set(cacheKey, null);
    return null;
  } catch (error) {
    console.warn("YouTube fallback failed", error);
    trailerCache.set(cacheKey, null);
    return null;
  }
}
