import activitiesData from "@/services/mockData/activities.json"

let activities = [...activitiesData]

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
  }
}