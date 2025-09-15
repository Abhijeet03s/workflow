import type { Client, Employee, VideoProject } from "./types"
import { mockClients, mockEmployees, mockVideoProjects } from "./mock-data"

class DataStore {
  private clients: Client[] = []
  private employees: Employee[] = []
  private videoProjects: VideoProject[] = []

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    if (typeof window !== "undefined") {
      const storedClients = localStorage.getItem("workflow-clients")
      const storedEmployees = localStorage.getItem("workflow-employees")
      const storedProjects = localStorage.getItem("workflow-projects")

      this.clients = storedClients ? JSON.parse(storedClients) : mockClients
      this.employees = storedEmployees ? JSON.parse(storedEmployees) : mockEmployees
      this.videoProjects = storedProjects ? JSON.parse(storedProjects) : mockVideoProjects

      // Convert date strings back to Date objects
      this.clients = this.clients.map((client) => ({
        ...client,
        createdAt: new Date(client.createdAt),
        assets: client.assets.map((asset) => ({
          ...asset,
          uploadedAt: new Date(asset.uploadedAt),
        })),
      }))
    } else {
      // Server-side fallback
      this.clients = mockClients
      this.employees = mockEmployees
      this.videoProjects = mockVideoProjects
    }
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      localStorage.setItem("workflow-clients", JSON.stringify(this.clients))
      localStorage.setItem("workflow-employees", JSON.stringify(this.employees))
      localStorage.setItem("workflow-projects", JSON.stringify(this.videoProjects))
    }
  }

  // Client operations
  getClients(): Client[] {
    return this.clients
  }

  getClient(id: string): Client | undefined {
    return this.clients.find((client) => client.id === id)
  }

  createClient(clientData: {
    name: string
    email: string
    phone: string
    company: string
    address?: string
    projectDescription: string
  }): Client {
    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      company: clientData.company,
      address: clientData.address,
      projectDescription: clientData.projectDescription,
      status: "active",
      stage: {
        id: 1,
        name: "Client Creation",
        description: "Initial client setup and onboarding",
        completed: false
      },
      createdAt: new Date(),
      assets: [],
      msaCompleted: false,
      assignedEmployees: [],
      projectCompleted: false,
    }

    this.clients.push(newClient)
    this.saveToStorage()
    return newClient
  }

  updateClient(id: string, updates: Partial<Client>): Client | null {
    const clientIndex = this.clients.findIndex((client) => client.id === id)
    if (clientIndex === -1) return null

    this.clients[clientIndex] = { ...this.clients[clientIndex], ...updates }
    this.saveToStorage()
    return this.clients[clientIndex]
  }

  addAssetToClient(clientId: string, asset: any): boolean {
    const client = this.getClient(clientId)
    if (!client) return false

    client.assets.push({
      ...asset,
      id: `asset-${Date.now()}`,
      uploadedAt: new Date(),
    })
    this.saveToStorage()
    return true
  }

  // Employee operations
  getEmployees(): Employee[] {
    return this.employees
  }

  getEmployee(id: string): Employee | undefined {
    return this.employees.find((emp) => emp.id === id)
  }

  // Video project operations
  getVideoProjects(): VideoProject[] {
    return this.videoProjects
  }

  getVideoProjectsByEmployee(employeeId: string): VideoProject[] {
    const employee = this.getEmployee(employeeId)
    if (!employee) return []

    return this.videoProjects.filter((project) => employee.assignedClients.includes(project.clientId))
  }

  updateVideoProject(id: string, updates: Partial<VideoProject>): VideoProject | null {
    const projectIndex = this.videoProjects.findIndex((project) => project.id === id)
    if (projectIndex === -1) return null

    this.videoProjects[projectIndex] = { ...this.videoProjects[projectIndex], ...updates }
    this.saveToStorage()
    return this.videoProjects[projectIndex]
  }
}

export const dataStore = new DataStore()
