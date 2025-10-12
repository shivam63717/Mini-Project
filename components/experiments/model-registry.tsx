"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Download, Upload, Star, GitBranch, Calendar, User, Search } from "lucide-react"
import { useState } from "react"

const models = [
  {
    id: "model_001",
    name: "CyberThreat-XGBoost-v2.1",
    version: "2.1.0",
    type: "XGBClassifier",
    status: "production",
    accuracy: 0.947,
    size: "45.2 MB",
    createdBy: "Alice Johnson",
    createdAt: "2024-01-15",
    deployments: 3,
    downloads: 127,
    tags: ["cybersecurity", "threat-detection", "xgboost"],
    description: "High-performance XGBoost model for cybersecurity threat detection with 94.7% accuracy",
    framework: "scikit-learn",
    pythonVersion: "3.9+",
    dependencies: ["xgboost==1.7.0", "pandas==1.5.0", "numpy==1.24.0"],
  },
  {
    id: "model_002",
    name: "AnomalyDetector-RF-v1.8",
    version: "1.8.3",
    type: "RandomForestClassifier",
    status: "staging",
    accuracy: 0.923,
    size: "32.1 MB",
    createdBy: "Bob Smith",
    createdAt: "2024-01-14",
    deployments: 1,
    downloads: 89,
    tags: ["anomaly-detection", "random-forest", "cybersecurity"],
    description: "Random Forest model optimized for network anomaly detection",
    framework: "scikit-learn",
    pythonVersion: "3.8+",
    dependencies: ["scikit-learn==1.3.0", "pandas==1.5.0", "numpy==1.24.0"],
  },
  {
    id: "model_003",
    name: "DeepSec-Neural-v3.0",
    version: "3.0.1",
    type: "MLPClassifier",
    status: "experimental",
    accuracy: 0.889,
    size: "78.9 MB",
    createdBy: "Carol Davis",
    createdAt: "2024-01-13",
    deployments: 0,
    downloads: 34,
    tags: ["deep-learning", "neural-network", "experimental"],
    description: "Deep neural network for advanced threat pattern recognition",
    framework: "tensorflow",
    pythonVersion: "3.9+",
    dependencies: ["tensorflow==2.13.0", "keras==2.13.0", "numpy==1.24.0"],
  },
]

export default function ModelRegistry() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "production":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "staging":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "experimental":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "deprecated":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const filteredModels = models.filter(
    (model) =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "all" || model.status === statusFilter) &&
      (typeFilter === "all" || model.type === typeFilter),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Model Registry</h2>
          <p className="text-slate-400 mt-1">Manage and deploy your trained models</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
          <Upload className="h-4 w-4 mr-2" />
          Upload Model
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="experimental">Experimental</SelectItem>
                <SelectItem value="deprecated">Deprecated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Model Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="XGBClassifier">XGBoost</SelectItem>
                <SelectItem value="RandomForestClassifier">Random Forest</SelectItem>
                <SelectItem value="MLPClassifier">Neural Network</SelectItem>
                <SelectItem value="SVC">SVM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Models Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredModels.map((model) => (
          <Card
            key={model.id}
            className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-400" />
                    {model.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    v{model.version} • {model.type}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(model.status)}>{model.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-300">{model.description}</p>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-900/50 rounded-lg">
                <div>
                  <p className="text-xs text-slate-400">Accuracy</p>
                  <p className="font-semibold text-green-400">{(model.accuracy * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Model Size</p>
                  <p className="font-semibold">{model.size}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <GitBranch className="h-3 w-3" />
                  <span>{model.deployments} deployments</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  <span>{model.downloads} downloads</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {model.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Metadata */}
              <div className="space-y-2 text-xs text-slate-400 border-t border-slate-700 pt-3">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>Created by {model.createdBy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>{model.createdAt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-3 w-3" />
                  <span>
                    {model.framework} • Python {model.pythonVersion}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  Deploy
                </Button>
                <Button variant="ghost" size="sm">
                  <Star className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
