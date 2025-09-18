"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Briefcase,
  CheckCircle,
  Clock,
  Plus,
  Eye,
  LogOut,
  TrendingUp,
  FileText,
  Video
} from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { dataStore } from "@/lib/data-store"
import type { Client, Project } from "@/lib/types"

export default function ManagerDashboard() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    // Check authentication
    if (!auth.hasRole('manager')) {
      router.push('/manager/login')
      return
    }

    const session = auth.getSession()
    if (session) {
      setUser({ name: session.name, email: session.email })
    }

    // Load data
    const clientData = dataStore.getClients()
    const projectData = dataStore.getProjects()
    setClients(clientData)
    setProjects(projectData)
  }, [router])

  const activeProjects = projects.filter(p => p.status === 'active')
  const completedProjects = projects.filter(p => p.status === 'completed')

  const getClientProgress = (clientId: string) => {
    return dataStore.calculateClientProgress(clientId)
  }

  const getClientProject = (clientId: string) => {
    return dataStore.getCurrentProjectForClient(clientId)
  }

  const handleLogout = () => {
    auth.logout()
    router.push('/')
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'secondary'
      case 'standard':
        return 'default'
      case 'premium':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
              {user && (
                <span className="text-sm text-gray-600">
                  Welcome, {user.name}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild>
                <Link href="/manager/create-client">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Client
                </Link>
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
              <p className="text-xs text-muted-foreground">All registered clients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjects.length}</div>
              <p className="text-xs text-muted-foreground">Currently in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedProjects.length}</div>
              <p className="text-xs text-muted-foreground">Successfully delivered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.length > 0
                  ? Math.round((completedProjects.length / projects.length) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Completion rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Clients List */}
        <Card>
          <CardHeader>
            <CardTitle>All Clients</CardTitle>
            <CardDescription>
              Manage and monitor all client projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clients.map(client => {
                const project = getClientProject(client.id)
                const progress = getClientProgress(client.id)

                return (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{client.businessName}</h3>
                        <Badge variant={getPlanBadgeColor(client.plan)}>
                          {client.plan.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Owner: {client.ownerName} • {client.email}
                      </p>
                      {project && (
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="h-4 w-4" />
                            <span>
                              Posts: {project.completedPosts}/{project.totalPosts}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Video className="h-4 w-4" />
                            <span>
                              Videos: {project.completedVideos}/{project.totalVideos}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <Button asChild variant="outline" size="sm">
                        <Link href={`/manager/client/${client.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })}

              {clients.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first client</p>
                  <Button asChild>
                    <Link href="/manager/create-client">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Client
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}