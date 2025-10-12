"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Scale, Play, Download, RotateCcw, TrendingUp } from "lucide-react"

const scalingMethods = [
  {
    name: "StandardScaler",
    description: "Standardize features by removing mean and scaling to unit variance",
    formula: "(x - μ) / σ",
    useCase: "Normal distribution, outliers present",
    recommended: true,
  },
  {
    name: "MinMaxScaler",
    description: "Scale features to a fixed range, usually [0, 1]",
    formula: "(x - min) / (max - min)",
    useCase: "Bounded features, preserve zero values",
    recommended: false,
  },
  {
    name: "RobustScaler",
    description: "Scale using statistics robust to outliers",
    formula: "(x - median) / IQR",
    useCase: "Many outliers present",
    recommended: true,
  },
  {
    name: "Normalizer",
    description: "Scale individual samples to have unit norm",
    formula: "x / ||x||",
    useCase: "Text analysis, sparse data",
    recommended: false,
  },
]

const featureStats = [
  {
    feature: "severity_score",
    mean: 45.2,
    std: 23.1,
    min: 0,
    max: 100,
    median: 42.0,
    q1: 25.0,
    q3: 65.0,
    outliers: 12,
    selected: true,
  },
  {
    feature: "bytes_transferred",
    mean: 2048576,
    std: 1234567,
    min: 64,
    max: 10485760,
    median: 1572864,
    q1: 524288,
    q3: 3145728,
    outliers: 45,
    selected: true,
  },
  {
    feature: "connection_duration",
    mean: 12.5,
    std: 8.9,
    min: 0.1,
    max: 120.0,
    median: 8.2,
    q1: 3.5,
    q3: 18.7,
    outliers: 8,
    selected: true,
  },
  {
    feature: "failed_attempts",
    mean: 3.2,
    std: 2.8,
    min: 0,
    max: 25,
    median: 2.0,
    q1: 1.0,
    q3: 4.0,
    outliers: 23,
    selected: false,
  },
]

const beforeAfterData = [
  { feature: "severity_score", before: 45.2, after: 0.0, beforeStd: 23.1, afterStd: 1.0 },
  { feature: "bytes_transferred", before: 2048576, after: 0.0, beforeStd: 1234567, afterStd: 1.0 },
  { feature: "connection_duration", before: 12.5, after: 0.0, beforeStd: 8.9, afterStd: 1.0 },
]

export function FeatureScaling() {
  const [selectedMethod, setSelectedMethod] = useState("StandardScaler")
  const [isScaling, setIsScaling] = useState(false)
  const [showComparison, setShowComparison] = useState(false)

  const handleFeatureToggle = (featureName: string) => {
    console.log(`Toggling scaling for: ${featureName}`)
  }

  const runScaling = () => {
    setIsScaling(true)
    setTimeout(() => {
      setIsScaling(false)
      setShowComparison(true)
    }, 2000)
  }

  const selectedFeatures = featureStats.filter((f) => f.selected)

  return (
    <div className="space-y-6">
      {/* Scaling Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Feature Scaling Methods
          </CardTitle>
          <CardDescription>Choose the appropriate scaling method for your features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scalingMethods.map((method) => (
              <div
                key={method.name}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedMethod === method.name
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedMethod(method.name)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{method.name}</h3>
                  {method.recommended && (
                    <Badge variant="default" className="text-xs">
                      Recommended
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                <div className="space-y-1">
                  <div className="text-xs font-mono bg-muted/50 p-2 rounded">Formula: {method.formula}</div>
                  <div className="text-xs text-muted-foreground">Best for: {method.useCase}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Feature Statistics</CardTitle>
              <CardDescription>Current distribution statistics for numerical features</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={runScaling} disabled={isScaling || selectedFeatures.length === 0}>
                {isScaling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Scaling...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Apply Scaling
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {featureStats.map((feature, index) => (
              <div
                key={feature.feature}
                className={`p-4 rounded-lg border transition-all ${
                  feature.selected ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={feature.selected} onCheckedChange={() => handleFeatureToggle(feature.feature)} />
                    <div>
                      <h4 className="font-medium text-foreground">{feature.feature}</h4>
                      <p className="text-sm text-muted-foreground">{feature.outliers} outliers detected</p>
                    </div>
                  </div>
                  <Badge
                    variant={feature.outliers > 20 ? "destructive" : feature.outliers > 10 ? "default" : "secondary"}
                  >
                    {feature.outliers > 20
                      ? "High variance"
                      : feature.outliers > 10
                        ? "Medium variance"
                        : "Low variance"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Mean</div>
                    <div className="font-medium text-foreground">
                      {feature.mean > 1000 ? (feature.mean / 1000000).toFixed(1) + "M" : feature.mean.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Std Dev</div>
                    <div className="font-medium text-foreground">
                      {feature.std > 1000 ? (feature.std / 1000000).toFixed(1) + "M" : feature.std.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Min</div>
                    <div className="font-medium text-foreground">{feature.min}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Q1</div>
                    <div className="font-medium text-foreground">
                      {feature.q1 > 1000 ? (feature.q1 / 1000000).toFixed(1) + "M" : feature.q1.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Median</div>
                    <div className="font-medium text-foreground">
                      {feature.median > 1000 ? (feature.median / 1000000).toFixed(1) + "M" : feature.median.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Q3</div>
                    <div className="font-medium text-foreground">
                      {feature.q3 > 1000 ? (feature.q3 / 1000000).toFixed(1) + "M" : feature.q3.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Max</div>
                    <div className="font-medium text-foreground">
                      {feature.max > 1000 ? (feature.max / 1000000).toFixed(1) + "M" : feature.max.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Before/After Comparison */}
      {showComparison && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Scaling Results
            </CardTitle>
            <CardDescription>Comparison of feature distributions before and after scaling</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-foreground mb-4">Mean Values</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={beforeAfterData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="feature" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="before" fill="hsl(var(--muted))" name="Before" />
                      <Bar dataKey="after" fill="hsl(var(--primary))" name="After" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-4">Standard Deviation</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={beforeAfterData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="feature" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="beforeStd" fill="hsl(var(--muted))" name="Before" />
                      <Bar dataKey="afterStd" fill="hsl(var(--success))" name="After" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-success">Scaling Complete</h4>
                  <p className="text-sm text-success/80">
                    {selectedFeatures.length} features successfully scaled using {selectedMethod}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Scaled Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
