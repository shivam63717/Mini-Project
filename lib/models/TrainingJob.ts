import { RedisService, RedisKeys } from '@/lib/database/redis'

export interface TrainingJob {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  type: 'classification' | 'regression' | 'clustering' | 'anomaly_detection' | 'deep_learning'
  algorithm: string
  datasetId: string
  experimentId?: string
  createdAt: string
  updatedAt: string
  startedAt?: string
  completedAt?: string
  progress: number
  estimatedTime?: number
  actualTime?: number
  hyperparameters: Record<string, any>
  configuration: TrainingConfiguration
  results?: TrainingResults
  error?: string
  logs: string[]
  metrics: TrainingMetrics
  modelInfo?: ModelInfo
}

export interface TrainingConfiguration {
  trainTestSplit: number
  crossValidation?: {
    enabled: boolean
    folds: number
    strategy: 'stratified' | 'kfold' | 'time_series'
  }
  preprocessing?: {
    scaling: boolean
    encoding: boolean
    featureSelection: boolean
    outlierRemoval: boolean
  }
  optimization?: {
    enabled: boolean
    method: 'grid_search' | 'random_search' | 'bayesian'
    maxIterations: number
  }
  earlyStopping?: {
    enabled: boolean
    patience: number
    minDelta: number
  }
}

export interface TrainingResults {
  accuracy?: number
  precision?: number
  recall?: number
  f1Score?: number
  auc?: number
  mse?: number
  rmse?: number
  mae?: number
  r2?: number
  silhouetteScore?: number
  confusionMatrix?: number[][]
  classificationReport?: Record<string, any>
  featureImportance?: Array<{
    feature: string
    importance: number
  }>
  validationScores?: number[]
  testPredictions?: any[]
  modelPath?: string
  artifacts?: string[]
}

export interface TrainingMetrics {
  trainingTime: number
  inferenceTime: number
  memoryUsage: number
  cpuUsage: number
  gpuUsage?: number
  epochs?: number
  batchSize?: number
  learningRate?: number
  loss?: number
  validationLoss?: number
  convergenceEpoch?: number
}

export interface ModelInfo {
  modelType: string
  modelSize: string
  modelFormat: 'pickle' | 'joblib' | 'onnx' | 'tensorflow' | 'pytorch'
  version: string
  framework: string
  dependencies: string[]
  inputShape?: number[]
  outputShape?: number[]
  preprocessingPipeline?: string
  postprocessingPipeline?: string
}

export class TrainingJobModel {
  // Create a new training job
  static async create(job: Omit<TrainingJob, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'logs' | 'metrics'>): Promise<TrainingJob> {
    const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    const newJob: TrainingJob = {
      ...job,
      id,
      createdAt: now,
      updatedAt: now,
      progress: 0,
      logs: [],
      metrics: {
        trainingTime: 0,
        inferenceTime: 0,
        memoryUsage: 0,
        cpuUsage: 0
      }
    }

    // Store job in Redis
    await RedisService.set(RedisKeys.MODEL_TRAINING(id), newJob)
    
    // Add to training jobs list
    await RedisService.lpush(RedisKeys.TRAINING_JOBS_LIST, id)

    return newJob
  }

  // Get training job by ID
  static async getById(id: string): Promise<TrainingJob | null> {
    return await RedisService.get<TrainingJob>(RedisKeys.MODEL_TRAINING(id))
  }

