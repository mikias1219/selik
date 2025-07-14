export async function fetchMovieDetails(imdbID: string) {
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?i=${imdbID}&apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}`,
      { cache: "force-cache" }
    );
    if (!response.ok) {
      console.warn(
        `OMDB API fetch failed for imdbID ${imdbID}: ${response.statusText}`
      );
      return null;
    }
    const data = await response.json();
    if (data.Response === "False") {
      console.warn(`OMDB API error for imdbID ${imdbID}: ${data.Error}`);
      return null;
    }
    return data;
  } catch (error) {
    console.warn(`fetchMovieDetails failed for imdbID ${imdbID}:`, error);
    return null;
  }
}
