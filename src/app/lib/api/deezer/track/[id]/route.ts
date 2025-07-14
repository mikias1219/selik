import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const response = await fetch(`https://api.deezer.com/track/${id}`, {
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: `Deezer API error: ${response.statusText}` },
        { status: response.status }
      );
    }
    const data = await response.json();
    if (data.error) {
      return NextResponse.json(
        { error: data.error.message },
        { status: data.error.code || 400 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Deezer API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch track from Deezer" },
      { status: 500 }
    );
  }
}
