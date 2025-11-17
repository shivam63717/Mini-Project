import { Sidebar } from "@/components/navigation/sidebar"
import { Header } from "@/components/navigation/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Plus, TrendingUp } from "lucide-react"

export default function ModelsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Model Registry</h1>
                <p className="text-muted-foreground mt-2">
                  Manage and track your trained models
                </p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Train New Model
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Brain className="h-5 w-5 text-primary" />
                      <Badge variant="outline">v{i}.0</Badge>
                    </div>
                    <CardTitle className="mt-4">Model {i}</CardTitle>
                    <CardDescription>
                      Trained on {new Date().toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Accuracy</span>
                        <span className="font-medium">{(95 - i * 2).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

