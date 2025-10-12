"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Square, MoreHorizontal, Search, Filter, TrendingUp } from "lucide-react"
import { useState } from "react"

const experiments = [
  {
    id: "exp_001",
    name: "Random Forest Threat Detection",
    status: "running",
    model: "RandomForestClassifier",
    accuracy: 0.923,
    precision: 0.891,
    recall: 0.945,
    f1Score: 0.917,
    runtime: "8m 23s",
    startTime: "2024-01-15 14:30:00",
    parameters: {
      n_estimators: 100,
      max_depth: 15,
      min_samples_split: 5,
    },
    dataset: "cybersec_v2.1",
    features: 47,
  },
  {
    id: "exp_002",
    name: "XGBoost Anomaly Detection",
    status: "completed",
    model: "XGBClassifier",
    accuracy: 0.947,
    precision: 0.932,
    recall: 0.961,
    f1Score: 0.946,
    runtime: "12m 45s",
    startTime: "2024-01-15 13:15:00",
    parameters: {
      n_estimators: 200,
      learning_rate: 0.1,
      max_depth: 8,
    },
    dataset: "cybersec_v2.1",
    features: 47,
  },
  {
    id: "exp_003",
    name: "Neural Network Deep Learning",
    status: "running",
    model: "MLPClassifier",
    accuracy: 0.889,
    precision: 0.876,
    recall: 0.902,
    f1Score: 0.889,
    runtime: "25m 12s",
    startTime: "2024-01-15 12:00:00",
    parameters: {
      hidden_layer_sizes: "(100, 50)",
      learning_rate: 0.001,
      batch_size: 32,
    },
    dataset: "cybersec_v2.1",
    features: 47,
  },
  {
    id: "exp_004",
    name: "SVM Classification",
    status: "failed",
    model: "SVC",
    accuracy: 0.834,
    precision: 0.821,
    recall: 0.847,
    f1Score: 0.834,
    runtime: "45m 33s",
    startTime: "2024-01-15 11:30:00",
    parameters: {
      C: 1.0,
      kernel: "rbf",
      gamma: "scale",
    },
    dataset: "cybersec_v2.1",
    features: 47,
  },
]

export default function ExperimentList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("startTime")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "paused":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Play className="h-3 w-3" />
      case "completed":
        return <Square className="h-3 w-3" />
      case "failed":
        return <Square className="h-3 w-3" />
      case "paused":
        return <Pause className="h-3 w-3" />
      default:
        return <Square className="h-3 w-3" />
    }
  }

  const filteredExperiments = experiments
    .filter(
      (exp) =>
        exp.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (statusFilter === "all" || exp.status === statusFilter),
    )
    .sort((a, b) => {
      if (sortBy === "accuracy") return b.accuracy - a.accuracy
      if (sortBy === "f1Score") return b.f1Score - a.f1Score
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    })

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search experiments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="startTime">Latest First</SelectItem>
                <SelectItem value="accuracy">Best Accuracy</SelectItem>
                <SelectItem value="f1Score">Best F1 Score</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Experiments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredExperiments.map((experiment) => (
          <Card
            key={experiment.id}
            className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{experiment.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <span>{experiment.model}</span>
                    <span>•</span>
                    <span>{experiment.dataset}</span>
                    <span>•</span>
                    <span>{experiment.features} features</span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(experiment.status)}>
                    {getStatusIcon(experiment.status)}
                    <span className="ml-1 capitalize">{experiment.status}</span>
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Accuracy</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{(experiment.accuracy * 100).toFixed(1)}%</span>
                        <TrendingUp className="h-3 w-3 text-green-400" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Precision</span>
                      <span className="font-medium">{(experiment.precision * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Recall</span>
                      <span className="font-medium">{(experiment.recall * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">F1 Score</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{(experiment.f1Score * 100).toFixed(1)}%</span>
                        <TrendingUp className="h-3 w-3 text-green-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parameters Preview */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Key Parameters</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(experiment.parameters)
                      .slice(0, 3)
                      .map(([key, value]) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {key}: {value}
                        </Badge>
                      ))}
                  </div>
                </div>

                {/* Runtime and Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                  <div className="text-sm text-slate-400">Runtime: {experiment.runtime}</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {experiment.status === "running" && (
                      <Button variant="outline" size="sm">
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
