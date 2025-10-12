"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts"
import { TrendingUp, Calendar, AlertTriangle, Download } from "lucide-react"
import { useState } from "react"

const timeSeriesData = [
  { timestamp: "2024-01-01", threats: 45, anomalies: 12, normal: 1200, prediction: 48 },
  { timestamp: "2024-01-02", threats: 52, anomalies: 18, normal: 1180, prediction: 55 },
  { timestamp: "2024-01-03", threats: 38, anomalies: 8, normal: 1250, prediction: 42 },
  { timestamp: "2024-01-04", threats: 67, anomalies: 25, normal: 1100, prediction: 70 },
  { timestamp: "2024-01-05", threats: 89, anomalies: 34, normal: 980, prediction: 85 },
  { timestamp: "2024-01-06", threats: 76, anomalies: 28, normal: 1050, prediction: 78 },
  { timestamp: "2024-01-07", threats: 43, anomalies: 15, normal: 1220, prediction: 45 },
  { timestamp: "2024-01-08", threats: 58, anomalies: 22, normal: 1150, prediction: 60 },
  { timestamp: "2024-01-09", threats: 71, anomalies: 31, normal: 1080, prediction: 68 },
  { timestamp: "2024-01-10", threats: 92, anomalies: 38, normal: 950, prediction: 95 },
  { timestamp: "2024-01-11", threats: 84, anomalies: 35, normal: 1000, prediction: 88 },
  { timestamp: "2024-01-12", threats: 61, anomalies: 24, normal: 1140, prediction: 65 },
  { timestamp: "2024-01-13", threats: 49, anomalies: 19, normal: 1190, prediction: 52 },
  { timestamp: "2024-01-14", threats: 73, anomalies: 29, normal: 1070, prediction: 75 },
]

const seasonalityData = [
  { hour: "00:00", monday: 23, tuesday: 18, wednesday: 21, thursday: 19, friday: 35, saturday: 45, sunday: 38 },
  { hour: "04:00", monday: 12, tuesday: 8, wednesday: 15, thursday: 11, friday: 18, saturday: 28, sunday: 22 },
  { hour: "08:00", monday: 67, tuesday: 72, wednesday: 69, thursday: 74, friday: 89, saturday: 34, sunday: 28 },
  { hour: "12:00", monday: 89, tuesday: 94, wednesday: 87, thursday: 92, friday: 98, saturday: 56, sunday: 43 },
  { hour: "16:00", monday: 76, tuesday: 81, wednesday: 78, thursday: 83, friday: 95, saturday: 67, sunday: 52 },
  { hour: "20:00", monday: 45, tuesday: 42, wednesday: 48, thursday: 44, friday: 78, saturday: 89, sunday: 76 },
]

const forecastData = [
  { date: "2024-01-15", actual: null, forecast: 58, confidence_lower: 45, confidence_upper: 71 },
  { date: "2024-01-16", actual: null, forecast: 62, confidence_lower: 48, confidence_upper: 76 },
  { date: "2024-01-17", actual: null, forecast: 55, confidence_lower: 42, confidence_upper: 68 },
  { date: "2024-01-18", actual: null, forecast: 71, confidence_lower: 58, confidence_upper: 84 },
  { date: "2024-01-19", actual: null, forecast: 68, confidence_lower: 55, confidence_upper: 81 },
  { date: "2024-01-20", actual: null, forecast: 74, confidence_lower: 61, confidence_upper: 87 },
  { date: "2024-01-21", actual: null, forecast: 66, confidence_lower: 53, confidence_upper: 79 },
]

