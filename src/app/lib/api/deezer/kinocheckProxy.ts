import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { term } = req.query;

  if (!term || typeof term !== "string") {
    return res.status(400).json({ error: "Missing or invalid term parameter" });
  }

  try {
    const response = await fetch(
      `https://api.kinocheck.com/movies?term=${encodeURIComponent(term)}`,
      {
        headers: {
          "X-Api-Key": process.env.KINOCHECK_API_KEY || "",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Kinocheck proxy error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
