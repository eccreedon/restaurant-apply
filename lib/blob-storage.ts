import { put } from "@vercel/blob"

export async function uploadPersonaImage(file: File): Promise<string> {
  try {
    const blob = await put(`personas/${Date.now()}-${file.name}`, file, {
      access: "public",
    })

    return blob.url
  } catch (error) {
    console.error("Error uploading image to blob storage:", error)
    throw new Error("Failed to upload image")
  }
}

export function isBase64Image(imageString: string): boolean {
  return imageString.startsWith("data:image/")
}

export function isBlobUrl(imageString: string): boolean {
  return imageString.includes("blob.vercel-storage.com") || imageString.startsWith("https://")
}
