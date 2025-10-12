"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { BarChart3, Download, Calculator, TrendingUp } from "lucide-react"
import { useState } from "react"

const sampleData = [
  { feature: "threat_score", mean: 45.7, median: 42.3, std: 12.8, min: 12.1, max: 89.4, q1: 35.2, q3: 56.8 },
  {
    feature: "bytes_transferred",
    mean: 2847392,
    median: 1892456,
    std: 1456789,
    min: 1024,
    max: 15728640,
    q1: 1048576,
    q3: 4194304,
  },
  { feature: "connection_duration", mean: 23.4, median: 18.7, std: 15.2, min: 0.1, max: 120.5, q1: 8.3, q3: 35.6 },
  { feature: "failed_attempts", mean: 3.2, median: 2.0, std: 4.1, min: 0, max: 25, q1: 1, q3: 4 },
]

const distributionData = [
  { bin: "0-10", count: 45, percentage: 4.5 },
  { bin: "10-20", count: 123, percentage: 12.3 },
  { bin: "20-30", count: 234, percentage: 23.4 },
  { bin: "30-40", count: 189, percentage: 18.9 },
  { bin: "40-50", count: 156, percentage: 15.6 },
  { bin: "50-60", count: 134, percentage: 13.4 },
  { bin: "60-70", count: 78, percentage: 7.8 },
  { bin: "70-80", count: 34, percentage: 3.4 },
  { bin: "80-90", count: 7, percentage: 0.7 },
]

const outlierData = [
  { feature: "threat_score", outliers: 23, percentage: 2.3, threshold_lower: 10.5, threshold_upper: 81.5 },
  { feature: "bytes_transferred", outliers: 45, percentage: 4.5, threshold_lower: -2097152, threshold_upper: 8388608 },
  { feature: "connection_duration", outliers: 12, percentage: 1.2, threshold_lower: -32.2, threshold_upper: 76.1 },
  { feature: "failed_attempts", outliers: 8, percentage: 0.8, threshold_lower: -5, threshold_upper: 10 },
]

const skewnessKurtosis = [
  { feature: "threat_score", skewness: 0.34, kurtosis: -0.12, interpretation: "Slightly right-skewed, normal peak" },
  { feature: "bytes_transferred", skewness: 1.87, kurtosis: 3.45, interpretation: "Highly right-skewed, heavy tails" },
  {
    feature: "connection_duration",
    skewness: 2.12,
    kurtosis: 5.67,
    interpretation: "Highly right-skewed, very heavy tails",
  },
  {
    feature: "failed_attempts",
    skewness: 3.45,
    kurtosis: 12.34,
    interpretation: "Extremely right-skewed, extremely heavy tails",
  },
]

