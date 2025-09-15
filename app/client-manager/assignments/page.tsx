"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Users, Search, Filter, UserPlus, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { ClientManagerHeader } from "@/components/client-manager-header"
import { AssignmentCard } from "@/components/assignment-card"
import { EmployeeWorkloadCard } from "@/components/employee-workload-card"
import { mockClients, mockEmployees } from "@/lib/mock-data"

export default function AssignmentsPage() {
  const [activeTab, setActiveTab] = useState("assignments")
  const [searchTerm, setSearchTerm] = useState("")
  const [employeeFilter, setEmployeeFilter] = useState("all")
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [assignmentNotes, setAssignmentNotes] = useState("")

  const unassignedClients = mockClients.filter((client) => !client.assignedEmployees || client.assignedEmployees.length === 0)
  const assignedClients = mockClients.filter((client) => client.assignedEmployees && client.assignedEmployees.length > 0)

  const filteredAssignments = assignedClients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEmployee = employeeFilter === "all" || (client.assignedEmployees && client.assignedEmployees.includes(employeeFilter))
    return matchesSearch && matchesEmployee
  })

  const handleAssignEmployee = () => {
    console.log("Assigning employee:", { selectedClient, selectedEmployee, assignmentNotes })
    // Mock assignment logic
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
              <h1 className="text-3xl font-bold text-foreground mb-2">Assignment Management</h1>
              <p className="text-muted-foreground">Assign clients to employees and track progress</p>
            </div>
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  New Assignment
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
                        {mockEmployees.map((employee) => (
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

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
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
              <div className="text-2xl font-bold">
                {assignedClients.filter((client) => !client.projectCompleted).length}
              </div>
              <p className="text-xs text-muted-foreground">Being worked on</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignedClients.filter((client) => client.projectCompleted).length}
              </div>
              <p className="text-xs text-muted-foreground">Successfully delivered</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="workload">Team Workload</TabsTrigger>
            <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="mt-6">
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {mockEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assignments List */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAssignments.map((client) => (
                  <AssignmentCard key={client.id} client={client} />
                ))}
              </div>

              {filteredAssignments.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No assignments found</p>
                    <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="workload" className="mt-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Team Workload Overview</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockEmployees.map((employee) => (
                  <EmployeeWorkloadCard key={employee.id} employee={employee} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="unassigned" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Unassigned Clients ({unassignedClients.length})</h2>
                {unassignedClients.length > 0 && (
                  <Button onClick={() => setIsAssignDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Client
                  </Button>
                )}
              </div>

              {unassignedClients.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {unassignedClients.map((client) => (
                    <Card key={client.id} className="border-yellow-200 bg-yellow-50/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                          {client.name}
                        </CardTitle>
                        <CardDescription>{client.company}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          Created: {client.createdAt.toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Stage: {client.stage.name}</div>
                        <div className="text-sm text-muted-foreground">Assets: {client.assets.length} files</div>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setSelectedClient(client.id)
                            setIsAssignDialogOpen(true)
                          }}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Assign Employee
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                    <p className="text-muted-foreground">All clients are assigned</p>
                    <p className="text-sm text-muted-foreground mt-2">Great job managing your team workload!</p>
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
