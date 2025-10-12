import { Dataset } from '@/lib/models/Dataset'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  metrics: {
    completeness: number
    accuracy: number
    consistency: number
    validity: number
  }
  schema: {
    columns: Array<{
      name: string
      type: string
      nullable: boolean
      unique: boolean
      min?: number
      max?: number
      categories?: string[]
    }>
  }
  dataQuality: {
    missingValues: Record<string, number>
    duplicates: number
    outliers: Record<string, number>
    dataTypes: Record<string, string>
  }
}

export class DataValidator {
  // Validate dataset structure and content
  async validateDataset(dataset: Dataset, parameters?: Record<string, any>): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []
    
    try {
      // Basic validation
      if (!dataset.name || dataset.name.trim() === '') {
        errors.push('Dataset name is required')
      }

      if (!dataset.description || dataset.description.trim() === '') {
        warnings.push('Dataset description is missing')
      }

      if (dataset.rows <= 0) {
        errors.push('Dataset must have at least one row')
      }

      if (dataset.columns <= 0) {
        errors.push('Dataset must have at least one column')
      }

      // Schema validation
      const schemaValidation = this.validateSchema(dataset.schema || [])
      errors.push(...schemaValidation.errors)
      warnings.push(...schemaValidation.warnings)

      // Data quality validation
      const qualityValidation = await this.validateDataQuality(dataset, parameters)
      errors.push(...qualityValidation.errors)
      warnings.push(...qualityValidation.warnings)

      // Calculate overall metrics
      const metrics = this.calculateMetrics(dataset, qualityValidation)

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        metrics,
        schema: {
          columns: dataset.schema || []
        },
        dataQuality: qualityValidation.dataQuality
      }

    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed'],
        warnings: [],
        metrics: {
          completeness: 0,
          accuracy: 0,
          consistency: 0,
          validity: 0
        },
        schema: { columns: [] },
        dataQuality: {
          missingValues: {},
          duplicates: 0,
          outliers: {},
          dataTypes: {}
        }
      }
    }
  }

  // Validate dataset schema
  private validateSchema(schema: any[]): { errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    if (!schema || schema.length === 0) {
      warnings.push('No schema information available')
      return { errors, warnings }
    }

    const columnNames = new Set<string>()

    for (const column of schema) {
      // Check for duplicate column names
      if (columnNames.has(column.name)) {
        errors.push(`Duplicate column name: ${column.name}`)
      }
      columnNames.add(column.name)

      // Validate column name
      if (!column.name || column.name.trim() === '') {
        errors.push('Column name cannot be empty')
      }

      // Validate data type
      const validTypes = ['string', 'integer', 'float', 'boolean', 'datetime', 'categorical']
      if (!validTypes.includes(column.type)) {
        errors.push(`Invalid data type for column ${column.name}: ${column.type}`)
      }

      // Validate constraints
      if (column.min !== undefined && column.max !== undefined && column.min > column.max) {
        errors.push(`Invalid range for column ${column.name}: min > max`)
      }

      // Check for required fields
      if (column.nullable === undefined) {
        warnings.push(`Nullable property not specified for column ${column.name}`)
      }
    }

    return { errors, warnings }
  }

  // Validate data quality
  private async validateDataQuality(dataset: Dataset, parameters?: Record<string, any>): Promise<{
    errors: string[]
    warnings: string[]
    dataQuality: {
      missingValues: Record<string, number>
      duplicates: number
      outliers: Record<string, number>
      dataTypes: Record<string, string>
    }
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    // Simulate data quality analysis
    const dataQuality = {
      missingValues: this.analyzeMissingValues(dataset),
      duplicates: this.analyzeDuplicates(dataset),
      outliers: this.analyzeOutliers(dataset),
      dataTypes: this.analyzeDataTypes(dataset)
    }

    // Check for high missing value rates
    for (const [column, missingCount] of Object.entries(dataQuality.missingValues)) {
      const missingRate = missingCount / dataset.rows
      if (missingRate > 0.5) {
        errors.push(`High missing value rate in column ${column}: ${(missingRate * 100).toFixed(1)}%`)
      } else if (missingRate > 0.1) {
        warnings.push(`Moderate missing value rate in column ${column}: ${(missingRate * 100).toFixed(1)}%`)
      }
    }

    // Check for high duplicate rates
    const duplicateRate = dataQuality.duplicates / dataset.rows
    if (duplicateRate > 0.1) {
      warnings.push(`High duplicate rate: ${(duplicateRate * 100).toFixed(1)}%`)
    }

    // Check for data type consistency
    for (const [column, dataType] of Object.entries(dataQuality.dataTypes)) {
      const schemaColumn = dataset.schema?.find(col => col.name === column)
      if (schemaColumn && schemaColumn.type !== dataType) {
        warnings.push(`Data type mismatch for column ${column}: expected ${schemaColumn.type}, found ${dataType}`)
      }
    }

    return { errors, warnings, dataQuality }
  }

  // Analyze missing values
  private analyzeMissingValues(dataset: Dataset): Record<string, number> {
    // Simulate missing value analysis
    const missingValues: Record<string, number> = {}
    
    if (dataset.schema) {
      for (const column of dataset.schema) {
        // Simulate missing value count (0-10% of rows)
        const missingRate = Math.random() * 0.1
        missingValues[column.name] = Math.floor(dataset.rows * missingRate)
      }
    }

    return missingValues
  }

  // Analyze duplicates
  private analyzeDuplicates(dataset: Dataset): number {
    // Simulate duplicate analysis (0-5% of rows)
    const duplicateRate = Math.random() * 0.05
    return Math.floor(dataset.rows * duplicateRate)
  }

  // Analyze outliers
  private analyzeOutliers(dataset: Dataset): Record<string, number> {
    const outliers: Record<string, number> = {}
    
    if (dataset.schema) {
      for (const column of dataset.schema) {
        if (['integer', 'float'].includes(column.type)) {
          // Simulate outlier count (0-2% of rows)
          const outlierRate = Math.random() * 0.02
          outliers[column.name] = Math.floor(dataset.rows * outlierRate)
        }
      }
    }

    return outliers
  }

  // Analyze data types
  private analyzeDataTypes(dataset: Dataset): Record<string, string> {
    const dataTypes: Record<string, string> = {}
    
    if (dataset.schema) {
      for (const column of dataset.schema) {
        dataTypes[column.name] = column.type
      }
    }

    return dataTypes
  }

  // Calculate validation metrics
  private calculateMetrics(dataset: Dataset, qualityValidation: any): {
    completeness: number
    accuracy: number
    consistency: number
    validity: number
  } {
    // Calculate completeness (based on missing values)
    const totalMissing = Object.values(qualityValidation.dataQuality.missingValues).reduce((sum: number, count: number) => sum + count, 0)
    const totalCells = dataset.rows * dataset.columns
    const completeness = totalCells > 0 ? 1 - (totalMissing / totalCells) : 0

    // Calculate accuracy (simulate based on data quality)
    const accuracy = Math.max(0, 1 - (qualityValidation.errors.length * 0.1))

    // Calculate consistency (based on schema validation)
    const consistency = qualityValidation.errors.length === 0 ? 1 : Math.max(0, 1 - (qualityValidation.errors.length * 0.2))

    // Calculate validity (based on data type consistency)
    const validity = qualityValidation.warnings.length === 0 ? 1 : Math.max(0, 1 - (qualityValidation.warnings.length * 0.05))

    return {
      completeness: Math.round(completeness * 100) / 100,
      accuracy: Math.round(accuracy * 100) / 100,
      consistency: Math.round(consistency * 100) / 100,
      validity: Math.round(validity * 100) / 100
    }
  }

  // Validate specific data format
  async validateDataFormat(data: any, format: string): Promise<{
    isValid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    switch (format.toLowerCase()) {
      case 'csv':
        return this.validateCSV(data)
      case 'json':
        return this.validateJSON(data)
      case 'parquet':
        return this.validateParquet(data)
      default:
        errors.push(`Unsupported data format: ${format}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Validate CSV format
  private validateCSV(data: any): { errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    if (typeof data !== 'string') {
      errors.push('CSV data must be a string')
      return { errors, warnings }
    }

    const lines = data.split('\n')
    if (lines.length < 2) {
      errors.push('CSV must have at least a header and one data row')
    }

    // Check for consistent column count
    if (lines.length > 1) {
      const headerColumns = lines[0].split(',').length
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const rowColumns = lines[i].split(',').length
          if (rowColumns !== headerColumns) {
            errors.push(`Row ${i + 1} has ${rowColumns} columns, expected ${headerColumns}`)
          }
        }
      }
    }

    return { errors, warnings }
  }

  // Validate JSON format
  private validateJSON(data: any): { errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data
      
      if (!Array.isArray(parsed)) {
        errors.push('JSON data must be an array of objects')
      } else if (parsed.length === 0) {
        warnings.push('JSON array is empty')
      } else {
        // Check for consistent structure
        const firstKeys = Object.keys(parsed[0])
        for (let i = 1; i < parsed.length; i++) {
          const currentKeys = Object.keys(parsed[i])
          if (JSON.stringify(currentKeys.sort()) !== JSON.stringify(firstKeys.sort())) {
            errors.push(`Object at index ${i} has different structure than the first object`)
          }
        }
      }
    } catch (error) {
      errors.push('Invalid JSON format')
    }

    return { errors, warnings }
  }

  // Validate Parquet format
  private validateParquet(data: any): { errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    // Basic validation for Parquet format
    if (!data || typeof data !== 'object') {
      errors.push('Parquet data must be an object')
    }

    return { errors, warnings }
  }

  // Validate data constraints
  async validateConstraints(data: any, constraints: Record<string, any>): Promise<{
    isValid: boolean
    violations: Array<{
      column: string
      constraint: string
      value: any
      message: string
    }>
  }> {
    const violations: Array<{
      column: string
      constraint: string
      value: any
      message: string
    }> = []

    for (const [column, constraint] of Object.entries(constraints)) {
      if (constraint.required && (data[column] === undefined || data[column] === null)) {
        violations.push({
          column,
          constraint: 'required',
          value: data[column],
          message: `Column ${column} is required but missing`
        })
      }

      if (constraint.min !== undefined && data[column] < constraint.min) {
        violations.push({
          column,
          constraint: 'min',
          value: data[column],
          message: `Column ${column} value ${data[column]} is below minimum ${constraint.min}`
        })
      }

      if (constraint.max !== undefined && data[column] > constraint.max) {
        violations.push({
          column,
          constraint: 'max',
          value: data[column],
          message: `Column ${column} value ${data[column]} is above maximum ${constraint.max}`
        })
      }

      if (constraint.pattern && !new RegExp(constraint.pattern).test(data[column])) {
        violations.push({
          column,
          constraint: 'pattern',
          value: data[column],
          message: `Column ${column} value does not match required pattern`
        })
      }

      if (constraint.enum && !constraint.enum.includes(data[column])) {
        violations.push({
          column,
          constraint: 'enum',
          value: data[column],
          message: `Column ${column} value ${data[column]} is not in allowed values: ${constraint.enum.join(', ')}`
        })
      }
    }

    return {
      isValid: violations.length === 0,
      violations
    }
  }
}
