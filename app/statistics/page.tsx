

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, BarChart3, TrendingUp, Target, Zap, Activity } from "lucide-react"
import DescriptiveStatistics from "@/components/statistics/descriptive-statistics"
import HypothesisTesting from "@/components/statistics/hypothesis-testing"
import CorrelationAnalysis from "@/components/statistics/correlation-analysis"
import RegressionAnalysis from "@/components/statistics/regression-analysis"
import DistributionAnalysis from "@/components/statistics/distribution-analysis"
import BayesianAnalysis from "@/components/statistics/bayesian-analysis"

export default function StatisticalAnalysisPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
            Statistical Analysis
          </h1>
          <p className="text-slate-400 mt-2">Comprehensive statistical tools for data science and research</p>
        </div>
        <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
          <Calculator className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <BarChart3 className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Descriptive</p>
                <p className="text-xl font-bold text-green-400">Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Target className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Tests</p>
                <p className="text-xl font-bold text-blue-400">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Activity className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Correlation</p>
                <p className="text-xl font-bold text-purple-400">0.87</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">R²</p>
                <p className="text-xl font-bold text-orange-400">0.94</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Zap className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">P-value</p>
                <p className="text-xl font-bold text-cyan-400">0.001</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border-pink-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-500/20 rounded-lg">
                <Calculator className="h-4 w-4 text-pink-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Bayesian</p>
                <p className="text-xl font-bold text-pink-400">95%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="descriptive" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-slate-800/50">
          <TabsTrigger value="descriptive" className="data-[state=active]:bg-green-500/20">
            Descriptive
          </TabsTrigger>
          <TabsTrigger value="hypothesis" className="data-[state=active]:bg-green-500/20">
            Hypothesis
          </TabsTrigger>
          <TabsTrigger value="correlation" className="data-[state=active]:bg-green-500/20">
            Correlation
          </TabsTrigger>
          <TabsTrigger value="regression" className="data-[state=active]:bg-green-500/20">
            Regression
          </TabsTrigger>
          <TabsTrigger value="distribution" className="data-[state=active]:bg-green-500/20">
            Distribution
          </TabsTrigger>
          <TabsTrigger value="bayesian" className="data-[state=active]:bg-green-500/20">
            Bayesian
          </TabsTrigger>
        </TabsList>

        <TabsContent value="descriptive">
          <DescriptiveStatistics />
        </TabsContent>

        <TabsContent value="hypothesis">
          <HypothesisTesting />
        </TabsContent>

        <TabsContent value="correlation">
          <CorrelationAnalysis />
        </TabsContent>

        <TabsContent value="regression">
          <RegressionAnalysis />
        </TabsContent>

        <TabsContent value="distribution">
          <DistributionAnalysis />
        </TabsContent>

        <TabsContent value="bayesian">
          <BayesianAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  )
}
