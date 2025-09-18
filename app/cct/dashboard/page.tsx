"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Building2,
  FileText,
  Video,
  LogOut,
  Edit,
  Folder,
  Download
} from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { dataStore } from "@/lib/data-store"
import type { Task, VideoStage, Client } from "@/lib/types"

export default function CCTDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [videoStages, setVideoStages] = useState<VideoStage[]>([])
  const [clients, setClients] = useState<Client[]>([])

  // Modal state
  const [selectedItem, setSelectedItem] = useState<(Task | VideoStage) | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deliveryDate, setDeliveryDate] = useState("")
  const [status, setStatus] = useState("")

  useEffect(() => {
    // Check authentication
    if (!auth.hasRole('cct')) {
      router.push('/cct/login')
      return
    }

    const session = auth.getSession()
    if (session) {
      setUser({ name: session.name, email: session.email })

      // Load user's tasks
      const userTasks = dataStore.getTasksByAssignee(session.email)
      const userVideoStages = dataStore.getVideoStagesByAssignee(session.email)
      const allClients = dataStore.getClients()

      setTasks(userTasks)
      setVideoStages(userVideoStages)
      setClients(allClients)
    }
  }, [router])

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    return client?.businessName || 'Unknown Client'
  }

  const handleUpdateItem = () => {
    if (!selectedItem) return

    if ('type' in selectedItem) {
      // It's a Task
      dataStore.updateTask(selectedItem.id, {
        deliveryDate: deliveryDate || selectedItem.deliveryDate,
        status: status as any || selectedItem.status
      })
    } else {
      // It's a VideoStage
      const canUpdate = !selectedItem.dependsOn ||
        videoStages.find(s => s.id === selectedItem.dependsOn)?.status === 'complete'

      if (!canUpdate && status !== 'not-started') {
        alert('Cannot update this stage until the previous stage is complete')
        return
      }

      dataStore.updateVideoStage(selectedItem.id, {
        deliveryDate: deliveryDate || selectedItem.deliveryDate,
        status: status as any || selectedItem.status
      })
    }

    // Refresh data
    if (user) {
      const userTasks = dataStore.getTasksByAssignee(user.email)
      const userVideoStages = dataStore.getVideoStagesByAssignee(user.email)
      setTasks(userTasks)
      setVideoStages(userVideoStages)
    }

    setIsModalOpen(false)
    setSelectedItem(null)
    setDeliveryDate("")
    setStatus("")
  }

  const openUpdateModal = (item: Task | VideoStage) => {
    setSelectedItem(item)
    setDeliveryDate(item.deliveryDate || "")
    setStatus(item.status)
    setIsModalOpen(true)
  }

  const handleLogout = () => {
    auth.logout()
    router.push('/')
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString()
  }

  const pendingTasks = tasks.filter(t => t.status === 'not-started')
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress')
  const completedTasks = tasks.filter(t => t.status === 'complete')

  const pendingStages = videoStages.filter(s => s.status === 'not-started')
  const inProgressStages = videoStages.filter(s => s.status === 'in-progress')
  const completedStages = videoStages.filter(s => s.status === 'complete')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">CCT Dashboard</h1>
              {user && (
                <span className="text-sm text-gray-600">
                  Welcome, {user.name}
                </span>
              )}
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length + videoStages.length}</div>
              <p className="text-xs text-muted-foreground">Posts + Video stages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressTasks.length + inProgressStages.length}</div>
              <p className="text-xs text-muted-foreground">Currently working on</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks.length + completedStages.length}</div>
              <p className="text-xs text-muted-foreground">Successfully finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTasks.length + pendingStages.length}</div>
              <p className="text-xs text-muted-foreground">Not started yet</p>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingTasks.length + pendingStages.length})
            </TabsTrigger>
            <TabsTrigger value="progress">
              In Progress ({inProgressTasks.length + inProgressStages.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedTasks.length + completedStages.length})
            </TabsTrigger>
            <TabsTrigger value="assets">
              <Folder className="h-4 w-4 mr-2" />
              Client Assets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Tasks</CardTitle>
                <CardDescription>All tasks assigned to you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Post Tasks */}
                  {tasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-gray-600">
                            Client: {getClientName(task.clientId)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Delivery</p>
                          <p className="font-medium">{formatDate(task.deliveryDate)}</p>
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('-', ' ')}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openUpdateModal(task)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Video Stages */}
                  {videoStages.map(stage => (
                    <div
                      key={stage.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <Video className="h-5 w-5 text-purple-600" />
                        <div>
                          <h4 className="font-medium">
                            {stage.stageName.charAt(0).toUpperCase() + stage.stageName.slice(1)} Stage
                          </h4>
                          <p className="text-sm text-gray-600">
                            Video Stage {stage.stageNumber}/5
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Delivery</p>
                          <p className="font-medium">{formatDate(stage.deliveryDate)}</p>
                        </div>
                        <Badge className={getStatusColor(stage.status)}>
                          {stage.status.replace('-', ' ')}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openUpdateModal(stage)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {tasks.length === 0 && videoStages.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned</h3>
                      <p className="text-gray-600">You don't have any tasks assigned yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Tasks</CardTitle>
                <CardDescription>Tasks that haven't been started yet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...pendingTasks, ...pendingStages].map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {'type' in item ?
                          <FileText className="h-5 w-5 text-blue-600" /> :
                          <Video className="h-5 w-5 text-purple-600" />
                        }
                        <div>
                          <h4 className="font-medium">
                            {'type' in item ? item.title :
                              `${item.stageName.charAt(0).toUpperCase() + item.stageName.slice(1)} Stage`
                            }
                          </h4>
                          <p className="text-sm text-gray-600">
                            {'type' in item ?
                              `Client: ${getClientName(item.clientId)}` :
                              `Video Stage ${item.stageNumber}/5`
                            }
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openUpdateModal(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>In Progress Tasks</CardTitle>
                <CardDescription>Tasks you're currently working on</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...inProgressTasks, ...inProgressStages].map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-blue-50"
                    >
                      <div className="flex items-center gap-3">
                        {'type' in item ?
                          <FileText className="h-5 w-5 text-blue-600" /> :
                          <Video className="h-5 w-5 text-purple-600" />
                        }
                        <div>
                          <h4 className="font-medium">
                            {'type' in item ? item.title :
                              `${item.stageName.charAt(0).toUpperCase() + item.stageName.slice(1)} Stage`
                            }
                          </h4>
                          <p className="text-sm text-gray-600">
                            {'type' in item ?
                              `Client: ${getClientName(item.clientId)}` :
                              `Video Stage ${item.stageNumber}/5`
                            }
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openUpdateModal(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed Tasks</CardTitle>
                <CardDescription>Tasks you've successfully finished</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...completedTasks, ...completedStages].map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-green-50"
                    >
                      <div className="flex items-center gap-3">
                        {'type' in item ?
                          <FileText className="h-5 w-5 text-blue-600" /> :
                          <Video className="h-5 w-5 text-purple-600" />
                        }
                        <div>
                          <h4 className="font-medium">
                            {'type' in item ? item.title :
                              `${item.stageName.charAt(0).toUpperCase() + item.stageName.slice(1)} Stage`
                            }
                          </h4>
                          <p className="text-sm text-gray-600">
                            {'type' in item ?
                              `Client: ${getClientName(item.clientId)}` :
                              `Video Stage ${item.stageNumber}/5`
                            }
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Completed
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets">
            <Card>
              <CardHeader>
                <CardTitle>Client Assets</CardTitle>
                <CardDescription>Access shared assets and resources from clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clients.map(client => {
                    const clientTasks = tasks.filter(t => t.clientId === client.id)
                    const clientStages = videoStages.filter(s =>
                      tasks.some(t => t.id === s.taskId && t.clientId === client.id)
                    )

                    if (clientTasks.length === 0 && clientStages.length === 0) return null

                    return (
                      <div key={client.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-gray-500" />
                            <h3 className="font-semibold">{client.businessName}</h3>
                            <Badge variant="outline">{client.plan}</Badge>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          {client.msaFile && (
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className="text-sm flex-1">MSA: {client.msaFile}</span>
                              <Button size="sm" variant="ghost">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {client.assetsFile && (
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                              <Folder className="h-4 w-4 text-green-600" />
                              <span className="text-sm flex-1">Assets: {client.assetsFile}</span>
                              <Button size="sm" variant="ghost">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 mt-3">
                          You have {clientTasks.length} posts and {clientStages.length} video stages for this client
                        </p>
                      </div>
                    )
                  })}

                  {clients.every(client => {
                    const clientTasks = tasks.filter(t => t.clientId === client.id)
                    return clientTasks.length === 0
                  }) && (
                    <div className="text-center py-8 text-gray-500">
                      <Folder className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No client assets available</p>
                      <p className="text-sm">Assets will appear here when you have tasks assigned</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Update Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Task</DialogTitle>
            <DialogDescription>
              Update the delivery date and status for this task
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-date">Delivery Date</Label>
              <Input
                id="delivery-date"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateItem} className="flex-1">
                Update Task
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}