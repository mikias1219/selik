import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imdbId = searchParams.get("imdb_id");

  if (!imdbId || typeof imdbId !== "string") {
    console.error("Invalid or missing imdb_id parameter:", imdbId);
    return NextResponse.json(
      { error: "Missing or invalid imdb_id parameter" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.kinocheck.com/movies?imdb_id=${encodeURIComponent(imdbId)}`,
      {
        headers: {
          "X-Api-Key": process.env.KINOCHECK_API_KEY || "",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error(
        `Kinocheck API error for imdb_id "${imdbId}": ${response.status} - ${text}`
      );
      return NextResponse.json({ error: text }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(`Kinocheck proxy error for imdb_id "${imdbId}":`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
