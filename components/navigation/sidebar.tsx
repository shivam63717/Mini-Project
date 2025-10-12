"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  Brain,
  Database,
  FlaskConical,
  GitBranch,
  LineChart,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
  ChevronRight,
  Search,
  Home,
  BookOpen,
  Activity,
} from "lucide-react"

interface SidebarProps {
  className?: string
}

const navigationSections = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", icon: Home, href: "/", badge: null },
      { name: "Quick Start", icon: Zap, href: "/quickstart", badge: null },
      { name: "Projects", icon: GitBranch, href: "/projects", badge: "3" },
    ],
  },
  {
    title: "Data Science",
    items: [
      { name: "Data Explorer", icon: Database, href: "/data-explorer", badge: null },
      { name: "Feature Engineering", icon: Settings, href: "/features", badge: "New" },
      { name: "Model Training", icon: Brain, href: "/models", badge: null },
      { name: "Experiments", icon: FlaskConical, href: "/experiments", badge: "12" },
    ],
  },
  {
    title: "Analytics",
    items: [
      { name: "Visualizations", icon: BarChart3, href: "/visualizations", badge: null },
      { name: "Statistical Analysis", icon: TrendingUp, href: "/statistics", badge: null },
      { name: "Model Interpretability", icon: Target, href: "/interpretability", badge: null },
      { name: "Performance Metrics", icon: Activity, href: "/metrics", badge: null },
    ],
  },
  {
    title: "Advanced",
    items: [
      { name: "AutoML", icon: Sparkles, href: "/automl", badge: "Beta" },
      { name: "Real-time Analytics", icon: LineChart, href: "/realtime", badge: null },
      { name: "Collaboration", icon: Users, href: "/collaboration", badge: null },
      { name: "Documentation", icon: BookOpen, href: "/docs", badge: null },
    ],
  },
]

export function Sidebar({ className }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeItem, setActiveItem] = useState(pathname || "/")
  const [expandedSections, setExpandedSections] = useState<string[]>(["Overview", "Data Science"])

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionTitle) ? prev.filter((s) => s !== sectionTitle) : [...prev, sectionTitle],
    )
  }

  return (
    <div className={cn("flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border", className)}>
      {/* Header */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
          <Brain className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground">CyberML</span>
          <span className="text-xs text-sidebar-foreground/60">Data Science Platform</span>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/50" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-lg bg-sidebar-accent px-10 py-2 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
          />
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-6">
          {navigationSections.map((section) => (
            <div key={section.title}>
              <button
                onClick={() => toggleSection(section.title)}
                className="flex w-full items-center justify-between py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70 hover:text-sidebar-foreground"
              >
                {section.title}
                <ChevronRight
                  className={cn(
                    "h-3 w-3 transition-transform",
                    expandedSections.includes(section.title) && "rotate-90",
                  )}
                />
              </button>

              {expandedSections.includes(section.title) && (
                <div className="mt-2 space-y-1">
                  {section.items.map((item) => (
                    <Button
                      key={item.name}
                      variant={activeItem === item.href ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 px-3 py-2 h-auto",
                        activeItem === item.href
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                      )}
                      onClick={() => {
                        setActiveItem(item.href)
                        router.push(item.href)
                      }}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{item.name}</span>
                      {item.badge && (
                        <Badge
                          variant={item.badge === "New" || item.badge === "Beta" ? "default" : "secondary"}
                          className="h-5 px-1.5 text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-accent" />
          <div className="flex-1">
            <div className="text-sm font-medium text-sidebar-foreground">Data Scientist</div>
            <div className="text-xs text-sidebar-foreground/60">Premium Plan</div>
          </div>
        </div>
      </div>
    </div>
  )
}