  // Get all training jobs with pagination and filtering
  static async getAll(page = 1, limit = 10, filters?: {
    status?: string
    type?: string
    algorithm?: string
    datasetId?: string
  }): Promise<{
    jobs: TrainingJob[]
    total: number
    page: number
    limit: number
  }> {
    const jobIds = await RedisService.lrange<string>(RedisKeys.TRAINING_JOBS_LIST, 0, -1)
    const jobs: TrainingJob[] = []

    for (const id of jobIds) {
      const job = await this.getById(id)
      if (job) {
        // Apply filters
        let include = true
        
        if (filters?.status) {
          include = include && job.status === filters.status
        }
        
        if (filters?.type) {
          include = include && job.type === filters.type
        }
        
        if (filters?.algorithm) {
          include = include && job.algorithm.toLowerCase().includes(filters.algorithm.toLowerCase())
        }
        
        if (filters?.datasetId) {
          include = include && job.datasetId === filters.datasetId
        }
        
        if (include) {
          jobs.push(job)
        }
      }
    }

    // Sort by updatedAt descending
    jobs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedJobs = jobs.slice(startIndex, endIndex)

    return {
      jobs: paginatedJobs,
      total: jobs.length,
      page,
      limit
    }
  }

  // Update training job
  static async update(id: string, updates: Partial<TrainingJob>): Promise<TrainingJob | null> {
    const job = await this.getById(id)
    if (!job) {
      return null
    }

    const updatedJob: TrainingJob = {
      ...job,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    }

    await RedisService.set(RedisKeys.MODEL_TRAINING(id), updatedJob)
    return updatedJob
  }

  // Delete training job
  static async delete(id: string): Promise<boolean> {
    const job = await this.getById(id)
    if (!job) {
      return false
    }

    // Remove from Redis
    await RedisService.del(RedisKeys.MODEL_TRAINING(id))
    await RedisService.del(RedisKeys.TRAINING_PROGRESS(id))
    await RedisService.del(RedisKeys.TRAINING_RESULTS(id))
    
    // Remove from jobs list
    await RedisService.srem(RedisKeys.TRAINING_JOBS_LIST, id)

    return true
  }

  // Start training job
  static async start(id: string): Promise<TrainingJob | null> {
    const now = new Date().toISOString()
    return await this.update(id, {
      status: 'running',
      startedAt: now
    })
  }

  // Complete training job
  static async complete(id: string, results: TrainingResults, modelInfo?: ModelInfo): Promise<TrainingJob | null> {
    const now = new Date().toISOString()
    const job = await this.getById(id)
    
    if (!job) return null

    const actualTime = job.startedAt ? 
      new Date(now).getTime() - new Date(job.startedAt).getTime() : 0

    return await this.update(id, {
      status: 'completed',
      completedAt: now,
      progress: 100,
      actualTime,
      results,
      modelInfo
    })
  }

  // Fail training job
  static async fail(id: string, error: string): Promise<TrainingJob | null> {
    const now = new Date().toISOString()
    return await this.update(id, {
      status: 'failed',
      completedAt: now,
      error
    })
  }

  // Cancel training job
  static async cancel(id: string): Promise<TrainingJob | null> {
    const now = new Date().toISOString()
    return await this.update(id, {
      status: 'cancelled',
      completedAt: now
    })
  }

  // Update progress
  static async updateProgress(id: string, progress: number, estimatedTime?: number): Promise<TrainingJob | null> {
    return await this.update(id, {
      progress: Math.min(100, Math.max(0, progress)),
      estimatedTime
    })
  }

  // Add log entry
  static async addLog(id: string, logEntry: string): Promise<void> {
    const job = await this.getById(id)
    if (!job) return

    const timestamp = new Date().toISOString()
    const formattedLog = `[${timestamp}] ${logEntry}`
    
    const updatedLogs = [...job.logs, formattedLog]
    await this.update(id, { logs: updatedLogs })
  }

  // Get training progress
  static async getProgress(id: string): Promise<{
    progress: number
    status: string
    estimatedTime?: number
    actualTime?: number
    currentEpoch?: number
    totalEpochs?: number
    currentLoss?: number
    validationLoss?: number
  } | null> {
    const job = await this.getById(id)
    if (!job) return null

    return {
      progress: job.progress,
      status: job.status,
      estimatedTime: job.estimatedTime,
      actualTime: job.actualTime,
      currentEpoch: job.metrics.epochs,
      totalEpochs: job.configuration.earlyStopping?.enabled ? undefined : job.metrics.epochs,
      currentLoss: job.metrics.loss,
      validationLoss: job.metrics.validationLoss
    }
  }

