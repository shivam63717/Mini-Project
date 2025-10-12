"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import { Brain, Settings, Play, Download, Users } from "lucide-react"
import { useState } from "react"

const clusterData = [
  { x: 23, y: 45, cluster: 0, size: 120, label: "Normal Web Traffic" },
  { x: 67, y: 89, cluster: 1, size: 85, label: "Suspicious Activity" },
  { x: 34, y: 12, cluster: 2, size: 200, label: "Database Queries" },
  { x: 78, y: 56, cluster: 3, size: 95, label: "File Transfers" },
  { x: 12, y: 78, cluster: 4, size: 150, label: "Authentication" },
  { x: 89, y: 23, cluster: 1, size: 75, label: "Potential Threats" },
  { x: 45, y: 67, cluster: 0, size: 110, label: "Regular Traffic" },
  { x: 56, y: 34, cluster: 2, size: 180, label: "Data Access" },
  { x: 90, y: 78, cluster: 3, size: 90, label: "Large Transfers" },
  { x: 15, y: 90, cluster: 4, size: 140, label: "Login Attempts" },
]

const clusterSummary = [
  {
    id: 0,
    name: "Normal Web Traffic",
    size: 342,
    percentage: 45.2,
    characteristics: ["Low severity", "Regular patterns", "Standard ports"],
    riskLevel: "low",
  },
  {
    id: 1,
    name: "Suspicious Activity",
    size: 89,
    percentage: 11.8,
    characteristics: ["High severity", "Unusual patterns", "Multiple failed attempts"],
    riskLevel: "high",
  },
  {
    id: 2,
    name: "Database Operations",
    size: 156,
    percentage: 20.6,
    characteristics: ["SQL queries", "Data retrieval", "Business hours"],
    riskLevel: "medium",
  },
  {
    id: 3,
    name: "File Transfers",
    size: 98,
    percentage: 13.0,
    characteristics: ["Large payloads", "FTP/SFTP", "Scheduled transfers"],
    riskLevel: "low",
  },
  {
    id: 4,
    name: "Authentication Events",
    size: 72,
    percentage: 9.5,
    characteristics: ["Login attempts", "Session management", "Multi-factor auth"],
    riskLevel: "medium",
  },
]

const clusterColors = ["#06b6d4", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"]

const silhouetteData = [
  { k: 2, score: 0.45 },
  { k: 3, score: 0.62 },
  { k: 4, score: 0.71 },
  { k: 5, score: 0.68 },
  { k: 6, score: 0.59 },
  { k: 7, score: 0.52 },
  { k: 8, score: 0.48 },
]

export default function ClusteringAnalysis() {
  const [algorithm, setAlgorithm] = useState("kmeans")
  const [numClusters, setNumClusters] = useState([5])
  const [isRunning, setIsRunning] = useState(false)

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
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
            <Brain className="h-6 w-6 text-purple-400" />
            Clustering Analysis
          </h2>
          <p className="text-slate-400 mt-1">Discover hidden patterns and group similar behaviors</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsRunning(!isRunning)}
            className={isRunning ? "bg-red-500/20 border-red-500/30" : ""}
          >
            {isRunning ? (
              <>
                <Settings className="h-4 w-4 mr-2 animate-spin" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-slate-400" />
            Clustering Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Algorithm</Label>
              <Select value={algorithm} onValueChange={setAlgorithm}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kmeans">K-Means</SelectItem>
                  <SelectItem value="dbscan">DBSCAN</SelectItem>
                  <SelectItem value="hierarchical">Hierarchical</SelectItem>
                  <SelectItem value="gaussian">Gaussian Mixture</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Number of Clusters: {numClusters[0]}</Label>
              <Slider value={numClusters} onValueChange={setNumClusters} max={10} min={2} step={1} className="w-full" />
            </div>
            <div className="space-y-2">
              <Label>Features</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Features</SelectItem>
                  <SelectItem value="network">Network Features</SelectItem>
                  <SelectItem value="behavioral">Behavioral Features</SelectItem>
                  <SelectItem value="temporal">Temporal Features</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cluster Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Cluster Visualization</CardTitle>
            <CardDescription>2D projection of high-dimensional clustering results</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart data={clusterData}>
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
                    name === "size" ? `${value} samples` : value,
                    props.payload.label,
                  ]}
                />
                {[0, 1, 2, 3, 4].map((clusterId) => (
                  <Scatter
                    key={clusterId}
                    data={clusterData.filter((d) => d.cluster === clusterId)}
                    fill={clusterColors[clusterId]}
                    name={`Cluster ${clusterId}`}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cluster Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Cluster Distribution</CardTitle>
            <CardDescription>Size and proportion of each cluster</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={clusterSummary}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="size"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {clusterSummary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={clusterColors[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cluster Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            Cluster Analysis Summary
          </CardTitle>
          <CardDescription>Detailed characteristics of each identified cluster</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clusterSummary.map((cluster, index) => (
              <div key={cluster.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: clusterColors[index] }}></div>
                    <h3 className="font-semibold">{cluster.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRiskColor(cluster.riskLevel)}>{cluster.riskLevel} risk</Badge>
                    <Badge variant="outline">{cluster.size} samples</Badge>
                    <Badge variant="outline">{cluster.percentage}%</Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cluster.characteristics.map((char, charIndex) => (
                    <Badge key={charIndex} variant="secondary" className="text-xs">
                      {char}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cluster Quality Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Optimal Cluster Count</CardTitle>
            <CardDescription>Silhouette analysis for determining optimal K</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={silhouetteData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="k" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="score" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clustering Metrics</CardTitle>
            <CardDescription>Quality assessment of current clustering</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Silhouette Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="w-4/5 h-full bg-purple-500"></div>
                  </div>
                  <span className="font-medium">0.71</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Calinski-Harabasz Index</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="w-3/5 h-full bg-blue-500"></div>
                  </div>
                  <span className="font-medium">234.5</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Davies-Bouldin Index</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="w-1/5 h-full bg-green-500"></div>
                  </div>
                  <span className="font-medium">0.89</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Inertia</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="w-2/5 h-full bg-yellow-500"></div>
                  </div>
                  <span className="font-medium">1,234</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
