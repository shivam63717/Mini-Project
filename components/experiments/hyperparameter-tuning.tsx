"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "recharts"
import { Settings, Play, Zap, Target } from "lucide-react"
import { useState } from "react"

const optimizationResults = [
  { trial: 1, accuracy: 0.847, n_estimators: 50, max_depth: 5, learning_rate: 0.1, runtime: 120 },
  { trial: 2, accuracy: 0.892, n_estimators: 100, max_depth: 8, learning_rate: 0.05, runtime: 240 },
  { trial: 3, accuracy: 0.923, n_estimators: 150, max_depth: 10, learning_rate: 0.1, runtime: 360 },
  { trial: 4, accuracy: 0.947, n_estimators: 200, max_depth: 8, learning_rate: 0.1, runtime: 480 },
  { trial: 5, accuracy: 0.934, n_estimators: 180, max_depth: 12, learning_rate: 0.08, runtime: 420 },
  { trial: 6, accuracy: 0.956, n_estimators: 220, max_depth: 9, learning_rate: 0.12, runtime: 520 },
  { trial: 7, accuracy: 0.941, n_estimators: 160, max_depth: 7, learning_rate: 0.15, runtime: 380 },
  { trial: 8, accuracy: 0.929, n_estimators: 140, max_depth: 11, learning_rate: 0.09, runtime: 340 },
]

const convergenceData = [
  { iteration: 1, bestScore: 0.847, currentScore: 0.847 },
  { iteration: 2, bestScore: 0.892, currentScore: 0.892 },
  { iteration: 3, bestScore: 0.923, currentScore: 0.923 },
  { iteration: 4, bestScore: 0.947, currentScore: 0.947 },
  { iteration: 5, bestScore: 0.947, currentScore: 0.934 },
  { iteration: 6, bestScore: 0.956, currentScore: 0.956 },
  { iteration: 7, bestScore: 0.956, currentScore: 0.941 },
  { iteration: 8, bestScore: 0.956, currentScore: 0.929 },
]

