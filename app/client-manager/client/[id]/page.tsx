"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  User,
  Building2,
  Mail,
  Upload,
  FileText,
  Download,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { ClientManagerHeader } from "@/components/client-manager-header"
import { AssetUploadZone } from "@/components/asset-upload-zone"
import { dataStore } from "@/lib/data-store"
import type { Client, Employee } from "@/lib/types"

export default function ClientDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [client, setClient] = useState<Client | null>(null)
  const [msaFile, setMsaFile] = useState<File | null>(null)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    const clientData = dataStore.getClient(params.id)
    if (clientData) {
      setClient(clientData)
    } else {
      router.push("/client-manager")
    }
    setEmployees(dataStore.getEmployees())
  }, [params.id, router])

  if (!client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading client...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the client data.</p>
        </div>
      </div>
    )
  }

  const calculateCurrentStage = () => {
    if (!client) return 1
    if (client.projectCompleted) return 5
    if (client.assignedEmployees && client.assignedEmployees.length > 0) return 5
    if (client.msaCompleted) return 4
    if (client.assets.length > 0) return 3
    return client.stage.id
  }

  const currentStage = client ? calculateCurrentStage() : 1
  const progressPercentage = (currentStage / 5) * 100

  const handleDeleteAsset = (assetId: string) => {
    const updatedAssets = client.assets.filter((asset) => asset.id !== assetId)
    const updatedClient = dataStore.updateClient(client.id, { assets: updatedAssets })
    if (updatedClient) {
      setClient(updatedClient)
    }
  }

  const handleMsaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setMsaFile(file)
      console.log("MSA file selected:", file.name)
    }
  }

  const handleCompleteMsa = () => {
    if (msaFile) {
      const updatedClient = dataStore.updateClient(client.id, {
        msaCompleted: true,
        stage: { id: 4, name: "Employee Assignment", description: "Assign project to an employee", completed: false },
      })
      if (updatedClient) {
        setClient(updatedClient)
        console.log("MSA completed and advanced to Employee Assignment")
      }
    }
  }

  const handleAssignEmployees = () => {
    if (selectedEmployees.length > 0) {
      const updatedClient = dataStore.updateClient(client.id, {
        assignedEmployees: selectedEmployees,
        stage: {
          id: 5,
          name: "Project Delivery",
          description: "Deliver completed project to client",
          completed: false,
        },
      })
      if (updatedClient) {
        setClient(updatedClient)
        console.log(`${selectedEmployees.length} employees assigned and advanced to Project Delivery`)
      }
    }
  }

  const handleCompleteProject = () => {
    const updatedClient = dataStore.updateClient(client.id, {
      projectCompleted: true,
    })
    if (updatedClient) {
      setClient(updatedClient)
      console.log("Project marked as completed/delivered")
    }
  }

  const handleAdvanceStage = () => {
    const currentStage = client.stage.id

    if (currentStage === 1) {
      const updatedClient = dataStore.updateClient(client.id, {
        stage: { id: 2, name: "Asset Collection", description: "Collect assets from client", completed: false },
      })
      if (updatedClient) setClient(updatedClient)
    } else if (currentStage === 2 && client.assets.length > 0) {
      const updatedClient = dataStore.updateClient(client.id, {
        stage: { id: 3, name: "MSA Creation", description: "Create and upload MSA document", completed: false },
      })
      if (updatedClient) setClient(updatedClient)
    }
  }

  const canAdvanceStage = () => {
    if (client.stage.id === 1) return true
    if (client.stage.id === 2) return client.assets.length > 0
    return false
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientManagerHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{client.name}</h1>
              <p className="text-muted-foreground">{client.company}</p>
            </div>
            <Badge variant={client.stage.id === 5 ? "default" : "secondary"} className="text-sm">
              Stage {client.stage.id}: {client.stage.name}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="assets">Assets</TabsTrigger>
                <TabsTrigger value="msa">MSA</TabsTrigger>
                <TabsTrigger value="workflow">Workflow</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Client Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <p className="text-sm">{client.name}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-sm flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Company</label>
                        <p className="text-sm flex items-center gap-2">
                          <Building2 className="h-3 w-3" />
                          {client.company}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Created</label>
                        <p className="text-sm">{client.createdAt.toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Project Status</label>
                      <div className="flex items-center gap-4">
                        {client.msaCompleted && (
                          <Badge variant="secondary" className="text-xs">
                            MSA Complete
                          </Badge>
                        )}
                        {client.assignedEmployees && client.assignedEmployees.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {client.assignedEmployees.length} Employee{client.assignedEmployees.length > 1 ? 's' : ''} Assigned
                          </Badge>
                        )}
                        {client.projectCompleted && (
                          <Badge variant="default" className="text-xs">
                            Project Delivered
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assets" className="mt-6">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Upload Assets
                      </CardTitle>
                      <CardDescription>Upload files for this client project</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AssetUploadZone
                        clientId={client.id}
                        onUploadComplete={() => {
                          const updatedClient = dataStore.getClient(client.id)
                          if (updatedClient) setClient(updatedClient)
                        }}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Uploaded Assets ({client.assets.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {client.assets.length > 0 ? (
                        <div className="space-y-3">
                          {client.assets.map((asset) => (
                            <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="h-8 w-8 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{asset.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {(asset.size / 1024 / 1024).toFixed(2)} MB • {asset.uploadedAt.toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteAsset(asset.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No assets uploaded yet</p>
                          <p className="text-sm text-muted-foreground mt-2">Upload files using the form above</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="msa" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      MSA Document
                    </CardTitle>
                    <CardDescription>Upload the Master Service Agreement document for this client</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!client.msaCompleted ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="msa-upload">Upload MSA Document</Label>
                          <Input
                            id="msa-upload"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleMsaUpload}
                            className="cursor-pointer"
                          />
                          <p className="text-sm text-muted-foreground">Accepted formats: PDF, DOC, DOCX (Max 10MB)</p>
                        </div>

                        {msaFile && (
                          <div className="p-4 border rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                              <FileText className="h-8 w-8 text-primary" />
                              <div className="flex-1">
                                <p className="font-medium">{msaFile.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {(msaFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <Button onClick={handleCompleteMsa} className="ml-auto">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete MSA
                              </Button>
                            </div>
                          </div>
                        )}

                        {currentStage < 3 && (
                          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <p className="text-sm text-amber-800">Complete asset collection before creating MSA</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <p className="font-medium text-green-700">MSA Document Completed</p>
                        <p className="text-sm text-muted-foreground mt-2">MSA has been uploaded and approved</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="workflow" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Workflow Progress</CardTitle>
                    <CardDescription>Track the client through each stage</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Overall Progress</span>
                        <span className="font-medium">{Math.round(progressPercentage)}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-3" />
                    </div>

                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((stageId) => {
                        const isCompleted = stageId < currentStage
                        const isCurrent = stageId === currentStage
                        const stageName = [
                          "Client Creation",
                          "Asset Collection",
                          "MSA Creation",
                          "Employee Assignment",
                          "Project Delivery",
                        ][stageId - 1]

                        return (
                          <div key={stageId} className="flex items-center gap-4">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                isCompleted
                                  ? "bg-green-500 text-white"
                                  : isCurrent
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {stageId}
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium ${isCurrent ? "text-primary" : ""}`}>{stageName}</p>
                              <p className="text-sm text-muted-foreground">
                                {isCompleted ? "Completed" : isCurrent ? "In Progress" : "Pending"}
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
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {canAdvanceStage() && (
                  <Button className="w-full justify-start" onClick={handleAdvanceStage}>
                    <Plus className="h-4 w-4 mr-2" />
                    Advance to Next Stage
                  </Button>
                )}

                {currentStage === 3 && !client.msaCompleted && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">Go to MSA tab to upload MSA document</p>
                  </div>
                )}

                {currentStage === 4 && (!client.assignedEmployees || client.assignedEmployees.length === 0) && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Select Employees (Multiple)</Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                        {employees.map((employee) => (
                          <div key={employee.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={employee.id}
                              checked={selectedEmployees.includes(employee.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEmployees([...selectedEmployees, employee.id])
                                } else {
                                  setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id))
                                }
                              }}
                              className="h-4 w-4"
                            />
                            <Label htmlFor={employee.id} className="flex-1 cursor-pointer">
                              {employee.name} - {employee.role}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      className="w-full justify-start"
                      onClick={handleAssignEmployees}
                      disabled={selectedEmployees.length === 0}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Assign {selectedEmployees.length > 0 ? `${selectedEmployees.length} ` : ''}Employee{selectedEmployees.length > 1 ? 's' : ''}
                    </Button>
                  </div>
                )}

                {currentStage === 5 && !client.projectCompleted && (
                  <Button className="w-full justify-start" onClick={handleCompleteProject}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Delivered
                  </Button>
                )}

                {!canAdvanceStage() &&
                  !(currentStage === 3 && !client.msaCompleted) &&
                  !(currentStage === 4 && (!client.assignedEmployees || client.assignedEmployees.length === 0)) &&
                  !(currentStage === 5 && !client.projectCompleted) && (
                    <div className="p-3 bg-gray-50 border rounded-lg">
                      <p className="text-sm text-gray-600">
                        {client.projectCompleted
                          ? "Project has been delivered successfully!"
                          : "Complete current stage requirements to proceed"}
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge variant="outline" className="w-full justify-center py-2">
                    {client.stage.name}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{client.stage.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
