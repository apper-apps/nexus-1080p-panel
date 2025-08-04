const tableName = 'deal';

export const dealService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "value" } },
          { field: { Name: "contactName" } },
          { field: { Name: "companyName" } },
          { field: { Name: "stage" } },
          { field: { Name: "description" } },
          { field: { Name: "closeDate" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "stageUpdatedAt" } },
          { field: { Name: "contactId" } },
          { field: { Name: "companyId" } }
        ]
      };

      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const response = await apperClient.fetchRecords(tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching deals:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "value" } },
          { field: { Name: "contactName" } },
          { field: { Name: "companyName" } },
          { field: { Name: "stage" } },
          { field: { Name: "description" } },
          { field: { Name: "closeDate" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "stageUpdatedAt" } },
          { field: { Name: "contactId" } },
          { field: { Name: "companyId" } }
        ]
      };

      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const response = await apperClient.getRecordById(tableName, parseInt(id), params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching deal with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async create(dealData) {
    try {
      const submitData = {
        Name: dealData.name,
        value: parseFloat(dealData.value),
        contactName: dealData.contactName,
        companyName: dealData.companyName,
        stage: dealData.stage || 'lead',
        description: dealData.description || '',
        closeDate: dealData.closeDate,
        createdAt: new Date().toISOString(),
        stageUpdatedAt: new Date().toISOString(),
        contactId: dealData.contactId ? parseInt(dealData.contactId) : null,
        companyId: dealData.companyId ? parseInt(dealData.companyId) : null
      };

      const params = {
        records: [submitData]
      };

      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const response = await apperClient.createRecord(tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);

        if (failedRecords.length > 0) {
          console.error(`Failed to create deals ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating deal:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const submitData = {
        Id: parseInt(id),
        ...updates
      };

      const params = {
        records: [submitData]
      };

      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const response = await apperClient.updateRecord(tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);

        if (failedUpdates.length > 0) {
          console.error(`Failed to update deals ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating deal:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async updateStage(id, newStage) {
    try {
      const submitData = {
        Id: parseInt(id),
        stage: newStage,
        stageUpdatedAt: new Date().toISOString()
      };

      const params = {
        records: [submitData]
      };

      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const response = await apperClient.updateRecord(tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);

        if (failedUpdates.length > 0) {
          console.error(`Failed to update deal stage ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating deal stage:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const response = await apperClient.deleteRecord(tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);

        if (failedDeletions.length > 0) {
          console.error(`Failed to delete deals ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        return response.results.every(result => result.success);
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting deal:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async getByStage(stage) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "value" } },
          { field: { Name: "contactName" } },
          { field: { Name: "companyName" } },
          { field: { Name: "stage" } },
          { field: { Name: "description" } },
          { field: { Name: "closeDate" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "stageUpdatedAt" } }
        ],
        where: [
          {
            FieldName: "stage",
            Operator: "EqualTo",
            Values: [stage]
          }
        ]
      };

      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const response = await apperClient.fetchRecords(tableName, params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching deals by stage:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async getTotalValue() {
    try {
      const deals = await this.getAll();
      return deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    } catch (error) {
      return 0;
    }
  },

  async getValueByStage(stage) {
    try {
      const deals = await this.getByStage(stage);
      return deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    } catch (error) {
      return 0;
    }
  },

  async getWinRate() {
    try {
      const deals = await this.getAll();
      const totalDeals = deals.length;
      if (totalDeals === 0) return 0;
      
      const closedDeals = deals.filter(deal => deal.stage === 'closed').length;
      return Math.round((closedDeals / totalDeals) * 100);
    } catch (error) {
      return 0;
    }
  },

  async getRecentDeals(days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "value" } },
          { field: { Name: "contactName" } },
          { field: { Name: "companyName" } },
          { field: { Name: "stage" } },
          { field: { Name: "description" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "stageUpdatedAt" } }
        ],
        where: [
          {
            FieldName: "createdAt",
            Operator: "GreaterThanOrEqualTo",
            Values: [cutoffDate.toISOString()]
          }
        ]
      };

      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const response = await apperClient.fetchRecords(tableName, params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching recent deals:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async getPipelineData() {
    try {
      const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed'];
      const results = [];
      
      for (const stage of stages) {
        const stageDeals = await this.getByStage(stage);
        results.push(stageDeals.length);
      }
      
      return results;
    } catch (error) {
      return [0, 0, 0, 0, 0];
    }
  },

  async getTopContactsByValue(limit = 5) {
    try {
      const deals = await this.getAll();
      const contactPerformance = {};
      
      deals.forEach(deal => {
        if (deal.contactName) {
          if (!contactPerformance[deal.contactName]) {
            contactPerformance[deal.contactName] = {
              name: deal.contactName,
              company: deal.companyName || 'No company',
              totalValue: 0,
              dealCount: 0
            };
          }
          contactPerformance[deal.contactName].totalValue += deal.value || 0;
          contactPerformance[deal.contactName].dealCount += 1;
        }
      });
      
      return Object.values(contactPerformance)
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, limit);
    } catch (error) {
      return [];
    }
  },

  async getTopCompaniesByOpportunities(limit = 5) {
    try {
      const deals = await this.getAll();
      const companyPerformance = {};
      
      deals.forEach(deal => {
        if (deal.companyName) {
          if (!companyPerformance[deal.companyName]) {
            companyPerformance[deal.companyName] = {
              company: deal.companyName,
              opportunityCount: 0,
              totalValue: 0
            };
          }
          companyPerformance[deal.companyName].opportunityCount += 1;
          companyPerformance[deal.companyName].totalValue += deal.value || 0;
        }
      });
      
      return Object.values(companyPerformance)
        .sort((a, b) => b.opportunityCount - a.opportunityCount)
        .slice(0, limit);
    } catch (error) {
      return [];
    }
  }
}