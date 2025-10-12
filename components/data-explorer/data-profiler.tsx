"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Database, FileText, Hash, AlertTriangle, CheckCircle, Upload, RefreshCw, X } from "lucide-react"
import { FileUpload } from './file-upload'
import { DatasetAnalysis } from '@/lib/services/csv-analyzer'

export function DataProfiler() {
  const [analysis, setAnalysis] = useState<DatasetAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  // Load the most recent analysis on component mount
  useEffect(() => {
    loadLatestAnalysis()
  }, [])

  const loadLatestAnalysis = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/datasets/analysis')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data.length > 0) {
          setAnalysis(result.data[0]) // Get the most recent analysis
        }
      }
    } catch (error) {
      console.error('Error loading analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadComplete = (newAnalysis: DatasetAnalysis) => {
    setAnalysis(newAnalysis)
    setShowUpload(false)
  }

  const handleUploadStart = () => {
    setShowUpload(true)
  }

  // If no analysis is loaded, show upload component
  if (!analysis && !loading) {
    return (
      <div className="space-y-6">
        <FileUpload 
          onUploadComplete={handleUploadComplete}
          onUploadStart={handleUploadStart}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading dataset analysis...</span>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="space-y-6">
        <FileUpload 
          onUploadComplete={handleUploadComplete}
          onUploadStart={handleUploadStart}
        />
      </div>
    )
  }

  // Convert analysis data to display format
const datasetInfo = {
    name: analysis.name,
    size: `${(analysis.size / 1024 / 1024).toFixed(2)} MB`,
    rows: analysis.rows,
    columns: analysis.columnCount,
    lastModified: new Date(analysis.uploadedAt).toLocaleDateString(),
    source: "Uploaded File",
}

const columnTypes = [
    { type: "Numerical", count: analysis.columnTypes.Numerical, color: "#8b5cf6" },
    { type: "Categorical", count: analysis.columnTypes.Categorical, color: "#06b6d4" },
    { type: "DateTime", count: analysis.columnTypes.DateTime, color: "#10b981" },
    { type: "Boolean", count: analysis.columnTypes.Boolean, color: "#f59e0b" },
    { type: "Text", count: analysis.columnTypes.Text, color: "#6b7280" },
  ].filter(item => item.count > 0)

const dataQualityMetrics = [
    { metric: "Completeness", value: analysis.dataQuality.completeness, status: analysis.dataQuality.completeness > 90 ? "good" : "warning" },
    { metric: "Uniqueness", value: analysis.dataQuality.uniqueness, status: analysis.dataQuality.uniqueness > 80 ? "good" : "warning" },
    { metric: "Validity", value: analysis.dataQuality.validity, status: analysis.dataQuality.validity > 90 ? "good" : "warning" },
    { metric: "Consistency", value: analysis.dataQuality.consistency, status: analysis.dataQuality.consistency > 85 ? "good" : "warning" },
  ]

  const topColumns = analysis.columns.slice(0, 5).map((col: any) => ({
    name: col.name,
    type: col.type,
    nulls: col.nullPercentage,
    unique: col.uniqueCount
  }))
  return (
    <div className="space-y-6">
      {/* Dataset Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Dataset Overview
            </CardTitle>
            <CardDescription>Basic information about your dataset</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-foreground">{datasetInfo.rows.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Rows</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-foreground">{datasetInfo.columns}</div>
                <div className="text-sm text-muted-foreground">Columns</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-foreground">{datasetInfo.size}</div>
                <div className="text-sm text-muted-foreground">Size</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-foreground">CSV</div>
                <div className="text-sm text-muted-foreground">Format</div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">{datasetInfo.name}</h4>
                  <p className="text-sm text-muted-foreground">Source: {datasetInfo.source}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowUpload(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Column Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {columnTypes.map((type) => (
                <div key={type.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: type.color }} />
                    <span className="text-sm text-foreground">{type.type}</span>
                  </div>
                  <Badge variant="secondary">{type.count}</Badge>
                </div>
              ))}
            </div>

            <div className="mt-4 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={columnTypes} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="count">
                    {columnTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Data Quality Assessment
          </CardTitle>
          <CardDescription>Overall health and quality metrics for your dataset</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dataQualityMetrics.map((metric) => (
              <div key={metric.metric} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{metric.metric}</span>
                  <div className="flex items-center gap-2">
                    {metric.status === "good" ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    )}
                    <span className="text-sm font-bold text-foreground">{metric.value}%</span>
                  </div>
                </div>
                <Progress value={metric.value} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Column Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary" />
                Column Analysis
              </CardTitle>
              <CardDescription>Detailed statistics for each column in your dataset</CardDescription>
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Columns</SelectItem>
                <SelectItem value="numerical">Numerical</SelectItem>
                <SelectItem value="categorical">Categorical</SelectItem>
                <SelectItem value="datetime">DateTime</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topColumns.map((column: any, index: number) => (
              <div key={column.name} className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{column.name}</h4>
                    <p className="text-sm text-muted-foreground">{column.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm font-medium text-foreground">{column.nulls}%</div>
                    <div className="text-xs text-muted-foreground">Missing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-foreground">{column.unique.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Unique</div>
                  </div>
                  <Button variant="outline" size="sm">
                    Analyze
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Upload New Dataset</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowUpload(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <FileUpload 
              onUploadComplete={handleUploadComplete}
              onUploadStart={handleUploadStart}
            />
          </div>
        </div>
      )}
    </div>
  )
}
