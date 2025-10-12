"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Zap, Eye, Activity, Brain } from "lucide-react"
import TimeSeriesAnalysis from "@/components/analytics/time-series-analysis"
import ClusteringAnalysis from "@/components/analytics/clustering-analysis"
import AnomalyDetection from "@/components/analytics/anomaly-detection"
import NetworkAnalysis from "@/components/analytics/network-analysis"
import PredictiveModeling from "@/components/analytics/predictive-modeling"
import RealTimeMonitoring from "@/components/analytics/real-time-monitoring"

export default function AdvancedAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Advanced Analytics
          </h1>
          <p className="text-slate-400 mt-2">Deep insights and advanced visualizations for cybersecurity data</p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
          <Eye className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Trends</p>
                <p className="text-xl font-bold text-cyan-400">↗ 23%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Brain className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Clusters</p>
                <p className="text-xl font-bold text-purple-400">7</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Zap className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Anomalies</p>
                <p className="text-xl font-bold text-red-400">142</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Activity className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Networks</p>
                <p className="text-xl font-bold text-green-400">34</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <BarChart3 className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Predictions</p>
                <p className="text-xl font-bold text-orange-400">96.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Eye className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Real-time</p>
                <p className="text-xl font-bold text-blue-400">Live</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timeseries" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-slate-800/50">
          <TabsTrigger value="timeseries" className="data-[state=active]:bg-cyan-500/20">
            Time Series
          </TabsTrigger>
          <TabsTrigger value="clustering" className="data-[state=active]:bg-cyan-500/20">
            Clustering
          </TabsTrigger>
          <TabsTrigger value="anomaly" className="data-[state=active]:bg-cyan-500/20">
            Anomaly
          </TabsTrigger>
          <TabsTrigger value="network" className="data-[state=active]:bg-cyan-500/20">
            Network
          </TabsTrigger>
          <TabsTrigger value="predictive" className="data-[state=active]:bg-cyan-500/20">
            Predictive
          </TabsTrigger>
          <TabsTrigger value="realtime" className="data-[state=active]:bg-cyan-500/20">
            Real-time
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeseries">
          <TimeSeriesAnalysis />
        </TabsContent>

        <TabsContent value="clustering">
          <ClusteringAnalysis />
        </TabsContent>

        <TabsContent value="anomaly">
          <AnomalyDetection />
        </TabsContent>

        <TabsContent value="network">
          <NetworkAnalysis />
        </TabsContent>

        <TabsContent value="predictive">
          <PredictiveModeling />
        </TabsContent>

        <TabsContent value="realtime">
          <RealTimeMonitoring />
        </TabsContent>
      </Tabs>
    </div>
  )
}
