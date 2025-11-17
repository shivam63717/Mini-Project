import { Sidebar } from "@/components/navigation/sidebar"
import { Header } from "@/components/navigation/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Code, FileText, Video } from "lucide-react"

const docCategories = [
  {
    title: "Getting Started",
    description: "Learn the basics of ML Vision",
    icon: BookOpen,
  },
  {
    title: "API Reference",
    description: "Complete API documentation",
    icon: Code,
  },
  {
    title: "Guides",
    description: "Step-by-step tutorials",
    icon: FileText,
  },
  {
    title: "Video Tutorials",
    description: "Watch and learn",
    icon: Video,
  },
]

export default function DocsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
              <p className="text-muted-foreground mt-2">
                Learn how to use ML Vision effectively
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {docCategories.map((category, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <category.icon className="h-5 w-5 text-primary mb-2" />
                    <CardTitle>{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="api">API</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Documentation Overview</CardTitle>
                    <CardDescription>
                      Welcome to ML Vision documentation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        ML Vision is a comprehensive machine learning platform for data science workflows.
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                        <li>Upload and explore your datasets</li>
                        <li>Perform feature engineering</li>
                        <li>Train and evaluate models</li>
                        <li>Analyze results and deploy models</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api">
                <Card>
                  <CardHeader>
                    <CardTitle>API Documentation</CardTitle>
                    <CardDescription>
                      Complete API reference
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">API documentation will appear here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="examples">
                <Card>
                  <CardHeader>
                    <CardTitle>Code Examples</CardTitle>
                    <CardDescription>
                      Practical examples and use cases
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Code examples will appear here.</p>
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

