import { put } from "@vercel/blob"

export async function uploadPersonaImage(file: File): Promise<string> {
  try {
    console.log("Attempting to upload image to blob storage:", file.name, file.size)

    // The BLOB_READ_WRITE_TOKEN should be automatically available in the Vercel environment
    const blob = await put(`personas/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true, // Add this to avoid naming conflicts
    })

    console.log("Image uploaded successfully to blob storage:", blob.url)
    return blob.url
  } catch (error) {
    console.error("Blob storage error details:", error)

    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    throw error // Re-throw so we can handle fallback in the component
  }
}

export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      resolve(event.target?.result as string)
    }
    reader.onerror = (error) => {
      reject(error)
    }
    reader.readAsDataURL(file)
  })
}

export function isBase64Image(imageString: string): boolean {
  return imageString.startsWith("data:image/")
}

export function isBlobUrl(imageString: string): boolean {
  return imageString.includes("blob.vercel-storage.com") || imageString.startsWith("https://")
}
