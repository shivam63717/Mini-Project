import { RedisService, RedisKeys } from '@/lib/database/redis'
import { DatasetModel, Dataset } from '@/lib/models/Dataset'
import { ExperimentModel, Experiment } from '@/lib/models/Experiment'
import { TrainingJobModel, TrainingJob } from '@/lib/models/TrainingJob'
import { DataValidator } from '@/lib/validators/DataValidator'
import { DataAnalyzer } from '../analyzers/DataAnalyzer'
import { FeatureProcessor } from '@/lib/processors/FeatureProcessor'
import { ModelProcessor } from '@/lib/processors/ModelProcessor'

export interface ProcessingResult {
  success: boolean
  data?: any
  error?: string
  metadata?: Record<string, any>
  processingTime?: number
}

export interface DataProcessingConfig {
  datasetId: string
  operations: string[]
  parameters?: Record<string, any>
  outputFormat?: 'json' | 'csv' | 'parquet'
  saveResults?: boolean
}

export class DataProcessingService {
  private validator: DataValidator
  private analyzer: DataAnalyzer
  private featureProcessor: FeatureProcessor
  private modelProcessor: ModelProcessor

  constructor() {
    this.validator = new DataValidator()
    this.analyzer = new DataAnalyzer()
    this.featureProcessor = new FeatureProcessor()
    this.modelProcessor = new ModelProcessor()
  }

