import { RedisService, RedisKeys } from '@/lib/database/redis'

export interface Experiment {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  algorithm: string
  datasetId: string
  accuracy?: number
  precision?: number
  recall?: number
  f1Score?: number
  auc?: number
  createdAt: string
  updatedAt: string
  startedAt?: string
  completedAt?: string
  hyperparameters: Record<string, any>
  metrics: ExperimentMetrics
  error?: string
  modelPath?: string
  trainingLogs?: string[]
  validationResults?: ValidationResults
}

export interface ExperimentMetrics {
  trainingTime: number
  inferenceTime: number
  memoryUsage: number
  cpuUsage?: number
  gpuUsage?: number
  epochs?: number
  batchSize?: number
  learningRate?: number
  loss?: number
  validationLoss?: number
}

export interface ValidationResults {
  crossValidation?: {
    scores: number[]
    mean: number
    std: number
  }
  testResults?: {
    accuracy: number
    precision: number
    recall: number
    f1Score: number
    confusionMatrix: number[][]
    classificationReport: Record<string, any>
  }
  featureImportance?: Array<{
    feature: string
    importance: number
  }>
}

export class ExperimentModel {
  // Create a new experiment
  static async create(experiment: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>): Promise<Experiment> {
    const id = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    const newExperiment: Experiment = {
      ...experiment,
      id,
      createdAt: now,
      updatedAt: now,
      metrics: {
        trainingTime: 0,
        inferenceTime: 0,
        memoryUsage: 0
      }
    }

    // Store experiment in Redis
    await RedisService.set(RedisKeys.EXPERIMENT(id), newExperiment)
    
    // Add to experiments list
    await RedisService.lpush(RedisKeys.EXPERIMENTS_LIST, id)

    return newExperiment
  }

  // Get experiment by ID
  static async getById(id: string): Promise<Experiment | null> {
    return await RedisService.get<Experiment>(RedisKeys.EXPERIMENT(id))
  }

  // Get all experiments with pagination and filtering
  static async getAll(page = 1, limit = 10, filters?: {
    status?: string
    algorithm?: string
    datasetId?: string
  }): Promise<{
    experiments: Experiment[]
    total: number
    page: number
    limit: number
  }> {
    const experimentIds = await RedisService.lrange<string>(RedisKeys.EXPERIMENTS_LIST, 0, -1)
    const experiments: Experiment[] = []

    for (const id of experimentIds) {
      const experiment = await this.getById(id)
      if (experiment) {
        // Apply filters
        let include = true
        
        if (filters?.status) {
          include = include && experiment.status === filters.status
        }
        
        if (filters?.algorithm) {
          include = include && experiment.algorithm.toLowerCase().includes(filters.algorithm.toLowerCase())
        }
        
        if (filters?.datasetId) {
          include = include && experiment.datasetId === filters.datasetId
        }
        
        if (include) {
          experiments.push(experiment)
        }
      }
    }

    // Sort by updatedAt descending
    experiments.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedExperiments = experiments.slice(startIndex, endIndex)

    return {
      experiments: paginatedExperiments,
      total: experiments.length,
      page,
      limit
    }
  }

  // Update experiment
  static async update(id: string, updates: Partial<Experiment>): Promise<Experiment | null> {
    const experiment = await this.getById(id)
    if (!experiment) {
      return null
    }

    const updatedExperiment: Experiment = {
      ...experiment,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    }

    await RedisService.set(RedisKeys.EXPERIMENT(id), updatedExperiment)
    return updatedExperiment
  }

  // Delete experiment
  static async delete(id: string): Promise<boolean> {
    const experiment = await this.getById(id)
    if (!experiment) {
      return false
    }

    // Remove from Redis
    await RedisService.del(RedisKeys.EXPERIMENT(id))
    await RedisService.del(RedisKeys.EXPERIMENT_METRICS(id))
    await RedisService.del(RedisKeys.EXPERIMENT_LOGS(id))
    
    // Remove from experiments list
    await RedisService.srem(RedisKeys.EXPERIMENTS_LIST, id)

    return true
  }

  // Start experiment
  static async start(id: string): Promise<Experiment | null> {
    const now = new Date().toISOString()
    return await this.update(id, {
      status: 'running',
      startedAt: now
    })
  }

  // Complete experiment
  static async complete(id: string, results: {
    accuracy?: number
    precision?: number
    recall?: number
    f1Score?: number
    auc?: number
    metrics?: ExperimentMetrics
    validationResults?: ValidationResults
    modelPath?: string
  }): Promise<Experiment | null> {
    const now = new Date().toISOString()
    return await this.update(id, {
      status: 'completed',
      completedAt: now,
      ...results
    })
  }

  // Fail experiment
  static async fail(id: string, error: string): Promise<Experiment | null> {
    const now = new Date().toISOString()
    return await this.update(id, {
      status: 'failed',
      completedAt: now,
      error
    })
  }

