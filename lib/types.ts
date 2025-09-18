export type UserRole = 'manager' | 'cct' | 'client'

export type PlanType = 'basic' | 'standard' | 'premium'

export type TaskStatus = 'not-started' | 'in-progress' | 'complete'

export type TaskType = 'post' | 'video'

export interface User {
  email: string
  password: string
  role: UserRole
  name: string
}

export interface Client {
  id: string
  businessName: string
  ownerName: string
  email: string
  phone: string
  plan: PlanType
  msaFile?: string
  assetsFile?: string
  createdAt: string
  createdBy: string
}

export interface Project {
  id: string
  clientId: string
  monthYear: string // format: "2025-01"
  totalPosts: number
  totalVideos: number
  completedPosts: number
  completedVideos: number
  status: 'active' | 'completed'
  createdAt: string
}

export interface Task {
  id: string
  projectId: string
  clientId: string
  type: TaskType
  title: string
  assignedTo?: string
  assignedToName?: string
  deliveryDate?: string
  status: TaskStatus
  createdAt: string
  completedAt?: string
}

export interface VideoStage {
  id: string
  taskId: string
  stageNumber: number
  stageName: 'script' | 'images' | 'motion' | 'voice' | 'edit'
  assignedTo: string
  assignedToName: string
  deliveryDate?: string
  status: TaskStatus
  dependsOn?: string // Previous stage ID
  completedAt?: string
}

export interface CCTMember {
  email: string
  name: string
  role: 'designer' | 'scriptWriter' | 'imageSpecialist' | 'motionDesigner' | 'voiceSpecialist' | 'videoEditor'
}

export const PLAN_DETAILS: Record<PlanType, { posts: number; videos: number }> = {
  basic: { posts: 8, videos: 2 },
  standard: { posts: 12, videos: 4 },
  premium: { posts: 20, videos: 8 }
}

export const VIDEO_STAGE_NAMES = ['script', 'images', 'motion', 'voice', 'edit'] as const

export const CCT_MEMBERS: CCTMember[] = [
  { email: 'priya@company.com', name: 'Priya Sharma', role: 'designer' },
  { email: 'vikram@company.com', name: 'Vikram Patel', role: 'designer' },
  { email: 'sarah@company.com', name: 'Sarah Johnson', role: 'scriptWriter' },
  { email: 'ananya@company.com', name: 'Ananya Gupta', role: 'scriptWriter' },
  { email: 'karan@company.com', name: 'Karan Singh', role: 'imageSpecialist' },
  { email: 'deepak@company.com', name: 'Deepak Kumar', role: 'imageSpecialist' },
  { email: 'neha@company.com', name: 'Neha Verma', role: 'motionDesigner' },
  { email: 'maya@company.com', name: 'Maya Reddy', role: 'motionDesigner' },
  { email: 'rajesh@company.com', name: 'Rajesh Nair', role: 'voiceSpecialist' },
  { email: 'alex@company.com', name: 'Alex Thompson', role: 'voiceSpecialist' },
  { email: 'amit@company.com', name: 'Amit Mehta', role: 'videoEditor' },
  { email: 'rohit@company.com', name: 'Rohit Sharma', role: 'videoEditor' }
]

export const STAGE_ROLE_MAPPING = {
  script: 'scriptWriter',
  images: 'imageSpecialist',
  motion: 'motionDesigner',
  voice: 'voiceSpecialist',
  edit: 'videoEditor'
} as const