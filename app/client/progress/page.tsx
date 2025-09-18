"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  FileText,
  Video,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { dataStore } from "@/lib/data-store"
import type { Client, Project, Task, VideoStage } from "@/lib/types"

export default function ClientProgressPage() {
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [videoStages, setVideoStages] = useState<VideoStage[]>([])

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

    // Get all video stages for video tasks
    const allStages: VideoStage[] = []
    projectTasks.filter(t => t.type === 'video').forEach(task => {
      allStages.push(...dataStore.getVideoStagesByTask(task.id))
    })

    setClient(currentClient)
    setProject(currentProject)
    setTasks(projectTasks)
    setVideoStages(allStages)
  }, [router])

  if (!client || !project) {
    return <div>Loading...</div>
  }

  const progress = dataStore.calculateClientProgress(client.id)
  const postTasks = tasks.filter(t => t.type === 'post')
  const videoTasks = tasks.filter(t => t.type === 'video')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled'
    return new Date(dateString).toLocaleDateString()
  }

  const handleDownload = (taskTitle: string) => {
    alert(`Download started for: ${taskTitle}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/client/dashboard"
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{client.businessName}</h1>
              <p className="text-gray-600">Project Progress Details</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Overall Progress</h2>
              <span className="text-3xl font-bold text-purple-600">{progress}%</span>
            </div>
            <Progress value={progress} className="h-4 mb-2" />
            <p className="text-sm text-gray-600">
              {project.completedPosts + project.completedVideos} of {project.totalPosts + project.totalVideos} deliverables completed
            </p>
          </div>
        </div>

        {/* Progress Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="posts">Posts ({postTasks.length})</TabsTrigger>
            <TabsTrigger value="videos">Videos ({videoTasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Social Media Posts
                </CardTitle>
                <CardDescription>
                  Track the progress of your social media content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {postTasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(task.status)}
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-gray-600">
                            Assigned to: {task.assignedToName || 'Team member'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Expected Delivery</p>
                          <p className="font-medium">{formatDate(task.deliveryDate)}</p>
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('-', ' ')}
                        </Badge>
                        {task.status === 'complete' && (
                          <Button
                            size="sm"
                            onClick={() => handleDownload(task.title)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  AI Videos
                </CardTitle>
                <CardDescription>
                  Track the 5-stage video production process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {videoTasks.map(task => {
                    const stages = videoStages.filter(s => s.taskId === task.id)
                    const videoProgress = dataStore.calculateVideoProgress(task.id)

                    return (
                      <div key={task.id} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-lg font-semibold">{task.title}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">{videoProgress}% complete</span>
                            <Progress value={videoProgress} className="w-24" />
                            {task.status === 'complete' && (
                              <Button
                                size="sm"
                                onClick={() => handleDownload(task.title)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-5">
                          {stages.map((stage, index) => {
                            const isActive = stage.status === 'in-progress'
                            const isComplete = stage.status === 'complete'
                            const isPending = stage.status === 'not-started'

                            return (
                              <div
                                key={stage.id}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                  isComplete
                                    ? 'border-green-200 bg-green-50'
                                    : isActive
                                    ? 'border-blue-200 bg-blue-50'
                                    : 'border-gray-200 bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  {getStatusIcon(stage.status)}
                                  <span className="text-sm font-medium">
                                    {stage.stageName.charAt(0).toUpperCase() + stage.stageName.slice(1)}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-600">
                                    {stage.assignedToName}
                                  </p>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-gray-400" />
                                    <p className="text-xs text-gray-500">
                                      {formatDate(stage.deliveryDate)}
                                    </p>
                                  </div>
                                  {stage.status === 'complete' && stage.completedAt && (
                                    <p className="text-xs text-green-600">
                                      ✓ Completed {formatDate(stage.completedAt)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-gray-600">
                            Current Stage: <span className="font-medium">
                              {stages.find(s => s.status === 'in-progress')?.stageName
                                ?.charAt(0).toUpperCase() +
                                stages.find(s => s.status === 'in-progress')?.stageName?.slice(1) ||
                                (videoProgress === 100 ? 'Completed' : 'Script')}
                            </span>
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}