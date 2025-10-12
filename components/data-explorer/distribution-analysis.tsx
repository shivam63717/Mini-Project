"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { BarChart3, TrendingUp, Download, Settings } from "lucide-react"

const histogramData = [
  { range: "0-10", count: 1250, percentage: 12.5 },
  { range: "10-20", count: 2100, percentage: 21.0 },
  { range: "20-30", count: 3200, percentage: 32.0 },
  { range: "30-40", count: 1800, percentage: 18.0 },
  { range: "40-50", count: 1100, percentage: 11.0 },
  { range: "50-60", count: 350, percentage: 3.5 },
  { range: "60-70", count: 150, percentage: 1.5 },
  { range: "70-80", count: 50, percentage: 0.5 },
]

const distributionStats = [
  { metric: "Mean", value: "24.7", unit: "" },
  { metric: "Median", value: "22.1", unit: "" },
  { metric: "Mode", value: "25.0", unit: "" },
  { metric: "Std Dev", value: "12.4", unit: "" },
  { metric: "Skewness", value: "0.34", unit: "" },
  { metric: "Kurtosis", value: "-0.12", unit: "" },
]

const boxPlotData = [
  { feature: "severity_score", min: 0, q1: 15, median: 25, q3: 35, max: 80, outliers: [85, 90, 95] },
  { feature: "bytes_transferred", min: 100, q1: 1500, median: 3200, q3: 5800, max: 12000, outliers: [15000, 18000] },
  { feature: "connection_duration", min: 0.1, q1: 2.5, median: 5.2, q3: 8.9, max: 15.0, outliers: [18.5, 22.1] },
]

export function DistributionAnalysis() {
  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Distribution Analysis
              </CardTitle>
              <CardDescription>Analyze the distribution patterns of your features</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="severity_score">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select feature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="severity_score">Severity Score</SelectItem>
                  <SelectItem value="bytes_transferred">Bytes Transferred</SelectItem>
                  <SelectItem value="connection_duration">Connection Duration</SelectItem>
                  <SelectItem value="failed_attempts">Failed Attempts</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Distribution Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Histogram</CardTitle>
            <CardDescription>Frequency distribution of severity_score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistical Summary</CardTitle>
            <CardDescription>Key distribution metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {distributionStats.map((stat) => (
                <div key={stat.metric} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{stat.metric}</span>
                  <span className="font-medium text-foreground">
                    {stat.value}
                    {stat.unit}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Distribution Shape</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Normality</span>
                  <Badge variant="secondary">Right-skewed</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Outliers</span>
                  <Badge variant="destructive">12 detected</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Box Plots */}
      <Card>
        <CardHeader>
          <CardTitle>Box Plot Analysis</CardTitle>
          <CardDescription>Quartile distribution and outlier detection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {boxPlotData.map((feature, index) => (
              <div key={feature.feature} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">{feature.feature}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Min: {feature.min}</span>
                    <span>Q1: {feature.q1}</span>
                    <span>Median: {feature.median}</span>
                    <span>Q3: {feature.q3}</span>
                    <span>Max: {feature.max}</span>
                  </div>
                </div>

                <div className="relative h-12 bg-muted/30 rounded-lg">
                  {/* Box plot visualization */}
                  <div className="absolute inset-y-2 flex items-center w-full px-4">
                    {/* Whiskers */}
                    <div className="w-full h-0.5 bg-border"></div>

                    {/* Box */}
                    <div
                      className="absolute h-6 bg-primary/20 border-2 border-primary rounded"
                      style={{
                        left: `${(feature.q1 / feature.max) * 80 + 10}%`,
                        width: `${((feature.q3 - feature.q1) / feature.max) * 80}%`,
                      }}
                    >
                      {/* Median line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-primary"
                        style={{
                          left: `${((feature.median - feature.q1) / (feature.q3 - feature.q1)) * 100}%`,
                        }}
                      ></div>
                    </div>

                    {/* Outliers */}
                    {feature.outliers.map((outlier, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-destructive rounded-full"
                        style={{
                          left: `${(outlier / feature.max) * 80 + 10}%`,
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                      ></div>
                    ))}
                  </div>
                </div>

                {feature.outliers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">
                      {feature.outliers.length} outliers
                    </Badge>
                    <span className="text-xs text-muted-foreground">Values: {feature.outliers.join(", ")}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Density Plot */}
      <Card>
        <CardHeader>
          <CardTitle>Probability Density</CardTitle>
          <CardDescription>Smooth distribution curve estimation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
