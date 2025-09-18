import { dataStore } from './data-store'

export function seedData() {
  // Clear existing data
  dataStore.clearAllData()

  // Create sample client - Raj's Restaurant with Standard Plan
  const rajClient = dataStore.createClient({
    businessName: "Raj's Restaurant",
    ownerName: 'Raj Kumar',
    email: 'raj@restaurant.com',
    phone: '9876543210',
    plan: 'standard',
    msaFile: 'msa-raj-restaurant.pdf',
    assetsFile: 'assets-raj-restaurant.zip',
    createdBy: 'manager@company.com'
  })

  // Get the auto-created project
  const project = dataStore.getCurrentProjectForClient(rajClient.id)
  if (!project) return

  // Update some tasks to different statuses
  const tasks = dataStore.getTasksByProject(project.id)

  // Set first 5 posts as complete
  const postTasks = tasks.filter(t => t.type === 'post')
  postTasks.slice(0, 5).forEach((task, index) => {
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() - (10 - index * 2))

    dataStore.updateTask(task.id, {
      status: 'complete',
      deliveryDate: deliveryDate.toISOString().split('T')[0]
    })
  })

  // Set next 3 posts as in-progress
  postTasks.slice(5, 8).forEach((task, index) => {
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + (index + 1))

    dataStore.updateTask(task.id, {
      status: 'in-progress',
      deliveryDate: deliveryDate.toISOString().split('T')[0]
    })
  })

  // Set delivery dates for remaining posts
  postTasks.slice(8).forEach((task, index) => {
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + (5 + index * 2))

    dataStore.updateTask(task.id, {
      deliveryDate: deliveryDate.toISOString().split('T')[0]
    })
  })

  // Work on first video
  const videoTasks = tasks.filter(t => t.type === 'video')
  if (videoTasks.length > 0) {
    const firstVideo = videoTasks[0]
    const videoStages = dataStore.getVideoStagesByTask(firstVideo.id)

    // Complete first 3 stages
    videoStages.slice(0, 3).forEach((stage, index) => {
      const deliveryDate = new Date()
      deliveryDate.setDate(deliveryDate.getDate() - (6 - index))

      dataStore.updateVideoStage(stage.id, {
        status: 'complete',
        deliveryDate: deliveryDate.toISOString().split('T')[0]
      })
    })

    // Set 4th stage as in-progress
    if (videoStages[3]) {
      const deliveryDate = new Date()
      deliveryDate.setDate(deliveryDate.getDate() + 2)

      dataStore.updateVideoStage(videoStages[3].id, {
        status: 'in-progress',
        deliveryDate: deliveryDate.toISOString().split('T')[0]
      })
    }

    // Set delivery date for 5th stage
    if (videoStages[4]) {
      const deliveryDate = new Date()
      deliveryDate.setDate(deliveryDate.getDate() + 4)

      dataStore.updateVideoStage(videoStages[4].id, {
        deliveryDate: deliveryDate.toISOString().split('T')[0]
      })
    }
  }

  // Create additional sample clients
  const clients = [
    {
      businessName: "Tech Innovations Inc",
      ownerName: "Alice Chen",
      email: "alice@techinnovations.com",
      phone: "5551234567",
      plan: 'premium' as const,
      msaFile: "msa-tech-innovations.pdf",
      assetsFile: "assets-tech-innovations.zip",
      createdBy: "manager@company.com"
    },
    {
      businessName: "Green Garden Cafe",
      ownerName: "Bob Wilson",
      email: "bob@greengarden.com",
      phone: "5559876543",
      plan: 'basic' as const,
      msaFile: "msa-green-garden.pdf",
      assetsFile: "assets-green-garden.zip",
      createdBy: "manager@company.com"
    },
    {
      businessName: "Fitness First Gym",
      ownerName: "Carol Martinez",
      email: "carol@fitnessfirst.com",
      phone: "5555551234",
      plan: 'standard' as const,
      msaFile: "msa-fitness-first.pdf",
      assetsFile: "assets-fitness-first.zip",
      createdBy: "manager@company.com"
    }
  ]

  clients.forEach(clientData => {
    const client = dataStore.createClient(clientData)
    const project = dataStore.getCurrentProjectForClient(client.id)
    if (!project) return

    // Set some random progress for variety
    const tasks = dataStore.getTasksByProject(project.id)
    const numToComplete = Math.floor(Math.random() * 5) + 1

    tasks.slice(0, numToComplete).forEach(task => {
      const deliveryDate = new Date()
      deliveryDate.setDate(deliveryDate.getDate() - Math.floor(Math.random() * 10))

      dataStore.updateTask(task.id, {
        status: 'complete',
        deliveryDate: deliveryDate.toISOString().split('T')[0]
      })
    })
  })

  console.log('Seed data created successfully!')
  return true
}

// Check if data needs seeding
export function checkAndSeedData() {
  if (typeof window === 'undefined') return

  const clients = dataStore.getClients()
  if (clients.length === 0) {
    seedData()
  }
}