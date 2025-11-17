import { NextRequest, NextResponse } from 'next/server'
import { pythonBackendClient } from '@/lib/api/python-backend-client'

export async function GET(request: NextRequest) {
  try {
    // Call Python backend API
    const response = await pythonBackendClient.listExperiments()

    // Transform response to match expected format
    const experiments = Array.isArray(response) ? response : (response.items || response.data || [])

    return NextResponse.json({
      success: true,
      data: experiments,
      pagination: {
        page: 1,
        limit: experiments.length,
        total: experiments.length,
        totalPages: 1
      }
    })
  } catch (error: any) {
    console.error('Error fetching experiments:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch experiments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, algorithm, datasetId, hyperparameters } = body

    if (!name || !algorithm || !datasetId) {
      return NextResponse.json(
        { success: false, error: 'Name, algorithm, and datasetId are required' },
        { status: 400 }
      )
    }

    // Call Python backend API
    const response = await pythonBackendClient.createExperiment({
      dataset_id: datasetId,
      name,
      algorithm,
      hyperparameters: hyperparameters || {},
    })

    return NextResponse.json({
      success: true,
      data: response
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating experiment:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create experiment' },
      { status: 500 }
    )
  }
}
