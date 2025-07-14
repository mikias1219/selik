import { NextResponse } from "next/server";

// Static data for editing software (fallback)
const editingSoftware = [
  {
    id: "gimp-1",
    name: "GIMP",
    category: "Photo Editing",
    description: "Free and open-source image editing software.",
    downloadLink: "https://www.gimp.org/downloads/",
    safetyScore: 90,
    background_image: "https://www.gimp.org/images/frontpage/wilber-big.png",
  },
  {
    id: "audacity-2",
    name: "Audacity",
    category: "Audio Editing",
    description: "Free, open-source, cross-platform audio software.",
    downloadLink: "https://www.audacityteam.org/download/",
    safetyScore: 85,
    background_image:
      "https://www.audacityteam.org/wp-content/uploads/2021/09/audacity-logo.png",
  },
  {
    id: "davinci-3",
    name: "DaVinci Resolve",
    category: "Video Editing",
    description: "Professional video editing and color correction software.",
    downloadLink: "https://www.blackmagicdesign.com/products/davinciresolve/",
    safetyScore: 88,
    background_image:
      "https://images.blackmagicdesign.com/images/products/davinciresolve/studio/hero/resolve-17-hero.jpg",
  },
  {
    id: "avast-4",
    name: "Avast Free Antivirus",
    category: "Antivirus",
    description: "Free antivirus software for Windows and other platforms.",
    downloadLink: "https://www.avast.com/free-antivirus-download",
    safetyScore: 95,
    background_image:
      "https://cdn.pixabay.com/photo/2017/08/30/01/05/motherboard-2695439_1280.jpg",
  },
  {
    id: "bitdefender-5",
    name: "Bitdefender Free",
    category: "Antivirus",
    description: "Lightweight free antivirus with real-time protection.",
    downloadLink: "https://www.bitdefender.com/solutions/free.html",
    safetyScore: 92,
    background_image:
      "https://cdn.pixabay.com/photo/2017/08/30/01/05/motherboard-2695439_1280.jpg",
  },
  {
    id: "avira-6",
    name: "Avira Free Antivirus",
    category: "Antivirus",
    description: "Free antivirus with cloud-based scanning.",
    downloadLink: "https://www.avira.com/en/free-antivirus-windows",
    safetyScore: 90,
    background_image:
      "https://cdn.pixabay.com/photo/2017/08/30/01/05/motherboard-2695439_1280.jpg",
  },
];

export async function GET() {
  console.log("Handling GET request for /api/fetchSoftware");
  try {
    const virusTotalApiKey = process.env.VIRUSTOTAL_API_KEY;

    if (!virusTotalApiKey) {
      console.warn("VirusTotal API key not configured, returning static data");
      return NextResponse.json(editingSoftware);
    }

    const antivirusSoftware = [
      {
        id: "avast-4",
        name: "Avast Free Antivirus",
        fileId: "example-avast-file-id",
        category: "Antivirus",
        description: "Free antivirus software for Windows and other platforms.",
        downloadLink: "https://www.avast.com/free-antivirus-download",
        background_image:
          "https://cdn.pixabay.com/photo/2017/08/30/01/05/motherboard-2695439_1280.jpg",
      },
      {
        id: "bitdefender-5",
        name: "Bitdefender Free",
        fileId: "example-bitdefender-file-id",
        category: "Antivirus",
        description: "Lightweight free antivirus with real-time protection.",
        downloadLink: "https://www.bitdefender.com/solutions/free.html",
        background_image:
          "https://cdn.pixabay.com/photo/2017/08/30/01/05/motherboard-2695439_1280.jpg",
      },
      {
        id: "avira-6",
        name: "Avira Free Antivirus",
        fileId: "example-avira-file-id",
        category: "Antivirus",
        description: "Free antivirus with cloud-based scanning.",
        downloadLink: "https://www.avira.com/en/free-antivirus-windows",
        background_image:
          "https://cdn.pixabay.com/photo/2017/08/30/01/05/motherboard-2695439_1280.jpg",
      },
    ];

    const softwarePromises = antivirusSoftware.map(async (software) => {
      try {
        const response = await fetch(
          `https://www.virustotal.com/api/v3/files/${software.fileId}`,
          {
            headers: {
              "x-apikey": virusTotalApiKey,
              Accept: "application/json",
            },
          }
        );
        if (!response.ok) {
          console.warn(
            `Failed to fetch ${software.name}: ${response.statusText}`
          );
          return { ...software, safetyScore: 50 };
        }
        const data = await response.json();
        return {
          ...software,
          safetyScore:
            data.data.attributes.last_analysis_stats.malicious === 0 ? 95 : 50,
        };
      } catch (error) {
        console.warn(`Error fetching ${software.name}:`, error);
        return { ...software, safetyScore: 50 };
      }
    });

    const antivirusResults = (await Promise.all(softwarePromises)).filter(
      (item): item is NonNullable<typeof item> => item !== null
    );

    const softwareList = [
      ...antivirusResults,
      ...editingSoftware.filter(
        (s) => !antivirusResults.some((a) => a.id === s.id)
      ),
    ].sort((a, b) => b.safetyScore - a.safetyScore);

    if (softwareList.length === 0) {
      console.warn("No software data available, returning static fallback");
      return NextResponse.json(editingSoftware);
    }

    return NextResponse.json(softwareList);
  } catch (error) {
    console.error("Error fetching software:", error);
    return NextResponse.json(editingSoftware, { status: 200 }); // Fallback to static data
  }
}
