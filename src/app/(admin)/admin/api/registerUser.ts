import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ detail: "Method Not Allowed" });
  }

  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const response = await axios.post(
      `${backendUrl}/auth/register-user`,
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: req.headers.authorization || "",
        },
      }
    );
    return res.status(200).json(response.data);
  } catch (error: any) {
    return res
      .status(error.response?.status || 500)
      .json(error.response?.data || { detail: "Internal Server Error" });
  }
}
