import { NextRequest, NextResponse } from 'next/server'
import { DataProcessingService } from '@/lib/services/DataProcessingService'
import { ProcessingQueue } from '@/lib/services/ProcessingQueue'

const processingService = new DataProcessingService()
const processingQueue = new ProcessingQueue()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, config, priority = 'normal', async = false } = body

    if (!type || !config) {
      return NextResponse.json(
        { success: false, error: 'Type and config are required' },
        { status: 400 }
      )
    }

    if (async) {
      // Add job to queue for async processing
      const jobId = await processingQueue.addJob({
        type,
        priority,
        status: 'pending',
        config,
        maxRetries: 3
      })

      return NextResponse.json({
        success: true,
        data: {
          jobId,
          status: 'queued',
          message: 'Job added to processing queue'
        }
      }, { status: 202 })
    } else {
      // Process synchronously
      let result: any

      switch (type) {
        case 'dataset':
          result = await processingService.processDataset(config)
          break
        
        case 'analytics':
          result = await processingService.processAnalytics(
            config.datasetId,
            config.analyticsType,
            config.parameters
          )
          break
        
        case 'statistics':
          result = await processingService.processStatistics(
            config.datasetId,
            config.statisticsType,
            config.parameters
          )
          break
        
        case 'training':
          result = await processingService.trainModel(
            config.experimentId,
            config
          )
          break
        
        case 'feature_engineering':
          result = await processingService.engineerFeatures(
            config.datasetId,
            config
          )
          break
        
        default:
          return NextResponse.json(
            { success: false, error: `Unknown processing type: ${type}` },
            { status: 400 }
          )
      }

      return NextResponse.json({
        success: result.success,
        data: result.data,
        metadata: result.metadata,
        error: result.error
      })
    }

  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json(
      { success: false, error: 'Processing failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    if (type === 'queue') {
      // Get queue status
      const queueStatus = await processingQueue.getQueueStatus()
      return NextResponse.json({
        success: true,
        data: queueStatus
      })
    }

    if (type === 'jobs') {
      // Get jobs
      const filters: any = {}
      if (status) filters.status = status
      if (priority) filters.priority = priority

      const jobs = await processingQueue.getJobs(filters)
      return NextResponse.json({
        success: true,
        data: jobs
      })
    }

    if (type === 'statistics') {
      // Get job statistics
      const statistics = await processingQueue.getJobStatistics()
      return NextResponse.json({
        success: true,
        data: statistics
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request type' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error fetching processing data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch processing data' },
      { status: 500 }
    )
  }
}
