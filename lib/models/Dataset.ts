import { RedisService, RedisKeys } from '@/lib/database/redis'

export interface Dataset {
  id: string
  name: string
  description: string
  size: string
  rows: number
  columns: number
  createdAt: string
  updatedAt: string
  status: 'pending' | 'processing' | 'active' | 'error'
  tags: string[]
  filePath?: string
  schema?: ColumnSchema[]
  sampleData?: any[]
  metadata?: DatasetMetadata
}

export interface ColumnSchema {
  name: string
  type: 'string' | 'integer' | 'float' | 'boolean' | 'datetime' | 'categorical'
  nullable: boolean
  description?: string
  unique?: boolean
  min?: number
  max?: number
  categories?: string[]
}

export interface DatasetMetadata {
  encoding?: string
  delimiter?: string
  hasHeader?: boolean
  missingValues?: Record<string, number>
  dataQuality?: {
    completeness: number
    accuracy: number
    consistency: number
    validity: number
  }
  statistics?: Record<string, any>
}

export class DatasetModel {
  // Create a new dataset
  static async create(dataset: Omit<Dataset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dataset> {
    const id = `dataset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    const newDataset: Dataset = {
      ...dataset,
      id,
      createdAt: now,
      updatedAt: now
    }

    // Store dataset in Redis
    await RedisService.set(RedisKeys.DATASET(id), newDataset)
    
    // Add to datasets list
    await RedisService.lpush(RedisKeys.DATASETS_LIST, id)
    
    // Store metadata separately if provided
    if (dataset.metadata) {
      await RedisService.set(RedisKeys.DATASET_METADATA(id), dataset.metadata)
    }

    return newDataset
  }

  // Get dataset by ID
  static async getById(id: string): Promise<Dataset | null> {
    return await RedisService.get<Dataset>(RedisKeys.DATASET(id))
  }

  // Get all datasets with pagination
  static async getAll(page = 1, limit = 10, search?: string, status?: string): Promise<{
    datasets: Dataset[]
    total: number
    page: number
    limit: number
  }> {
    const datasetIds = await RedisService.lrange<string>(RedisKeys.DATASETS_LIST, 0, -1)
    const datasets: Dataset[] = []

    for (const id of datasetIds) {
      const dataset = await this.getById(id)
      if (dataset) {
        // Apply filters
        let include = true
        
        if (search) {
          const searchLower = search.toLowerCase()
          include = include && (
            dataset.name.toLowerCase().includes(searchLower) ||
            dataset.description.toLowerCase().includes(searchLower) ||
            dataset.tags.some(tag => tag.toLowerCase().includes(searchLower))
          )
        }
        
        if (status) {
          include = include && dataset.status === status
        }
        
        if (include) {
          datasets.push(dataset)
        }
      }
    }

    // Sort by updatedAt descending
    datasets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedDatasets = datasets.slice(startIndex, endIndex)

    return {
      datasets: paginatedDatasets,
      total: datasets.length,
      page,
      limit
    }
  }

  // Update dataset
  static async update(id: string, updates: Partial<Dataset>): Promise<Dataset | null> {
    const dataset = await this.getById(id)
    if (!dataset) {
      return null
    }

    const updatedDataset: Dataset = {
      ...dataset,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    }

    await RedisService.set(RedisKeys.DATASET(id), updatedDataset)
    
    // Update metadata separately if provided
    if (updates.metadata) {
      await RedisService.set(RedisKeys.DATASET_METADATA(id), updates.metadata)
    }

    return updatedDataset
  }

  // Delete dataset
  static async delete(id: string): Promise<boolean> {
    const dataset = await this.getById(id)
    if (!dataset) {
      return false
    }

    // Remove from Redis
    await RedisService.del(RedisKeys.DATASET(id))
    await RedisService.del(RedisKeys.DATASET_METADATA(id))
    await RedisService.del(RedisKeys.DATASET_SAMPLE(id))
    
    // Remove from datasets list
    await RedisService.srem(RedisKeys.DATASETS_LIST, id)

    return true
  }

  // Get dataset metadata
  static async getMetadata(id: string): Promise<DatasetMetadata | null> {
    return await RedisService.get<DatasetMetadata>(RedisKeys.DATASET_METADATA(id))
  }

  // Update dataset metadata
  static async updateMetadata(id: string, metadata: DatasetMetadata): Promise<void> {
    await RedisService.set(RedisKeys.DATASET_METADATA(id), metadata)
    
    // Also update the main dataset record
    const dataset = await this.getById(id)
    if (dataset) {
      await this.update(id, { metadata })
    }
  }

  // Get sample data
  static async getSampleData(id: string, limit = 100): Promise<any[]> {
    const sampleData = await RedisService.get<any[]>(RedisKeys.DATASET_SAMPLE(id))
    return sampleData ? sampleData.slice(0, limit) : []
  }

  // Set sample data
  static async setSampleData(id: string, sampleData: any[]): Promise<void> {
    await RedisService.set(RedisKeys.DATASET_SAMPLE(id), sampleData)
  }

  // Get datasets by status
  static async getByStatus(status: Dataset['status']): Promise<Dataset[]> {
    const allDatasets = await this.getAll(1, 1000) // Get all datasets
    return allDatasets.datasets.filter(dataset => dataset.status === status)
  }

  // Get datasets by tags
  static async getByTags(tags: string[]): Promise<Dataset[]> {
    const allDatasets = await this.getAll(1, 1000) // Get all datasets
    return allDatasets.datasets.filter(dataset =>
      tags.some(tag => dataset.tags.includes(tag))
    )
  }

  // Update dataset status
  static async updateStatus(id: string, status: Dataset['status']): Promise<Dataset | null> {
    return await this.update(id, { status })
  }

  // Get dataset statistics
  static async getStatistics(): Promise<{
    total: number
    byStatus: Record<string, number>
    byTags: Record<string, number>
    totalSize: string
  }> {
    const allDatasets = await this.getAll(1, 1000)
    const datasets = allDatasets.datasets

    const byStatus: Record<string, number> = {}
    const byTags: Record<string, number> = {}
    let totalSizeBytes = 0

    datasets.forEach(dataset => {
      // Count by status
      byStatus[dataset.status] = (byStatus[dataset.status] || 0) + 1

      // Count by tags
      dataset.tags.forEach(tag => {
        byTags[tag] = (byTags[tag] || 0) + 1
      })

      // Calculate total size (simplified)
      const sizeMatch = dataset.size.match(/(\d+\.?\d*)\s*(\w+)/)
      if (sizeMatch) {
        const value = parseFloat(sizeMatch[1])
        const unit = sizeMatch[2].toLowerCase()
        const multiplier = unit === 'gb' ? 1024 * 1024 * 1024 : 
                          unit === 'mb' ? 1024 * 1024 : 
                          unit === 'kb' ? 1024 : 1
        totalSizeBytes += value * multiplier
      }
    })

    const formatSize = (bytes: number): string => {
      if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
      if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
      if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`
      return `${bytes} B`
    }

    return {
      total: datasets.length,
      byStatus,
      byTags,
      totalSize: formatSize(totalSizeBytes)
    }
  }
}
