export async function fetchTrailerFromKinocheck(imdbID: string) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://your-production-url.com"
        : "http://localhost:3000");
    const url = `${baseUrl}/api/kinocheckProxy?imdb_id=${encodeURIComponent(
      imdbID
    )}`;
    console.log(`Fetching trailer for IMDb ID "${imdbID}" from ${url}`);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Kinocheck proxy error for IMDb ID "${imdbID}": ${response.status} - ${errorText}`
      );
      return null;
    }

    const data = await response.json();
    console.log(
      `Kinocheck response for IMDb ID "${imdbID}":`,
      JSON.stringify(data, null, 2)
    );

    let youtubeId = data.trailer?.youtube_video_id;
    if (!youtubeId && data.trailers?.length > 0) {
      youtubeId = data.trailers[0].youtube_video_id;
    }

    if (!youtubeId) {
      console.warn(`No trailer found for IMDb ID "${imdbID}"`);
      return null;
    }

    return `https://www.youtube.com/embed/${youtubeId}`;
  } catch (error) {
    console.error(
      `fetchTrailerFromKinocheck failed for IMDb ID "${imdbID}":`,
      error
    );
    return null;
  }
}
