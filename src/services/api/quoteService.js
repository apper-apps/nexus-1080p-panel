// Quote Service - Handles all quote-related data operations
const TABLE_NAME = 'quote';

class QuoteService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }

  // Get all quotes with lookup field expansion
  async getAll(filters = {}) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "companyId" } },
          { field: { Name: "contactId" } },
          { field: { Name: "dealId" } },
          { field: { Name: "quoteDate" } },
          { field: { Name: "status" } },
          { field: { Name: "deliveryMethod" } },
          { field: { Name: "expiresOn" } },
          { field: { Name: "billingBillToName" } },
          { field: { Name: "billingStreet" } },
          { field: { Name: "billingCity" } },
          { field: { Name: "billingState" } },
          { field: { Name: "billingCountry" } },
          { field: { Name: "billingPincode" } },
          { field: { Name: "shippingShipToName" } },
          { field: { Name: "shippingStreet" } },
          { field: { Name: "shippingCity" } },
          { field: { Name: "shippingState" } },
          { field: { Name: "shippingCountry" } },
          { field: { Name: "shippingPincode" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "ModifiedOn" } }
        ],
        orderBy: [
          {
            fieldName: "CreatedOn",
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit: filters.limit || 20,
          offset: filters.offset || 0
        }
      };

      // Add filters if provided
      if (filters.where && filters.where.length > 0) {
        params.where = filters.where;
      }

      if (filters.search) {
        params.where = params.where || [];
        params.where.push({
          FieldName: "Name",
          Operator: "Contains",
          Values: [filters.search]
        });
      }

      const response = await this.apperClient.fetchRecords(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return {
        data: response.data || [],
        total: response.total || 0
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching quotes:", error.response.data.message);
        throw new Error(error.response.data.message);
      }
      console.error("Error fetching quotes:", error.message);
      throw error;
    }
  }

  // Get quote by ID
  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "companyId" } },
          { field: { Name: "contactId" } },
          { field: { Name: "dealId" } },
          { field: { Name: "quoteDate" } },
          { field: { Name: "status" } },
          { field: { Name: "deliveryMethod" } },
          { field: { Name: "expiresOn" } },
          { field: { Name: "billingBillToName" } },
          { field: { Name: "billingStreet" } },
          { field: { Name: "billingCity" } },
          { field: { Name: "billingState" } },
          { field: { Name: "billingCountry" } },
          { field: { Name: "billingPincode" } },
          { field: { Name: "shippingShipToName" } },
          { field: { Name: "shippingStreet" } },
          { field: { Name: "shippingCity" } },
          { field: { Name: "shippingState" } },
          { field: { Name: "shippingCountry" } },
          { field: { Name: "shippingPincode" } }
        ]
      };

      const response = await this.apperClient.getRecordById(TABLE_NAME, id, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching quote with ID ${id}:`, error.response.data.message);
        throw new Error(error.response.data.message);
      }
      console.error(`Error fetching quote with ID ${id}:`, error.message);
      throw error;
    }
  }

  // Create new quote
  async create(quoteData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Name: quoteData.Name,
          companyId: parseInt(quoteData.companyId),
          contactId: parseInt(quoteData.contactId),
          dealId: quoteData.dealId ? parseInt(quoteData.dealId) : null,
          quoteDate: quoteData.quoteDate,
          status: quoteData.status || 'Draft',
          deliveryMethod: quoteData.deliveryMethod,
          expiresOn: quoteData.expiresOn,
          billingBillToName: quoteData.billingBillToName,
          billingStreet: quoteData.billingStreet,
          billingCity: quoteData.billingCity,
          billingState: quoteData.billingState,
          billingCountry: quoteData.billingCountry,
          billingPincode: quoteData.billingPincode,
          shippingShipToName: quoteData.shippingShipToName,
          shippingStreet: quoteData.shippingStreet,
          shippingCity: quoteData.shippingCity,
          shippingState: quoteData.shippingState,
          shippingCountry: quoteData.shippingCountry,
          shippingPincode: quoteData.shippingPincode
        }]
      };

      const response = await this.apperClient.createRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create quote ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          // Throw first error for user feedback
          const firstError = failedRecords[0];
          if (firstError.errors && firstError.errors.length > 0) {
            throw new Error(`${firstError.errors[0].fieldLabel}: ${firstError.errors[0].message}`);
          }
          if (firstError.message) {
            throw new Error(firstError.message);
          }
        }

        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating quote:", error.response.data.message);
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  // Update quote
  async update(id, quoteData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: quoteData.Name,
          companyId: parseInt(quoteData.companyId),
          contactId: parseInt(quoteData.contactId),
          dealId: quoteData.dealId ? parseInt(quoteData.dealId) : null,
          quoteDate: quoteData.quoteDate,
          status: quoteData.status,
          deliveryMethod: quoteData.deliveryMethod,
          expiresOn: quoteData.expiresOn,
          billingBillToName: quoteData.billingBillToName,
          billingStreet: quoteData.billingStreet,
          billingCity: quoteData.billingCity,
          billingState: quoteData.billingState,
          billingCountry: quoteData.billingCountry,
          billingPincode: quoteData.billingPincode,
          shippingShipToName: quoteData.shippingShipToName,
          shippingStreet: quoteData.shippingStreet,
          shippingCity: quoteData.shippingCity,
          shippingState: quoteData.shippingState,
          shippingCountry: quoteData.shippingCountry,
          shippingPincode: quoteData.shippingPincode
        }]
      };

      const response = await this.apperClient.updateRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update quote ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          const firstError = failedRecords[0];
          if (firstError.errors && firstError.errors.length > 0) {
            throw new Error(`${firstError.errors[0].fieldLabel}: ${firstError.errors[0].message}`);
          }
          if (firstError.message) {
            throw new Error(firstError.message);
          }
        }

        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating quote:", error.response.data.message);
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  // Delete quote
  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to delete quote ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          const firstError = failedRecords[0];
          if (firstError.message) {
            throw new Error(firstError.message);
          }
        }

        return response.results.some(result => result.success);
      }

      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting quote:", error.response.data.message);
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }
}

export const quoteService = new QuoteService();