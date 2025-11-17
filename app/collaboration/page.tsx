import { Sidebar } from "@/components/navigation/sidebar"
import { Header } from "@/components/navigation/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Share2 } from "lucide-react"

export default function CollaborationPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Collaboration</h1>
                <p className="text-muted-foreground mt-2">
                  Work together with your team on ML projects
                </p>
              </div>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Team Member
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <Users className="h-5 w-5 text-primary mb-2" />
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage your team and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active members</span>
                      <Badge>5</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Share2 className="h-5 w-5 text-primary mb-2" />
                  <CardTitle>Shared Projects</CardTitle>
                  <CardDescription>
                    Projects shared with your team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Shared projects</span>
                      <Badge>12</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity Feed</CardTitle>
                  <CardDescription>
                    Recent team activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Recent team activities will appear here.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  View and manage team members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Team member list will appear here.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