export default function HyperparameterTuning() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("xgboost")
  const [optimizationMethod, setOptimizationMethod] = useState("bayesian")
  const [maxTrials, setMaxTrials] = useState([50])
  const [isRunning, setIsRunning] = useState(false)

  const bestResult = optimizationResults.reduce((best, current) => (current.accuracy > best.accuracy ? current : best))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-400" />
            AutoML & Hyperparameter Optimization
          </h2>
          <p className="text-slate-400 mt-1">Automatically find the best hyperparameters for your models</p>
        </div>
        <Button
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? (
            <>
              <Settings className="h-4 w-4 mr-2 animate-spin" />
              Stop Optimization
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start Optimization
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger value="setup" className="data-[state=active]:bg-yellow-500/20">
            Setup
          </TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-yellow-500/20">
            Results
          </TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-yellow-500/20">
            Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Configuration</CardTitle>
                <CardDescription>Configure your hyperparameter optimization settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Algorithm</Label>
                  <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xgboost">XGBoost Classifier</SelectItem>
                      <SelectItem value="randomforest">Random Forest</SelectItem>
                      <SelectItem value="svm">Support Vector Machine</SelectItem>
                      <SelectItem value="neuralnet">Neural Network</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Optimization Method</Label>
                  <Select value={optimizationMethod} onValueChange={setOptimizationMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bayesian">Bayesian Optimization</SelectItem>
                      <SelectItem value="random">Random Search</SelectItem>
                      <SelectItem value="grid">Grid Search</SelectItem>
                      <SelectItem value="genetic">Genetic Algorithm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Maximum Trials: {maxTrials[0]}</Label>
                  <Slider
                    value={maxTrials}
                    onValueChange={setMaxTrials}
                    max={200}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Optimization Objectives</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Maximize Accuracy</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Minimize Training Time</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Maximize F1 Score</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parameter Ranges */}
            <Card>
              <CardHeader>
                <CardTitle>Parameter Search Space</CardTitle>
                <CardDescription>Define the ranges for hyperparameter search</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedAlgorithm === "xgboost" && (
                  <>
                    <div className="space-y-2">
                      <Label>Number of Estimators</Label>
                      <div className="flex gap-2">
                        <Input placeholder="Min (50)" className="flex-1" />
                        <Input placeholder="Max (300)" className="flex-1" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Max Depth</Label>
                      <div className="flex gap-2">
                        <Input placeholder="Min (3)" className="flex-1" />
                        <Input placeholder="Max (15)" className="flex-1" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Learning Rate</Label>
                      <div className="flex gap-2">
                        <Input placeholder="Min (0.01)" className="flex-1" />
                        <Input placeholder="Max (0.3)" className="flex-1" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Subsample</Label>
                      <div className="flex gap-2">
                        <Input placeholder="Min (0.6)" className="flex-1" />
                        <Input placeholder="Max (1.0)" className="flex-1" />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results">
          <div className="space-y-6">
            {/* Best Result */}
            <Card className="bg-gradient-to-r from-green-500/10 to-green-600/5 border-green-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-400" />
                  Best Configuration Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{(bestResult.accuracy * 100).toFixed(1)}%</p>
                    <p className="text-sm text-slate-400">Accuracy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{bestResult.n_estimators}</p>
                    <p className="text-sm text-slate-400">N Estimators</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{bestResult.max_depth}</p>
                    <p className="text-sm text-slate-400">Max Depth</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{bestResult.learning_rate}</p>
                    <p className="text-sm text-slate-400">Learning Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Optimization Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Progress</CardTitle>
                <CardDescription>Performance across all trials</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart data={optimizationResults}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="trial" stroke="#9ca3af" />
                    <YAxis dataKey="accuracy" domain={[0.8, 1]} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                      formatter={(value, name) => [name === "accuracy" ? `${(value * 100).toFixed(1)}%` : value, name]}
                    />
                    <Scatter dataKey="accuracy" fill="#10b981" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Trial Results Table */}
            <Card>
              <CardHeader>
                <CardTitle>Trial Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-3">Trial</th>
                        <th className="text-center p-3">Accuracy</th>
                        <th className="text-center p-3">N Estimators</th>
                        <th className="text-center p-3">Max Depth</th>
                        <th className="text-center p-3">Learning Rate</th>
                        <th className="text-center p-3">Runtime</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optimizationResults.map((result) => (
                        <tr key={result.trial} className="border-b border-slate-800">
                          <td className="p-3">
                            <Badge variant="outline">#{result.trial}</Badge>
                          </td>
                          <td className="text-center p-3">
                            <Badge
                              className={
                                result.accuracy === bestResult.accuracy
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : ""
                              }
                            >
                              {(result.accuracy * 100).toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="text-center p-3">{result.n_estimators}</td>
                          <td className="text-center p-3">{result.max_depth}</td>
                          <td className="text-center p-3">{result.learning_rate}</td>
                          <td className="text-center p-3">
                            <span className="text-sm text-slate-400">
                              {Math.floor(result.runtime / 60)}m {result.runtime % 60}s
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="space-y-6">
            {/* Convergence Plot */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Convergence</CardTitle>
                <CardDescription>How the best score improved over iterations</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={convergenceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="iteration" stroke="#9ca3af" />
                    <YAxis domain={[0.8, 1]} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [`${(value * 100).toFixed(1)}%`, "Accuracy"]}
                    />
                    <Line type="monotone" dataKey="bestScore" stroke="#10b981" strokeWidth={3} name="Best Score" />
                    <Line
                      type="monotone"
                      dataKey="currentScore"
                      stroke="#6b7280"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Current Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Parameter Importance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Parameter Importance</CardTitle>
                  <CardDescription>Impact of each parameter on model performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">N Estimators</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="w-4/5 h-full bg-purple-500"></div>
                        </div>
                        <span className="text-sm text-slate-400">0.82</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Learning Rate</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="w-3/5 h-full bg-blue-500"></div>
                        </div>
                        <span className="text-sm text-slate-400">0.67</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Max Depth</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="w-2/5 h-full bg-green-500"></div>
                        </div>
                        <span className="text-sm text-slate-400">0.45</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Optimization Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Total Trials</span>
                      <span className="font-medium">{optimizationResults.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Best Accuracy</span>
                      <span className="font-medium text-green-400">{(bestResult.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Improvement</span>
                      <span className="font-medium text-green-400">
                        +{((bestResult.accuracy - optimizationResults[0].accuracy) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Total Runtime</span>
                      <span className="font-medium">
                        {Math.floor(optimizationResults.reduce((sum, r) => sum + r.runtime, 0) / 60)}m
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
