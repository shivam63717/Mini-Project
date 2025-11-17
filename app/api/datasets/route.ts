import { NextRequest, NextResponse } from 'next/server'
import { pythonBackendClient } from '@/lib/api/python-backend-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('limit') || '10')
    const name = searchParams.get('search') || searchParams.get('name') || undefined
    const source = searchParams.get('source') || undefined
    const updatedFrom = searchParams.get('updated_from') || undefined
    const updatedTo = searchParams.get('updated_to') || undefined

    // Call Python backend API
    const response = await pythonBackendClient.listDatasets({
      name,
      source: source as any,
      updated_from: updatedFrom,
      updated_to: updatedTo,
      page,
      page_size: pageSize,
    })

    // Transform response to match expected format
    return NextResponse.json({
      success: true,
      data: response.items || response.data || [],
      pagination: {
        page: response.page || page,
        limit: response.page_size || pageSize,
        total: response.total || 0,
        totalPages: response.total_pages || Math.ceil((response.total || 0) / pageSize)
      }
    })
  } catch (error: any) {
    console.error('Error fetching datasets:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch datasets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, schema, row_count, source, files } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    // Call Python backend API
    const response = await pythonBackendClient.createDataset({
      name,
      description: description || '',
      schema,
      row_count: row_count || 0,
      source: source || 'internal',
      files: files || [],
    })

    return NextResponse.json({
      success: true,
      data: response
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating dataset:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create dataset' },
      { status: 500 }
    )
  }
}
