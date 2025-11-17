import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { CSVAnalyzer } from '@/lib/services/csv-analyzer'
import { RedisService, RedisKeys } from '@/lib/database/redis'

// Configure upload directory
const UPLOAD_DIR = join(process.cwd(), 'uploads')
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir()
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/json',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Please upload CSV, JSON, or Excel files.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name
    const extension = originalName.split('.').pop()
    const filename = `${timestamp}_${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filepath = join(UPLOAD_DIR, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Parse file metadata
    const fileInfo = {
      id: timestamp.toString(),
      originalName,
      filename,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      path: filepath,
      status: 'uploaded' as string,
      rows: 0,
      columns: 0
    }

    // Analyze CSV file if it's a CSV
    let analysis = null
    if (file.type === 'text/csv' || originalName.toLowerCase().endsWith('.csv')) {
      try {
        analysis = await CSVAnalyzer.analyzeFile(filepath, timestamp.toString(), originalName)
        fileInfo.status = 'analyzed'
        if (analysis) {
          fileInfo.rows = analysis.rows || 0
          fileInfo.columns = analysis.columnCount || 0
        }
      } catch (error) {
        console.error('Error analyzing CSV:', error)
        // Continue with upload even if analysis fails
      }
    }

    // Store file info in Redis
    await RedisService.set(RedisKeys.UPLOAD_FILE(timestamp.toString()), fileInfo)
    await RedisService.rpush(RedisKeys.UPLOAD_FILES_LIST, timestamp.toString())

    return NextResponse.json({
      success: true,
      data: {
        ...fileInfo,
        analysis
      },
      message: 'File uploaded successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get all uploaded file IDs from Redis list
    const fileIds = await RedisService.lrange<string>(RedisKeys.UPLOAD_FILES_LIST, 0, -1)
    
    // Fetch all file info
    const allFiles = []
    for (const id of fileIds) {
      const fileInfo = await RedisService.get<any>(RedisKeys.UPLOAD_FILE(id))
      if (fileInfo) {
        allFiles.push(fileInfo)
      }
    }

    // Sort by upload date (newest first)
    allFiles.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedFiles = allFiles.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedFiles,
      pagination: {
        page,
        limit,
        total: allFiles.length,
        totalPages: Math.ceil(allFiles.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching uploaded files:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch uploaded files' },
      { status: 500 }
    )
  }
}
