import { NextRequest, NextResponse } from 'next/server'
import { ProcessingQueue } from '@/lib/services/ProcessingQueue'

const processingQueue = new ProcessingQueue()

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params
    const job = await processingQueue.getJob(jobId)

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: job
    })
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch job' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params
    const body = await request.json()
    const { action, updates } = body

    if (action === 'cancel') {
      const success = await processingQueue.cancelJob(jobId)
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Failed to cancel job' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Job cancelled successfully'
      })
    }

    if (action === 'retry') {
      const success = await processingQueue.retryJob(jobId)
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Failed to retry job' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Job queued for retry'
      })
    }

    if (action === 'update' && updates) {
      const success = await processingQueue.updateJobStatus(jobId, updates.status, updates)
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Failed to update job' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Job updated successfully'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update job' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params
    
    // Cancel the job first
    const cancelled = await processingQueue.cancelJob(jobId)
    if (!cancelled) {
      return NextResponse.json(
        { success: false, error: 'Job not found or already completed' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete job' },
      { status: 500 }
    )
  }
}