export default function DescriptiveStatistics() {
  const [selectedFeature, setSelectedFeature] = useState("threat_score")

  const currentFeature = sampleData.find((f) => f.feature === selectedFeature)
  const currentDistribution = distributionData
  const currentOutliers = outlierData.find((f) => f.feature === selectedFeature)
  const currentShape = skewnessKurtosis.find((f) => f.feature === selectedFeature)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-green-400" />
            Descriptive Statistics
          </h2>
          <p className="text-slate-400 mt-1">Comprehensive summary statistics and data distribution analysis</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedFeature} onValueChange={setSelectedFeature}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="threat_score">Threat Score</SelectItem>
              <SelectItem value="bytes_transferred">Bytes Transferred</SelectItem>
              <SelectItem value="connection_duration">Connection Duration</SelectItem>
              <SelectItem value="failed_attempts">Failed Attempts</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Mean</span>
              <Calculator className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">{currentFeature?.mean.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">Average value</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Median</span>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">{currentFeature?.median.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">Middle value</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Std Dev</span>
              <BarChart3 className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-purple-400">{currentFeature?.std.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">Variability</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Range</span>
              <TrendingUp className="h-4 w-4 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-orange-400">
              {((currentFeature?.max || 0) - (currentFeature?.min || 0)).toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1">Max - Min</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics Table</CardTitle>
          <CardDescription>Comprehensive statistical measures for all features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-3">Feature</th>
                  <th className="text-center p-3">Count</th>
                  <th className="text-center p-3">Mean</th>
                  <th className="text-center p-3">Median</th>
                  <th className="text-center p-3">Std Dev</th>
                  <th className="text-center p-3">Min</th>
                  <th className="text-center p-3">Q1</th>
                  <th className="text-center p-3">Q3</th>
                  <th className="text-center p-3">Max</th>
                </tr>
              </thead>
              <tbody>
                {sampleData.map((stat) => (
                  <tr key={stat.feature} className="border-b border-slate-800">
                    <td className="p-3 font-medium">{stat.feature.replace("_", " ")}</td>
                    <td className="text-center p-3">1,000</td>
                    <td className="text-center p-3">{stat.mean.toLocaleString()}</td>
                    <td className="text-center p-3">{stat.median.toLocaleString()}</td>
                    <td className="text-center p-3">{stat.std.toLocaleString()}</td>
                    <td className="text-center p-3">{stat.min.toLocaleString()}</td>
                    <td className="text-center p-3">{stat.q1.toLocaleString()}</td>
                    <td className="text-center p-3">{stat.q3.toLocaleString()}</td>
                    <td className="text-center p-3">{stat.max.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Histogram */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution Histogram</CardTitle>
            <CardDescription>Frequency distribution of {selectedFeature.replace("_", " ")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={currentDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="bin" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Box Plot Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Box Plot Analysis</CardTitle>
            <CardDescription>Quartiles and outlier detection for {selectedFeature.replace("_", " ")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-slate-400">Q1 (25th percentile)</p>
                  <p className="text-xl font-bold text-blue-400">{currentFeature?.q1.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-slate-400">Q3 (75th percentile)</p>
                  <p className="text-xl font-bold text-blue-400">{currentFeature?.q3.toLocaleString()}</p>
                </div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-400">Interquartile Range (IQR)</p>
                <p className="text-xl font-bold text-green-400">
                  {((currentFeature?.q3 || 0) - (currentFeature?.q1 || 0)).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">Outliers Detected</p>
                <p className="text-xl font-bold text-red-400">
                  {currentOutliers?.outliers} ({currentOutliers?.percentage}%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shape Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution Shape Analysis</CardTitle>
          <CardDescription>Skewness and kurtosis analysis for all features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skewnessKurtosis.map((shape) => (
              <div key={shape.feature} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{shape.feature.replace("_", " ")}</h3>
                  <div className="flex gap-2">
                    <Badge variant="outline">Skewness: {shape.skewness}</Badge>
                    <Badge variant="outline">Kurtosis: {shape.kurtosis}</Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-400">{shape.interpretation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Outlier Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Outlier Analysis</CardTitle>
          <CardDescription>Identification and analysis of outliers using IQR method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-3">Feature</th>
                  <th className="text-center p-3">Outliers</th>
                  <th className="text-center p-3">Percentage</th>
                  <th className="text-center p-3">Lower Threshold</th>
                  <th className="text-center p-3">Upper Threshold</th>
                  <th className="text-center p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {outlierData.map((outlier) => (
                  <tr key={outlier.feature} className="border-b border-slate-800">
                    <td className="p-3 font-medium">{outlier.feature.replace("_", " ")}</td>
                    <td className="text-center p-3">
                      <Badge variant={outlier.outliers > 20 ? "destructive" : "secondary"}>{outlier.outliers}</Badge>
                    </td>
                    <td className="text-center p-3">{outlier.percentage}%</td>
                    <td className="text-center p-3">{outlier.threshold_lower.toLocaleString()}</td>
                    <td className="text-center p-3">{outlier.threshold_upper.toLocaleString()}</td>
                    <td className="text-center p-3">
                      <Button variant="outline" size="sm">
                        Investigate
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
