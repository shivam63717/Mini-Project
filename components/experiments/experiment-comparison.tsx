"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from "recharts"
import { GitCompare } from "lucide-react"
import { useState } from "react"

const experiments = [
  {
    id: "exp_001",
    name: "Random Forest",
    accuracy: 0.923,
    precision: 0.891,
    recall: 0.945,
    f1Score: 0.917,
    runtime: 503, // seconds
    parameters: { n_estimators: 100, max_depth: 15 },
  },
  {
    id: "exp_002",
    name: "XGBoost",
    accuracy: 0.947,
    precision: 0.932,
    recall: 0.961,
    f1Score: 0.946,
    runtime: 765,
    parameters: { n_estimators: 200, learning_rate: 0.1 },
  },
  {
    id: "exp_003",
    name: "Neural Network",
    accuracy: 0.889,
    precision: 0.876,
    recall: 0.902,
    f1Score: 0.889,
    runtime: 1512,
    parameters: { hidden_layers: "(100,50)", learning_rate: 0.001 },
  },
  {
    id: "exp_004",
    name: "SVM",
    accuracy: 0.834,
    precision: 0.821,
    recall: 0.847,
    f1Score: 0.834,
    runtime: 2733,
    parameters: { C: 1.0, kernel: "rbf" },
  },
]

const trainingHistory = [
  { epoch: 1, randomForest: 0.78, xgboost: 0.82, neuralNet: 0.65, svm: 0.71 },
  { epoch: 5, randomForest: 0.85, xgboost: 0.89, neuralNet: 0.76, svm: 0.78 },
  { epoch: 10, randomForest: 0.89, xgboost: 0.92, neuralNet: 0.83, svm: 0.81 },
  { epoch: 15, randomForest: 0.91, xgboost: 0.94, neuralNet: 0.87, svm: 0.83 },
  { epoch: 20, randomForest: 0.92, xgboost: 0.95, neuralNet: 0.89, svm: 0.83 },
]

export default function ExperimentComparison() {
  const [selectedExperiments, setSelectedExperiments] = useState<string[]>(["exp_001", "exp_002"])

  const toggleExperiment = (expId: string) => {
    setSelectedExperiments((prev) => (prev.includes(expId) ? prev.filter((id) => id !== expId) : [...prev, expId]))
  }

  const selectedData = experiments.filter((exp) => selectedExperiments.includes(exp.id))

  const metricsData = selectedData.map((exp) => ({
    name: exp.name,
    accuracy: exp.accuracy * 100,
    precision: exp.precision * 100,
    recall: exp.recall * 100,
    f1Score: exp.f1Score * 100,
  }))

  const radarData = [
    { metric: "Accuracy", ...Object.fromEntries(selectedData.map((exp) => [exp.name, exp.accuracy * 100])) },
    { metric: "Precision", ...Object.fromEntries(selectedData.map((exp) => [exp.name, exp.precision * 100])) },
    { metric: "Recall", ...Object.fromEntries(selectedData.map((exp) => [exp.name, exp.recall * 100])) },
    { metric: "F1 Score", ...Object.fromEntries(selectedData.map((exp) => [exp.name, exp.f1Score * 100])) },
  ]

  const colors = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-purple-400" />
            Experiment Comparison
          </CardTitle>
          <CardDescription>Compare performance metrics across different experiments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-medium">Select Experiments to Compare</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {experiments.map((exp, index) => (
                <div
                  key={exp.id}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                >
                  <Checkbox
                    id={exp.id}
                    checked={selectedExperiments.includes(exp.id)}
                    onCheckedChange={() => toggleExperiment(exp.id)}
                  />
                  <div className="flex-1">
                    <label htmlFor={exp.id} className="text-sm font-medium cursor-pointer">
                      {exp.name}
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: colors[index] }} />
                      <span className="text-xs text-slate-400">F1: {(exp.f1Score * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedData.length > 0 && (
        <>
          {/* Metrics Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-3">Experiment</th>
                      <th className="text-center p-3">Accuracy</th>
                      <th className="text-center p-3">Precision</th>
                      <th className="text-center p-3">Recall</th>
                      <th className="text-center p-3">F1 Score</th>
                      <th className="text-center p-3">Runtime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedData.map((exp, index) => (
                      <tr key={exp.id} className="border-b border-slate-800">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: colors[index] }} />
                            <span className="font-medium">{exp.name}</span>
                          </div>
                        </td>
                        <td className="text-center p-3">
                          <Badge variant="outline">{(exp.accuracy * 100).toFixed(1)}%</Badge>
                        </td>
                        <td className="text-center p-3">
                          <Badge variant="outline">{(exp.precision * 100).toFixed(1)}%</Badge>
                        </td>
                        <td className="text-center p-3">
                          <Badge variant="outline">{(exp.recall * 100).toFixed(1)}%</Badge>
                        </td>
                        <td className="text-center p-3">
                          <Badge variant="outline">{(exp.f1Score * 100).toFixed(1)}%</Badge>
                        </td>
                        <td className="text-center p-3">
                          <span className="text-sm text-slate-400">
                            {Math.floor(exp.runtime / 60)}m {exp.runtime % 60}s
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Metrics Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metricsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="accuracy" fill="#8b5cf6" name="Accuracy" />
                    <Bar dataKey="precision" fill="#06b6d4" name="Precision" />
                    <Bar dataKey="recall" fill="#10b981" name="Recall" />
                    <Bar dataKey="f1Score" fill="#f59e0b" name="F1 Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 10 }} />
                    {selectedData.map((exp, index) => (
                      <Radar
                        key={exp.name}
                        name={exp.name}
                        dataKey={exp.name}
                        stroke={colors[index]}
                        fill={colors[index]}
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    ))}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Training History */}
          <Card>
            <CardHeader>
              <CardTitle>Training Progress</CardTitle>
              <CardDescription>Model performance over training iterations</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trainingHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="epoch" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="randomForest" stroke="#8b5cf6" strokeWidth={2} name="Random Forest" />
                  <Line type="monotone" dataKey="xgboost" stroke="#06b6d4" strokeWidth={2} name="XGBoost" />
                  <Line type="monotone" dataKey="neuralNet" stroke="#10b981" strokeWidth={2} name="Neural Network" />
                  <Line type="monotone" dataKey="svm" stroke="#f59e0b" strokeWidth={2} name="SVM" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
