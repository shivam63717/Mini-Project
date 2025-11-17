import { NextRequest, NextResponse } from 'next/server'
import { RedisService, RedisKeys } from '@/lib/database/redis'

interface Dataset {
  id: string
  name: string
  description: string
  size: string
  rows: number
  columns: number
  createdAt: string
  updatedAt: string
  status: string
  tags: string[]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    // Get all dataset IDs from Redis list
    const datasetIds = await RedisService.lrange<string>(RedisKeys.DATASETS_LIST, 0, -1)
    
    // Fetch all datasets
    const allDatasets: Dataset[] = []
    for (const id of datasetIds) {
      const dataset = await RedisService.get<Dataset>(RedisKeys.DATASET(id))
      if (dataset) {
        allDatasets.push(dataset)
      }
    }

    // Filter datasets
    let filteredDatasets = allDatasets

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

    // Generate new ID
    const idSeq = await RedisService.get<number>('dataset:id:seq') || 0
    const newId = String(idSeq + 1)
    await RedisService.set('dataset:id:seq', idSeq + 1)

    // Create new dataset
    const newDataset: Dataset = {
      id: newId,
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

    // Store dataset in Redis
    await RedisService.set(RedisKeys.DATASET(newId), newDataset)
    await RedisService.rpush(RedisKeys.DATASETS_LIST, newId)

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
