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
      closeDate: dealData.closeDate || '',
      contact: dealData.contactName || '',
      contactId: dealData.contactId || '',
      company: dealData.companyName || '',
      companyId: dealData.companyId || '',
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
  },

  async getWinRate() {
    await simulateDelay()
    const totalDeals = deals.length
    if (totalDeals === 0) return 0
    
    const closedDeals = deals.filter(deal => deal.stage === 'closed').length
    return Math.round((closedDeals / totalDeals) * 100)
  },

  async getRecentDeals(days = 30) {
    await simulateDelay()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return deals
      .filter(deal => {
        const dealDate = new Date(deal.createdAt || deal.stageUpdatedAt)
        return dealDate >= cutoffDate
      })
      .map(deal => ({ ...deal }))
  },

async getPipelineData() {
    await simulateDelay()
    const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed']
    
    return stages.map(stage => {
      return deals.filter(deal => deal.stage === stage).length
    })
  },

  async getTopContactsByValue(limit = 5) {
    await simulateDelay()
    
    // Group deals by contact and calculate totals
    const contactPerformance = {}
    
    deals.forEach(deal => {
      if (deal.contact) {
        if (!contactPerformance[deal.contact]) {
          contactPerformance[deal.contact] = {
            name: deal.contact,
            company: deal.company || 'No company',
            totalValue: 0,
            dealCount: 0
          }
        }
        contactPerformance[deal.contact].totalValue += deal.value || 0
        contactPerformance[deal.contact].dealCount += 1
      }
    })
    
    // Convert to array and sort by total value
    return Object.values(contactPerformance)
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, limit)
  },

  async getTopCompaniesByOpportunities(limit = 5) {
    await simulateDelay()
    
    // Group deals by company and calculate totals
    const companyPerformance = {}
    
    deals.forEach(deal => {
      if (deal.company) {
        if (!companyPerformance[deal.company]) {
          companyPerformance[deal.company] = {
            company: deal.company,
            opportunityCount: 0,
            totalValue: 0
          }
        }
        companyPerformance[deal.company].opportunityCount += 1
        companyPerformance[deal.company].totalValue += deal.value || 0
      }
    })
    
    // Convert to array and sort by opportunity count
    return Object.values(companyPerformance)
      .sort((a, b) => b.opportunityCount - a.opportunityCount)
      .slice(0, limit)
  }
}