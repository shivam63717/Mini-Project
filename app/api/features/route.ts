import { NextRequest, NextResponse } from 'next/server'
import { pythonBackendClient } from '@/lib/api/python-backend-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'operations'
    const operationId = searchParams.get('operationId')

    if (type === 'operations' && operationId) {
      // Get specific feature operation
      const operation = await pythonBackendClient.getFeatureOperation(operationId)
      return NextResponse.json({
        success: true,
        data: operation
      })
    }

    if (type === 'operations') {
      // For listing operations, we'd need a list endpoint in the backend
      // For now, return empty array or handle via operationId
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    if (type === 'importance') {
      // Feature importance would come from experiment results or analysis
      // This would need to be fetched from experiment/analysis endpoints
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    if (type === 'scaling') {
      const scalingMethods = [
        { name: 'Standard Scaler', description: 'Zero mean, unit variance' },
        { name: 'Min-Max Scaler', description: 'Scale to [0, 1] range' },
        { name: 'Robust Scaler', description: 'Median and IQR based scaling' },
        { name: 'Normalizer', description: 'Scale to unit norm' }
      ]

      return NextResponse.json({
        success: true,
        data: scalingMethods
      })
    }

    if (type === 'selection') {
      const selectionMethods = [
        { name: 'Mutual Information', description: 'Information-theoretic feature selection' },
        { name: 'Chi-Square', description: 'Statistical test for categorical features' },
        { name: 'F-Score', description: 'ANOVA F-test for numerical features' },
        { name: 'Recursive Feature Elimination', description: 'Wrapper method with cross-validation' }
      ]

      return NextResponse.json({
        success: true,
        data: selectionMethods
      })
    }

    if (type === 'encoding') {
      const encodingMethods = [
        { name: 'One-Hot Encoding', description: 'Binary features for categorical variables' },
        { name: 'Label Encoding', description: 'Integer encoding for ordinal variables' },
        { name: 'Target Encoding', description: 'Mean target value encoding' },
        { name: 'Frequency Encoding', description: 'Frequency-based encoding' }
      ]

      return NextResponse.json({
        success: true,
        data: encodingMethods
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid feature type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error fetching feature data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feature data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { datasetId, operations, config } = body

    if (!datasetId || !operations || !Array.isArray(operations)) {
      return NextResponse.json(
        { success: false, error: 'datasetId and operations array are required' },
        { status: 400 }
      )
    }

    // Validate operations are valid types
    const validOperations = ['impute', 'encode', 'scale', 'normalize']
    const invalidOps = operations.filter((op: string) => !validOperations.includes(op))
    if (invalidOps.length > 0) {
      return NextResponse.json(
        { success: false, error: `Invalid operations: ${invalidOps.join(', ')}` },
        { status: 400 }
      )
    }

    // Call Python backend API to queue feature operation
    const response = await pythonBackendClient.queueFeatureOperation({
      dataset_id: datasetId,
      operations: operations as Array<'impute' | 'encode' | 'scale' | 'normalize'>,
      config: config || {},
    })

    return NextResponse.json({
      success: true,
      data: {
        operation_id: response.operation_id,
        status: 'queued',
        message: 'Feature operation queued for processing'
      }
    }, { status: 202 })
  } catch (error: any) {
    console.error('Error creating feature operation:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create feature operation' },
      { status: 500 }
    )
  }
}
