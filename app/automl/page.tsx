import { Sidebar } from "@/components/navigation/sidebar"
import { Header } from "@/components/navigation/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Play, Settings } from "lucide-react"

export default function AutoMLPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight">AutoML</h1>
                  <Badge variant="secondary">Beta</Badge>
                </div>
                <p className="text-muted-foreground mt-2">
                  Automatically find the best model for your data
                </p>
              </div>
              <Button>
                <Play className="mr-2 h-4 w-4" />
                Start AutoML
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <Sparkles className="h-5 w-5 text-primary mb-2" />
                  <CardTitle>Automated Model Selection</CardTitle>
                  <CardDescription>
                    Let AutoML find the best algorithm for your dataset
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Automatic hyperparameter tuning</li>
                    <li>• Multiple algorithm testing</li>
                    <li>• Best model recommendation</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Settings className="h-5 w-5 text-primary mb-2" />
                  <CardTitle>Configuration</CardTitle>
                  <CardDescription>
                    Configure your AutoML experiment settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Time budget: 1 hour</li>
                    <li>• Algorithms: All available</li>
                    <li>• Cross-validation: 5-fold</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent AutoML Runs</CardTitle>
                <CardDescription>
                  View your automated model training history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No AutoML runs yet. Start your first run to get started.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

