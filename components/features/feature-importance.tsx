"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Target, Download, RefreshCw, TrendingUp, AlertCircle } from "lucide-react"

const featureImportanceData = [
  { feature: "severity_score", importance: 0.342, method: "Random Forest", rank: 1 },
  { feature: "bytes_transferred", importance: 0.287, method: "Random Forest", rank: 2 },
  { feature: "connection_duration", importance: 0.156, method: "Random Forest", rank: 3 },
  { feature: "failed_attempts", importance: 0.098, method: "Random Forest", rank: 4 },
  { feature: "source_port", importance: 0.067, method: "Random Forest", rank: 5 },
  { feature: "hour_of_day", importance: 0.034, method: "Random Forest", rank: 6 },
  { feature: "is_weekend", importance: 0.016, method: "Random Forest", rank: 7 },
]

const shapValues = [
  { feature: "severity_score", shapValue: 2.45, impact: "High", direction: "Positive" },
  { feature: "bytes_transferred", shapValue: 1.87, impact: "High", direction: "Positive" },
  { feature: "connection_duration", shapValue: -1.23, impact: "Medium", direction: "Negative" },
  { feature: "failed_attempts", shapValue: 0.89, impact: "Medium", direction: "Positive" },
  { feature: "source_port", shapValue: -0.45, impact: "Low", direction: "Negative" },
]

const permutationImportance = [
  { feature: "severity_score", baseline: 0.942, permuted: 0.756, drop: 0.186, rank: 1 },
  { feature: "bytes_transferred", baseline: 0.942, permuted: 0.823, drop: 0.119, rank: 2 },
  { feature: "connection_duration", baseline: 0.942, permuted: 0.887, drop: 0.055, rank: 3 },
  { feature: "failed_attempts", baseline: 0.942, permuted: 0.912, drop: 0.03, rank: 4 },
]

function getImportanceColor(importance: number): string {
  if (importance >= 0.3) return "hsl(var(--destructive))"
  if (importance >= 0.2) return "hsl(var(--warning))"
  if (importance >= 0.1) return "hsl(var(--primary))"
  return "hsl(var(--muted-foreground))"
}

function getImpactColor(impact: string): "destructive" | "default" | "secondary" {
  switch (impact) {
    case "High":
      return "destructive"
    case "Medium":
      return "default"
    case "Low":
      return "secondary"
    default:
      return "secondary"
  }
}

export function FeatureImportance() {
  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Feature Importance Analysis
              </CardTitle>
              <CardDescription>Understand which features contribute most to your model predictions</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="random-forest">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random-forest">Random Forest</SelectItem>
                  <SelectItem value="xgboost">XGBoost</SelectItem>
                  <SelectItem value="permutation">Permutation</SelectItem>
                  <SelectItem value="shap">SHAP Values</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Recalculate
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Feature Importance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Importance Ranking</CardTitle>
          <CardDescription>Relative importance of features based on Random Forest model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportanceData} layout="horizontal">
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
                <Bar dataKey="importance" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Importance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Feature Importance Details</CardTitle>
            <CardDescription>Detailed breakdown of feature contributions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {featureImportanceData.map((feature, index) => (
                <div
                  key={feature.feature}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-medium text-xs">
                      {feature.rank}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{feature.feature}</h4>
                      <p className="text-xs text-muted-foreground">Method: {feature.method}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-foreground">{(feature.importance * 100).toFixed(1)}%</div>
                    </div>
                    <div className="w-20">
                      <Progress value={feature.importance * 100} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              SHAP Values
            </CardTitle>
            <CardDescription>Feature contributions to individual predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shapValues.map((feature, index) => (
                <div
                  key={feature.feature}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent font-medium text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{feature.feature}</h4>
                      <p className="text-xs text-muted-foreground">{feature.direction} impact</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={getImpactColor(feature.impact)}>{feature.impact}</Badge>
                    <div className="text-right">
                      <div className={`font-bold ${feature.shapValue > 0 ? "text-success" : "text-destructive"}`}>
                        {feature.shapValue > 0 ? "+" : ""}
                        {feature.shapValue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-lg bg-info/10 border border-info/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-info mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-info">SHAP Interpretation</p>
                  <p className="text-info/80 text-xs mt-1">
                    Positive values increase prediction probability, negative values decrease it.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permutation Importance */}
      <Card>
        <CardHeader>
          <CardTitle>Permutation Importance</CardTitle>
          <CardDescription>Model performance drop when each feature is randomly shuffled</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {permutationImportance.map((feature, index) => (
              <div
                key={feature.feature}
                className="flex items-center justify-between p-4 rounded-lg border border-border"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-warning/10 text-warning font-medium text-sm">
                    {feature.rank}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{feature.feature}</h4>
                    <p className="text-sm text-muted-foreground">
                      Baseline: {feature.baseline.toFixed(3)} → Permuted: {feature.permuted.toFixed(3)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-destructive">-{(feature.drop * 100).toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Performance drop</div>
                  </div>
                  <div className="w-24">
                    <Progress value={feature.drop * 500} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
