import { NextRequest, NextResponse } from 'next/server'

// Mock data for demonstration
const mockDatasets = [
  {
    id: '1',
    name: 'Cybersecurity Logs',
    description: 'Network security event logs from firewall and IDS systems',
    size: '2.4 MB',
    rows: 15420,
    columns: 12,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    status: 'active',
    tags: ['security', 'network', 'logs']
  },
  {
    id: '2',
    name: 'Malware Samples',
    description: 'Binary features extracted from malware samples',
    size: '8.7 MB',
    rows: 8920,
    columns: 25,
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T14:20:00Z',
    status: 'active',
    tags: ['malware', 'binary', 'features']
  },
  {
    id: '3',
    name: 'User Behavior Analytics',
    description: 'User activity patterns and authentication events',
    size: '15.2 MB',
    rows: 45680,
    columns: 18,
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z',
    status: 'processing',
    tags: ['user', 'behavior', 'analytics']
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    // Filter datasets
    let filteredDatasets = mockDatasets

    if (search) {
      filteredDatasets = filteredDatasets.filter(dataset =>
        dataset.name.toLowerCase().includes(search.toLowerCase()) ||
        dataset.description.toLowerCase().includes(search.toLowerCase()) ||
        dataset.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      )
    }

    if (status) {
      filteredDatasets = filteredDatasets.filter(dataset => dataset.status === status)
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedDatasets = filteredDatasets.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedDatasets,
      pagination: {
        page,
        limit,
        total: filteredDatasets.length,
        totalPages: Math.ceil(filteredDatasets.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching datasets:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch datasets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, tags } = body

    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: 'Name and description are required' },
        { status: 400 }
      )
    }

    // Create new dataset
    const newDataset = {
      id: (mockDatasets.length + 1).toString(),
      name,
      description,
      size: '0 MB',
      rows: 0,
      columns: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending',
      tags: tags || []
    }

    mockDatasets.push(newDataset)

    return NextResponse.json({
      success: true,
      data: newDataset
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating dataset:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create dataset' },
      { status: 500 }
    )
  }
}
