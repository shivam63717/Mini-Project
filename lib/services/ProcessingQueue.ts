import { RedisService, RedisKeys } from '@/lib/database/redis'
import { DataProcessingService } from './DataProcessingService'

export interface QueueJob {
  id: string
  type: 'dataset' | 'analytics' | 'statistics' | 'training' | 'feature_engineering'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  config: any
  createdAt: string
  startedAt?: string
  completedAt?: string
  progress: number
  result?: any
  error?: string
  retries: number
  maxRetries: number
}

export interface QueueStatus {
  pending: number
  processing: number
  completed: number
  failed: number
  total: number
  averageProcessingTime: number
  throughput: number
}

export class ProcessingQueue {
  private processingService: DataProcessingService
  private isProcessing: boolean = false
  private processingInterval: NodeJS.Timeout | null = null

  constructor() {
    this.processingService = new DataProcessingService()
  }

  // Add job to queue
  async addJob(job: Omit<QueueJob, 'id' | 'createdAt' | 'progress' | 'retries'>): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    const queueJob: QueueJob = {
      ...job,
      id: jobId,
      createdAt: now,
      progress: 0,
      retries: 0,
      maxRetries: job.maxRetries || 3
    }

    // Add to Redis queue
    await RedisService.zadd(
      RedisKeys.TRAINING_JOBS_LIST,
      this.getPriorityScore(job.priority),
      queueJob
    )

    // Start processing if not already running
    if (!this.isProcessing) {
      this.startProcessing()
    }

