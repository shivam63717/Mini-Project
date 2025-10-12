"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { TrendingUp, Play, Download, Grid3X3 } from "lucide-react"

const pdpData = {
  severity_score: [
    { value: 0, prediction: 0.12, confidence: [0.08, 0.16] },
    { value: 10, prediction: 0.18, confidence: [0.14, 0.22] },
    { value: 20, prediction: 0.28, confidence: [0.24, 0.32] },
    { value: 30, prediction: 0.42, confidence: [0.38, 0.46] },
    { value: 40, prediction: 0.58, confidence: [0.54, 0.62] },
    { value: 50, prediction: 0.71, confidence: [0.67, 0.75] },
    { value: 60, prediction: 0.82, confidence: [0.78, 0.86] },
    { value: 70, prediction: 0.89, confidence: [0.85, 0.93] },
    { value: 80, prediction: 0.94, confidence: [0.9, 0.98] },
    { value: 90, prediction: 0.97, confidence: [0.93, 1.0] },
    { value: 100, prediction: 0.98, confidence: [0.94, 1.0] },
  ],
  bytes_transferred: [
    { value: 0, prediction: 0.25, confidence: [0.21, 0.29] },
    { value: 1000000, prediction: 0.32, confidence: [0.28, 0.36] },
    { value: 2000000, prediction: 0.45, confidence: [0.41, 0.49] },
    { value: 3000000, prediction: 0.58, confidence: [0.54, 0.62] },
    { value: 4000000, prediction: 0.69, confidence: [0.65, 0.73] },
    { value: 5000000, prediction: 0.78, confidence: [0.74, 0.82] },
    { value: 6000000, prediction: 0.84, confidence: [0.8, 0.88] },
    { value: 7000000, prediction: 0.88, confidence: [0.84, 0.92] },
    { value: 8000000, prediction: 0.91, confidence: [0.87, 0.95] },
    { value: 9000000, prediction: 0.93, confidence: [0.89, 0.97] },
    { value: 10000000, prediction: 0.94, confidence: [0.9, 0.98] },
  ],
  connection_duration: [
    { value: 0, prediction: 0.78, confidence: [0.74, 0.82] },
    { value: 5, prediction: 0.72, confidence: [0.68, 0.76] },
    { value: 10, prediction: 0.65, confidence: [0.61, 0.69] },
    { value: 15, prediction: 0.58, confidence: [0.54, 0.62] },
    { value: 20, prediction: 0.52, confidence: [0.48, 0.56] },
    { value: 25, prediction: 0.47, confidence: [0.43, 0.51] },
    { value: 30, prediction: 0.43, confidence: [0.39, 0.47] },
    { value: 35, prediction: 0.4, confidence: [0.36, 0.44] },
    { value: 40, prediction: 0.38, confidence: [0.34, 0.42] },
    { value: 45, prediction: 0.37, confidence: [0.33, 0.41] },
    { value: 50, prediction: 0.36, confidence: [0.32, 0.4] },
  ],
}

const interactionData = [
  { severity: 20, bytes: 1000000, prediction: 0.25 },
  { severity: 20, bytes: 3000000, prediction: 0.35 },
  { severity: 20, bytes: 5000000, prediction: 0.42 },
  { severity: 50, bytes: 1000000, prediction: 0.58 },
  { severity: 50, bytes: 3000000, prediction: 0.68 },
  { severity: 50, bytes: 5000000, prediction: 0.75 },
  { severity: 80, bytes: 1000000, prediction: 0.85 },
  { severity: 80, bytes: 3000000, prediction: 0.91 },
  { severity: 80, bytes: 5000000, prediction: 0.95 },
]

const availableFeatures = [
  { name: "severity_score", type: "Numerical", selected: true },
  { name: "bytes_transferred", type: "Numerical", selected: true },
  { name: "connection_duration", type: "Numerical", selected: true },
  { name: "failed_attempts", type: "Numerical", selected: false },
  { name: "source_port", type: "Numerical", selected: false },
  { name: "hour_of_day", type: "Numerical", selected: false },
]

