import { NextResponse } from "next/server";

// Static data for software details
const softwareData = [
  {
    id: "gimp-1",
    name: "GIMP",
    category: "Photo Editing",
    description:
      "GIMP is a free and open-source raster graphics editor used for image retouching, editing, and conversion.",
    downloadLink: "https://www.gimp.org/downloads/",
    safetyScore: 90,
    background_image: "https://www.gimp.org/images/frontpage/wilber-big.png",
    platforms: [
      { platform: { name: "Windows" } },
      { platform: { name: "macOS" } },
      { platform: { name: "Linux" } },
    ],
    developers: [{ name: "GIMP Team" }],
    publishers: [{ name: "GIMP Team" }],
  },
  {
    id: "audacity-2",
    name: "Audacity",
    category: "Audio Editing",
    description:
      "Audacity is a free, open-source, cross-platform audio software for multi-track recording and editing.",
    downloadLink: "https://www.audacityteam.org/download/",
    safetyScore: 85,
    background_image:
      "https://www.audacityteam.org/wp-content/uploads/2021/09/audacity-logo.png",
    platforms: [
      { platform: { name: "Windows" } },
      { platform: { name: "macOS" } },
      { platform: { name: "Linux" } },
    ],
    developers: [{ name: "Audacity Team" }],
    publishers: [{ name: "Audacity Team" }],
  },
  {
    id: "davinci-3",
    name: "DaVinci Resolve",
    category: "Video Editing",
    description:
      "DaVinci Resolve is professional video editing and color correction software with advanced features.",
    downloadLink: "https://www.blackmagicdesign.com/products/davinciresolve/",
    safetyScore: 88,
    background_image:
      "https://images.blackmagicdesign.com/images/products/davinciresolve/studio/hero/resolve-17-hero.jpg",
    platforms: [
      { platform: { name: "Windows" } },
      { platform: { name: "macOS" } },
      { platform: { name: "Linux" } },
    ],
    developers: [{ name: "Blackmagic Design" }],
    publishers: [{ name: "Blackmagic Design" }],
  },
  {
    id: "avast-4",
    name: "Avast Free Antivirus",
    category: "Antivirus",
    description:
      "Avast Free Antivirus provides essential protection against viruses and malware for Windows and other platforms.",
    downloadLink: "https://www.avast.com/free-antivirus-download",
    safetyScore: 95,
    background_image:
      "https://cdn.pixabay.com/photo/2017/08/30/01/05/motherboard-2695439_1280.jpg",
    platforms: [
      { platform: { name: "Windows" } },
      { platform: { name: "macOS" } },
    ],
    developers: [{ name: "Avast Software" }],
    publishers: [{ name: "Avast Software" }],
  },
  {
    id: "bitdefender-5",
    name: "Bitdefender Free",
    category: "Antivirus",
    description:
      "Bitdefender Free offers lightweight antivirus protection with real-time threat detection.",
    downloadLink: "https://www.bitdefender.com/solutions/free.html",
    safetyScore: 92,
    background_image:
      "https://cdn.pixabay.com/photo/2017/08/30/01/05/motherboard-2695439_1280.jpg",
    platforms: [
      { platform: { name: "Windows" } },
      { platform: { name: "macOS" } },
    ],
    developers: [{ name: "Bitdefender" }],
    publishers: [{ name: "Bitdefender" }],
  },
  {
    id: "avira-6",
    name: "Avira Free Antivirus",
    category: "Antivirus",
    description:
      "Avira Free Antivirus provides cloud-based scanning and protection against malware.",
    downloadLink: "https://www.avira.com/en/free-antivirus-windows",
    safetyScore: 90,
    background_image:
      "https://cdn.pixabay.com/photo/2017/08/30/01/05/motherboard-2695439_1280.jpg",
    platforms: [
      { platform: { name: "Windows" } },
      { platform: { name: "macOS" } },
    ],
    developers: [{ name: "Avira Operations" }],
    publishers: [{ name: "Avira Operations" }],
  },
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  console.log(`Handling GET request for /api/software/${id}`);

  try {
    const software = softwareData.find((item) => item.id === id);
    if (!software) {
      console.warn(`Software not found for ID: ${id}`);
      return NextResponse.json(
        { error: "Software not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(software);
  } catch (error) {
    console.error(`Error fetching software details for ID ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch software details" },
      { status: 500 }
    );
  }
}
