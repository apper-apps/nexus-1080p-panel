import activitiesData from "@/services/mockData/activities.json"

let activities = [...activitiesData]

// Utility function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Get all activities
const getAll = async () => {
  await delay(300)
  return [...activities].sort((a, b) => new Date(b.date) - new Date(a.date))
}

// Get activity by ID
const getById = async (id) => {
  await delay(200)
  const activity = activities.find(activity => activity.Id === parseInt(id))
  if (!activity) {
    throw new Error('Activity not found')
  }
  return { ...activity }
}

// Get recent activities with limit
const getRecentActivities = async (limit = 10) => {
  await delay(250)
  return [...activities]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit)
}

// Get activities by entity (contact, deal, company)
const getByEntity = async (entityType, entityId) => {
  await delay(200)
  return activities.filter(activity => 
    activity.entityType === entityType && 
    activity.entityId === parseInt(entityId)
  ).sort((a, b) => new Date(b.date) - new Date(a.date))
}

// Create new activity
const create = async (activityData) => {
  await delay(400)
  
  const newActivity = {
    ...activityData,
    Id: Math.max(...activities.map(a => a.Id), 0) + 1,
    date: activityData.date || new Date().toISOString(),
    createdBy: activityData.createdBy || 'Current User'
  }
  
  activities.unshift(newActivity)
  return { ...newActivity }
}

// Update activity
const update = async (id, updateData) => {
  await delay(300)
  
  const index = activities.findIndex(activity => activity.Id === parseInt(id))
  if (index === -1) {
    throw new Error('Activity not found')
  }
  
  activities[index] = { ...activities[index], ...updateData }
  return { ...activities[index] }
}

// Delete activity
const deleteActivity = async (id) => {
  await delay(250)
  
  const index = activities.findIndex(activity => activity.Id === parseInt(id))
  if (index === -1) {
    throw new Error('Activity not found')
  }
  
  activities.splice(index, 1)
  return { success: true }
}

// Mark task as complete/incomplete
const markTaskComplete = async (id, completed) => {
  await delay(200)
  
  const index = activities.findIndex(activity => activity.Id === parseInt(id))
  if (index === -1) {
    throw new Error('Activity not found')
  }
  
  if (activities[index].type !== 'task') {
    throw new Error('Only tasks can be marked as complete')
  }
  
  activities[index].completed = completed
  return { ...activities[index] }
}

// Get activity statistics
const getStats = async () => {
  await delay(200)
  
  const stats = {
    total: activities.length,
    byType: {},
    completed: 0,
    pending: 0,
    overdue: 0
  }
  
  activities.forEach(activity => {
    // Count by type
    stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1
    
    // Count task statuses
    if (activity.type === 'task') {
      if (activity.completed) {
        stats.completed++
      } else {
        stats.pending++
        // Check if overdue
        if (activity.dueDate && new Date(activity.dueDate) < new Date()) {
          stats.overdue++
        }
      }
    }
  })
  
  return stats
}

export const activityService = {
  getAll,
  getById,
  getRecentActivities,
  getByEntity,
  create,
  update,
  delete: deleteActivity,
  markTaskComplete,
  getStats
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const activityService = {
  async getAll() {
    await delay(300)
    return [...activities]
  },

  async getById(id) {
    await delay(200)
    const activity = activities.find(a => a.Id === parseInt(id))
    if (!activity) {
      throw new Error("Activity not found")
    }
    return { ...activity }
  },

  async getByEntity(entityType, entityId) {
    await delay(200)
    const entityActivities = activities.filter(
      a => a.entityType === entityType && a.entityId === parseInt(entityId)
    )
    // Sort by date descending (newest first)
    return [...entityActivities].sort((a, b) => new Date(b.date) - new Date(a.date))
  },

  async create(activityData) {
    await delay(400)
    const newActivity = {
      Id: Math.max(...activities.map(a => a.Id)) + 1,
      ...activityData,
      createdAt: new Date().toISOString(),
      createdBy: "Current User" // In a real app, this would come from auth
    }
    activities.push(newActivity)
    return { ...newActivity }
  },

  async update(id, activityData) {
    await delay(350)
    const index = activities.findIndex(a => a.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Activity not found")
    }
    activities[index] = { ...activities[index], ...activityData }
    return { ...activities[index] }
  },

  async delete(id) {
    await delay(250)
    const index = activities.findIndex(a => a.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Activity not found")
    }
    const deletedActivity = activities[index]
    activities.splice(index, 1)
    return { ...deletedActivity }
  },

  async markTaskComplete(id, completed = true) {
    await delay(200)
    const index = activities.findIndex(a => a.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Activity not found")
    }
    if (activities[index].type !== 'task') {
      throw new Error("Activity is not a task")
    }
    activities[index].completed = completed
activities[index].outcome = completed ? "Completed" : "In progress"
    return { ...activities[index] }
  },

  async getRecentActivities(limit = 10) {
    await delay(200)
    // Sort all activities by date descending (newest first) and limit results
    const sortedActivities = [...activities]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit)
    return sortedActivities
  }
}