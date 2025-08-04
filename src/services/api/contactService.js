const tableName = 'app_contact';

export const contactService = {
async getAll(customParams = null) {
    try {
      const defaultParams = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "email" } },
          { field: { Name: "phone" } },
          { field: { Name: "companyName" } },
          { field: { Name: "jobTitle" } },
          { field: { Name: "notes" } },
          { field: { Name: "lastContactDate" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "companyId" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } }
        ]
      };

      // Merge custom params with default params
      const params = customParams ? { ...defaultParams, ...customParams } : defaultParams;

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

      return {
        data: response.data || [],
        total: response.total || (response.data ? response.data.length : 0)
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching contacts:", error?.response?.data?.message);
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
          { field: { Name: "email" } },
          { field: { Name: "phone" } },
          { field: { Name: "companyName" } },
          { field: { Name: "jobTitle" } },
          { field: { Name: "notes" } },
          { field: { Name: "lastContactDate" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "companyId" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } }
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
        console.error(`Error fetching contact with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async create(contactData) {
    try {
      // Combine first and last name if provided separately
      const submitData = {
        Name: contactData.name || `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim(),
        email: contactData.email,
        phone: contactData.phone,
        companyName: contactData.companyName,
        jobTitle: contactData.jobTitle || '',
        notes: contactData.notes || '',
        lastContactDate: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString().split("T")[0],
        companyId: contactData.companyId ? parseInt(contactData.companyId) : null
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
          console.error(`Failed to create contacts ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error creating contact:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async update(id, contactData) {
    try {
      const submitData = {
        Id: parseInt(id),
        Name: contactData.name || `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim(),
        email: contactData.email,
        phone: contactData.phone,
        companyName: contactData.companyName,
        jobTitle: contactData.jobTitle || '',
        notes: contactData.notes || '',
        companyId: contactData.companyId ? parseInt(contactData.companyId) : null
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
          console.error(`Failed to update contacts ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error updating contact:", error?.response?.data?.message);
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
          console.error(`Failed to delete contacts ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        return response.results.every(result => result.success);
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting contact:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async search(query) {
    try {
const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "email" } },
          { field: { Name: "phone" } },
          { field: { Name: "companyName" } },
          { field: { Name: "jobTitle" } },
          { field: { Name: "notes" } },
          { field: { Name: "lastContactDate" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "companyId" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } }
        ],
        where: query ? [
          {
            FieldName: "Name",
            Operator: "Contains",
            Values: [query]
          }
        ] : undefined
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
        console.error("Error searching contacts:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async getTotalCount() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } }
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
        return 0;
      }

      return response.total || 0;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error getting contact count:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return 0;
    }
  }
}