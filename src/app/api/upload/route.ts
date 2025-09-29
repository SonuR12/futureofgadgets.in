import { NextRequest, NextResponse } from 'next/server'

function compressBase64(base64: string, quality: number = 0.6): string {
  // For server-side, we'll just validate and return
  // Compression happens on client-side for better performance
  if (!base64.startsWith('data:image/')) {
    throw new Error('Invalid image format')
  }
  return base64
}

export async function POST(request: NextRequest) {
  try {
    const { images } = await request.json()
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 })
    }

    // Validate and process images
    const processedImages = images.map((imageData: string, index: number) => {
      try {
        return compressBase64(imageData)
      } catch (error) {
        throw new Error(`Invalid image format at index ${index}`)
      }
    })

    return NextResponse.json({ 
      success: true, 
      files: processedImages 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}