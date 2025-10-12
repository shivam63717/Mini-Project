"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Download, Shield } from "lucide-react"

const qualityMetrics = [
  {
    metric: "Completeness",
    score: 94.2,
    status: "good",
    description: "Percentage of non-null values",
    issues: 72500,
    total: 1250000,
  },
  {
    metric: "Uniqueness",
    score: 87.5,
    status: "warning",
    description: "Percentage of unique values where expected",
    issues: 156250,
    total: 1250000,
  },
  {
    metric: "Validity",
    score: 96.8,
    status: "good",
    description: "Percentage of values matching expected format",
    issues: 40000,
    total: 1250000,
  },
  {
    metric: "Consistency",
    score: 91.3,
    status: "good",
    description: "Percentage of values consistent across related fields",
    issues: 108750,
    total: 1250000,
  },
  {
    metric: "Accuracy",
    score: 89.7,
    status: "warning",
    description: "Percentage of values within expected ranges",
    issues: 128750,
    total: 1250000,
  },
]

const missingDataPattern = [
  { column: "threat_type", missing: 0.2, pattern: "Random" },
  { column: "severity_score", missing: 1.1, pattern: "Random" },
  { column: "source_location", missing: 15.3, pattern: "Systematic" },
  { column: "bytes_transferred", missing: 2.3, pattern: "Random" },
  { column: "user_agent", missing: 8.7, pattern: "Systematic" },
]

const dataIssues = [
  {
    type: "Duplicates",
    count: 12450,
    severity: "high",
    description: "Exact duplicate rows found",
    action: "Remove duplicates",
  },
  {
    type: "Outliers",
    count: 3200,
    severity: "medium",
    description: "Values beyond 3 standard deviations",
    action: "Investigate outliers",
  },
  {
    type: "Invalid Formats",
    count: 890,
    severity: "high",
    description: "IP addresses with invalid format",
    action: "Fix format issues",
  },
  {
    type: "Inconsistent Values",
    count: 5670,
    severity: "medium",
    description: "Inconsistent categorical values",
    action: "Standardize values",
  },
]

const dataTypes = [
  { name: "Valid", value: 89.2, color: "#10b981" },
  { name: "Missing", value: 5.8, color: "#f59e0b" },
  { name: "Invalid", value: 3.2, color: "#ef4444" },
  { name: "Duplicates", value: 1.8, color: "#8b5cf6" },
]

function getStatusIcon(status: string) {
  switch (status) {
    case "good":
      return <CheckCircle className="h-4 w-4 text-success" />
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-warning" />
    case "error":
      return <XCircle className="h-4 w-4 text-destructive" />
    default:
      return <CheckCircle className="h-4 w-4 text-muted-foreground" />
  }
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "high":
      return "destructive"
    case "medium":
      return "default"
    case "low":
      return "secondary"
    default:
      return "secondary"
  }
}

export function DataQualityAssessment() {
  return (
    <div className="space-y-6">
      {/* Overall Quality Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Data Quality Assessment
              </CardTitle>
              <CardDescription>Comprehensive analysis of data health and integrity</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {qualityMetrics.map((metric) => (
                  <div key={metric.metric} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(metric.status)}
                        <span className="font-medium text-foreground">{metric.metric}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{metric.issues.toLocaleString()} issues</span>
                        <span className="font-bold text-foreground">{metric.score}%</span>
                      </div>
                    </div>
                    <Progress value={metric.score} className="h-2" />
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">91.9%</div>
                <div className="text-sm text-muted-foreground">Overall Quality Score</div>
                <Badge variant="default" className="mt-2">
                  Good Quality
                </Badge>
              </div>

              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dataTypes} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                      {dataTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {dataTypes.map((type) => (
                  <div key={type.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                      <span className="text-foreground">{type.name}</span>
                    </div>
                    <span className="text-muted-foreground">{type.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Identified Issues</CardTitle>
          <CardDescription>Critical data quality problems that need attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dataIssues.map((issue, index) => (
              <Alert key={index} className="border-l-4 border-l-destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{issue.type}</span>
                        <Badge variant={getSeverityColor(issue.severity)}>{issue.severity}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {issue.count.toLocaleString()} instances found
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      {issue.action}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Missing Data Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Missing Data Patterns</CardTitle>
          <CardDescription>Analysis of missing values across different columns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {missingDataPattern.map((column, index) => (
              <div
                key={column.column}
                className="flex items-center justify-between p-4 rounded-lg border border-border"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{column.column}</h4>
                    <p className="text-sm text-muted-foreground">Missing pattern: {column.pattern}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">{column.missing}%</div>
                    <div className="text-xs text-muted-foreground">Missing</div>
                  </div>
                  <div className="w-24">
                    <Progress value={100 - column.missing} className="h-2" />
                  </div>
                  <Button variant="outline" size="sm">
                    Fix
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
