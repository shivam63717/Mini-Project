"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts"
import { AlertTriangle, Zap, Settings, Eye, Shield } from "lucide-react"
import { useState } from "react"

const anomalyData = [
  { x: 23, y: 45, anomaly: false, score: 0.12, timestamp: "2024-01-15 09:15" },
  { x: 67, y: 89, anomaly: true, score: 0.89, timestamp: "2024-01-15 09:23" },
  { x: 34, y: 12, anomaly: false, score: 0.08, timestamp: "2024-01-15 09:31" },
  { x: 78, y: 56, anomaly: false, score: 0.15, timestamp: "2024-01-15 09:45" },
  { x: 12, y: 78, anomaly: true, score: 0.92, timestamp: "2024-01-15 10:12" },
  { x: 89, y: 23, anomaly: true, score: 0.87, timestamp: "2024-01-15 10:34" },
  { x: 45, y: 67, anomaly: false, score: 0.11, timestamp: "2024-01-15 10:56" },
  { x: 56, y: 34, anomaly: false, score: 0.09, timestamp: "2024-01-15 11:23" },
  { x: 90, y: 78, anomaly: true, score: 0.94, timestamp: "2024-01-15 11:45" },
  { x: 15, y: 90, anomaly: false, score: 0.13, timestamp: "2024-01-15 12:01" },
]

const anomalyTimeSeries = [
  { time: "09:00", score: 0.12, threshold: 0.7 },
  { time: "09:15", score: 0.15, threshold: 0.7 },
  { time: "09:30", score: 0.89, threshold: 0.7 },
  { time: "09:45", score: 0.23, threshold: 0.7 },
  { time: "10:00", score: 0.18, threshold: 0.7 },
  { time: "10:15", score: 0.92, threshold: 0.7 },
  { time: "10:30", score: 0.87, threshold: 0.7 },
  { time: "10:45", score: 0.11, threshold: 0.7 },
  { time: "11:00", score: 0.09, threshold: 0.7 },
  { time: "11:15", score: 0.94, threshold: 0.7 },
  { time: "11:30", score: 0.13, threshold: 0.7 },
  { time: "11:45", score: 0.16, threshold: 0.7 },
]

const detectedAnomalies = [
  {
    id: "anom_001",
    timestamp: "2024-01-15 10:34:22",
    type: "Network Traffic",
    severity: "high",
    score: 0.94,
    description: "Unusual spike in outbound traffic to unknown destination",
    features: ["bytes_out: 15.2MB", "connections: 847", "duration: 2.3s"],
    status: "investigating",
  },
  {
    id: "anom_002",
    timestamp: "2024-01-15 09:23:15",
    type: "Authentication",
    severity: "critical",
    score: 0.89,
    description: "Multiple failed login attempts from suspicious IP",
    features: ["failed_attempts: 23", "source_ip: 192.168.1.100", "user_agent: unknown"],
    status: "confirmed",
  },
  {
    id: "anom_003",
    timestamp: "2024-01-15 11:45:33",
    type: "Data Access",
    severity: "medium",
    score: 0.76,
    description: "Unusual database query pattern detected",
    features: ["query_count: 156", "tables_accessed: 12", "execution_time: 45s"],
    status: "false_positive",
  },
]

const featureImportance = [
  { feature: "bytes_transferred", importance: 0.23 },
  { feature: "connection_duration", importance: 0.19 },
  { feature: "failed_attempts", importance: 0.17 },
  { feature: "unique_destinations", importance: 0.15 },
  { feature: "request_frequency", importance: 0.12 },
  { feature: "payload_entropy", importance: 0.08 },
  { feature: "time_of_day", importance: 0.06 },
]

export default function AnomalyDetection() {
  const [algorithm, setAlgorithm] = useState("isolation_forest")
  const [threshold, setThreshold] = useState([0.7])
  const [sensitivity, setSensitivity] = useState([0.8])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "investigating":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "false_positive":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-red-400" />
            Anomaly Detection
          </h2>
          <p className="text-slate-400 mt-1">Identify unusual patterns and potential security threats</p>
        </div>
        <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
          <Eye className="h-4 w-4 mr-2" />
          Real-time Monitor
        </Button>
      </div>

      {/* Detection Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Critical</p>
                <p className="text-2xl font-bold text-red-400">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">High</p>
                <p className="text-2xl font-bold text-orange-400">7</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Medium</p>
                <p className="text-2xl font-bold text-yellow-400">15</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Shield className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Accuracy</p>
                <p className="text-2xl font-bold text-green-400">94.7%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-slate-400" />
            Detection Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label>Algorithm</Label>
              <Select value={algorithm} onValueChange={setAlgorithm}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="isolation_forest">Isolation Forest</SelectItem>
                  <SelectItem value="one_class_svm">One-Class SVM</SelectItem>
                  <SelectItem value="local_outlier">Local Outlier Factor</SelectItem>
                  <SelectItem value="autoencoder">Autoencoder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Threshold: {threshold[0]}</Label>
              <Slider value={threshold} onValueChange={setThreshold} max={1} min={0.1} step={0.1} className="w-full" />
            </div>
            <div className="space-y-2">
              <Label>Sensitivity: {sensitivity[0]}</Label>
              <Slider
                value={sensitivity}
                onValueChange={setSensitivity}
                max={1}
                min={0.1}
                step={0.1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Window Size</Label>
              <Input placeholder="1000" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomaly Scatter Plot */}
        <Card>
          <CardHeader>
            <CardTitle>Anomaly Visualization</CardTitle>
            <CardDescription>2D projection showing normal vs anomalous data points</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart data={anomalyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="x" stroke="#9ca3af" />
                <YAxis dataKey="y" stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  formatter={(value, name, props) => [
                    name === "score" ? `Score: ${value}` : value,
                    props.payload.anomaly ? "Anomaly" : "Normal",
                  ]}
                />
                <Scatter data={anomalyData.filter((d) => !d.anomaly)} fill="#06b6d4" name="Normal" shape="circle" />
                <Scatter data={anomalyData.filter((d) => d.anomaly)} fill="#ef4444" name="Anomaly" shape="triangle" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Anomaly Score Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Anomaly Score Timeline</CardTitle>
            <CardDescription>Real-time anomaly scores with detection threshold</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={anomalyTimeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={2} name="Anomaly Score" />
                <Line
                  type="monotone"
                  dataKey="threshold"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Threshold"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detected Anomalies */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Anomalies</CardTitle>
          <CardDescription>Detailed view of detected anomalous events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {detectedAnomalies.map((anomaly) => (
              <div key={anomaly.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div>
                      <h3 className="font-semibold">{anomaly.type}</h3>
                      <p className="text-sm text-slate-400">{anomaly.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(anomaly.severity)}>{anomaly.severity}</Badge>
                    <Badge className={getStatusColor(anomaly.status)}>{anomaly.status.replace("_", " ")}</Badge>
                    <Badge variant="outline">Score: {anomaly.score}</Badge>
                  </div>
                </div>
                <p className="text-sm mb-3">{anomaly.description}</p>
                <div className="flex flex-wrap gap-2">
                  {anomaly.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Importance */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Importance for Anomaly Detection</CardTitle>
          <CardDescription>Which features contribute most to anomaly detection</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={featureImportance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="feature" type="category" stroke="#9ca3af" width={120} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="importance" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
