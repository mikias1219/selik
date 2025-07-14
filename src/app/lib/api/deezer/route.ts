import { NextResponse } from "next/server";

const GENRES = ["Pop", "Hip-Hop", "Rock", "Jazz", "Electronic", "RnB"];

function addFakeGenres(data: any) {
  return {
    ...data,
    data: data.data.map((track: any) => ({
      ...track,
      genre: GENRES[Math.floor(Math.random() * GENRES.length)],
    })),
  };
}

export async function GET() {
  try {
    const response = await fetch("https://api.deezer.com/search?q=rophnan", {
      headers: {
        Accept: "application/json",
      },
    });
    const rawData = await response.json();
    const dataWithGenres = addFakeGenres(rawData);

    return NextResponse.json(dataWithGenres);
  } catch (error) {
    console.error("Error fetching Deezer API:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracks" },
      { status: 500 }
    );
  }
}
