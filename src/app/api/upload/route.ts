import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const productName = data.get('productName') as string
    const files: File[] = []
    
    for (const [key, value] of data.entries()) {
      if (value instanceof File) {
        files.push(value)
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    if (!productName) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
    }

    // Create safe directory name
    const safeDirName = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const productDir = join(process.cwd(), 'public/uploads/productadd', safeDirName)
    
    // Create directory if it doesn't exist
    if (!existsSync(productDir)) {
      await mkdir(productDir, { recursive: true })
    }

    const uploadedFiles = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const filename = `${Date.now()}-${file.name}`
      const filePath = join(productDir, filename)
      
      await writeFile(filePath, buffer)
      uploadedFiles.push(`/uploads/productadd/${safeDirName}/${filename}`)
    }

    return NextResponse.json({ 
      success: true, 
      files: uploadedFiles 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}