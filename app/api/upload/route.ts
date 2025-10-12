import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { CSVAnalyzer } from '@/lib/services/csv-analyzer'

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
      status: 'uploaded'
    }

    // Analyze CSV file if it's a CSV
    let analysis = null
    if (file.type === 'text/csv' || originalName.toLowerCase().endsWith('.csv')) {
      try {
        analysis = await CSVAnalyzer.analyzeFile(filepath, timestamp.toString(), originalName)
        fileInfo.status = 'analyzed'
      } catch (error) {
        console.error('Error analyzing CSV:', error)
        // Continue with upload even if analysis fails
      }
    }

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

    // Mock uploaded files data
    const mockFiles = [
      {
        id: '1',
        originalName: 'security_logs.csv',
        filename: '1705320000000_security_logs.csv',
        size: 2457600,
        type: 'text/csv',
        uploadedAt: '2024-01-15T10:30:00Z',
        status: 'processed',
        rows: 15420,
        columns: 12
      },
      {
        id: '2',
        originalName: 'malware_features.json',
        filename: '1705308000000_malware_features.json',
        size: 8912000,
        type: 'application/json',
        uploadedAt: '2024-01-14T14:20:00Z',
        status: 'processing',
        rows: 8920,
        columns: 25
      },
      {
        id: '3',
        originalName: 'user_behavior.xlsx',
        filename: '1705296000000_user_behavior.xlsx',
        size: 15200000,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        uploadedAt: '2024-01-13T09:15:00Z',
        status: 'uploaded',
        rows: 0,
        columns: 0
      }
    ]

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedFiles = mockFiles.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedFiles,
      pagination: {
        page,
        limit,
        total: mockFiles.length,
        totalPages: Math.ceil(mockFiles.length / limit)
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
