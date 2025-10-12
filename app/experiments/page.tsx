"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Play, BarChart3, Clock, Target } from "lucide-react"
import ExperimentList from "@/components/experiments/experiment-list"
import ExperimentComparison from "@/components/experiments/experiment-comparison"
import ModelRegistry from "@/components/experiments/model-registry"
import HyperparameterTuning from "@/components/experiments/hyperparameter-tuning"

export default function ExperimentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Experiment Tracking
          </h1>
          <p className="text-slate-400 mt-2">Track, compare, and manage your machine learning experiments</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
          <Plus className="h-4 w-4 mr-2" />
          New Experiment
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Play className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Running</p>
                <p className="text-2xl font-bold text-purple-400">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Target className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-green-400">47</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <BarChart3 className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Best Accuracy</p>
                <p className="text-2xl font-bold text-blue-400">94.7%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Clock className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Avg Runtime</p>
                <p className="text-2xl font-bold text-orange-400">12.3m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="experiments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
          <TabsTrigger value="experiments" className="data-[state=active]:bg-purple-500/20">
            Experiments
          </TabsTrigger>
          <TabsTrigger value="comparison" className="data-[state=active]:bg-purple-500/20">
            Comparison
          </TabsTrigger>
          <TabsTrigger value="models" className="data-[state=active]:bg-purple-500/20">
            Model Registry
          </TabsTrigger>
          <TabsTrigger value="tuning" className="data-[state=active]:bg-purple-500/20">
            AutoML
          </TabsTrigger>
        </TabsList>

        <TabsContent value="experiments">
          <ExperimentList />
        </TabsContent>

        <TabsContent value="comparison">
          <ExperimentComparison />
        </TabsContent>

        <TabsContent value="models">
          <ModelRegistry />
        </TabsContent>

        <TabsContent value="tuning">
          <HyperparameterTuning />
        </TabsContent>
      </Tabs>
    </div>
  )
}
