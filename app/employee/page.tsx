"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Clock, Building2, Video, FileText, ImageIcon, Zap, Mic, Edit } from "lucide-react"
import { mockVideoProjects } from "@/lib/mock-data"
import { EmployeeHeader } from "@/components/employee-header"

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState("assigned")
  const [stageUpdates, setStageUpdates] = useState<Record<string, number>>({})

  // Mock current employee ID (in a real app, this would come from auth context)
  const currentEmployeeId = "emp-1"

  // Filter projects for current employee only
  const assignedProjects = mockVideoProjects.filter(
    (project) => project.employeeId === currentEmployeeId && !project.completed
  )
  const completedProjects = mockVideoProjects.filter(
    (project) => project.employeeId === currentEmployeeId && project.completed
  )

  const handleStageUpdate = (projectId: string, newStage: number) => {
    setStageUpdates((prev) => ({ ...prev, [projectId]: newStage }))
    console.log(`[v0] Updating project ${projectId} to stage ${newStage}`)
  }

  const getStageIcon = (stageId: number) => {
    switch (stageId) {
      case 1:
        return <FileText className="h-4 w-4" />
      case 2:
        return <Edit className="h-4 w-4" />
      case 3:
        return <ImageIcon className="h-4 w-4" />
      case 4:
        return <Zap className="h-4 w-4" />
      case 5:
        return <Mic className="h-4 w-4" />
      case 6:
        return <Video className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStageOptions = () => [
    { value: 1, label: "Asset Review" },
    { value: 2, label: "Script" },
    { value: 3, label: "Images" },
    { value: 4, label: "Motion" },
    { value: 5, label: "Voice" },
    { value: 6, label: "Edit" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <EmployeeHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Video Production Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your AI video generation projects and track production progress
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Video Projects</CardTitle>
              <Video className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignedProjects.length + completedProjects.length}</div>
              <p className="text-xs text-muted-foreground">Total assignments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Production</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignedProjects.length}</div>
              <p className="text-xs text-muted-foreground">Active projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedProjects.length}</div>
              <p className="text-xs text-muted-foreground">Videos completed</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assigned">My Projects</TabsTrigger>
            <TabsTrigger value="completed">Delivered Videos</TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="mt-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Active Video Projects ({assignedProjects.length})</h2>
              </div>

              {assignedProjects.length > 0 ? (
                <div className="grid gap-4">
                  {assignedProjects.map((project) => {
                    const currentStage = stageUpdates[project.id] || project.currentStage.id
                    return (
                      <Card key={project.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">{project.clientName}</CardTitle>
                              <CardDescription className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {project.company}
                              </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Video Project
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getStageIcon(currentStage)}
                              <span className="text-sm font-medium">Current Stage:</span>
                            </div>
                            <Select
                              value={currentStage.toString()}
                              onValueChange={(value) => handleStageUpdate(project.id, Number.parseInt(value))}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {getStageOptions().map((stage) => (
                                  <SelectItem key={stage.value} value={stage.value.toString()}>
                                    {stage.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Production Progress</span>
                              <span className="font-medium">{Math.round((currentStage / 6) * 100)}%</span>
                            </div>
                            <Progress value={(currentStage / 6) * 100} className="h-2" />
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">{project.assets.length} assets</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ImageIcon className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {project.generatedImages.length} generated
                                </span>
                              </div>
                            </div>

                            {project.videoSettings && (
                              <div className="flex gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  {project.videoSettings.duration}s
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {project.videoSettings.style}
                                </Badge>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              onClick={() => {
                                if (currentStage < 6) {
                                  handleStageUpdate(project.id, currentStage + 1)
                                }
                              }}
                              disabled={currentStage >= 6}
                            >
                              {currentStage >= 6 ? "Completed" : "Complete Stage"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Video className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No active video projects</p>
                    <p className="text-sm text-muted-foreground mt-2">Check back later for new video assignments</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Delivered Videos ({completedProjects.length})</h2>

              {completedProjects.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {completedProjects.map((project) => (
                    <Card key={project.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          {project.clientName}
                        </CardTitle>
                        <CardDescription>{project.company}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Delivered:</span>
                            <span className="font-medium">{project.deliveredAt?.toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="font-medium">{project.videoSettings?.duration}s</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Style:</span>
                            <span className="font-medium">{project.videoSettings?.style}</span>
                          </div>
                        </div>
                        <Badge variant="default" className="mt-3">
                          Video Delivered
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Video className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No completed video projects yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Complete your first video project to see it here
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
