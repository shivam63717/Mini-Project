import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'
import { RedisService } from '@/lib/database/redis'

export interface ColumnInfo {
  name: string
  type: 'Numerical' | 'Categorical' | 'DateTime' | 'Boolean' | 'Text'
  nullCount: number
  nullPercentage: number
  uniqueCount: number
  uniquePercentage: number
  sampleValues: any[]
  statistics?: {
    mean?: number
    median?: number
    mode?: any
    std?: number
    min?: number
    max?: number
    quartiles?: number[]
  }
}

export interface DatasetAnalysis {
  id: string
  name: string
  size: number
  rows: number
  columnCount: number
  format: string
  uploadedAt: string
  columnTypes: {
    Numerical: number
    Categorical: number
    DateTime: number
    Boolean: number
    Text: number
  }
  dataQuality: {
    completeness: number
    uniqueness: number
    validity: number
    consistency: number
  }
  columns: ColumnInfo[]
  sampleData: any[]
}

export class CSVAnalyzer {
  private static readonly REDIS_KEY_PREFIX = 'dataset:'
  private static readonly MAX_SAMPLE_ROWS = 1000
  private static readonly MAX_SAMPLE_VALUES = 10

  static async analyzeFile(filePath: string, fileId: string, originalName: string): Promise<DatasetAnalysis> {
    try {
      // Read and parse CSV file
      const fileContent = readFileSync(filePath, 'utf-8')
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: false
      })

      if (records.length === 0) {
        throw new Error('CSV file is empty or invalid')
      }

      const headers = Object.keys(records[0] as Record<string, any>)
      const totalRows = records.length
      const totalColumns = headers.length

      // Analyze each column
      const columns: ColumnInfo[] = headers.map(header => 
        this.analyzeColumn(header, records.map((row: any) => row[header]))
      )

      // Calculate column type distribution
      const columnTypes = this.calculateColumnTypes(columns)

      // Calculate data quality metrics
      const dataQuality = this.calculateDataQuality(records, columns)

      // Get sample data (first 100 rows)
      const sampleData = records.slice(0, Math.min(100, totalRows))

      // Create analysis result
      const analysis: DatasetAnalysis = {
        id: fileId,
        name: originalName,
        size: fileContent.length,
        rows: totalRows,
        columnCount: totalColumns,
        format: 'CSV',
        uploadedAt: new Date().toISOString(),
        columnTypes,
        dataQuality,
        columns,
        sampleData
      }

      // Store in Redis
      await this.storeAnalysis(fileId, analysis)

