"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Filter, Play, Download, Settings, CheckCircle, XCircle } from "lucide-react"

const availableFeatures = [
  {
    name: "severity_score",
    type: "Numerical",
    correlation: 0.89,
    importance: 0.342,
    selected: true,
    reason: "High importance",
  },
  {
    name: "bytes_transferred",
    type: "Numerical",
    correlation: 0.76,
    importance: 0.287,
    selected: true,
    reason: "Strong correlation",
  },
  {
    name: "connection_duration",
    type: "Numerical",
    correlation: 0.45,
    importance: 0.156,
    selected: true,
    reason: "Moderate importance",
  },
  {
    name: "failed_attempts",
    type: "Numerical",
    correlation: 0.68,
    importance: 0.098,
    selected: false,
    reason: "Low importance",
  },
  {
    name: "source_port",
    type: "Numerical",
    correlation: -0.12,
    importance: 0.067,
    selected: false,
    reason: "Weak correlation",
  },
  {
    name: "hour_of_day",
    type: "Numerical",
    correlation: 0.23,
    importance: 0.034,
    selected: false,
    reason: "Low importance",
  },
  {
    name: "is_weekend",
    type: "Boolean",
    correlation: 0.19,
    importance: 0.016,
    selected: false,
    reason: "Very low importance",
  },
  {
    name: "threat_type_encoded",
    type: "Categorical",
    correlation: 0.67,
    importance: 0.145,
    selected: true,
    reason: "Good correlation",
  },
]

const selectionMethods = [
  {
    name: "Recursive Feature Elimination",
    description: "Iteratively remove features and build model on remaining attributes",
    complexity: "High",
    timeEstimate: "10-30 min",
    recommended: true,
  },
  {
    name: "Correlation-based Selection",
    description: "Remove features with high correlation to reduce redundancy",
    complexity: "Low",
    timeEstimate: "1-2 min",
    recommended: false,
  },
  {
    name: "Mutual Information",
    description: "Select features based on mutual information with target variable",
    complexity: "Medium",
    timeEstimate: "5-10 min",
    recommended: true,
  },
  {
    name: "LASSO Regularization",
    description: "Use L1 regularization to automatically select features",
    complexity: "Medium",
    timeEstimate: "3-8 min",
    recommended: false,
  },
]

export function FeatureSelection() {
  const [selectedMethod, setSelectedMethod] = useState("rfe")
  const [correlationThreshold, setCorrelationThreshold] = useState([0.8])
  const [importanceThreshold, setImportanceThreshold] = useState([0.05])
  const [maxFeatures, setMaxFeatures] = useState(10)
  const [isRunning, setIsRunning] = useState(false)

  const handleFeatureToggle = (featureName: string) => {
    // Toggle feature selection logic would go here
    console.log(`Toggling feature: ${featureName}`)
  }

  const runSelection = () => {
    setIsRunning(true)
    // Simulate feature selection process
    setTimeout(() => {
      setIsRunning(false)
    }, 3000)
  }

  const selectedCount = availableFeatures.filter((f) => f.selected).length
  const totalFeatures = availableFeatures.length

  return (
    <div className="space-y-6">
      {/* Selection Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Feature Selection Methods
          </CardTitle>
          <CardDescription>Choose the best method for selecting optimal features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectionMethods.map((method) => (
              <div
                key={method.name}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedMethod === method.name.toLowerCase().replace(/\s+/g, "-")
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedMethod(method.name.toLowerCase().replace(/\s+/g, "-"))}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{method.name}</h3>
                  <div className="flex items-center gap-2">
                    {method.recommended && (
                      <Badge variant="default" className="text-xs">
                        Recommended
                      </Badge>
                    )}
                    <Badge
                      variant={
                        method.complexity === "High"
                          ? "destructive"
                          : method.complexity === "Medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {method.complexity}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                <div className="text-xs text-muted-foreground">Estimated time: {method.timeEstimate}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Selection Parameters</CardTitle>
          <CardDescription>Configure thresholds and constraints for feature selection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label>Correlation Threshold</Label>
              <div className="px-2">
                <Slider
                  value={correlationThreshold}
                  onValueChange={setCorrelationThreshold}
                  max={1}
                  min={0}
                  step={0.05}
                  className="w-full"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Remove features with correlation {">"} {correlationThreshold[0].toFixed(2)}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Importance Threshold</Label>
              <div className="px-2">
                <Slider
                  value={importanceThreshold}
                  onValueChange={setImportanceThreshold}
                  max={0.5}
                  min={0}
                  step={0.01}
                  className="w-full"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Keep features with importance {">"} {importanceThreshold[0].toFixed(2)}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="max-features">Maximum Features</Label>
              <Input
                id="max-features"
                type="number"
                value={maxFeatures}
                onChange={(e) => setMaxFeatures(Number.parseInt(e.target.value) || 10)}
                min={1}
                max={50}
              />
              <div className="text-sm text-muted-foreground">Select top {maxFeatures} features</div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Current selection: {selectedCount} of {totalFeatures} features
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Advanced
              </Button>
              <Button onClick={runSelection} disabled={isRunning}>
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Selection
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Feature Selection Results</CardTitle>
              <CardDescription>Review and modify the selected features</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Select All
              </Button>
              <Button variant="outline" size="sm">
                Clear All
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availableFeatures.map((feature, index) => (
              <div
                key={feature.name}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  feature.selected ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Checkbox checked={feature.selected} onCheckedChange={() => handleFeatureToggle(feature.name)} />
                  <div className="flex items-center gap-2">
                    {feature.selected ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{feature.name}</h4>
                    <p className="text-sm text-muted-foreground">{feature.reason}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant="outline">{feature.type}</Badge>
                  <div className="text-right text-sm">
                    <div className="text-foreground">Corr: {feature.correlation.toFixed(2)}</div>
                    <div className="text-muted-foreground">Imp: {feature.importance.toFixed(3)}</div>
                  </div>
                  <div className="w-16">
                    <Progress value={feature.importance * 1000} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Selection Summary</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedCount} features selected from {totalFeatures} available
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">
                  {((selectedCount / totalFeatures) * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Reduction</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
