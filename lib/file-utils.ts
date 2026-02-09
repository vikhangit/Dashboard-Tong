import fileExtension from "file-extension";

export function isImageUrl(url: string): boolean {
  if (!url) return false;

  // Handle some common cases where url might be a blob or data url if needed in future
  // For now, relies on extension
  const ext = fileExtension(url);
  const imageExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "svg",
    "bmp",
    "ico",
    "tiff",
  ];

  return imageExtensions.includes(ext.toLowerCase());
}
