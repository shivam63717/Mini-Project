import { Sidebar } from "@/components/navigation/sidebar"
import { Header } from "@/components/navigation/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Target, TrendingUp, Clock } from "lucide-react"

export default function MetricsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Performance Metrics</h1>
              <p className="text-muted-foreground mt-2">
                Monitor and analyze model performance metrics
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94.2%</div>
                  <p className="text-xs text-muted-foreground">+2.1% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Precision</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">91.8%</div>
                  <p className="text-xs text-muted-foreground">+1.5% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recall</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89.5%</div>
                  <p className="text-xs text-muted-foreground">+0.8% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">F1 Score</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">90.6%</div>
                  <p className="text-xs text-muted-foreground">+1.2% from last month</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="training">Training Metrics</TabsTrigger>
                <TabsTrigger value="validation">Validation Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Model Performance Overview</CardTitle>
                    <CardDescription>
                      Overall performance metrics across all models
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Metrics visualization will appear here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="training">
                <Card>
                  <CardHeader>
                    <CardTitle>Training Metrics</CardTitle>
                    <CardDescription>
                      Track training progress and metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Training metrics will appear here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="validation">
                <Card>
                  <CardHeader>
                    <CardTitle>Validation Metrics</CardTitle>
                    <CardDescription>
                      Validation performance across different models
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Validation metrics will appear here.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