export default function TimeSeriesAnalysis() {
  const [selectedMetric, setSelectedMetric] = useState("threats")
  const [timeRange, setTimeRange] = useState("7d")

  const trendAnalysis = {
    threats: { trend: "increasing", change: 23.4, significance: "high" },
    anomalies: { trend: "stable", change: 2.1, significance: "low" },
    normal: { trend: "decreasing", change: -8.7, significance: "medium" },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-cyan-400" />
            Time Series Analysis
          </h2>
          <p className="text-slate-400 mt-1">Analyze temporal patterns and forecast future trends</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Trend Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(trendAnalysis).map(([metric, analysis]) => (
          <Card key={metric} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium capitalize">{metric}</span>
                <Badge
                  variant="outline"
                  className={
                    analysis.significance === "high"
                      ? "border-red-500/30 text-red-400"
                      : analysis.significance === "medium"
                        ? "border-yellow-500/30 text-yellow-400"
                        : "border-green-500/30 text-green-400"
                  }
                >
                  {analysis.significance}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-2xl font-bold ${
                    analysis.trend === "increasing"
                      ? "text-red-400"
                      : analysis.trend === "decreasing"
                        ? "text-green-400"
                        : "text-blue-400"
                  }`}
                >
                  {analysis.change > 0 ? "+" : ""}
                  {analysis.change.toFixed(1)}%
                </span>
                <TrendingUp
                  className={`h-4 w-4 ${
                    analysis.trend === "increasing"
                      ? "text-red-400 rotate-0"
                      : analysis.trend === "decreasing"
                        ? "text-green-400 rotate-180"
                        : "text-blue-400 rotate-90"
                  }`}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1 capitalize">{analysis.trend} trend detected</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Time Series Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Threat Activity Over Time</CardTitle>
              <CardDescription>Historical data with trend analysis and predictions</CardDescription>
            </div>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="threats">Threats</SelectItem>
                <SelectItem value="anomalies">Anomalies</SelectItem>
                <SelectItem value="normal">Normal Traffic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="timestamp" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                fill="#06b6d4"
                fillOpacity={0.1}
                stroke="#06b6d4"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="prediction"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Prediction"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seasonality Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              Seasonality Patterns
            </CardTitle>
            <CardDescription>Weekly patterns in threat activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={seasonalityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="monday" stroke="#8b5cf6" strokeWidth={2} name="Monday" />
                <Line type="monotone" dataKey="tuesday" stroke="#06b6d4" strokeWidth={2} name="Tuesday" />
                <Line type="monotone" dataKey="wednesday" stroke="#10b981" strokeWidth={2} name="Wednesday" />
                <Line type="monotone" dataKey="thursday" stroke="#f59e0b" strokeWidth={2} name="Thursday" />
                <Line type="monotone" dataKey="friday" stroke="#ef4444" strokeWidth={2} name="Friday" />
                <Line type="monotone" dataKey="saturday" stroke="#f97316" strokeWidth={2} name="Saturday" />
                <Line type="monotone" dataKey="sunday" stroke="#84cc16" strokeWidth={2} name="Sunday" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Forecast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              7-Day Forecast
            </CardTitle>
            <CardDescription>Predicted threat levels with confidence intervals</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="confidence_upper"
                  stackId="1"
                  stroke="none"
                  fill="#f59e0b"
                  fillOpacity={0.1}
                />
                <Area
                  type="monotone"
                  dataKey="confidence_lower"
                  stackId="1"
                  stroke="none"
                  fill="#ffffff"
                  fillOpacity={1}
                />
                <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={3} name="Forecast" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Anomaly Detection in Time Series */}
      <Card>
        <CardHeader>
          <CardTitle>Temporal Anomaly Detection</CardTitle>
          <CardDescription>Identify unusual patterns and outliers in time series data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="font-medium text-red-400">Critical Anomalies</span>
                </div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-slate-400">Last 24 hours</p>
              </div>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <span className="font-medium text-yellow-400">Moderate Anomalies</span>
                </div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-slate-400">Last 24 hours</p>
              </div>
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span className="font-medium text-blue-400">Trend Changes</span>
                </div>
                <p className="text-2xl font-bold">7</p>
                <p className="text-sm text-slate-400">Last 7 days</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Recent Anomalies</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <div>
                      <p className="font-medium">Unusual spike in threat activity</p>
                      <p className="text-sm text-slate-400">2024-01-10 14:23 - 340% above normal</p>
                    </div>
                  </div>
                  <Badge variant="destructive">Critical</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div>
                      <p className="font-medium">Unexpected traffic pattern</p>
                      <p className="text-sm text-slate-400">2024-01-09 09:15 - Unusual timing</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Moderate</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div>
                      <p className="font-medium">Trend reversal detected</p>
                      <p className="text-sm text-slate-400">2024-01-08 16:45 - Significant change</p>
                    </div>
                  </div>
                  <Badge variant="outline">Info</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
