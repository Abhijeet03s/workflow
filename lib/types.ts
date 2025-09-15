export interface Client {
  id: string
  name: string
  email: string
  phone: string
  company: string
  address?: string
  projectDescription: string
  status: "active" | "inactive" | "completed"
  createdAt: Date
  stage: WorkflowStage
  assignedEmployees: string[] // Changed to array for multiple employees
  assets: Asset[]
  msaCompleted: boolean
  projectCompleted: boolean
}

export interface Asset {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: Date
  url: string
}

export interface Employee {
  id: string
  name: string
  email: string
  role: string
  assignedClients: string[]
  assignedVideoProjects?: VideoProject[]
}

export interface WorkflowStage {
  id: number
  name: string
  description: string
  completed: boolean
  completedAt?: Date
}

export const WORKFLOW_STAGES = [
  { id: 1, name: "Client Creation", description: "Initial client setup and onboarding" },
  { id: 2, name: "Asset Collection", description: "Upload and organize client assets" },
  { id: 3, name: "MSA Creation", description: "Master Service Agreement preparation" },
  { id: 4, name: "Employee Assignment", description: "Assign project to team member" },
  { id: 5, name: "Project Delivery", description: "Final delivery and completion" },
] as const

export const AI_VIDEO_STAGES = [
  { id: 1, name: "Asset Review", description: "Review and validate client assets transferred by manager" },
  { id: 2, name: "Script Generation", description: "Create AI-generated script based on client requirements" },
  { id: 3, name: "Image Generation", description: "Generate AI images and visual assets for video" },
  { id: 4, name: "Motion Creation", description: "Apply motion and animation to generated assets" },
  { id: 5, name: "Voice Generation", description: "Generate AI voiceover and audio elements" },
  { id: 6, name: "Video Editing", description: "Final video editing and post-production" },
] as const

export interface VideoProject {
  id: string
  clientId: string
  clientName: string
  company: string
  employeeId: string // Added to track which employee is working on this
  assignedAt: Date
  currentStage: AIVideoStage
  assets: Asset[]
  script?: string
  generatedImages: Asset[]
  voiceSettings?: {
    voice: string
    speed: number
    tone: string
  }
  videoSettings?: {
    duration: number
    style: string
    resolution: string
  }
  completed: boolean
  deliveredAt?: Date
}

export interface AIVideoStage {
  id: number
  name: string
  description: string
  completed: boolean
  completedAt?: Date
  notes?: string
}