    return jobId
  }

  // Get job by ID
  async getJob(jobId: string): Promise<QueueJob | null> {
    const jobs = await RedisService.zrange<QueueJob>(RedisKeys.TRAINING_JOBS_LIST, 0, -1)
    return jobs.find(job => job.id === jobId) || null
  }

  // Get all jobs with filtering
  async getJobs(filters?: {
    status?: string
    type?: string
    priority?: string
  }): Promise<QueueJob[]> {
    const jobs = await RedisService.zrange<QueueJob>(RedisKeys.TRAINING_JOBS_LIST, 0, -1)
    
    if (!filters) {
      return jobs
    }

    return jobs.filter(job => {
      if (filters.status && job.status !== filters.status) return false
      if (filters.type && job.type !== filters.type) return false
      if (filters.priority && job.priority !== filters.priority) return false
      return true
    })
  }

  // Update job status
  async updateJobStatus(jobId: string, status: QueueJob['status'], updates?: Partial<QueueJob>): Promise<boolean> {
    const job = await this.getJob(jobId)
    if (!job) {
      return false
    }

    const updatedJob: QueueJob = {
      ...job,
      status,
      ...updates,
      id: jobId // Ensure ID doesn't change
    }

    // Update in Redis
    await RedisService.zadd(
      RedisKeys.TRAINING_JOBS_LIST,
      this.getPriorityScore(updatedJob.priority),
      updatedJob
    )

    return true
  }

  // Cancel job
  async cancelJob(jobId: string): Promise<boolean> {
    return await this.updateJobStatus(jobId, 'cancelled', {
      completedAt: new Date().toISOString()
    })
  }

  // Retry failed job
  async retryJob(jobId: string): Promise<boolean> {
    const job = await this.getJob(jobId)
    if (!job || job.retries >= job.maxRetries) {
      return false
    }

    return await this.updateJobStatus(jobId, 'pending', {
      retries: job.retries + 1,
      error: undefined
    })
  }

  // Get queue status
  async getQueueStatus(): Promise<QueueStatus> {
    const jobs = await this.getJobs()
    
    const status: QueueStatus = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      total: jobs.length,
      averageProcessingTime: 0,
      throughput: 0
    }

    let totalProcessingTime = 0
    let completedJobs = 0

    jobs.forEach(job => {
      status[job.status as keyof QueueStatus]++
      
      if (job.status === 'completed' && job.startedAt && job.completedAt) {
        const processingTime = new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()
        totalProcessingTime += processingTime
        completedJobs++
      }
    })

    if (completedJobs > 0) {
      status.averageProcessingTime = totalProcessingTime / completedJobs
    }

    // Calculate throughput (jobs per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const recentCompleted = jobs.filter(job => 
      job.status === 'completed' && job.completedAt && job.completedAt > oneHourAgo
    ).length
    status.throughput = recentCompleted

    return status
  }

  // Start processing queue
  startProcessing(): void {
    if (this.isProcessing) {
      return
    }

    this.isProcessing = true
    this.processingInterval = setInterval(async () => {
      await this.processNextJob()
    }, 1000) // Check every second
  }

  // Stop processing queue
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
    this.isProcessing = false
  }

  // Process next job in queue
  private async processNextJob(): Promise<void> {
    try {
      // Get pending jobs sorted by priority
      const pendingJobs = await this.getJobs({ status: 'pending' })
      
      if (pendingJobs.length === 0) {
        return
      }

      // Sort by priority and creation time
      pendingJobs.sort((a, b) => {
        const priorityDiff = this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority)
        if (priorityDiff !== 0) return priorityDiff
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })

      const nextJob = pendingJobs[0]
      
      // Update job status to processing
      await this.updateJobStatus(nextJob.id, 'processing', {
        startedAt: new Date().toISOString()
      })

      // Process the job
      await this.processJob(nextJob)

    } catch (error) {
      console.error('Error processing queue:', error)
    }
  }

  // Process individual job
  private async processJob(job: QueueJob): Promise<void> {
    try {
      let result: any

      // Update progress
      await this.updateJobProgress(job.id, 10)

      // Process based on job type
      switch (job.type) {
        case 'dataset':
          result = await this.processingService.processDataset(job.config)
          break
        
        case 'analytics':
          result = await this.processingService.processAnalytics(
            job.config.datasetId,
            job.config.analyticsType,
            job.config.parameters
          )
          break
        
        case 'statistics':
          result = await this.processingService.processStatistics(
            job.config.datasetId,
            job.config.statisticsType,
            job.config.parameters
          )
          break
        
        case 'training':
          result = await this.processingService.trainModel(
            job.config.experimentId,
            job.config
          )
          break
        
        case 'feature_engineering':
          result = await this.processingService.engineerFeatures(
            job.config.datasetId,
            job.config
          )
          break
        
        default:
          throw new Error(`Unknown job type: ${job.type}`)
      }

      // Update progress
      await this.updateJobProgress(job.id, 90)

      if (result.success) {
        // Job completed successfully
        await this.updateJobStatus(job.id, 'completed', {
          completedAt: new Date().toISOString(),
          progress: 100,
          result: result.data
        })
      } else {
        // Job failed
        await this.handleJobFailure(job, result.error || 'Unknown error')
      }

    } catch (error) {
      await this.handleJobFailure(job, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // Handle job failure
  private async handleJobFailure(job: QueueJob, error: string): Promise<void> {
    const newRetries = job.retries + 1

    if (newRetries < job.maxRetries) {
      // Retry the job
      await this.updateJobStatus(job.id, 'pending', {
        retries: newRetries,
        error: undefined
      })
    } else {
      // Max retries reached, mark as failed
      await this.updateJobStatus(job.id, 'failed', {
        completedAt: new Date().toISOString(),
        error
      })
    }
  }

  // Update job progress
  private async updateJobProgress(jobId: string, progress: number): Promise<void> {
    await this.updateJobStatus(jobId, 'processing', { progress })
  }

  // Get priority score for sorting
  private getPriorityScore(priority: QueueJob['priority']): number {
    const scores = {
      'urgent': 1000,
      'high': 750,
      'normal': 500,
      'low': 250
    }
    return scores[priority] || 500
  }

  // Clean up completed jobs
  async cleanupCompletedJobs(olderThanHours: number = 24): Promise<number> {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000).toISOString()
    const jobs = await this.getJobs()
    
    let cleanedCount = 0
    
    for (const job of jobs) {
      if ((job.status === 'completed' || job.status === 'failed') && 
          job.completedAt && job.completedAt < cutoffTime) {
        
        // Remove from Redis (using del for now)
        await RedisService.del(RedisKeys.TRAINING_JOBS_LIST)
        cleanedCount++
      }
    }
    
    return cleanedCount
  }

  // Get job statistics
  async getJobStatistics(): Promise<{
    total: number
    byStatus: Record<string, number>
    byType: Record<string, number>
    byPriority: Record<string, number>
    averageProcessingTime: number
    successRate: number
  }> {
    const jobs = await this.getJobs()
    
    const statistics = {
      total: jobs.length,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      averageProcessingTime: 0,
      successRate: 0
    }

    let totalProcessingTime = 0
    let completedJobs = 0
    let successfulJobs = 0

    jobs.forEach(job => {
      // Count by status
      statistics.byStatus[job.status] = (statistics.byStatus[job.status] || 0) + 1
      
      // Count by type
      statistics.byType[job.type] = (statistics.byType[job.type] || 0) + 1
      
      // Count by priority
      statistics.byPriority[job.priority] = (statistics.byPriority[job.priority] || 0) + 1
      
      // Calculate processing time
      if (job.startedAt && job.completedAt) {
        const processingTime = new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()
        totalProcessingTime += processingTime
        completedJobs++
        
        if (job.status === 'completed') {
          successfulJobs++
        }
      }
    })

    if (completedJobs > 0) {
      statistics.averageProcessingTime = totalProcessingTime / completedJobs
      statistics.successRate = successfulJobs / completedJobs
    }

    return statistics
  }

  // Pause queue processing
  async pauseQueue(): Promise<void> {
    this.stopProcessing()
  }

  // Resume queue processing
  async resumeQueue(): Promise<void> {
    this.startProcessing()
  }

  // Get processing status
  isQueueProcessing(): boolean {
    return this.isProcessing
  }
}
