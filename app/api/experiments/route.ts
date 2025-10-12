import { NextRequest, NextResponse } from 'next/server'

// Mock data for experiments
const mockExperiments = [
  {
    id: '1',
    name: 'Malware Detection Model',
    description: 'Binary classification model for malware detection using network features',
    status: 'running',
    algorithm: 'Random Forest',
    accuracy: 0.942,
    precision: 0.938,
    recall: 0.945,
    f1Score: 0.941,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T11:30:00Z',
    datasetId: '2',
    hyperparameters: {
      n_estimators: 100,
      max_depth: 10,
      min_samples_split: 2,
      min_samples_leaf: 1,
      random_state: 42
    },
    metrics: {
      training_time: 45.2,
      inference_time: 0.012,
      memory_usage: 128.5
    }
  },
  {
    id: '2',
    name: 'Network Anomaly Detection',
    description: 'Unsupervised anomaly detection for network traffic patterns',
    status: 'completed',
    algorithm: 'Isolation Forest',
    accuracy: 0.876,
    precision: 0.892,
    recall: 0.861,
    f1Score: 0.876,
    createdAt: '2024-01-14T14:00:00Z',
    updatedAt: '2024-01-14T16:45:00Z',
    datasetId: '1',
    hyperparameters: {
      n_estimators: 200,
      contamination: 0.1,
      max_samples: 0.8,
      random_state: 42
    },
    metrics: {
      training_time: 23.8,
      inference_time: 0.008,
      memory_usage: 95.2
    }
  },
  {
    id: '3',
    name: 'User Behavior Classification',
    description: 'Multi-class classification for user behavior patterns',
    status: 'failed',
    algorithm: 'XGBoost',
    accuracy: 0.0,
    precision: 0.0,
    recall: 0.0,
    f1Score: 0.0,
    createdAt: '2024-01-13T10:00:00Z',
    updatedAt: '2024-01-13T10:15:00Z',
    datasetId: '3',
    hyperparameters: {
      n_estimators: 1000,
      max_depth: 6,
      learning_rate: 0.1,
      subsample: 0.8,
      random_state: 42
    },
    metrics: {
      training_time: 0,
      inference_time: 0,
      memory_usage: 0
    },
    error: 'Insufficient training data for multi-class classification'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const algorithm = searchParams.get('algorithm') || ''

    // Filter experiments
    let filteredExperiments = mockExperiments

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

    // Create new experiment
    const newExperiment = {
      id: (mockExperiments.length + 1).toString(),
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

    mockExperiments.push(newExperiment)

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
