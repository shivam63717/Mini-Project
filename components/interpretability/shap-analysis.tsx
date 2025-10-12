"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts"
import { Target, Play, RefreshCw, TrendingUp, AlertCircle } from "lucide-react"

const shapGlobalData = [
  { feature: "severity_score", shapValue: 2.45, absShapValue: 2.45, impact: "High" },
  { feature: "bytes_transferred", shapValue: 1.87, absShapValue: 1.87, impact: "High" },
  { feature: "connection_duration", shapValue: -1.23, absShapValue: 1.23, impact: "Medium" },
  { feature: "failed_attempts", shapValue: 0.89, absShapValue: 0.89, impact: "Medium" },
  { feature: "source_port", shapValue: -0.45, absShapValue: 0.45, impact: "Low" },
  { feature: "hour_of_day", shapValue: 0.34, absShapValue: 0.34, impact: "Low" },
  { feature: "is_weekend", shapValue: -0.12, absShapValue: 0.12, impact: "Very Low" },
]

const shapLocalData = [
  {
    instance: "Sample 1",
    prediction: 0.89,
    features: {
      severity_score: { value: 85, shap: 2.1 },
      bytes_transferred: { value: 5242880, shap: 1.5 },
      connection_duration: { value: 45.2, shap: -0.8 },
      failed_attempts: { value: 12, shap: 1.2 },
    },
  },
  {
    instance: "Sample 2",
    prediction: 0.23,
    features: {
      severity_score: { value: 25, shap: -1.8 },
      bytes_transferred: { value: 1024000, shap: -0.9 },
      connection_duration: { value: 2.1, shap: 0.3 },
      failed_attempts: { value: 1, shap: -0.4 },
    },
  },
]

const shapSummaryData = [
  {
    feature: "severity_score",
    values: [1.2, 2.1, 1.8, 2.5, 1.9, 2.3, 1.7],
    shapValues: [1.8, 2.1, 1.9, 2.5, 2.0, 2.3, 1.8],
  },
  {
    feature: "bytes_transferred",
    values: [1.5, 2.8, 2.1, 3.2, 2.7, 3.1, 2.4],
    shapValues: [1.2, 1.9, 1.5, 2.1, 1.8, 2.0, 1.6],
  },
  {
    feature: "connection_duration",
    values: [0.8, 1.2, 0.9, 1.5, 1.1, 1.4, 1.0],
    shapValues: [-0.6, -1.0, -0.7, -1.2, -0.9, -1.1, -0.8],
  },
]

export function ShapAnalysis() {
  const [selectedModel, setSelectedModel] = useState("threat-classifier")
  const [selectedInstance, setSelectedInstance] = useState("sample-1")
  const [isCalculating, setIsCalculating] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleCalculateShap = () => {
    setIsCalculating(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsCalculating(false)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                SHAP Analysis
              </CardTitle>
              <CardDescription>SHapley Additive exPlanations for model interpretability</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="threat-classifier">Threat Classifier</SelectItem>
                  <SelectItem value="anomaly-detector">Anomaly Detector</SelectItem>
                  <SelectItem value="severity-predictor">Severity Predictor</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleCalculateShap} disabled={isCalculating}>
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Calculating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Calculate SHAP
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        {isCalculating && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Computing SHAP values...</span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Global Feature Importance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Global Feature Importance
          </CardTitle>
          <CardDescription>Average absolute SHAP values across all predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shapGlobalData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="feature"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="absShapValue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {shapGlobalData.slice(0, 4).map((feature, index) => (
              <div key={feature.feature} className="p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{feature.feature}</span>
                  <Badge
                    variant={
                      feature.impact === "High" ? "destructive" : feature.impact === "Medium" ? "default" : "secondary"
                    }
                  >
                    {feature.impact}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-foreground">
                  {feature.shapValue > 0 ? "+" : ""}
                  {feature.shapValue.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">Average SHAP value</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Local Explanations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Local Explanations</CardTitle>
                <CardDescription>SHAP values for individual predictions</CardDescription>
              </div>
              <Select value={selectedInstance} onValueChange={setSelectedInstance}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sample-1">Sample 1</SelectItem>
                  <SelectItem value="sample-2">Sample 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {shapLocalData.map((sample, index) => {
              if (selectedInstance !== `sample-${index + 1}`) return null

              return (
                <div key={sample.instance} className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">Prediction</span>
                      <Badge
                        variant={sample.prediction > 0.5 ? "destructive" : "default"}
                        className="text-lg px-3 py-1"
                      >
                        {(sample.prediction * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {sample.prediction > 0.5 ? "High threat probability" : "Low threat probability"}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(sample.features).map(([feature, data]) => (
                      <div
                        key={feature}
                        className="flex items-center justify-between p-3 rounded-lg border border-border"
                      >
                        <div>
                          <div className="font-medium text-foreground">{feature}</div>
                          <div className="text-sm text-muted-foreground">
                            Value:{" "}
                            {typeof data.value === "number" && data.value > 1000
                              ? (data.value / 1000000).toFixed(1) + "M"
                              : data.value}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${data.shap > 0 ? "text-success" : "text-destructive"}`}>
                            {data.shap > 0 ? "+" : ""}
                            {data.shap.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">SHAP</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SHAP Summary Plot</CardTitle>
            <CardDescription>Feature values vs SHAP values distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    dataKey="value"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    name="Feature Value"
                  />
                  <YAxis
                    type="number"
                    dataKey="shap"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    name="SHAP Value"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  {shapSummaryData.map((feature, index) => (
                    <Scatter
                      key={feature.feature}
                      name={feature.feature}
                      data={feature.values.map((value, i) => ({
                        value,
                        shap: feature.shapValues[i],
                      }))}
                      fill={`hsl(${index * 60 + 200}, 70%, 50%)`}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SHAP Waterfall */}
      <Card>
        <CardHeader>
          <CardTitle>SHAP Waterfall Chart</CardTitle>
          <CardDescription>Step-by-step contribution of each feature to the final prediction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <span className="font-medium text-foreground">Base Value (Expected Output)</span>
              <span className="font-bold text-foreground">0.45</span>
            </div>

            {shapLocalData[0].features &&
              Object.entries(shapLocalData[0].features).map(([feature, data], index) => (
                <div key={feature} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-medium text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{feature}</div>
                      <div className="text-sm text-muted-foreground">
                        Value:{" "}
                        {typeof data.value === "number" && data.value > 1000
                          ? (data.value / 1000000).toFixed(1) + "M"
                          : data.value}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`font-bold ${data.shap > 0 ? "text-success" : "text-destructive"}`}>
                      {data.shap > 0 ? "+" : ""}
                      {data.shap.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      →{" "}
                      {(
                        0.45 +
                        Object.entries(shapLocalData[0].features)
                          .slice(0, index + 1)
                          .reduce((sum, [, d]) => sum + d.shap, 0)
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}

            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
              <span className="font-medium text-primary">Final Prediction</span>
              <span className="font-bold text-primary text-lg">{shapLocalData[0].prediction.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-info/10 border border-info/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-info mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-info">SHAP Interpretation</p>
                <p className="text-info/80 text-xs mt-1">
                  Each feature's SHAP value shows how much it pushes the prediction above or below the expected model
                  output. Positive values increase the prediction, negative values decrease it.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
