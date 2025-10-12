"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts"
import { Target, Play, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useState } from "react"

const testResults = [
  {
    id: "test_001",
    name: "T-Test: Threat Scores Before vs After Security Update",
    type: "two_sample_ttest",
    hypothesis: "H0: μ1 = μ2 (no difference), H1: μ1 ≠ μ2 (significant difference)",
    statistic: -3.45,
    pValue: 0.0012,
    criticalValue: 1.96,
    alpha: 0.05,
    conclusion: "reject_null",
    effectSize: 0.67,
    powerAnalysis: 0.89,
    sampleSize1: 150,
    sampleSize2: 145,
  },
  {
    id: "test_002",
    name: "Chi-Square: Independence of Attack Type and Time of Day",
    type: "chi_square",
    hypothesis: "H0: Variables are independent, H1: Variables are dependent",
    statistic: 23.67,
    pValue: 0.0001,
    criticalValue: 12.59,
    alpha: 0.05,
    conclusion: "reject_null",
    degreesOfFreedom: 6,
    cramersV: 0.34,
    sampleSize1: 500,
    sampleSize2: null,
  },
  {
    id: "test_003",
    name: "ANOVA: Mean Response Time Across Different Threat Levels",
    type: "anova",
    hypothesis: "H0: μ1 = μ2 = μ3 = μ4, H1: At least one mean differs",
    statistic: 8.92,
    pValue: 0.0003,
    criticalValue: 2.76,
    alpha: 0.05,
    conclusion: "reject_null",
    etaSquared: 0.23,
    groups: 4,
    totalSampleSize: 200,
  },
]

const powerAnalysisData = [
  { sampleSize: 10, power: 0.12 },
  { sampleSize: 20, power: 0.28 },
  { sampleSize: 30, power: 0.45 },
  { sampleSize: 50, power: 0.67 },
  { sampleSize: 75, power: 0.82 },
  { sampleSize: 100, power: 0.91 },
  { sampleSize: 150, power: 0.97 },
  { sampleSize: 200, power: 0.99 },
]

const distributionData = [
  { x: -4, normal: 0.0001, t: 0.0002 },
  { x: -3, normal: 0.0044, t: 0.0067 },
  { x: -2, normal: 0.054, t: 0.0637 },
  { x: -1, normal: 0.242, t: 0.2365 },
  { x: 0, normal: 0.3989, t: 0.3183 },
  { x: 1, normal: 0.242, t: 0.2365 },
  { x: 2, normal: 0.054, t: 0.0637 },
  { x: 3, normal: 0.0044, t: 0.0067 },
  { x: 4, normal: 0.0001, t: 0.0002 },
]

