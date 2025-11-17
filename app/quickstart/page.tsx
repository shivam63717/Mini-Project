import { Sidebar } from "@/components/navigation/sidebar"
import { Header } from "@/components/navigation/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"

const steps = [
  {
    title: "Upload Your Data",
    description: "Import CSV files or connect to your data source",
    href: "/data-explorer",
  },
  {
    title: "Explore & Analyze",
    description: "Use our data explorer to understand your dataset",
    href: "/data-explorer",
  },
  {
    title: "Feature Engineering",
    description: "Create and transform features for better models",
    href: "/features",
  },
  {
    title: "Train Models",
    description: "Build and train machine learning models",
    href: "/experiments",
  },
  {
    title: "Evaluate & Deploy",
    description: "Analyze results and deploy your best models",
    href: "/analytics",
  },
]

export default function QuickStartPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Quick Start Guide</h1>
              <p className="text-muted-foreground mt-2">
                Get started with ML Vision in 5 simple steps
              </p>
            </div>

            <div className="grid gap-4">
              {steps.map((step, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <CardTitle>{step.title}</CardTitle>
                          <CardDescription>{step.description}</CardDescription>
                        </div>
                      </div>
                      <Link href={step.href}>
                        <Button variant="outline" size="sm">
                          Go <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ready to get started?</CardTitle>
                <CardDescription>
                  Follow the steps above to begin your machine learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/data-explorer">
                  <Button size="lg" className="w-full">
                    Start with Data Explorer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

