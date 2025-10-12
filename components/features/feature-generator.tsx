"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Play, Download, Settings, Plus, Trash2 } from "lucide-react"

const featureTypes = [
  {
    type: "Time-based Features",
    description: "Extract temporal patterns from datetime columns",
    features: ["Hour of day", "Day of week", "Month", "Quarter", "Is weekend", "Time since last event"],
    complexity: "Low",
    estimatedTime: "2-5 min",
  },
  {
    type: "Statistical Aggregations",
    description: "Rolling statistics and window functions",
    features: ["Rolling mean", "Rolling std", "Rolling min/max", "Lag features", "Cumulative sum"],
    complexity: "Medium",
    estimatedTime: "5-10 min",
  },
  {
    type: "Polynomial Features",
    description: "Generate interaction and polynomial terms",
    features: ["Feature interactions", "Squared terms", "Cubic terms", "Cross products"],
    complexity: "High",
    estimatedTime: "10-20 min",
  },
  {
    type: "Domain-specific",
    description: "Cybersecurity-specific feature engineering",
    features: ["IP geolocation", "Port risk scores", "Threat frequency", "Anomaly scores"],
    complexity: "Medium",
    estimatedTime: "5-15 min",
  },
]

const generatedFeatures = [
  { name: "hour_of_day", type: "Numerical", source: "timestamp", method: "Time extraction", status: "completed" },
  { name: "is_weekend", type: "Boolean", source: "timestamp", method: "Time extraction", status: "completed" },
  {
    name: "bytes_per_second",
    type: "Numerical",
    source: "bytes_transferred, duration",
    method: "Ratio",
    status: "completed",
  },
  { name: "threat_frequency_7d", type: "Numerical", source: "threat_type", method: "Rolling count", status: "running" },
  {
    name: "severity_rolling_mean",
    type: "Numerical",
    source: "severity_score",
    method: "Rolling mean",
    status: "queued",
  },
]

export function FeatureGenerator() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleTypeSelection = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, type])
    } else {
      setSelectedTypes(selectedTypes.filter((t) => t !== type))
    }
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    setProgress(0)

    // Simulate feature generation progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  return (
    <div className="space-y-6">
      {/* Feature Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Automated Feature Generation
          </CardTitle>
          <CardDescription>Select feature types to automatically generate from your dataset</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featureTypes.map((featureType) => (
              <div
                key={featureType.type}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedTypes.includes(featureType.type)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleTypeSelection(featureType.type, !selectedTypes.includes(featureType.type))}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedTypes.includes(featureType.type)}
                      onChange={() => {}}
                      className="pointer-events-none"
                    />
                    <h3 className="font-semibold text-foreground">{featureType.type}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        featureType.complexity === "High"
                          ? "destructive"
                          : featureType.complexity === "Medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {featureType.complexity}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{featureType.description}</p>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {featureType.features.slice(0, 3).map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {featureType.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{featureType.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">Estimated time: {featureType.estimatedTime}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              {selectedTypes.length} feature type{selectedTypes.length !== 1 ? "s" : ""} selected
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={selectedTypes.length === 0 || isGenerating}
                className="min-w-32"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Generate Features
                  </>
                )}
              </Button>
            </div>
          </div>

          {isGenerating && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Generating features...</span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Features */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Generated Features</CardTitle>
              <CardDescription>Recently created features from your dataset</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Custom
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {generatedFeatures.map((feature, index) => (
              <div
                key={feature.name}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{feature.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Source: {feature.source}</span>
                      <span>•</span>
                      <span>Method: {feature.method}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant="outline">{feature.type}</Badge>
                  <Badge
                    variant={
                      feature.status === "completed"
                        ? "default"
                        : feature.status === "running"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {feature.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Feature Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Feature Builder</CardTitle>
          <CardDescription>Create custom features using mathematical expressions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feature-name">Feature Name</Label>
                <Input id="feature-name" placeholder="e.g., bytes_per_connection" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feature-type">Feature Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="numerical">Numerical</SelectItem>
                    <SelectItem value="categorical">Categorical</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expression">Mathematical Expression</Label>
              <Textarea
                id="expression"
                placeholder="e.g., bytes_transferred / connection_duration"
                className="font-mono"
              />
              <div className="text-xs text-muted-foreground">
                Available columns: bytes_transferred, connection_duration, severity_score, timestamp
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline">Validate Expression</Button>
              <Button>Create Feature</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
