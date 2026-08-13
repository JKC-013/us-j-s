import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchGoogleDriveMedia } from "@/lib/googleDrive";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, folderUrl } = body;

    const driveMedia = folderUrl ? await fetchGoogleDriveMedia(folderUrl) : [];

    const mediaItems = driveMedia.length > 0 ? driveMedia : [
      { url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80", type: "image", shape: "portrait" },
      { url: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&q=80", type: "image", shape: "landscape" },
      { url: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&q=80", type: "image", shape: "square" },
      { url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&q=80", type: "image", shape: "panorama" },
    ];

    const page = await prisma.page.create({
      data: {
        text,
        layoutSeed: Math.random().toString(36).substring(7),
        media: {
          create: mediaItems,
        },
      },
      include: {
        media: true,
      }
    });

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json({ success: false, error: "Failed to create page" }, { status: 500 });
  }
}
