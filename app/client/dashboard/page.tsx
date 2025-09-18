"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  FileText,
  Video,
  TrendingUp,
  Calendar,
  LogOut,
  Eye
} from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { dataStore } from "@/lib/data-store"
import type { Client, Project, Task } from "@/lib/types"

export default function ClientDashboard() {
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    // Check authentication
    if (!auth.hasRole('client')) {
      router.push('/client/login')
      return
    }

    const currentClient = auth.getCurrentClient()
    if (!currentClient) {
      router.push('/client/login')
      return
    }

    const currentProject = dataStore.getCurrentProjectForClient(currentClient.id)
    const projectTasks = currentProject ? dataStore.getTasksByProject(currentProject.id) : []

    setClient(currentClient)
    setProject(currentProject)
    setTasks(projectTasks)
  }, [router])

  if (!client || !project) {
    return <div>Loading...</div>
  }

  const progress = dataStore.calculateClientProgress(client.id)
  const postTasks = tasks.filter(t => t.type === 'post')
  const videoTasks = tasks.filter(t => t.type === 'video')
  const completedPosts = postTasks.filter(t => t.status === 'complete').length
  const completedVideos = videoTasks.filter(t => t.status === 'complete').length

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
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{client.businessName}</h1>
                <p className="text-sm text-gray-600">Client Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline">
                <Link href="/client/progress">
                  <Eye className="h-4 w-4 mr-2" />
                  View Progress
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {client.ownerName}!
          </h2>
          <div className="flex items-center gap-3">
            <p className="text-gray-600">Your project is {progress}% complete</p>
            <Badge variant={getPlanBadgeColor(client.plan)}>
              {client.plan.toUpperCase()} Plan
            </Badge>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Project Progress Overview
            </CardTitle>
            <CardDescription>
              Current month progress for {project.monthYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold">Overall Progress</span>
                  <span className="text-2xl font-bold text-purple-600">{progress}%</span>
                </div>
                <Progress value={progress} className="h-4" />
                <p className="text-sm text-gray-600 mt-2">
                  {project.completedPosts + project.completedVideos} of {project.totalPosts + project.totalVideos} deliverables completed
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Social Media Posts</span>
                  </div>
                  <Progress
                    value={(completedPosts / project.totalPosts) * 100}
                    className="h-3"
                  />
                  <p className="text-sm text-gray-600">
                    {completedPosts} of {project.totalPosts} posts completed
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">AI Videos</span>
                  </div>
                  <Progress
                    value={(completedVideos / project.totalVideos) * 100}
                    className="h-3"
                  />
                  <p className="text-sm text-gray-600">
                    {completedVideos} of {project.totalVideos} videos completed
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deliverables</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.totalPosts + project.totalVideos}</div>
              <p className="text-xs text-muted-foreground">
                {project.totalPosts} posts + {project.totalVideos} videos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Badge className="bg-green-100 text-green-800">Done</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.completedPosts + project.completedVideos}</div>
              <p className="text-xs text-muted-foreground">
                Ready for download
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Badge className="bg-blue-100 text-blue-800">Working</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tasks.filter(t => t.status === 'in-progress').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Being worked on by team
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Completions</CardTitle>
            <CardDescription>
              Your recently completed deliverables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks
                .filter(task => task.status === 'complete')
                .slice(0, 5)
                .map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {task.type === 'post' ?
                        <FileText className="h-5 w-5 text-blue-600" /> :
                        <Video className="h-5 w-5 text-purple-600" />
                      }
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-gray-600">
                          Completed {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'recently'}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Download
                    </Button>
                  </div>
                ))
              }

              {tasks.filter(t => t.status === 'complete').length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No completions yet</h3>
                  <p className="text-gray-600">Your team is working on your deliverables.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}