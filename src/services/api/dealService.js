import dealsData from '@/services/mockData/deals.json'

let deals = [...dealsData]
let nextId = Math.max(...deals.map(d => d.Id)) + 1

const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 300))

export const dealService = {
  async getAll() {
    await simulateDelay()
    // Return copies to prevent direct mutation
    return deals.map(deal => ({ ...deal }))
  },

  async getById(id) {
    await simulateDelay()
    if (typeof id !== 'number') {
      throw new Error('Deal ID must be a number')
    }
    
    const deal = deals.find(d => d.Id === id)
    if (!deal) {
      throw new Error(`Deal with ID ${id} not found`)
    }
    
    return { ...deal }
  },

  async create(dealData) {
    await simulateDelay()
    
    const newDeal = {
      Id: nextId++,
      name: dealData.name || '',
      value: dealData.value || 0,
      contact: dealData.contact || '',
      stage: dealData.stage || 'lead',
      description: dealData.description || '',
      createdAt: new Date().toISOString(),
      stageUpdatedAt: new Date().toISOString()
    }
    
    deals.push(newDeal)
    return { ...newDeal }
  },

  async update(id, updates) {
    await simulateDelay()
    
    if (typeof id !== 'number') {
      throw new Error('Deal ID must be a number')
    }
    
    const index = deals.findIndex(d => d.Id === id)
    if (index === -1) {
      throw new Error(`Deal with ID ${id} not found`)
    }
    
    deals[index] = {
      ...deals[index],
      ...updates,
      Id: id // Ensure ID cannot be changed
    }
    
    return { ...deals[index] }
  },

  async updateStage(id, newStage) {
    await simulateDelay()
    
    if (typeof id !== 'number') {
      throw new Error('Deal ID must be a number')
    }
    
    const index = deals.findIndex(d => d.Id === id)
    if (index === -1) {
      throw new Error(`Deal with ID ${id} not found`)
    }
    
    deals[index] = {
      ...deals[index],
      stage: newStage,
      stageUpdatedAt: new Date().toISOString()
    }
    
    return { ...deals[index] }
  },

  async delete(id) {
    await simulateDelay()
    
    if (typeof id !== 'number') {
      throw new Error('Deal ID must be a number')
    }
    
    const index = deals.findIndex(d => d.Id === id)
    if (index === -1) {
      throw new Error(`Deal with ID ${id} not found`)
    }
    
    const deletedDeal = deals[index]
    deals.splice(index, 1)
    return { ...deletedDeal }
  },

  async getByStage(stage) {
    await simulateDelay()
    return deals.filter(deal => deal.stage === stage).map(deal => ({ ...deal }))
  },

  async getTotalValue() {
    await simulateDelay()
    return deals.reduce((sum, deal) => sum + deal.value, 0)
  },

  async getValueByStage(stage) {
    await simulateDelay()
    return deals
      .filter(deal => deal.stage === stage)
      .reduce((sum, deal) => sum + deal.value, 0)
  }
}