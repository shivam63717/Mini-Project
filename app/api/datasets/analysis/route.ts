import { NextRequest, NextResponse } from 'next/server'
import { CSVAnalyzer } from '@/lib/services/csv-analyzer'
import { ApiResponseHandler } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const datasetId = searchParams.get('id')

    if (datasetId) {
      // Get specific dataset analysis
      const analysis = await CSVAnalyzer.getAnalysis(datasetId)
      
      if (!analysis) {
        return ApiResponseHandler.notFound('Dataset analysis not found')
      }

      return ApiResponseHandler.success(analysis, 'Dataset analysis retrieved successfully')
    } else {
      // Get all dataset analyses
      const analyses = await CSVAnalyzer.getAllAnalyses()
      return ApiResponseHandler.success(analyses, 'All dataset analyses retrieved successfully')
    }
  } catch (error) {
    console.error('Error fetching dataset analysis:', error)
    return ApiResponseHandler.internalError('Failed to fetch dataset analysis')
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const datasetId = searchParams.get('id')

    if (!datasetId) {
      return ApiResponseHandler.badRequest('Dataset ID is required')
    }

    await CSVAnalyzer.deleteAnalysis(datasetId)
    return ApiResponseHandler.success(null, 'Dataset analysis deleted successfully')
  } catch (error) {
    console.error('Error deleting dataset analysis:', error)
    return ApiResponseHandler.internalError('Failed to delete dataset analysis')
  }
}
