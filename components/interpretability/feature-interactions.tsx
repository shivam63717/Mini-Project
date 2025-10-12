"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Network, Download, RefreshCw, Zap } from "lucide-react"

const interactionStrengths = [
  { feature1: "severity_score", feature2: "bytes_transferred", strength: 0.78, type: "Synergistic" },
  { feature1: "connection_duration", feature2: "failed_attempts", strength: 0.65, type: "Antagonistic" },
  { feature1: "severity_score", feature2: "connection_duration", strength: 0.52, type: "Synergistic" },
  { feature1: "bytes_transferred", feature2: "failed_attempts", strength: 0.43, type: "Synergistic" },
  { feature1: "source_port", feature2: "hour_of_day", strength: 0.21, type: "Weak" },
  { feature1: "severity_score", feature2: "source_port", strength: 0.18, type: "Weak" },
]

const interactionMatrix = [
  ["", "severity_score", "bytes_transferred", "connection_duration", "failed_attempts", "source_port"],
  ["severity_score", 1.0, 0.78, 0.52, 0.34, 0.18],
  ["bytes_transferred", 0.78, 1.0, 0.29, 0.43, 0.12],
  ["connection_duration", 0.52, 0.29, 1.0, 0.65, 0.08],
  ["failed_attempts", 0.34, 0.43, 0.65, 1.0, 0.15],
  ["source_port", 0.18, 0.12, 0.08, 0.15, 1.0],
]

const detailedInteraction = {
  features: ["severity_score", "bytes_transferred"],
  data: [
    { x: 15, y: 1000000, prediction: 0.25, interaction: 0.12 },
    { x: 25, y: 1500000, prediction: 0.35, interaction: 0.18 },
    { x: 35, y: 2000000, prediction: 0.48, interaction: 0.25 },
    { x: 45, y: 2500000, prediction: 0.62, interaction: 0.34 },
    { x: 55, y: 3000000, prediction: 0.74, interaction: 0.45 },
    { x: 65, y: 3500000, prediction: 0.83, interaction: 0.58 },
    { x: 75, y: 4000000, prediction: 0.89, interaction: 0.72 },
    { x: 85, y: 4500000, prediction: 0.94, interaction: 0.85 },
    { x: 95, y: 5000000, prediction: 0.97, interaction: 0.92 },
  ],
}

function getInteractionColor(strength: number): string {
  if (strength >= 0.7) return "hsl(var(--destructive))"
  if (strength >= 0.5) return "hsl(var(--warning))"
  if (strength >= 0.3) return "hsl(var(--primary))"
  return "hsl(var(--muted-foreground))"
}

function getInteractionIntensity(strength: number): string {
  if (strength >= 0.7) return "opacity-90"
  if (strength >= 0.5) return "opacity-70"
  if (strength >= 0.3) return "opacity-50"
  return "opacity-30"
}

export function FeatureInteractions() {
  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" />
                Feature Interactions
              </CardTitle>
              <CardDescription>Discover how features work together to influence predictions</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="h-statistic">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h-statistic">H-Statistic</SelectItem>
                  <SelectItem value="permutation">Permutation Test</SelectItem>
                  <SelectItem value="shap-interaction">SHAP Interaction</SelectItem>
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

      {/* Interaction Strength Ranking */}
      <Card>
        <CardHeader>
          <CardTitle>Interaction Strength Ranking</CardTitle>
          <CardDescription>Strongest feature interactions detected in your model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {interactionStrengths.map((interaction, index) => (
              <div
                key={`${interaction.feature1}-${interaction.feature2}`}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {interaction.feature1} × {interaction.feature2}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {interaction.type === "Synergistic"
                        ? "Features amplify each other's effects"
                        : interaction.type === "Antagonistic"
                          ? "Features counteract each other"
                          : "Weak interaction detected"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge
                    variant={
                      interaction.type === "Synergistic"
                        ? "default"
                        : interaction.type === "Antagonistic"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {interaction.type}
                  </Badge>
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">{interaction.strength.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">H-Statistic</div>
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

      {/* Interaction Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Interaction Matrix</CardTitle>
          <CardDescription>Pairwise interaction strengths between all features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-destructive rounded"></div>
                <span>Strong (0.7+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-warning rounded"></div>
                <span>Moderate (0.5-0.7)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded"></div>
                <span>Weak (0.3-0.5)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-muted-foreground rounded"></div>
                <span>Very Weak (0-0.3)</span>
              </div>
            </div>

            {/* Matrix Grid */}
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                <div className="grid grid-cols-6 gap-1 text-xs">
                  {interactionMatrix.map((row, rowIndex) => (
                    <>
                      {row.map((cell, colIndex) => {
                        if (rowIndex === 0 || colIndex === 0) {
                          // Header cells
                          return (
                            <div
                              key={`${rowIndex}-${colIndex}`}
                              className="p-2 text-center font-medium text-muted-foreground bg-muted/30 rounded"
                            >
                              {typeof cell === "string"
                                ? colIndex === 0 && rowIndex > 0
                                  ? cell.slice(0, 8) + "..."
                                  : cell
                                : ""}
                            </div>
                          )
                        } else {
                          // Data cells
                          const value = cell as number
                          return (
                            <div
                              key={`${rowIndex}-${colIndex}`}
                              className={`
                                relative p-2 text-center font-medium text-white rounded
                                ${value >= 0.7 ? "bg-destructive" : value >= 0.5 ? "bg-warning" : value >= 0.3 ? "bg-primary" : "bg-muted-foreground"}
                                ${value >= 0.7 ? "opacity-90" : value >= 0.5 ? "opacity-70" : value >= 0.3 ? "opacity-50" : "opacity-30"}
                                hover:scale-110 transition-transform cursor-pointer
                              `}
                              title={`${interactionMatrix[0][colIndex]} × ${interactionMatrix[rowIndex][0]}: ${value.toFixed(2)}`}
                            >
                              {value === 1.0 ? "1.0" : value.toFixed(2)}
                            </div>
                          )
                        }
                      })}
                    </>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Interaction Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Detailed Interaction: {detailedInteraction.features.join(" × ")}
              </CardTitle>
              <CardDescription>How these features interact to influence model predictions</CardDescription>
            </div>
            <Select defaultValue="severity_score-bytes_transferred">
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="severity_score-bytes_transferred">Severity Score × Bytes Transferred</SelectItem>
                <SelectItem value="connection_duration-failed_attempts">
                  Connection Duration × Failed Attempts
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-4">Interaction Scatter Plot</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={detailedInteraction.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      name="Severity Score"
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      name="Bytes Transferred"
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any, name) => [
                        name === "prediction" ? `${(value * 100).toFixed(1)}%` : value,
                        name === "prediction" ? "Prediction" : name,
                      ]}
                    />
                    <Scatter dataKey="prediction" fill="hsl(var(--primary))">
                      {detailedInteraction.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getInteractionColor(entry.interaction)} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-4">Interaction Effects</h4>
              <div className="space-y-4">
                {detailedInteraction.data.slice(0, 6).map((point, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        Severity: {point.x}, Bytes: {(point.y / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Interaction strength: {point.interaction.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground">{(point.prediction * 100).toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Prediction</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-info/10 border border-info/20">
                <div className="text-sm">
                  <p className="font-medium text-info">Synergistic Interaction</p>
                  <p className="text-info/80 text-xs mt-1">
                    High severity scores combined with large byte transfers create a multiplicative effect, leading to
                    higher threat predictions than either feature alone would suggest.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
