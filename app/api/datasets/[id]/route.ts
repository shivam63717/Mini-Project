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
  schema?: any[]
  sampleData?: any[]
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const dataset = await RedisService.get<Dataset>(RedisKeys.DATASET(id))

    if (!dataset) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: dataset
    })
  } catch (error) {
    console.error('Error fetching dataset:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dataset' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, description, tags } = body

    const dataset = await RedisService.get<Dataset>(RedisKeys.DATASET(id))
    if (!dataset) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      )
    }

    // Update dataset
    const updatedDataset: Dataset = {
      ...dataset,
      name: name || dataset.name,
      description: description || dataset.description,
      tags: tags || dataset.tags,
      updatedAt: new Date().toISOString()
    }

    await RedisService.set(RedisKeys.DATASET(id), updatedDataset)

    return NextResponse.json({
      success: true,
      data: updatedDataset
    })
  } catch (error) {
    console.error('Error updating dataset:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update dataset' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const dataset = await RedisService.get<Dataset>(RedisKeys.DATASET(id))

    if (!dataset) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      )
    }

    // Remove dataset from Redis
    await RedisService.del(RedisKeys.DATASET(id))
    
    // Remove from list
    const datasetIds = await RedisService.lrange<string>(RedisKeys.DATASETS_LIST, 0, -1)
    const filteredIds = datasetIds.filter(datasetId => datasetId !== id)
    await RedisService.del(RedisKeys.DATASETS_LIST)
    if (filteredIds.length > 0) {
      await RedisService.rpush(RedisKeys.DATASETS_LIST, ...filteredIds)
    }

    return NextResponse.json({
      success: true,
      message: 'Dataset deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting dataset:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete dataset' },
      { status: 500 }
    )
  }
}
