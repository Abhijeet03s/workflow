"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Video,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  UserPlus
} from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { dataStore } from "@/lib/data-store"
import type { Client, Project, Task, VideoStage } from "@/lib/types"
import { CCT_MEMBERS } from "@/lib/types"

export default function ClientDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [videoStages, setVideoStages] = useState<VideoStage[]>([])

  // Assignment modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedVideoStage, setSelectedVideoStage] = useState<VideoStage | null>(null)
  const [selectedAssignee, setSelectedAssignee] = useState<string>("")

  useEffect(() => {
    // Check authentication
    if (!auth.hasRole('manager')) {
      router.push('/manager/login')
      return
    }

    // Load data
    const clientData = dataStore.getClient(clientId)
    if (!clientData) {
      router.push('/manager/dashboard')
      return
    }

    const projectData = dataStore.getCurrentProjectForClient(clientId)
    const tasksData = projectData ? dataStore.getTasksByProject(projectData.id) : []

    // Get all video stages for video tasks
    const allStages: VideoStage[] = []
    tasksData.filter(t => t.type === 'video').forEach(task => {
      allStages.push(...dataStore.getVideoStagesByTask(task.id))
    })

    setClient(clientData)
    setProject(projectData || null)
    setTasks(tasksData)
    setVideoStages(allStages)
  }, [clientId, router])

  if (!client || !project) {
    return <div>Loading...</div>
  }

  const progress = dataStore.calculateClientProgress(clientId)
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

  const openAssignModal = (task: Task) => {
    setSelectedTask(task)
    setSelectedVideoStage(null)
    setSelectedAssignee(task.assignedTo || "unassigned")
    setIsAssignModalOpen(true)
  }

  const openAssignModalForStage = (stage: VideoStage) => {
    setSelectedTask(null)
    setSelectedVideoStage(stage)
    setSelectedAssignee(stage.assignedTo || "unassigned")
    setIsAssignModalOpen(true)
  }

  const handleAssignment = () => {
    if (!selectedAssignee) return

    const isUnassigned = selectedAssignee === 'unassigned'
    const assigneeMember = isUnassigned ? null : CCT_MEMBERS.find(m => m.email === selectedAssignee)

    if (selectedTask) {
      // Update task with new assignee
      dataStore.updateTask(selectedTask.id, {
        assignedTo: isUnassigned ? undefined : selectedAssignee,
        assignedToName: isUnassigned ? undefined : assigneeMember?.name
      })
    } else if (selectedVideoStage) {
      // Update video stage with new assignee
      dataStore.updateVideoStage(selectedVideoStage.id, {
        assignedTo: isUnassigned ? '' : selectedAssignee,
        assignedToName: isUnassigned ? '' : assigneeMember?.name
      })
    }

    // Refresh data
    const projectData = dataStore.getCurrentProjectForClient(clientId)
    const tasksData = projectData ? dataStore.getTasksByProject(projectData.id) : []
    const allStages: VideoStage[] = []
    tasksData.filter(t => t.type === 'video').forEach(task => {
      allStages.push(...dataStore.getVideoStagesByTask(task.id))
    })
    setTasks(tasksData)
    setVideoStages(allStages)

    // Close modal
    setIsAssignModalOpen(false)
    setSelectedTask(null)
    setSelectedVideoStage(null)
    setSelectedAssignee("")
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/manager/dashboard"
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
        {/* Client Info Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{client.businessName}</h1>
                    <Badge variant={getPlanBadgeColor(client.plan)}>
                      {client.plan.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-gray-600">Owner: {client.ownerName}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{progress}%</div>
                <p className="text-sm text-gray-600">Complete</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{client.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium">{formatDate(client.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Project Progress</p>
                <p className="text-sm text-gray-600">
                  {project.completedPosts + project.completedVideos} / {project.totalPosts + project.totalVideos} tasks completed
                </p>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Tasks Overview */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="posts">Posts ({postTasks.length})</TabsTrigger>
            <TabsTrigger value="videos">Videos ({videoTasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Posts Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Social Media Posts
                  </CardTitle>
                  <CardDescription>
                    {project.completedPosts} of {project.totalPosts} completed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={(project.completedPosts / project.totalPosts) * 100}
                    className="mb-4"
                  />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Completed</span>
                      <span className="font-medium">{project.completedPosts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>In Progress</span>
                      <span className="font-medium">
                        {postTasks.filter(t => t.status === 'in-progress').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Not Started</span>
                      <span className="font-medium">
                        {postTasks.filter(t => t.status === 'not-started').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Videos Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    AI Videos
                  </CardTitle>
                  <CardDescription>
                    {project.completedVideos} of {project.totalVideos} completed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={(project.completedVideos / project.totalVideos) * 100}
                    className="mb-4"
                  />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Completed</span>
                      <span className="font-medium">{project.completedVideos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>In Progress</span>
                      <span className="font-medium">
                        {videoTasks.filter(t => t.status === 'in-progress').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Not Started</span>
                      <span className="font-medium">
                        {videoTasks.filter(t => t.status === 'not-started').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Posts</CardTitle>
                <CardDescription>All post tasks for this client</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {postTasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(task.status)}
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-gray-600">
                            Assigned to: {task.assignedToName || 'Unassigned'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Delivery Date</p>
                          <p className="font-medium">{formatDate(task.deliveryDate)}</p>
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('-', ' ')}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAssignModal(task)}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
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
                <CardTitle>AI Videos</CardTitle>
                <CardDescription>Video production stages and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {videoTasks.map(task => {
                    const stages = videoStages.filter(s => s.taskId === task.id)
                    const videoProgress = dataStore.calculateVideoProgress(task.id)

                    return (
                      <div key={task.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold">{task.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{videoProgress}%</span>
                            <Progress value={videoProgress} className="w-20" />
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-5">
                          {stages.map((stage, index) => (
                            <div
                              key={stage.id}
                              className={`p-3 rounded-lg border-2 ${
                                stage.status === 'complete'
                                  ? 'border-green-200 bg-green-50'
                                  : stage.status === 'in-progress'
                                  ? 'border-blue-200 bg-blue-50'
                                  : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {getStatusIcon(stage.status)}
                                <span className="text-sm font-medium">
                                  {stage.stageName.charAt(0).toUpperCase() + stage.stageName.slice(1)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mb-1">
                                {stage.assignedToName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(stage.deliveryDate)}
                              </p>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="w-full mt-2 h-6"
                                onClick={() => openAssignModalForStage(stage)}
                              >
                                <UserPlus className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
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

      {/* Assignment Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
            <DialogDescription>
              Assign or reassign this task to a CCT member
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{selectedTask ? 'Task' : 'Video Stage'}</Label>
              <p className="text-sm font-medium">
                {selectedTask?.title ||
                 (selectedVideoStage && `${selectedVideoStage.stageName.charAt(0).toUpperCase() + selectedVideoStage.stageName.slice(1)} Stage`)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assign to</Label>
              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a CCT member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {(() => {
                    // Filter CCT members based on task type or video stage
                    let filteredMembers = CCT_MEMBERS

                    if (selectedTask) {
                      if (selectedTask.type === 'post' || selectedTask.type === 'infographic') {
                        filteredMembers = CCT_MEMBERS.filter(m => m.role === 'designer')
                      } else if (selectedTask.type === 'newsletter') {
                        filteredMembers = CCT_MEMBERS.filter(m => m.role === 'scriptWriter')
                      } else if (selectedTask.type === 'podcast') {
                        filteredMembers = CCT_MEMBERS.filter(m => m.role === 'voiceSpecialist')
                      }
                    } else if (selectedVideoStage) {
                      // Filter based on video stage type
                      const stageRoleMap: Record<string, string> = {
                        script: 'scriptWriter',
                        images: 'imageSpecialist',
                        motion: 'motionDesigner',
                        voice: 'voiceSpecialist',
                        edit: 'videoEditor'
                      }
                      const requiredRole = stageRoleMap[selectedVideoStage.stageName]
                      if (requiredRole) {
                        filteredMembers = CCT_MEMBERS.filter(m => m.role === requiredRole)
                      }
                    }

                    return filteredMembers.map(member => (
                      <SelectItem key={member.email} value={member.email}>
                        {member.name} - {member.role}
                      </SelectItem>
                    ))
                  })()}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignment}>
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}