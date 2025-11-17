import { NextRequest, NextResponse } from 'next/server'
import { RedisService, RedisKeys } from '@/lib/database/redis'

interface FeatureOperation {
  id: string
  name: string
  type: string
  description: string
  status: string
  datasetId: string
  parameters: Record<string, any>
  results: {
    features_processed?: number
    features_selected?: number
    original_features?: number
    processing_time: number
    memory_usage: number
  }
  createdAt: string
  updatedAt: string
}

interface FeatureImportance {
  feature: string
  importance: number
  type: string
  description: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'operations'
    const datasetId = searchParams.get('datasetId')

    if (type === 'operations') {
      // Get all feature operation IDs from Redis list
      const operationIds = await RedisService.lrange<string>(RedisKeys.FEATURE_OPERATIONS_LIST, 0, -1)
      
      // Fetch all operations
      const allOperations: FeatureOperation[] = []
      for (const id of operationIds) {
        const operation = await RedisService.get<FeatureOperation>(RedisKeys.FEATURE_OPERATION(id))
        if (operation) {
          allOperations.push(operation)
        }
      }

      let filteredOperations = allOperations

      if (datasetId) {
        filteredOperations = filteredOperations.filter(op => op.datasetId === datasetId)
      }

      return NextResponse.json({
        success: true,
        data: filteredOperations
      })
    }

    if (type === 'importance') {
      if (datasetId) {
        const importance = await RedisService.get<FeatureImportance[]>(RedisKeys.FEATURE_IMPORTANCE(datasetId))
        if (importance) {
          return NextResponse.json({
            success: true,
            data: importance
          })
        }
      }

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
    const { name, type, datasetId, parameters } = body

    if (!name || !type || !datasetId) {
      return NextResponse.json(
        { success: false, error: 'Name, type, and datasetId are required' },
        { status: 400 }
      )
    }

    // Generate new ID
    const idSeq = await RedisService.get<number>('feature:id:seq') || 0
    const newId = String(idSeq + 1)
    await RedisService.set('feature:id:seq', idSeq + 1)

    // Create new feature operation
    const newOperation: FeatureOperation = {
      id: newId,
      name,
      type,
      description: `Feature ${type} operation: ${name}`,
      status: 'pending',
      datasetId,
      parameters: parameters || {},
      results: {
        features_processed: 0,
        processing_time: 0,
        memory_usage: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Store operation in Redis
    await RedisService.set(RedisKeys.FEATURE_OPERATION(newId), newOperation)
    await RedisService.rpush(RedisKeys.FEATURE_OPERATIONS_LIST, newId)

    // In a real implementation, this would trigger background processing
    return NextResponse.json({
      success: true,
      data: newOperation,
      message: 'Feature operation queued for processing'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating feature operation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create feature operation' },
      { status: 500 }
    )
  }
}