  // Get training results
  static async getResults(id: string): Promise<TrainingResults | null> {
    return await RedisService.get<TrainingResults>(RedisKeys.TRAINING_RESULTS(id))
  }

  // Update training results
  static async updateResults(id: string, results: TrainingResults): Promise<void> {
    await RedisService.set(RedisKeys.TRAINING_RESULTS(id), results)
    
    // Also update the main job record
    const job = await this.getById(id)
    if (job) {
      await this.update(id, { results })
    }
  }

  // Get jobs by status
  static async getByStatus(status: TrainingJob['status']): Promise<TrainingJob[]> {
    const allJobs = await this.getAll(1, 1000)
    return allJobs.jobs.filter(job => job.status === status)
  }

  // Get jobs by type
  static async getByType(type: TrainingJob['type']): Promise<TrainingJob[]> {
    const allJobs = await this.getAll(1, 1000)
    return allJobs.jobs.filter(job => job.type === type)
  }

  // Get running jobs
  static async getRunningJobs(): Promise<TrainingJob[]> {
    return await this.getByStatus('running')
  }

  // Get job statistics
  static async getStatistics(): Promise<{
    total: number
    byStatus: Record<string, number>
    byType: Record<string, number>
    byAlgorithm: Record<string, number>
    averageTrainingTime: number
    successRate: number
    totalTrainingTime: number
  }> {
    const allJobs = await this.getAll(1, 1000)
    const jobs = allJobs.jobs

    const byStatus: Record<string, number> = {}
    const byType: Record<string, number> = {}
    const byAlgorithm: Record<string, number> = {}
    let totalTrainingTime = 0
    let completedJobs = 0
    let successfulJobs = 0

    jobs.forEach(job => {
      // Count by status
      byStatus[job.status] = (byStatus[job.status] || 0) + 1

      // Count by type
      byType[job.type] = (byType[job.type] || 0) + 1

      // Count by algorithm
      byAlgorithm[job.algorithm] = (byAlgorithm[job.algorithm] || 0) + 1

      // Calculate training time
      totalTrainingTime += job.metrics.trainingTime

      // Calculate success rate
      if (job.status === 'completed' || job.status === 'failed') {
        completedJobs++
        if (job.status === 'completed') {
          successfulJobs++
        }
      }
    })

    return {
      total: jobs.length,
      byStatus,
      byType,
      byAlgorithm,
      averageTrainingTime: jobs.length > 0 ? totalTrainingTime / jobs.length : 0,
      successRate: completedJobs > 0 ? successfulJobs / completedJobs : 0,
      totalTrainingTime
    }
  }

  // Get job queue status
  static async getQueueStatus(): Promise<{
    pending: number
    running: number
    completed: number
    failed: number
    averageWaitTime: number
    estimatedCompletionTime: number
  }> {
    const [pendingJobs, runningJobs, completedJobs, failedJobs] = await Promise.all([
      this.getByStatus('pending'),
      this.getByStatus('running'),
      this.getByStatus('completed'),
      this.getByStatus('failed')
    ])

    // Calculate average wait time for completed jobs
    let totalWaitTime = 0
    let waitTimeCount = 0
    
    completedJobs.forEach(job => {
      if (job.startedAt && job.createdAt) {
        const waitTime = new Date(job.startedAt).getTime() - new Date(job.createdAt).getTime()
        totalWaitTime += waitTime
        waitTimeCount++
      }
    })

    const averageWaitTime = waitTimeCount > 0 ? totalWaitTime / waitTimeCount : 0

    // Estimate completion time for running jobs
    let estimatedCompletionTime = 0
    runningJobs.forEach(job => {
      if (job.estimatedTime) {
        estimatedCompletionTime += job.estimatedTime
      }
    })

    return {
      pending: pendingJobs.length,
      running: runningJobs.length,
      completed: completedJobs.length,
      failed: failedJobs.length,
      averageWaitTime,
      estimatedCompletionTime
    }
  }
}
