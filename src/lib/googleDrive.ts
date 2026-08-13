import { google } from "googleapis";

export interface DriveMediaItem {
  url: string;
  type: "image" | "video";
  shape: string;
}

const DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

function parseGoogleDriveFolderId(folderUrl: string) {
  const patterns = [
    /drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/drive\/u\/\d+\/folders\/([a-zA-Z0-9_-]+)/,
  ];

  for (const regex of patterns) {
    const match = folderUrl.match(regex);
    if (match) {
      return match[1];
    }
  }

  return null;
}

function inferShape(mimeType: string, width?: number, height?: number) {
  if (mimeType.startsWith("image/")) {
    if (!width || !height) return "landscape";
    const ratio = width / height;
    if (ratio > 2.2) return "panorama";
    if (ratio > 1.3) return "landscape";
    if (ratio < 0.85) return "portrait";
    return "square";
  }

  if (mimeType.startsWith("video/")) {
    if (!width || !height) return "horizontal-video";
    return width / height < 0.85 ? "vertical-video" : "horizontal-video";
  }

  return "square";
}

async function createDriveClient() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: DRIVE_SCOPES,
    });
    return google.drive({ version: "v3", auth });
  }

  if (process.env.GOOGLE_API_KEY) {
    return google.drive({ version: "v3", auth: process.env.GOOGLE_API_KEY });
  }

  return null;
}

export async function fetchGoogleDriveMedia(folderUrl: string) {
  const folderId = parseGoogleDriveFolderId(folderUrl);
  if (!folderId) return [];

  const drive = await createDriveClient();
  if (!drive) return [];

  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false and (mimeType contains 'image/' or mimeType contains 'video/')`,
      fields: 'files(id,mimeType,name,imageMediaMetadata(width,height),videoMediaMetadata(width,height))',
      pageSize: 8,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    return (response.data.files || [])
      .filter((file) => !!file.id && !!file.mimeType)
      .map((file) => {
        const width = file.imageMediaMetadata?.width || file.videoMediaMetadata?.width;
        const height = file.imageMediaMetadata?.height || file.videoMediaMetadata?.height;
        const shape = inferShape(file.mimeType!, width, height);
        const type = file.mimeType!.startsWith("video/") ? "video" : "image";

        return {
          url: `https://drive.google.com/uc?export=view&id=${file.id}`,
          type,
          shape,
        } as DriveMediaItem;
      });
  } catch (error) {
    console.error("Google Drive fetch failed:", error);
    return [];
  }
}
