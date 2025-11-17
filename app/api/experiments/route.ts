import { NextRequest, NextResponse } from 'next/server'
import { RedisService, RedisKeys } from '@/lib/database/redis'

interface Experiment {
  id: string
  name: string
  description: string
  status: string
  algorithm: string
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  createdAt: string
  updatedAt: string
  datasetId: string
  hyperparameters: Record<string, any>
  metrics: {
    training_time: number
    inference_time: number
    memory_usage: number
  }
  error?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const algorithm = searchParams.get('algorithm') || ''

    // Get all experiment IDs from Redis list
    const experimentIds = await RedisService.lrange<string>(RedisKeys.EXPERIMENTS_LIST, 0, -1)
    
    // Fetch all experiments
    const allExperiments: Experiment[] = []
    for (const id of experimentIds) {
      const experiment = await RedisService.get<Experiment>(RedisKeys.EXPERIMENT(id))
      if (experiment) {
        allExperiments.push(experiment)
      }
    }

    // Filter experiments
    let filteredExperiments = allExperiments

    if (status) {
      filteredExperiments = filteredExperiments.filter(exp => exp.status === status)
    }

    if (algorithm) {
      filteredExperiments = filteredExperiments.filter(exp => 
        exp.algorithm.toLowerCase().includes(algorithm.toLowerCase())
      )
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedExperiments = filteredExperiments.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedExperiments,
      pagination: {
        page,
        limit,
        total: filteredExperiments.length,
        totalPages: Math.ceil(filteredExperiments.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching experiments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch experiments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, algorithm, datasetId, hyperparameters } = body

    if (!name || !description || !algorithm || !datasetId) {
      return NextResponse.json(
        { success: false, error: 'Name, description, algorithm, and datasetId are required' },
        { status: 400 }
      )
    }

    // Generate new ID
    const idSeq = await RedisService.get<number>('experiment:id:seq') || 0
    const newId = String(idSeq + 1)
    await RedisService.set('experiment:id:seq', idSeq + 1)

    // Create new experiment
    const newExperiment: Experiment = {
      id: newId,
      name,
      description,
      status: 'pending',
      algorithm,
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      datasetId,
      hyperparameters: hyperparameters || {},
      metrics: {
        training_time: 0,
        inference_time: 0,
        memory_usage: 0
      }
    }

    // Store experiment in Redis
    await RedisService.set(RedisKeys.EXPERIMENT(newId), newExperiment)
    await RedisService.rpush(RedisKeys.EXPERIMENTS_LIST, newId)

    return NextResponse.json({
      success: true,
      data: newExperiment
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating experiment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create experiment' },
      { status: 500 }
    )
  }
}
