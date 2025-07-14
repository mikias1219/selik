// app/api/deezer/album/[id]/route.ts
import { NextResponse } from "next/server";

type Album = {
  id: string;
  title: string;
  artist: {
    name: string;
    id: string;
  };
  cover_medium: string;
  release_date: string;
  tracks: {
    data: any[];
  };
};

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const res = await fetch(`https://api.deezer.com/album/${params.id}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Deezer API error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    if (!data.id || !data.title || !data.artist?.name) {
      throw new Error("Invalid album data");
    }
    const album: Album = {
      id: String(data.id),
      title: data.title || "Unknown Title",
      artist: {
        name: data.artist?.name || "Unknown Artist",
        id: String(data.artist?.id),
      },
      cover_medium: data.cover_medium || "/music.png",
      release_date: data.release_date || "Unknown",
      tracks: data.tracks || { data: [] },
    };
    return NextResponse.json(album);
  } catch (error: any) {
    console.error("Error fetching Deezer album:", error.message);
    return NextResponse.json(
      { error: `Failed to fetch album: ${error.message}` },
      { status: 500 }
    );
  }
}