  // Dataset Processing
  async processDataset(config: DataProcessingConfig): Promise<ProcessingResult> {
    const startTime = Date.now()

    try {
      // Get dataset
      const dataset = await DatasetModel.getById(config.datasetId)
      if (!dataset) {
        return {
          success: false,
          error: 'Dataset not found'
        }
      }

      // Update dataset status
      await DatasetModel.updateStatus(config.datasetId, 'processing')

      const results: any = {}
      const metadata: Record<string, any> = {
        datasetId: config.datasetId,
        operations: config.operations,
        timestamp: new Date().toISOString()
      }

      // Process each operation
      for (const operation of config.operations) {
        const operationResult = await this.executeOperation(operation, dataset, config.parameters)
        results[operation] = operationResult
      }

      // Update dataset status
      await DatasetModel.updateStatus(config.datasetId, 'active')

      const processingTime = Date.now() - startTime

      return {
        success: true,
        data: results,
        metadata: {
          ...metadata,
          processingTime,
          operationsCount: config.operations.length
        },
        processingTime
      }

    } catch (error) {
      console.error('Dataset processing error:', error)

      // Update dataset status to error
      await DatasetModel.updateStatus(config.datasetId, 'error')

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime
      }
    }
  }

  // Execute specific operation
  private async executeOperation(operation: string, dataset: Dataset, parameters?: Record<string, any>): Promise<any> {
    switch (operation) {
      case 'validate':
        return await this.validator.validateDataset(dataset, parameters)

      case 'analyze':
        return await this.analyzer.analyzeDataset(dataset, parameters)

      case 'preprocess':
        return await this.featureProcessor.preprocessData(dataset, parameters)

      case 'feature_engineering':
        return await this.featureProcessor.engineerFeatures(dataset, parameters)

      case 'quality_assessment':
        return await this.analyzer.assessDataQuality(dataset, parameters)

      case 'statistical_analysis':
        return await this.analyzer.performStatisticalAnalysis(dataset, parameters)

      case 'correlation_analysis':
        return await this.analyzer.analyzeCorrelations(dataset, parameters)

      case 'distribution_analysis':
        return await this.analyzer.analyzeDistributions(dataset, parameters)

      default:
        throw new Error(`Unknown operation: ${operation}`)
    }
  }

  // Feature Engineering
  async engineerFeatures(datasetId: string, config: {
    operations: string[]
    parameters?: Record<string, any>
    saveResults?: boolean
  }): Promise<ProcessingResult> {
    const startTime = Date.now()

    try {
      const dataset = await DatasetModel.getById(datasetId)
      if (!dataset) {
        return {
          success: false,
          error: 'Dataset not found'
        }
      }

      const results = await this.featureProcessor.engineerFeatures(dataset, config.parameters)

      if (config.saveResults) {
        // Save engineered features
        await this.saveEngineeredFeatures(datasetId, results)
      }

      return {
        success: true,
        data: results,
        metadata: {
          datasetId,
          operations: config.operations,
          processingTime: Date.now() - startTime
        },
        processingTime: Date.now() - startTime
      }

    } catch (error) {
      console.error('Feature engineering error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime
      }
    }
  }

  // Model Training
  async trainModel(experimentId: string, config: {
    algorithm: string
    hyperparameters: Record<string, any>
    trainingConfig: Record<string, any>
  }): Promise<ProcessingResult> {
    const startTime = Date.now()

    try {
      const experiment = await ExperimentModel.getById(experimentId)
      if (!experiment) {
        return {
          success: false,
          error: 'Experiment not found'
        }
      }

      // Update experiment status
      await ExperimentModel.start(experimentId)

      // Create training job
      const trainingJob = await TrainingJobModel.create({
        name: experiment.name,
        description: experiment.description,
        status: 'pending',
        type: this.getModelType(config.algorithm),
        algorithm: config.algorithm,
        datasetId: experiment.datasetId,
        experimentId: experimentId,
        hyperparameters: config.hyperparameters,
        configuration: {
          trainTestSplit: 0.8,
          ...config.trainingConfig
        }
      })

      // Start training
      await TrainingJobModel.start(trainingJob.id)

      // Process training (simulate for now)
      const trainingResult = await this.modelProcessor.trainModel(trainingJob, config)

      // Complete training
      await TrainingJobModel.complete(trainingJob.id, trainingResult.results, trainingResult.modelInfo)

      // Update experiment
      await ExperimentModel.complete(experimentId, {
        accuracy: trainingResult.results.accuracy,
        precision: trainingResult.results.precision,
        recall: trainingResult.results.recall,
        f1Score: trainingResult.results.f1Score,
        metrics: trainingResult.metrics,
        validationResults: trainingResult.results.validationScores ? {
          testResults: {
            accuracy: trainingResult.results.accuracy || 0,
            precision: trainingResult.results.precision || 0,
            recall: trainingResult.results.recall || 0,
            f1Score: trainingResult.results.f1Score || 0,
            confusionMatrix: trainingResult.results.confusionMatrix || [],
            classificationReport: trainingResult.results.classificationReport || {}
          }
        } : undefined,
        modelPath: trainingResult.results.modelPath
      })

      return {
        success: true,
        data: {
          experimentId,
          trainingJobId: trainingJob.id,
          results: trainingResult.results
        },
        metadata: {
          algorithm: config.algorithm,
          processingTime: Date.now() - startTime
        },
        processingTime: Date.now() - startTime
      }

    } catch (error) {
      console.error('Model training error:', error)

      // Update experiment status to failed
      await ExperimentModel.fail(experimentId, error instanceof Error ? error.message : 'Unknown error')

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime
      }
    }
  }

  // Analytics Processing
  async processAnalytics(datasetId: string, analyticsType: string, parameters?: Record<string, any>): Promise<ProcessingResult> {
    const startTime = Date.now()

    try {
      // Map analytics types to backend analysis types
      const analysisTypeMap: Record<string, 'descriptive' | 'quality' | 'correlation' | 'timeseries' | 'distribution'> = {
        'time_series': 'timeseries',
        'clustering': 'descriptive', // Clustering would be part of descriptive or separate
        'anomaly_detection': 'quality',
        'correlation': 'correlation',
        'statistical': 'descriptive',
        'descriptive': 'descriptive',
        'quality': 'quality',
        'timeseries': 'timeseries',
        'distribution': 'distribution',
      }

      const backendAnalysisType = analysisTypeMap[analyticsType] || 'descriptive'

      // Import Python backend client
      const { pythonBackendClient } = await import('@/lib/api/python-backend-client')

      // Run analysis via Python backend
      const jobResponse = await pythonBackendClient.runAnalysis({
        dataset_id: datasetId,
        analysis_types: [backendAnalysisType],
        options: parameters || {},
      })

      // Poll for results (with timeout)
      const maxWaitTime = 300000 // 5 minutes
      const pollInterval = 2000 // 2 seconds
      const startPollTime = Date.now()
      let jobStatus: any

      while (Date.now() - startPollTime < maxWaitTime) {
        jobStatus = await pythonBackendClient.getAnalysisJobStatus(jobResponse.job_id)

        if (jobStatus.status === 'completed') {
          const results = await pythonBackendClient.getAnalysisJobResults(jobResponse.job_id)

          // Cache results in Redis
          await RedisService.set(
            RedisKeys.ANALYTICS_RESULT(analyticsType, datasetId),
            results,
            3600 // 1 hour TTL
          )

          return {
            success: true,
            data: results,
            metadata: {
              datasetId,
              analyticsType,
              jobId: jobResponse.job_id,
              processingTime: Date.now() - startTime
            },
            processingTime: Date.now() - startTime
          }
        }

        if (jobStatus.status === 'failed') {
          throw new Error(jobStatus.error || 'Analysis job failed')
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval))
      }

      // Timeout - return job info for async polling
      return {
        success: true,
        data: {
          job_id: jobResponse.job_id,
          status: jobStatus?.status || 'processing',
          message: 'Analysis job is still processing. Poll /api/v1/analysis/jobs/{job_id} for results.'
        },
        metadata: {
          datasetId,
          analyticsType,
          jobId: jobResponse.job_id,
          processingTime: Date.now() - startTime
        },
        processingTime: Date.now() - startTime
      }

    } catch (error) {
      console.error('Analytics processing error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime
      }
    }
  }

  // Statistics Processing
  async processStatistics(datasetId: string, statisticsType: string, parameters?: Record<string, any>): Promise<ProcessingResult> {
    const startTime = Date.now()

    try {
      // Import Python backend client
      const { pythonBackendClient } = await import('@/lib/api/python-backend-client')

      // Get statistics summary from Python backend
      const results = await pythonBackendClient.getStatisticsSummary({
        dataset_id: datasetId,
        columns: parameters?.columns,
        options: parameters || {},
      })

      return {
        success: true,
        data: results,
        metadata: {
          datasetId,
          statisticsType,
          processingTime: Date.now() - startTime
        },
        processingTime: Date.now() - startTime
      }

    } catch (error) {
      console.error('Statistics processing error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime
      }
    }
  }

  // Helper methods
  private getModelType(algorithm: string): TrainingJob['type'] {
    const classificationAlgorithms = ['random_forest', 'xgboost', 'svm', 'logistic_regression']
    const regressionAlgorithms = ['linear_regression', 'random_forest_regressor', 'xgboost_regressor']
    const clusteringAlgorithms = ['kmeans', 'dbscan', 'hierarchical']
    const anomalyAlgorithms = ['isolation_forest', 'one_class_svm', 'autoencoder']

    if (classificationAlgorithms.includes(algorithm.toLowerCase())) {
      return 'classification'
    } else if (regressionAlgorithms.includes(algorithm.toLowerCase())) {
      return 'regression'
    } else if (clusteringAlgorithms.includes(algorithm.toLowerCase())) {
      return 'clustering'
    } else if (anomalyAlgorithms.includes(algorithm.toLowerCase())) {
      return 'anomaly_detection'
    } else {
      return 'deep_learning'
    }
  }

  private async saveEngineeredFeatures(datasetId: string, features: any): Promise<void> {
    // Save engineered features to Redis
    await RedisService.set(
      RedisKeys.FEATURE_IMPORTANCE(datasetId),
      features,
      86400 // 24 hours TTL
    )
  }

  // Batch Processing
  async processBatch(operations: Array<{
    type: 'dataset' | 'analytics' | 'statistics' | 'training'
    config: any
  }>): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = []

    for (const operation of operations) {
      try {
        let result: ProcessingResult

        switch (operation.type) {
          case 'dataset':
            result = await this.processDataset(operation.config)
            break
          case 'analytics':
            result = await this.processAnalytics(
              operation.config.datasetId,
              operation.config.analyticsType,
              operation.config.parameters
            )
            break
          case 'statistics':
            result = await this.processStatistics(
              operation.config.datasetId,
              operation.config.statisticsType,
              operation.config.parameters
            )
            break
          case 'training':
            result = await this.trainModel(
              operation.config.experimentId,
              operation.config
            )
            break
          default:
            result = {
              success: false,
              error: `Unknown operation type: ${operation.type}`
            }
        }

        results.push(result)
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return results
  }

  // Get Processing Status
  async getProcessingStatus(operationId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed'
    progress?: number
    result?: any
    error?: string
  }> {
    const status = await RedisService.get<{
      status: 'pending' | 'processing' | 'completed' | 'failed'
      progress?: number
      result?: any
      error?: string
    }>(`processing:${operationId}`)
    return status || { status: 'pending' as const }
  }

  // Cancel Processing
  async cancelProcessing(operationId: string): Promise<boolean> {
    try {
      await RedisService.set(`processing:${operationId}`, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      })
      return true
    } catch (error) {
      console.error('Error cancelling processing:', error)
      return false
    }
  }
}

