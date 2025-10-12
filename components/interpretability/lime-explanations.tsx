"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Lightbulb, Play, Settings, AlertTriangle } from "lucide-react"

const limeExplanations = [
  {
    instance: "Threat Sample #1247",
    prediction: { class: "Malware", probability: 0.87 },
    features: [
      { name: "severity_score", value: 85, weight: 0.34, contribution: "Supports" },
      { name: "bytes_transferred", value: "5.2MB", weight: 0.28, contribution: "Supports" },
      { name: "connection_duration", value: "45.2s", weight: -0.15, contribution: "Contradicts" },
      { name: "failed_attempts", value: 12, weight: 0.22, contribution: "Supports" },
      { name: "source_port", value: 443, weight: -0.08, contribution: "Contradicts" },
      { name: "hour_of_day", value: 14, weight: 0.05, contribution: "Supports" },
    ],
    localAccuracy: 0.92,
    modelFidelity: 0.89,
  },
  {
    instance: "Normal Sample #3891",
    prediction: { class: "Benign", probability: 0.78 },
    features: [
      { name: "severity_score", value: 25, weight: -0.41, contribution: "Supports" },
      { name: "bytes_transferred", value: "1.1MB", weight: -0.19, contribution: "Supports" },
      { name: "connection_duration", value: "2.1s", weight: 0.12, contribution: "Contradicts" },
      { name: "failed_attempts", value: 1, weight: -0.25, contribution: "Supports" },
      { name: "source_port", value: 80, weight: 0.08, contribution: "Contradicts" },
      { name: "hour_of_day", value: 9, weight: -0.03, contribution: "Supports" },
    ],
    localAccuracy: 0.88,
    modelFidelity: 0.85,
  },
]

const perturbationResults = [
  { feature: "severity_score", original: 85, perturbed: [75, 65, 95], predictions: [0.82, 0.71, 0.91] },
  {
    feature: "bytes_transferred",
    original: 5242880,
    perturbed: [3145728, 1048576, 7340032],
    predictions: [0.83, 0.74, 0.89],
  },
  { feature: "connection_duration", original: 45.2, perturbed: [35.2, 25.2, 55.2], predictions: [0.88, 0.89, 0.85] },
]

export function LimeExplanations() {
  const [selectedInstance, setSelectedInstance] = useState(0)
  const [numFeatures, setNumFeatures] = useState(6)
  const [numSamples, setNumSamples] = useState(5000)
  const [isExplaining, setIsExplaining] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleExplain = () => {
    setIsExplaining(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsExplaining(false)
          return 100
        }
        return prev + 8
      })
    }, 200)
  }

  const currentExplanation = limeExplanations[selectedInstance]

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                LIME Explanations
              </CardTitle>
              <CardDescription>Local Interpretable Model-agnostic Explanations</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedInstance.toString()}
                onValueChange={(value) => setSelectedInstance(Number.parseInt(value))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {limeExplanations.map((exp, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {exp.instance}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
              <Button onClick={handleExplain} disabled={isExplaining}>
                {isExplaining ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Explaining...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Generate Explanation
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        {isExplaining && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Generating local explanation...</span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Creating {numSamples.toLocaleString()} perturbed samples around the instance
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* LIME Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>LIME Parameters</CardTitle>
          <CardDescription>Configure the local explanation generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="num-features">Number of Features</Label>
              <Input
                id="num-features"
                type="number"
                value={numFeatures}
                onChange={(e) => setNumFeatures(Number.parseInt(e.target.value) || 6)}
                min={3}
                max={10}
              />
              <div className="text-xs text-muted-foreground">Features to include in explanation</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="num-samples">Number of Samples</Label>
              <Input
                id="num-samples"
                type="number"
                value={numSamples}
                onChange={(e) => setNumSamples(Number.parseInt(e.target.value) || 5000)}
                min={1000}
                max={10000}
                step={1000}
              />
              <div className="text-xs text-muted-foreground">Perturbed samples for local model</div>
            </div>
            <div className="space-y-2">
              <Label>Kernel Width</Label>
              <Select defaultValue="auto">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="0.25">0.25</SelectItem>
                  <SelectItem value="0.5">0.5</SelectItem>
                  <SelectItem value="0.75">0.75</SelectItem>
                  <SelectItem value="1.0">1.0</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">Kernel width for local model</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Explanation Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Feature Contributions</CardTitle>
            <CardDescription>How each feature influences the prediction locally</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentExplanation.features} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="weight"
                    fill={(entry) => (entry.weight > 0 ? "hsl(var(--success))" : "hsl(var(--destructive))")}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-3">
              {currentExplanation.features.map((feature, index) => (
                <div
                  key={feature.name}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-medium text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{feature.name}</div>
                      <div className="text-sm text-muted-foreground">Value: {feature.value}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={feature.contribution === "Supports" ? "default" : "destructive"}>
                      {feature.contribution}
                    </Badge>
                    <div className={`font-bold ${feature.weight > 0 ? "text-success" : "text-destructive"}`}>
                      {feature.weight > 0 ? "+" : ""}
                      {feature.weight.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prediction Details</CardTitle>
            <CardDescription>Local model performance and prediction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">{currentExplanation.prediction.class}</div>
                  <div className="text-sm text-muted-foreground mb-2">Predicted Class</div>
                  <Badge
                    variant={currentExplanation.prediction.probability > 0.7 ? "default" : "secondary"}
                    className="text-lg px-3 py-1"
                  >
                    {(currentExplanation.prediction.probability * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Local Accuracy</span>
                  <div className="flex items-center gap-2">
                    <Progress value={currentExplanation.localAccuracy * 100} className="w-16 h-2" />
                    <span className="font-medium text-foreground">
                      {(currentExplanation.localAccuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Model Fidelity</span>
                  <div className="flex items-center gap-2">
                    <Progress value={currentExplanation.modelFidelity * 100} className="w-16 h-2" />
                    <span className="font-medium text-foreground">
                      {(currentExplanation.modelFidelity * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                <div className="text-sm">
                  <p className="font-medium text-info">Explanation Quality</p>
                  <p className="text-info/80 text-xs mt-1">
                    {currentExplanation.localAccuracy > 0.9
                      ? "High quality - local model fits well"
                      : currentExplanation.localAccuracy > 0.8
                        ? "Good quality - reasonable local fit"
                        : "Lower quality - consider more samples"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Perturbation Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Perturbation Analysis</CardTitle>
          <CardDescription>How predictions change when feature values are modified</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {perturbationResults.map((result, index) => (
              <div key={result.feature} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">{result.feature}</h4>
                  <Badge variant="outline">
                    Original: {result.original > 1000 ? (result.original / 1000000).toFixed(1) + "M" : result.original}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {result.perturbed.map((value, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border text-center">
                      <div className="text-sm text-muted-foreground">Perturbed Value</div>
                      <div className="font-medium text-foreground">
                        {value > 1000 ? (value / 1000000).toFixed(1) + "M" : value}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Prediction: {(result.predictions[i] * 100).toFixed(1)}%
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          result.predictions[i] > currentExplanation.prediction.probability
                            ? "text-destructive"
                            : "text-success"
                        }`}
                      >
                        {result.predictions[i] > currentExplanation.prediction.probability ? "↑" : "↓"}{" "}
                        {Math.abs((result.predictions[i] - currentExplanation.prediction.probability) * 100).toFixed(1)}
                        %
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning">LIME Limitations</p>
                <p className="text-warning/80 text-xs mt-1">
                  LIME explanations are local and may not represent global model behavior. The quality depends on the
                  local model's ability to approximate the original model in the neighborhood of the instance.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