export default function HypothesisTesting() {
  const [selectedTest, setSelectedTest] = useState("two_sample_ttest")
  const [alpha, setAlpha] = useState("0.05")
  const [isRunning, setIsRunning] = useState(false)

  const getConclusionColor = (conclusion: string) => {
    switch (conclusion) {
      case "reject_null":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "fail_to_reject":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "inconclusive":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const getConclusionIcon = (conclusion: string) => {
    switch (conclusion) {
      case "reject_null":
        return <XCircle className="h-4 w-4 text-red-400" />
      case "fail_to_reject":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "inconclusive":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      default:
        return <AlertTriangle className="h-4 w-4 text-slate-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-400" />
            Hypothesis Testing
          </h2>
          <p className="text-slate-400 mt-1">Statistical hypothesis testing and significance analysis</p>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? (
            <>
              <Target className="h-4 w-4 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Test
            </>
          )}
        </Button>
      </div>

      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>Configure your statistical hypothesis test</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Test Type</Label>
              <Select value={selectedTest} onValueChange={setSelectedTest}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_sample_ttest">One-Sample T-Test</SelectItem>
                  <SelectItem value="two_sample_ttest">Two-Sample T-Test</SelectItem>
                  <SelectItem value="paired_ttest">Paired T-Test</SelectItem>
                  <SelectItem value="chi_square">Chi-Square Test</SelectItem>
                  <SelectItem value="anova">ANOVA</SelectItem>
                  <SelectItem value="mann_whitney">Mann-Whitney U</SelectItem>
                  <SelectItem value="wilcoxon">Wilcoxon Signed-Rank</SelectItem>
                  <SelectItem value="kruskal_wallis">Kruskal-Wallis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Significance Level (α)</Label>
              <Select value={alpha} onValueChange={setAlpha}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.01">0.01 (99% confidence)</SelectItem>
                  <SelectItem value="0.05">0.05 (95% confidence)</SelectItem>
                  <SelectItem value="0.10">0.10 (90% confidence)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Alternative Hypothesis</Label>
              <Select defaultValue="two_tailed">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="two_tailed">Two-tailed (≠)</SelectItem>
                  <SelectItem value="greater">Greater than (&gt;)</SelectItem>
                  <SelectItem value="less">Less than (&lt;)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Null Hypothesis (H₀)</Label>
              <Textarea placeholder="Enter your null hypothesis..." className="min-h-[60px]" />
            </div>
            <div className="space-y-2">
              <Label>Alternative Hypothesis (H₁)</Label>
              <Textarea placeholder="Enter your alternative hypothesis..." className="min-h-[60px]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results Summary</CardTitle>
          <CardDescription>Results from recent hypothesis tests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResults.map((test) => (
              <div key={test.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{test.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge className={getConclusionColor(test.conclusion)}>
                      {getConclusionIcon(test.conclusion)}
                      <span className="ml-1">
                        {test.conclusion === "reject_null" ? "Reject H₀" : "Fail to Reject H₀"}
                      </span>
                    </Badge>
                    <Badge variant="outline">p = {test.pValue}</Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-3">{test.hypothesis}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Test Statistic</p>
                    <p className="font-medium">{test.statistic}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">P-Value</p>
                    <p className="font-medium text-blue-400">{test.pValue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Critical Value</p>
                    <p className="font-medium">{test.criticalValue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Effect Size</p>
                    <p className="font-medium">{test.effectSize || test.cramersV || test.etaSquared || "N/A"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Power Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Power Analysis</CardTitle>
            <CardDescription>Statistical power vs sample size relationship</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={powerAnalysisData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="sampleSize" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="power" stroke="#10b981" strokeWidth={3} />
                <Line
                  type="monotone"
                  dataKey={() => 0.8}
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Minimum Power (0.8)"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
              <p className="text-sm text-slate-400">
                Recommended minimum sample size for 80% power: <span className="font-medium text-green-400">75</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Test Distribution</CardTitle>
            <CardDescription>Probability distribution under null hypothesis</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="x" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="normal"
                  stackId="1"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.3}
                  name="Normal Distribution"
                />
                <Area
                  type="monotone"
                  dataKey="t"
                  stackId="2"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  name="T-Distribution"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500 rounded"></div>
                <span>Normal Distribution</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>T-Distribution</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Effect Size Interpretation */}
      <Card>
        <CardHeader>
          <CardTitle>Effect Size Interpretation</CardTitle>
          <CardDescription>Guidelines for interpreting effect sizes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h3 className="font-semibold text-green-400 mb-2">Cohen's d (T-tests)</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Small:</span> 0.2 - 0.5
                </p>
                <p>
                  <span className="font-medium">Medium:</span> 0.5 - 0.8
                </p>
                <p>
                  <span className="font-medium">Large:</span> {">"}0.8
                </p>
              </div>
            </div>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h3 className="font-semibold text-blue-400 mb-2">Eta Squared (ANOVA)</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Small:</span> 0.01 - 0.06
                </p>
                <p>
                  <span className="font-medium">Medium:</span> 0.06 - 0.14
                </p>
                <p>
                  <span className="font-medium">Large:</span> {">"}0.14
                </p>
              </div>
            </div>
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <h3 className="font-semibold text-purple-400 mb-2">Cramer's V (Chi-square)</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Small:</span> 0.1 - 0.3
                </p>
                <p>
                  <span className="font-medium">Medium:</span> 0.3 - 0.5
                </p>
                <p>
                  <span className="font-medium">Large:</span> {">"}0.5
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multiple Testing Correction */}
      <Card>
        <CardHeader>
          <CardTitle>Multiple Testing Correction</CardTitle>
          <CardDescription>Adjust p-values for multiple comparisons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Correction Method</Label>
                <Select defaultValue="bonferroni">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bonferroni">Bonferroni</SelectItem>
                    <SelectItem value="holm">Holm-Bonferroni</SelectItem>
                    <SelectItem value="benjamini_hochberg">Benjamini-Hochberg (FDR)</SelectItem>
                    <SelectItem value="benjamini_yekutieli">Benjamini-Yekutieli</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Number of Tests</Label>
                <Input placeholder="Enter number of tests" />
              </div>
            </div>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-400">
                <strong>Warning:</strong> When conducting multiple tests, the probability of Type I error increases. Use
                appropriate correction methods to maintain the desired significance level.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
