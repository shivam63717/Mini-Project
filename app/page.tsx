import { Sidebar } from "@/components/navigation/sidebar"
import { Header } from "@/components/navigation/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Brain, Database, FlaskConical, TrendingUp, Zap, ArrowRight, Activity, Target } from "lucide-react"
import Link from "next/link"

const quickActions = [
  {
    title: "Upload Dataset",
    description: "Import your cybersecurity data for analysis",
    icon: Database,
    action: "Upload",
    gradient: "from-blue-500 to-cyan-500",
    href: "/data-explorer",
  },
  {
    title: "Train Model",
    description: "Create new ML models for threat detection",
    icon: Brain,
    action: "Start Training",
    gradient: "from-purple-500 to-pink-500",
    href: "/experiments",
  },
  {
    title: "Run Experiment",
    description: "Test different algorithms and parameters",
    icon: FlaskConical,
    action: "New Experiment",
    gradient: "from-green-500 to-emerald-500",
    href: "/experiments",
  },
  {
    title: "Analyze Data",
    description: "Explore patterns in your security data",
    icon: BarChart3,
    action: "Explore",
    gradient: "from-orange-500 to-red-500",
    href: "/analytics",
  },
]

const recentActivity = [
  { name: "Malware Detection Model", status: "Training", progress: 75, time: "2h ago" },
  { name: "Network Anomaly Analysis", status: "Completed", progress: 100, time: "4h ago" },
  { name: "Feature Engineering Pipeline", status: "Running", progress: 45, time: "6h ago" },
  { name: "Threat Classification", status: "Queued", progress: 0, time: "8h ago" },
]

const stats = [
  { label: "Active Models", value: "12", change: "+2", icon: Brain },
  { label: "Datasets", value: "48", change: "+5", icon: Database },
  { label: "Experiments", value: "156", change: "+12", icon: FlaskConical },
  { label: "Accuracy", value: "94.2%", change: "+1.2%", icon: Target },
]

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" subtitle="Welcome back! Here's what's happening with your data science projects." />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="gradient-card border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                          <Badge variant="secondary" className="text-xs">
                            {stat.change}
                          </Badge>
                        </div>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <stat.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Get started with common data science tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action) => (
                    <Link key={action.title} href={action.href} className="group">
                      <div
                        className="relative overflow-hidden rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-all duration-200"
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}
                        />
                        <div className="relative">
                          <div className="flex items-center justify-between mb-4">
                            <action.icon className="h-8 w-8 text-primary" />
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <h3 className="font-semibold text-foreground mb-2">{action.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                          <Button size="sm" className="w-full" asChild>
                            <span>{action.action}</span>
                          </Button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your latest experiments and model training</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-foreground">{activity.name}</h4>
                            <Badge
                              variant={activity.status === "Completed" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {activity.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={activity.progress} className="flex-1 h-2" />
                            <span className="text-xs text-muted-foreground">{activity.progress}%</span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground ml-4">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Performance Insights
                  </CardTitle>
                  <CardDescription>Key metrics and trends from your models</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
                      <div>
                        <h4 className="text-sm font-medium text-foreground">Model Accuracy</h4>
                        <p className="text-xs text-muted-foreground">Improved by 2.3% this week</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-success">94.2%</div>
                        <div className="text-xs text-success">+2.3%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-info/10 border border-info/20">
                      <div>
                        <h4 className="text-sm font-medium text-foreground">Processing Speed</h4>
                        <p className="text-xs text-muted-foreground">Average inference time</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-info">12ms</div>
                        <div className="text-xs text-info">-3ms</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                      <div>
                        <h4 className="text-sm font-medium text-foreground">Data Quality</h4>
                        <p className="text-xs text-muted-foreground">Overall data health score</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-warning">87%</div>
                        <div className="text-xs text-warning">Needs attention</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
