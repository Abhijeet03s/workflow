import type { Client, Project, Task, VideoStage, PlanType, CCTMember } from './types'
import { PLAN_DETAILS, CCT_MEMBERS, VIDEO_STAGE_NAMES, STAGE_ROLE_MAPPING } from './types'

class DataStore {
  private readonly STORAGE_KEYS = {
    clients: 'workflow-clients',
    projects: 'workflow-projects',
    tasks: 'workflow-tasks',
    videoStages: 'workflow-video-stages'
  }

  // Generate unique IDs
  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Get current month in YYYY-MM format
  private getCurrentMonth(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  // Get random CCT member by role
  private getRandomCCTMember(role: string): CCTMember | undefined {
    const members = CCT_MEMBERS.filter(m => m.role === role)
    return members[Math.floor(Math.random() * members.length)]
  }

  // Client operations
  getClients(): Client[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(this.STORAGE_KEYS.clients)
    return data ? JSON.parse(data) : []
  }

  getClient(id: string): Client | undefined {
    return this.getClients().find(client => client.id === id)
  }

  getClientByEmail(email: string): Client | undefined {
    return this.getClients().find(client => client.email === email)
  }

  createClient(clientData: Omit<Client, 'id' | 'createdAt'>): Client {
    const newClient: Client = {
      ...clientData,
      id: this.generateId('client'),
      createdAt: new Date().toISOString()
    }

    const clients = this.getClients()
    clients.push(newClient)
    localStorage.setItem(this.STORAGE_KEYS.clients, JSON.stringify(clients))

    // Auto-create project and tasks
    this.createProjectForClient(newClient)

    return newClient
  }

  // Project operations
  getProjects(): Project[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(this.STORAGE_KEYS.projects)
    return data ? JSON.parse(data) : []
  }

  getProject(id: string): Project | undefined {
    return this.getProjects().find(project => project.id === id)
  }

  getProjectsByClient(clientId: string): Project[] {
    return this.getProjects().filter(project => project.clientId === clientId)
  }

  getCurrentProjectForClient(clientId: string): Project | undefined {
    const currentMonth = this.getCurrentMonth()
    return this.getProjects().find(
      project => project.clientId === clientId && project.monthYear === currentMonth
    )
  }

  private createProjectForClient(client: Client): Project {
    const planDetails = PLAN_DETAILS[client.plan]
    const newProject: Project = {
      id: this.generateId('project'),
      clientId: client.id,
      monthYear: this.getCurrentMonth(),
      totalPosts: planDetails.posts,
      totalVideos: planDetails.videos,
      completedPosts: 0,
      completedVideos: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    }

    const projects = this.getProjects()
    projects.push(newProject)
    localStorage.setItem(this.STORAGE_KEYS.projects, JSON.stringify(projects))

    // Generate tasks for this project
    this.generateTasksForProject(newProject, client)

    return newProject
  }

  updateProject(id: string, updates: Partial<Project>): Project | null {
    const projects = this.getProjects()
    const index = projects.findIndex(p => p.id === id)
    if (index === -1) return null

    projects[index] = { ...projects[index], ...updates }
    localStorage.setItem(this.STORAGE_KEYS.projects, JSON.stringify(projects))
    return projects[index]
  }

  // Task operations
  getTasks(): Task[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(this.STORAGE_KEYS.tasks)
    return data ? JSON.parse(data) : []
  }

  getTask(id: string): Task | undefined {
    return this.getTasks().find(task => task.id === id)
  }

  getTasksByProject(projectId: string): Task[] {
    return this.getTasks().filter(task => task.projectId === projectId)
  }

  getTasksByAssignee(assigneeEmail: string): Task[] {
    return this.getTasks().filter(task => task.assignedTo === assigneeEmail)
  }

  private generateTasksForProject(project: Project, client: Client) {
    const tasks: Task[] = []

    // Generate post tasks
    for (let i = 1; i <= project.totalPosts; i++) {
      const designer = this.getRandomCCTMember('designer')
      tasks.push({
        id: this.generateId('task'),
        projectId: project.id,
        clientId: client.id,
        type: 'post',
        title: `Social Media Post #${i}`,
        assignedTo: designer?.email,
        assignedToName: designer?.name,
        status: 'not-started',
        createdAt: new Date().toISOString()
      })
    }

    // Generate video tasks
    for (let i = 1; i <= project.totalVideos; i++) {
      const videoTaskId = this.generateId('task')
      tasks.push({
        id: videoTaskId,
        projectId: project.id,
        clientId: client.id,
        type: 'video',
        title: `AI Video #${i}`,
        status: 'not-started',
        createdAt: new Date().toISOString()
      })

      // Generate video stages for this video task
      this.generateVideoStagesForTask(videoTaskId)
    }

    const existingTasks = this.getTasks()
    localStorage.setItem(this.STORAGE_KEYS.tasks, JSON.stringify([...existingTasks, ...tasks]))
  }

  updateTask(id: string, updates: Partial<Task>): Task | null {
    const tasks = this.getTasks()
    const index = tasks.findIndex(t => t.id === id)
    if (index === -1) return null

    const updatedTask = { ...tasks[index], ...updates }

    // If task is being completed, update project counts
    if (updates.status === 'complete' && tasks[index].status !== 'complete') {
      updatedTask.completedAt = new Date().toISOString()
      const project = this.getProject(updatedTask.projectId)
      if (project) {
        const projectUpdate: Partial<Project> = {}
        if (updatedTask.type === 'post') {
          projectUpdate.completedPosts = project.completedPosts + 1
        } else if (updatedTask.type === 'video') {
          // Check if all video stages are complete
          const stages = this.getVideoStagesByTask(updatedTask.id)
          const allStagesComplete = stages.every(s => s.status === 'complete')
          if (allStagesComplete) {
            projectUpdate.completedVideos = project.completedVideos + 1
          }
        }
        this.updateProject(project.id, projectUpdate)
      }
    }

    tasks[index] = updatedTask
    localStorage.setItem(this.STORAGE_KEYS.tasks, JSON.stringify(tasks))
    return updatedTask
  }

  // Video Stage operations
  getVideoStages(): VideoStage[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(this.STORAGE_KEYS.videoStages)
    return data ? JSON.parse(data) : []
  }

  getVideoStage(id: string): VideoStage | undefined {
    return this.getVideoStages().find(stage => stage.id === id)
  }

  getVideoStagesByTask(taskId: string): VideoStage[] {
    return this.getVideoStages()
      .filter(stage => stage.taskId === taskId)
      .sort((a, b) => a.stageNumber - b.stageNumber)
  }

  getVideoStagesByAssignee(assigneeEmail: string): VideoStage[] {
    return this.getVideoStages().filter(stage => stage.assignedTo === assigneeEmail)
  }

  private generateVideoStagesForTask(taskId: string) {
    const stages: VideoStage[] = []
    let previousStageId: string | undefined

    VIDEO_STAGE_NAMES.forEach((stageName, index) => {
      const role = STAGE_ROLE_MAPPING[stageName]
      const assignee = this.getRandomCCTMember(role)

      const stage: VideoStage = {
        id: this.generateId('stage'),
        taskId,
        stageNumber: index + 1,
        stageName,
        assignedTo: assignee?.email || '',
        assignedToName: assignee?.name || '',
        status: 'not-started',
        dependsOn: previousStageId
      }

      stages.push(stage)
      previousStageId = stage.id
    })

    const existingStages = this.getVideoStages()
    localStorage.setItem(this.STORAGE_KEYS.videoStages, JSON.stringify([...existingStages, ...stages]))
  }

  updateVideoStage(id: string, updates: Partial<VideoStage>): VideoStage | null {
    const stages = this.getVideoStages()
    const index = stages.findIndex(s => s.id === id)
    if (index === -1) return null

    const stage = stages[index]

    // Check if previous stage is complete before allowing update to in-progress
    if (updates.status === 'in-progress' || updates.status === 'complete') {
      if (stage.dependsOn) {
        const previousStage = this.getVideoStage(stage.dependsOn)
        if (previousStage && previousStage.status !== 'complete') {
          return null // Can't update if previous stage isn't complete
        }
      }
    }

    if (updates.status === 'complete' && stage.status !== 'complete') {
      updates.completedAt = new Date().toISOString()

      // Check if this completes the entire video task
      const allStages = this.getVideoStagesByTask(stage.taskId)
      const willBeAllComplete = allStages.every(s =>
        s.id === id ? updates.status === 'complete' : s.status === 'complete'
      )

      if (willBeAllComplete) {
        this.updateTask(stage.taskId, { status: 'complete' })
      }
    }

    stages[index] = { ...stage, ...updates }
    localStorage.setItem(this.STORAGE_KEYS.videoStages, JSON.stringify(stages))
    return stages[index]
  }

  // Calculate progress
  calculateClientProgress(clientId: string): number {
    const project = this.getCurrentProjectForClient(clientId)
    if (!project) return 0

    const totalTasks = project.totalPosts + project.totalVideos
    const completedTasks = project.completedPosts + project.completedVideos

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }

  calculateVideoProgress(taskId: string): number {
    const stages = this.getVideoStagesByTask(taskId)
    const completedStages = stages.filter(s => s.status === 'complete').length

    return stages.length > 0 ? Math.round((completedStages / stages.length) * 100) : 0
  }

  // Clear all data
  clearAllData() {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }
}

export const dataStore = new DataStore()