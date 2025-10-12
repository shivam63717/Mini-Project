"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Download, Filter } from "lucide-react"

const correlationData = [
  { feature1: "severity_score", feature2: "threat_level", correlation: 0.89, strength: "Very Strong" },
  { feature1: "bytes_transferred", feature2: "connection_duration", correlation: 0.76, strength: "Strong" },
  { feature1: "failed_attempts", feature2: "security_alerts", correlation: 0.68, strength: "Moderate" },
  { feature1: "source_port", feature2: "destination_port", correlation: -0.12, strength: "Weak" },
  { feature1: "packet_size", feature2: "response_time", correlation: 0.45, strength: "Moderate" },
]

const heatmapData = [
  ["severity_score", "threat_level", "bytes_transferred", "failed_attempts", "packet_size"],
  [1.0, 0.89, 0.34, 0.56, 0.23],
  [0.89, 1.0, 0.28, 0.67, 0.19],
  [0.34, 0.28, 1.0, 0.76, 0.45],
  [0.56, 0.67, 0.76, 1.0, 0.31],
  [0.23, 0.19, 0.45, 0.31, 1.0],
]

function getCorrelationColor(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 0.8) return "bg-red-500"
  if (abs >= 0.6) return "bg-orange-500"
  if (abs >= 0.4) return "bg-yellow-500"
  if (abs >= 0.2) return "bg-blue-500"
  return "bg-gray-500"
}

function getCorrelationIntensity(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 0.8) return "opacity-90"
  if (abs >= 0.6) return "opacity-70"
  if (abs >= 0.4) return "opacity-50"
  if (abs >= 0.2) return "opacity-30"
  return "opacity-10"
}

export function CorrelationMatrix() {
  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Correlation Analysis
              </CardTitle>
              <CardDescription>Explore relationships between numerical features</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="pearson">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pearson">Pearson</SelectItem>
                  <SelectItem value="spearman">Spearman</SelectItem>
                  <SelectItem value="kendall">Kendall</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Correlation Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Correlation Heatmap</CardTitle>
          <CardDescription>Visual representation of feature correlations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Very Strong (0.8+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>Strong (0.6-0.8)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>Moderate (0.4-0.6)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Weak (0.2-0.4)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <span>Very Weak (0-0.2)</span>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                <div className="grid grid-cols-6 gap-1 text-xs">
                  {/* Header row */}
                  <div></div>
                  {heatmapData[0].map((feature, index) => (
                    <div
                      key={index}
                      className="p-2 text-center font-medium text-muted-foreground transform -rotate-45 origin-center"
                    >
                      {feature}
                    </div>
                  ))}

                  {/* Data rows */}
                  {heatmapData.slice(1).map((row, rowIndex) => (
                    <>
                      <div key={`label-${rowIndex}`} className="p-2 text-right font-medium text-muted-foreground">
                        {heatmapData[0][rowIndex]}
                      </div>
                      {row.map((value, colIndex) => (
                        <div
                          key={`cell-${rowIndex}-${colIndex}`}
                          className={`
                            relative p-2 text-center font-medium text-white rounded
                            ${getCorrelationColor(value)} ${getCorrelationIntensity(value)}
                            hover:scale-110 transition-transform cursor-pointer
                          `}
                          title={`${heatmapData[0][rowIndex]} vs ${heatmapData[0][colIndex]}: ${value.toFixed(2)}`}
                        >
                          {value.toFixed(2)}
                        </div>
                      ))}
                    </>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Correlations */}
      <Card>
        <CardHeader>
          <CardTitle>Strongest Correlations</CardTitle>
          <CardDescription>Features with the highest correlation coefficients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {correlationData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {item.feature1} ↔ {item.feature2}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.correlation > 0 ? "Positive" : "Negative"} correlation
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge
                    variant={
                      Math.abs(item.correlation) >= 0.8
                        ? "destructive"
                        : Math.abs(item.correlation) >= 0.6
                          ? "default"
                          : "secondary"
                    }
                  >
                    {item.strength}
                  </Badge>
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">{item.correlation.toFixed(2)}</div>
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
    </div>
  )
}