  // Cancel experiment
  static async cancel(id: string): Promise<Experiment | null> {
    const now = new Date().toISOString()
    return await this.update(id, {
      status: 'cancelled',
      completedAt: now
    })
  }

  // Get experiment metrics
  static async getMetrics(id: string): Promise<ExperimentMetrics | null> {
    return await RedisService.get<ExperimentMetrics>(RedisKeys.EXPERIMENT_METRICS(id))
  }

  // Update experiment metrics
  static async updateMetrics(id: string, metrics: ExperimentMetrics): Promise<void> {
    await RedisService.set(RedisKeys.EXPERIMENT_METRICS(id), metrics)
    
    // Also update the main experiment record
    const experiment = await this.getById(id)
    if (experiment) {
      await this.update(id, { metrics })
    }
  }

  // Get experiment logs
  static async getLogs(id: string): Promise<string[]> {
    return await RedisService.lrange<string>(RedisKeys.EXPERIMENT_LOGS(id), 0, -1)
  }

  // Add log entry
  static async addLog(id: string, logEntry: string): Promise<void> {
    const timestamp = new Date().toISOString()
    const formattedLog = `[${timestamp}] ${logEntry}`
    await RedisService.lpush(RedisKeys.EXPERIMENT_LOGS(id), formattedLog)
  }

  // Get experiments by status
  static async getByStatus(status: Experiment['status']): Promise<Experiment[]> {
    const allExperiments = await this.getAll(1, 1000)
    return allExperiments.experiments.filter(experiment => experiment.status === status)
  }

  // Get experiments by algorithm
  static async getByAlgorithm(algorithm: string): Promise<Experiment[]> {
    const allExperiments = await this.getAll(1, 1000)
    return allExperiments.experiments.filter(experiment =>
      experiment.algorithm.toLowerCase().includes(algorithm.toLowerCase())
    )
  }

  // Get experiments by dataset
  static async getByDataset(datasetId: string): Promise<Experiment[]> {
    const allExperiments = await this.getAll(1, 1000)
    return allExperiments.experiments.filter(experiment => experiment.datasetId === datasetId)
  }

  // Get experiment statistics
  static async getStatistics(): Promise<{
    total: number
    byStatus: Record<string, number>
    byAlgorithm: Record<string, number>
    averageAccuracy: number
    bestAccuracy: number
    totalTrainingTime: number
  }> {
    const allExperiments = await this.getAll(1, 1000)
    const experiments = allExperiments.experiments

    const byStatus: Record<string, number> = {}
    const byAlgorithm: Record<string, number> = {}
    let totalAccuracy = 0
    let accuracyCount = 0
    let bestAccuracy = 0
    let totalTrainingTime = 0

    experiments.forEach(experiment => {
      // Count by status
      byStatus[experiment.status] = (byStatus[experiment.status] || 0) + 1

      // Count by algorithm
      byAlgorithm[experiment.algorithm] = (byAlgorithm[experiment.algorithm] || 0) + 1

      // Calculate accuracy statistics
      if (experiment.accuracy !== undefined) {
        totalAccuracy += experiment.accuracy
        accuracyCount++
        if (experiment.accuracy > bestAccuracy) {
          bestAccuracy = experiment.accuracy
        }
      }

      // Calculate total training time
      totalTrainingTime += experiment.metrics.trainingTime
    })

    return {
      total: experiments.length,
      byStatus,
      byAlgorithm,
      averageAccuracy: accuracyCount > 0 ? totalAccuracy / accuracyCount : 0,
      bestAccuracy,
      totalTrainingTime
    }
  }

  // Compare experiments
  static async compare(experimentIds: string[]): Promise<{
    experiments: Experiment[]
    comparison: {
      bestAccuracy: Experiment | null
      fastestTraining: Experiment | null
      mostEfficient: Experiment | null
    }
  }> {
    const experiments: Experiment[] = []
    
    for (const id of experimentIds) {
      const experiment = await this.getById(id)
      if (experiment) {
        experiments.push(experiment)
      }
    }

    // Find best performers
    const bestAccuracy = experiments.reduce((best, current) => {
      if (!best || (current.accuracy && current.accuracy > (best.accuracy || 0))) {
        return current
      }
      return best
    }, null as Experiment | null)

    const fastestTraining = experiments.reduce((fastest, current) => {
      if (!fastest || current.metrics.trainingTime < fastest.metrics.trainingTime) {
        return current
      }
      return fastest
    }, null as Experiment | null)

    const mostEfficient = experiments.reduce((most, current) => {
      if (!most) return current
      
      const currentEfficiency = current.accuracy && current.metrics.trainingTime > 0 
        ? current.accuracy / current.metrics.trainingTime 
        : 0
      const mostEfficiency = most.accuracy && most.metrics.trainingTime > 0 
        ? most.accuracy / most.metrics.trainingTime 
        : 0
        
      return currentEfficiency > mostEfficiency ? current : most
    }, null as Experiment | null)

    return {
      experiments,
      comparison: {
        bestAccuracy,
        fastestTraining,
        mostEfficient
      }
    }
  }
}
