"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, ChevronDown, Target, TrendingUp } from "lucide-react"
import { useState } from "react"

const decisionTree = {
  root: {
    feature: "severity_score",
    threshold: 50,
    samples: 10000,
    value: [4500, 5500],
    gini: 0.495,
    left: {
      feature: "bytes_transferred",
      threshold: 2000000,
      samples: 4500,
      value: [3800, 700],
      gini: 0.302,
      left: {
        feature: "connection_duration",
        threshold: 10,
        samples: 2800,
        value: [2650, 150],
        gini: 0.203,
        prediction: "Benign",
        confidence: 0.946,
      },
      right: {
        feature: "failed_attempts",
        threshold: 5,
        samples: 1700,
        value: [1150, 550],
        gini: 0.456,
        left: {
          prediction: "Benign",
          confidence: 0.676,
          samples: 1200,
          value: [900, 300],
        },
        right: {
          prediction: "Threat",
          confidence: 0.625,
          samples: 500,
          value: [250, 250],
        },
      },
    },
    right: {
      feature: "bytes_transferred",
      threshold: 3000000,
      samples: 5500,
      value: [700, 4800],
      gini: 0.231,
      left: {
        feature: "connection_duration",
        threshold: 30,
        samples: 2200,
        value: [450, 1750],
        gini: 0.372,
        prediction: "Threat",
        confidence: 0.795,
      },
      right: {
        feature: "failed_attempts",
        threshold: 8,
        samples: 3300,
        value: [250, 3050],
        gini: 0.146,
        prediction: "Threat",
        confidence: 0.924,
      },
    },
  },
}

const samplePaths = [
  {
    id: "sample_1",
    features: { severity_score: 85, bytes_transferred: 5242880, connection_duration: 45.2, failed_attempts: 12 },
    path: [
      { feature: "severity_score", value: 85, threshold: 50, direction: "right", decision: "≥ 50" },
      { feature: "bytes_transferred", value: 5242880, threshold: 3000000, direction: "right", decision: "≥ 3MB" },
      { feature: "failed_attempts", value: 12, threshold: 8, direction: "right", decision: "≥ 8" },
    ],
    prediction: "Threat",
    confidence: 0.924,
    probability: { benign: 0.076, threat: 0.924 },
  },
  {
    id: "sample_2",
    features: { severity_score: 25, bytes_transferred: 1048576, connection_duration: 5.8, failed_attempts: 2 },
    path: [
      { feature: "severity_score", value: 25, threshold: 50, direction: "left", decision: "< 50" },
      { feature: "bytes_transferred", value: 1048576, threshold: 2000000, direction: "left", decision: "< 2MB" },
      { feature: "connection_duration", value: 5.8, threshold: 10, direction: "left", decision: "< 10s" },
    ],
    prediction: "Benign",
    confidence: 0.946,
    probability: { benign: 0.946, threat: 0.054 },
  },
]

export default function ModelDecisionPaths() {
  const [selectedSample, setSelectedSample] = useState("sample_1")
  const [expandedNodes, setExpandedNodes] = useState<string[]>(["root"])

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => (prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]))
  }

  const renderTreeNode = (node: any, nodeId: string, depth = 0) => {
    const isExpanded = expandedNodes.includes(nodeId)
    const hasChildren = node.left || node.right
    const isLeaf = node.prediction

    return (
      <div key={nodeId} className="ml-4" style={{ marginLeft: `${depth * 24}px` }}>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700 mb-2">
          {hasChildren && (
            <Button variant="ghost" size="sm" onClick={() => toggleNode(nodeId)} className="p-1 h-6 w-6">
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          )}

          <div className="flex-1">
            {isLeaf ? (
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium">Prediction: {node.prediction}</span>
                <Badge variant={node.prediction === "Threat" ? "destructive" : "secondary"}>
                  {(node.confidence * 100).toFixed(1)}% confidence
                </Badge>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium">
                  {node.feature} ≤ {node.threshold}
                </span>
                <Badge variant="outline">{node.samples} samples</Badge>
                <Badge variant="outline">Gini: {node.gini.toFixed(3)}</Badge>
              </div>
            )}
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="ml-6 border-l border-slate-700 pl-4">
            {node.left && renderTreeNode(node.left, `${nodeId}_left`, depth + 1)}
            {node.right && renderTreeNode(node.right, `${nodeId}_right`, depth + 1)}
          </div>
        )}
      </div>
    )
  }

  const currentSample = samplePaths.find((s) => s.id === selectedSample)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-400" />
            Model Decision Paths
          </CardTitle>
          <CardDescription>Visualize how the model makes predictions through decision trees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Decision Tree Visualization */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Decision Tree Structure</h3>
              <div className="bg-slate-900/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                {renderTreeNode(decisionTree.root, "root")}
              </div>
            </div>

            {/* Sample Path Analysis */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold">Sample Path Analysis</h3>
                <Select value={selectedSample} onValueChange={setSelectedSample}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {samplePaths.map((sample) => (
                      <SelectItem key={sample.id} value={sample.id}>
                        {sample.id.replace("_", " ").toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentSample && (
                <div className="space-y-4">
                  <Card className="bg-slate-800/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">Final Prediction</span>
                        <Badge variant={currentSample.prediction === "Threat" ? "destructive" : "secondary"}>
                          {currentSample.prediction}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>Confidence: {(currentSample.confidence * 100).toFixed(1)}%</span>
                        <span>Benign: {(currentSample.probability.benign * 100).toFixed(1)}%</span>
                        <span>Threat: {(currentSample.probability.threat * 100).toFixed(1)}%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <h4 className="font-medium">Decision Path:</h4>
                    {currentSample.path.map((step, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                        <div className="flex items-center justify-center w-6 h-6 bg-purple-500/20 rounded-full text-xs font-medium text-purple-400">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{step.feature}</div>
                          <div className="text-xs text-slate-400">
                            Value: {step.value} → {step.decision}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
