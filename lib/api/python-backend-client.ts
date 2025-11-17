import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import { env } from '@/env.mjs'


export interface PythonBackendError {
  detail?: string | Array<{ loc: (string | number)[]; msg: string; type: string }>
}

export class PythonBackendClient {
  private client: AxiosInstance
  private baseURL: string

  constructor(baseURL?: string) {
    this.baseURL = baseURL || env.PYTHON_BACKEND_URL
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 60000, // 60 seconds for long-running operations
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor for logging (optional)
    this.client.interceptors.request.use(
      (config) => {
        // Add any auth headers here if needed
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<PythonBackendError>) => {
        if (error.response) {
          const errorData = error.response.data
          if (errorData?.detail) {
            if (typeof errorData.detail === 'string') {
              error.message = errorData.detail
            } else if (Array.isArray(errorData.detail)) {
              error.message = errorData.detail.map(e => e.msg).join(', ')
            }
          }
        }
        return Promise.reject(error)
      }
    )
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<T>(config)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.message || 'Python backend request failed')
      }
      throw error
    }
  }

  // ==================== Datasets ====================

  /**
   * List datasets with optional filtering
   */
  async listDatasets(params?: {
    name?: string
    source?: string
    updated_from?: string
    updated_to?: string
    page?: number
    page_size?: number
  }): Promise<any> {
    return this.request<any>({
      method: 'GET',
      url: '/api/v1/datasets',
      params,
    })
  }

  /**
   * Create a new dataset
   */
  async createDataset(data: {
    name: string
    description?: string
    schema?: Record<string, any>
    row_count?: number
    source?: 'internal' | 'external' | 'synthetic'
    files?: Array<{ path: string; checksum: string; file_type?: string }>
  }): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: '/api/v1/datasets',
      data,
    })
  }

  /**
   * Get a specific dataset
   */
  async getDataset(datasetId: string): Promise<any> {
    return this.request<any>({
      method: 'GET',
      url: `/api/v1/datasets/${datasetId}`,
    })
  }

  /**
   * Update a dataset
   */
  async updateDataset(
    datasetId: string,
    data: {
      name?: string
      description?: string
      schema?: Record<string, any>
      row_count?: number
      source?: 'internal' | 'external' | 'synthetic'
    }
  ): Promise<any> {
    return this.request<any>({
      method: 'PUT',
      url: `/api/v1/datasets/${datasetId}`,
      data,
    })
  }

  /**
   * Delete a dataset
   */
  async deleteDataset(datasetId: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/api/v1/datasets/${datasetId}`,
    })
  }

  /**
   * Register a file for a dataset
   */
  async registerFile(
    datasetId: string,
    data: { path: string; checksum: string; file_type?: string }
  ): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: `/api/v1/datasets/${datasetId}/files`,
      data,
    })
  }

  /**
   * List files for a dataset
   */
  async listFiles(datasetId: string): Promise<any> {
    return this.request<any>({
      method: 'GET',
      url: `/api/v1/datasets/${datasetId}/files`,
    })
  }

  // ==================== Analysis ====================

  /**
   * Run analysis on a dataset
   */
  async runAnalysis(data: {
    dataset_id: string
    analysis_types: Array<'descriptive' | 'quality' | 'correlation' | 'timeseries' | 'distribution'>
    options?: Record<string, any>
  }): Promise<{ job_id: string }> {
    return this.request<{ job_id: string }>({
      method: 'POST',
      url: '/api/v1/analysis/run',
      data,
    })
  }

  /**
   * Get analysis job status
   */
  async getAnalysisJobStatus(jobId: string): Promise<any> {
    return this.request<any>({
      method: 'GET',
      url: `/api/v1/analysis/jobs/${jobId}`,
    })
  }

  /**
   * Get analysis job results
   */
  async getAnalysisJobResults(jobId: string): Promise<any> {
    return this.request<any>({
      method: 'GET',
      url: `/api/v1/analysis/jobs/${jobId}/results`,
    })
  }

  // ==================== Statistics ====================

  /**
   * Get statistical summary for a dataset
   */
  async getStatisticsSummary(data: {
    dataset_id: string
    columns?: string[]
    options?: Record<string, any>
  }): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: '/api/v1/statistics/summary',
      data,
    })
  }

  // ==================== Features ====================

  /**
   * Queue a feature engineering operation
   */
  async queueFeatureOperation(data: {
    dataset_id: string
    operations: Array<'impute' | 'encode' | 'scale' | 'normalize'>
    config?: Record<string, any>
  }): Promise<{ operation_id: string }> {
    return this.request<{ operation_id: string }>({
      method: 'POST',
      url: '/api/v1/features/queue',
      data,
    })
  }

  /**
   * Get feature operation status and results
   */
  async getFeatureOperation(operationId: string): Promise<any> {
    return this.request<any>({
      method: 'GET',
      url: `/api/v1/features/${operationId}`,
    })
  }

  // ==================== Experiments ====================

  /**
   * List experiments
   */
  async listExperiments(): Promise<any> {
    return this.request<any>({
      method: 'GET',
      url: '/api/v1/experiments',
    })
  }

  /**
   * Create a new experiment
   */
  async createExperiment(data: {
    dataset_id: string
    name: string
    algorithm: string
    hyperparameters?: Record<string, any>
  }): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: '/api/v1/experiments',
      data,
    })
  }

  /**
   * Get a specific experiment
   */
  async getExperiment(experimentId: string): Promise<any> {
    return this.request<any>({
      method: 'GET',
      url: `/api/v1/experiments/${experimentId}`,
    })
  }

  /**
   * Update an experiment
   */
  async updateExperiment(
    experimentId: string,
    data: {
      name?: string
      algorithm?: string
      hyperparameters?: Record<string, any>
      status?: 'draft' | 'running' | 'completed' | 'failed' | 'cancelled'
    }
  ): Promise<any> {
    return this.request<any>({
      method: 'PATCH',
      url: `/api/v1/experiments/${experimentId}`,
      data,
    })
  }

  /**
   * Delete an experiment
   */
  async deleteExperiment(experimentId: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/api/v1/experiments/${experimentId}`,
    })
  }

  /**
   * Get experiment runs
   */
  async getExperimentRuns(experimentId: string): Promise<any> {
    return this.request<any>({
      method: 'GET',
      url: `/api/v1/experiments/${experimentId}/runs`,
    })
  }

  // ==================== Analytics ====================

  /**
   * Get analytics dashboard data
   */
  async getAnalyticsDashboard(params?: {
    dataset_id?: string
    experiment_id?: string
    start_date?: string
    end_date?: string
  }): Promise<any> {
    return this.request<any>({
      method: 'GET',
      url: '/api/v1/analytics/dashboard',
      params,
    })
  }

  // ==================== Jobs ====================

  /**
   * Get job logs
   */
  async getJobLogs(jobId: string): Promise<any> {
    return this.request<any>({
      method: 'GET',
      url: `/api/v1/jobs/${jobId}/logs`,
    })
  }
}

// Create and export default instance
export const pythonBackendClient = new PythonBackendClient()

