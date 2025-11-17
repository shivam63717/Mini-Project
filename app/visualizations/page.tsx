import { Sidebar } from "@/components/navigation/sidebar"
import { Header } from "@/components/navigation/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, LineChart, PieChart, Scatter } from "lucide-react"

export default function VisualizationsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Visualizations</h1>
              <p className="text-muted-foreground mt-2">
                Create and explore data visualizations
              </p>
            </div>

            <Tabs defaultValue="charts" className="space-y-4">
              <TabsList>
                <TabsTrigger value="charts">Charts</TabsTrigger>
                <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="charts" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <CardTitle>Bar Charts</CardTitle>
                      <CardDescription>Compare categories</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader>
                      <LineChart className="h-5 w-5 text-primary" />
                      <CardTitle>Line Charts</CardTitle>
                      <CardDescription>Track trends over time</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader>
                      <PieChart className="h-5 w-5 text-primary" />
                      <CardTitle>Pie Charts</CardTitle>
                      <CardDescription>Show proportions</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader>
                      <Scatter className="h-5 w-5 text-primary" />
                      <CardTitle>Scatter Plots</CardTitle>
                      <CardDescription>Explore correlations</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="dashboards">
                <Card>
                  <CardHeader>
                    <CardTitle>Dashboards</CardTitle>
                    <CardDescription>
                      Create interactive dashboards with multiple visualizations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">No dashboards yet. Create your first dashboard to get started.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports">
                <Card>
                  <CardHeader>
                    <CardTitle>Reports</CardTitle>
                    <CardDescription>
                      Generate and export reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">No reports yet. Generate your first report to get started.</p>
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

