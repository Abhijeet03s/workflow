"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Clock,
  CheckCircle,
  Plus,
  FileText,
  Upload,
  UserCheck,
  Truck,
  AlertCircle,
  UserPlus,
} from "lucide-react"
import { dataStore } from "@/lib/data-store"
import type { Client, Employee } from "@/lib/types"
import { ClientManagerHeader } from "@/components/client-manager-header"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClientCard } from "@/components/client-card"

export default function ClientManagerDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [assignmentNotes, setAssignmentNotes] = useState("")

  const [clients, setClients] = useState<Client[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    setClients(dataStore.getClients())
    setEmployees(dataStore.getEmployees())
  }, [])

  const activeClients = clients.filter((client) => !client.projectCompleted)
  const completedClients = clients.filter((client) => client.projectCompleted)
  const totalAssets = clients.reduce((sum, client) => sum + client.assets.length, 0)
  const unassignedClients = clients.filter((client) => !client.assignedEmployees || client.assignedEmployees.length === 0)
  const assignedClients = clients.filter((client) => client.assignedEmployees && client.assignedEmployees.length > 0)
  const inProgressClients = assignedClients.filter((client) => !client.projectCompleted)

  const getStageIcon = (stageId: number) => {
    switch (stageId) {
      case 1:
        return <Users className="h-4 w-4" />
      case 2:
        return <Upload className="h-4 w-4" />
      case 3:
        return <FileText className="h-4 w-4" />
      case 4:
        return <UserCheck className="h-4 w-4" />
      case 5:
        return <Truck className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStageColor = (stageId: number) => {
    switch (stageId) {
      case 1:
        return "bg-blue-500"
      case 2:
        return "bg-yellow-500"
      case 3:
        return "bg-purple-500"
      case 4:
        return "bg-green-500"
      case 5:
        return "bg-cyan-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleAssignEmployee = () => {
    if (selectedClient && selectedEmployee) {
      const updatedClient = dataStore.updateClient(selectedClient, {
        assignedEmployees: [selectedEmployee],
        stage: {
          id: 5,
          name: "Project Delivery",
          description: "Deliver completed project to client",
          completed: false,
        },
      })

      if (updatedClient) {
        // Refresh clients data
        setClients(dataStore.getClients())
        console.log("Employee assigned:", { selectedClient, selectedEmployee, assignmentNotes })
      }
    }

    setIsAssignDialogOpen(false)
    setSelectedClient("")
    setSelectedEmployee("")
    setAssignmentNotes("")
  }

  const getEmployeeWorkload = (employeeId: string) => {
    return assignedClients.filter((client) => client.assignedEmployees && client.assignedEmployees.includes(employeeId)).length
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientManagerHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Client Manager Dashboard</h1>
              <p className="text-muted-foreground">Manage your client workflows and track project progress</p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/client-manager/create-client">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Client
                </Link>
              </Button>
              <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Employee
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Assign Client to Employee</DialogTitle>
                    <DialogDescription>Select a client and employee to create a new assignment</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-select">Client</Label>
                      <Select value={selectedClient} onValueChange={setSelectedClient}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          {unassignedClients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name} - {client.company}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employee-select">Employee</Label>
                      <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name} - {employee.role} ({getEmployeeWorkload(employee.id)} assigned)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Assignment Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any specific instructions or notes for this assignment..."
                        value={assignmentNotes}
                        onChange={(e) => setAssignmentNotes(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleAssignEmployee}
                        disabled={!selectedClient || !selectedEmployee}
                        className="flex-1"
                      >
                        Create Assignment
                      </Button>
                      <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="active">Active Projects</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <div className="space-y-8">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clients.length}</div>
                    <p className="text-xs text-muted-foreground">All registered clients</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                    <Clock className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activeClients.length}</div>
                    <p className="text-xs text-muted-foreground">Currently in progress</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Delivered Projects</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{completedClients.length}</div>
                    <p className="text-xs text-muted-foreground">Successfully delivered</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{assignedClients.length}</div>
                    <p className="text-xs text-muted-foreground">Active assignments</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{unassignedClients.length}</div>
                    <p className="text-xs text-muted-foreground">Awaiting assignment</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                    <Clock className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{inProgressClients.length}</div>
                    <p className="text-xs text-muted-foreground">Being worked on</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Active Projects</h2>
                <p className="text-muted-foreground">{activeClients.length} projects in progress</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeClients.map((client) => (
                  <ClientCard key={client.id} client={client} showEmployeeProgress={true} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="delivered" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Delivered Projects</h2>
                <p className="text-muted-foreground">{completedClients.length} projects completed</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {completedClients.map((client) => (
                  <ClientCard key={client.id} client={client} showEmployeeProgress={true} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