export function PartialDependencePlots() {
  const [selectedFeature, setSelectedFeature] = useState("severity_score")
  const [showConfidence, setShowConfidence] = useState(true)
  const [showInteraction, setShowInteraction] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleCalculate = () => {
    setIsCalculating(true)
    setTimeout(() => {
      setIsCalculating(false)
    }, 2000)
  }

  const currentData = pdpData[selectedFeature as keyof typeof pdpData] || []

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Partial Dependence Plots
              </CardTitle>
              <CardDescription>Visualize the marginal effect of features on model predictions</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedFeature} onValueChange={setSelectedFeature}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableFeatures
                    .filter((f) => f.selected)
                    .map((feature) => (
                      <SelectItem key={feature.name} value={feature.name}>
                        {feature.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => setShowInteraction(!showInteraction)}>
                <Grid3X3 className="h-4 w-4 mr-2" />
                {showInteraction ? "Hide" : "Show"} Interactions
              </Button>
              <Button onClick={handleCalculate} disabled={isCalculating}>
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Calculating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Calculate PDP
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Feature Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Selection</CardTitle>
          <CardDescription>Select features to include in partial dependence analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableFeatures.map((feature) => (
              <div key={feature.name} className="flex items-center space-x-2">
                <Checkbox checked={feature.selected} />
                <div>
                  <div className="font-medium text-foreground">{feature.name}</div>
                  <div className="text-sm text-muted-foreground">{feature.type}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main PDP Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Partial Dependence: {selectedFeature}</CardTitle>
              <CardDescription>How predictions change as this feature varies, holding others constant</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox checked={showConfidence} onCheckedChange={setShowConfidence} />
                <span className="text-sm text-foreground">Show confidence intervals</span>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {showConfidence ? (
                <AreaChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="value"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => (value > 1000000 ? `${(value / 1000000).toFixed(1)}M` : value.toString())}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 1]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelFormatter={(value) =>
                      `${selectedFeature}: ${value > 1000000 ? `${(value / 1000000).toFixed(1)}M` : value}`
                    }
                    formatter={(value: any, name) => [
                      `${(value * 100).toFixed(1)}%`,
                      name === "prediction" ? "Prediction" : "Confidence",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="confidence"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.1}
                    strokeWidth={0}
                  />
                  <Line
                    type="monotone"
                    dataKey="prediction"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  />
                </AreaChart>
              ) : (
                <LineChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="value"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => (value > 1000000 ? `${(value / 1000000).toFixed(1)}M` : value.toString())}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 1]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelFormatter={(value) =>
                      `${selectedFeature}: ${value > 1000000 ? `${(value / 1000000).toFixed(1)}M` : value}`
                    }
                    formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, "Prediction"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="prediction"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-sm text-muted-foreground">Min Prediction</div>
              <div className="text-lg font-bold text-foreground">
                {(Math.min(...currentData.map((d) => d.prediction)) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-sm text-muted-foreground">Max Prediction</div>
              <div className="text-lg font-bold text-foreground">
                {(Math.max(...currentData.map((d) => d.prediction)) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-sm text-muted-foreground">Range</div>
              <div className="text-lg font-bold text-foreground">
                {(
                  (Math.max(...currentData.map((d) => d.prediction)) -
                    Math.min(...currentData.map((d) => d.prediction))) *
                  100
                ).toFixed(1)}
                %
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Interactions */}
      {showInteraction && (
        <Card>
          <CardHeader>
            <CardTitle>Feature Interactions</CardTitle>
            <CardDescription>
              2D partial dependence showing interaction between severity_score and bytes_transferred
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center font-medium text-foreground">Bytes Transferred →</div>
                <div className="text-center text-sm text-muted-foreground">1MB</div>
                <div className="text-center text-sm text-muted-foreground">3MB</div>
                <div className="text-center text-sm text-muted-foreground">5MB</div>
              </div>

              {[20, 50, 80].map((severity) => (
                <div key={severity} className="grid grid-cols-4 gap-4 items-center">
                  <div className="text-right font-medium text-foreground">Severity {severity}</div>
                  {[1000000, 3000000, 5000000].map((bytes) => {
                    const interaction = interactionData.find((d) => d.severity === severity && d.bytes === bytes)
                    return (
                      <div
                        key={bytes}
                        className="p-3 rounded-lg text-center"
                        style={{
                          backgroundColor: `hsl(var(--primary) / ${interaction?.prediction || 0})`,
                          border: "1px solid hsl(var(--border))",
                        }}
                      >
                        <div className="font-bold text-foreground">
                          {((interaction?.prediction || 0) * 100).toFixed(0)}%
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(var(--primary) / 0.2)" }}></div>
                  <span>Low Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(var(--primary) / 0.6)" }}></div>
                  <span>Medium Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(var(--primary) / 1.0)" }}></div>
                  <span>High Risk</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