      return analysis
    } catch (error) {
      console.error('Error analyzing CSV file:', error)
      throw new Error(`Failed to analyze CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private static analyzeColumn(name: string, values: any[]): ColumnInfo {
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '')
    const nullCount = values.length - nonNullValues.length
    const nullPercentage = (nullCount / values.length) * 100

    // Determine column type
    const type = this.detectColumnType(nonNullValues)
    
    // Calculate unique values
    const uniqueValues = [...new Set(nonNullValues)]
    const uniqueCount = uniqueValues.length
    const uniquePercentage = (uniqueCount / nonNullValues.length) * 100

    // Get sample values
    const sampleValues = uniqueValues.slice(0, this.MAX_SAMPLE_VALUES)

    // Calculate statistics for numerical columns
    let statistics: ColumnInfo['statistics'] = undefined
    if (type === 'Numerical') {
      const numericValues = nonNullValues.map(v => parseFloat(v)).filter(v => !isNaN(v))
      if (numericValues.length > 0) {
        statistics = this.calculateNumericStatistics(numericValues)
      }
    }

    return {
      name,
      type,
      nullCount,
      nullPercentage,
      uniqueCount,
      uniquePercentage,
      sampleValues,
      statistics
    }
  }

  private static detectColumnType(values: any[]): ColumnInfo['type'] {
    if (values.length === 0) return 'Text'

    // Check for boolean
    const booleanValues = values.filter(v => 
      ['true', 'false', '1', '0', 'yes', 'no', 'y', 'n'].includes(String(v).toLowerCase())
    )
    if (booleanValues.length / values.length > 0.8) {
      return 'Boolean'
    }

    // Check for datetime
    const dateValues = values.filter(v => {
      const date = new Date(v)
      return !isNaN(date.getTime()) && String(v).match(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/)
    })
    if (dateValues.length / values.length > 0.5) {
      return 'DateTime'
    }

    // Check for numerical
    const numericValues = values.filter(v => !isNaN(parseFloat(v)) && isFinite(parseFloat(v)))
    if (numericValues.length / values.length > 0.7) {
      return 'Numerical'
    }

    // Check for categorical (limited unique values)
    const uniqueValues = [...new Set(values)]
    if (uniqueValues.length / values.length < 0.1 && uniqueValues.length < 50) {
      return 'Categorical'
    }

    return 'Text'
  }

  private static calculateNumericStatistics(values: number[]): ColumnInfo['statistics'] {
    const sorted = [...values].sort((a, b) => a - b)
    const n = sorted.length

    const mean = sorted.reduce((sum, val) => sum + val, 0) / n
    const median = n % 2 === 0 
      ? (sorted[n/2 - 1] + sorted[n/2]) / 2 
      : sorted[Math.floor(n/2)]
    
    // Calculate mode
    const frequency: { [key: number]: number } = {}
    sorted.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1
    })
    const mode = Object.keys(frequency).reduce((a, b) => 
      frequency[parseFloat(a)] > frequency[parseFloat(b)] ? a : b
    )

    // Calculate standard deviation
    const variance = sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n
    const std = Math.sqrt(variance)

    // Calculate quartiles
    const q1Index = Math.floor(n * 0.25)
    const q3Index = Math.floor(n * 0.75)
    const quartiles = [sorted[q1Index], median, sorted[q3Index]]

    return {
      mean: parseFloat(mean.toFixed(4)),
      median: parseFloat(median.toFixed(4)),
      mode: parseFloat(mode),
      std: parseFloat(std.toFixed(4)),
      min: sorted[0],
      max: sorted[n - 1],
      quartiles
    }
  }

  private static calculateColumnTypes(columns: ColumnInfo[]) {
    const types = {
      Numerical: 0,
      Categorical: 0,
      DateTime: 0,
      Boolean: 0,
      Text: 0
    }

    columns.forEach(col => {
      types[col.type]++
    })

    return types
  }

  private static calculateDataQuality(records: any[], columns: ColumnInfo[]) {
    const totalCells = records.length * columns.length
    let nullCells = 0
    let duplicateRows = 0
    let invalidCells = 0

    // Count null cells
    records.forEach(row => {
      columns.forEach(col => {
        if (row[col.name] === null || row[col.name] === undefined || row[col.name] === '') {
          nullCells++
        }
      })
    })

    // Count duplicate rows
    const rowStrings = records.map(row => JSON.stringify(row))
    const uniqueRows = new Set(rowStrings)
    duplicateRows = records.length - uniqueRows.size

    // Count invalid cells (basic validation)
    records.forEach(row => {
      columns.forEach(col => {
        const value = row[col.name]
        if (col.type === 'Numerical' && value !== null && value !== undefined && value !== '') {
          if (isNaN(parseFloat(value))) {
            invalidCells++
          }
        }
      })
    })

    const completeness = ((totalCells - nullCells) / totalCells) * 100
    const uniqueness = ((records.length - duplicateRows) / records.length) * 100
    const validity = ((totalCells - invalidCells) / totalCells) * 100
    const consistency = Math.min(completeness, validity) // Simplified consistency metric

    return {
      completeness: parseFloat(completeness.toFixed(1)),
      uniqueness: parseFloat(uniqueness.toFixed(1)),
      validity: parseFloat(validity.toFixed(1)),
      consistency: parseFloat(consistency.toFixed(1))
    }
  }

  static async storeAnalysis(fileId: string, analysis: DatasetAnalysis): Promise<void> {
    const key = `${this.REDIS_KEY_PREFIX}${fileId}`
    await RedisService.set(key, analysis, 86400) // 24 hours TTL
  }

  static async getAnalysis(fileId: string): Promise<DatasetAnalysis | null> {
    const key = `${this.REDIS_KEY_PREFIX}${fileId}`
    return await RedisService.get<DatasetAnalysis>(key)
  }

  static async getAllAnalyses(): Promise<DatasetAnalysis[]> {
    const keys = await RedisService.keys(`${this.REDIS_KEY_PREFIX}*`)
    const analyses: DatasetAnalysis[] = []

    for (const key of keys) {
      const analysis = await RedisService.get<DatasetAnalysis>(key)
      if (analysis) {
        analyses.push(analysis)
      }
    }

    return analyses.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
  }

  static async deleteAnalysis(fileId: string): Promise<void> {
    const key = `${this.REDIS_KEY_PREFIX}${fileId}`
    await RedisService.del(key)
  }
}