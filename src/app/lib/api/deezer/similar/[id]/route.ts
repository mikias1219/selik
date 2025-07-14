import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Fetch the track to get the artist ID
    const trackResponse = await fetch(`https://api.deezer.com/track/${id}`, {
      headers: {
        Accept: "application/json",
      },
    });
    if (!trackResponse.ok) {
      return NextResponse.json(
        { error: `Deezer API error: ${trackResponse.statusText}` },
        { status: trackResponse.status }
      );
    }
    const trackData = await trackResponse.json();
    if (trackData.error) {
      return NextResponse.json(
        { error: trackData.error.message },
        { status: trackData.error.code || 400 }
      );
    }
    const artistId = trackData.artist?.id;

    if (!artistId) {
      return NextResponse.json(
        { error: "Artist ID not found for the track" },
        { status: 400 }
      );
    }

    // Fetch the artist's top tracks
    const similarResponse = await fetch(
      `https://api.deezer.com/artist/${artistId}/top?limit=5`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    if (!similarResponse.ok) {
      return NextResponse.json(
        { error: `Deezer API error: ${similarResponse.statusText}` },
        { status: similarResponse.status }
      );
    }
    const similarData = await similarResponse.json();
    if (similarData.error) {
      return NextResponse.json(
        { error: similarData.error.message },
        { status: similarData.error.code || 400 }
      );
    }

    return NextResponse.json({ data: similarData.data || [] });
  } catch (error) {
    console.error("Deezer API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch similar tracks from Deezer" },
      { status: 500 }
    );
  }
}
