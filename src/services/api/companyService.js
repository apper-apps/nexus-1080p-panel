import companiesData from '@/services/mockData/companies.json';

// Create a copy of the data to avoid mutations
let companies = [...companiesData];

// Industry options for dropdown
export const industryOptions = [
  'Technology',
  'Manufacturing', 
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Energy',
  'Transportation',
  'Real Estate',
  'Consulting',
  'Media',
  'Agriculture',
  'Construction',
  'Hospitality',
  'Other'
];

export const companyService = {
  // Get all companies
  getAll: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...companies];
  },

  // Get company by ID
  getById: async (id) => {
    // Validate ID is an integer
    const companyId = parseInt(id);
    if (isNaN(companyId)) {
      throw new Error('Invalid company ID');
    }

    await new Promise(resolve => setTimeout(resolve, 200));
    const company = companies.find(c => c.Id === companyId);
    
    if (!company) {
      throw new Error('Company not found');
    }
    
    return { ...company };
  },

  // Create new company
  create: async (companyData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate new ID (ignore any provided ID)
    const newId = Math.max(...companies.map(c => c.Id), 0) + 1;
    
    const newCompany = {
      Id: newId,
      name: companyData.name || '',
      industry: companyData.industry || '',
      employeeCount: parseInt(companyData.employeeCount) || 0,
      website: companyData.website || '',
      address: companyData.address || '',
      description: companyData.description || '',
      contactCount: 0 // New companies start with 0 contacts
    };
    
    companies.push(newCompany);
    return { ...newCompany };
  },

  // Update company
  update: async (id, companyData) => {
    const companyId = parseInt(id);
    if (isNaN(companyId)) {
      throw new Error('Invalid company ID');
    }

    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = companies.findIndex(c => c.Id === companyId);
    if (index === -1) {
      throw new Error('Company not found');
    }
    
    companies[index] = {
      ...companies[index],
      name: companyData.name || companies[index].name,
      industry: companyData.industry || companies[index].industry,
      employeeCount: parseInt(companyData.employeeCount) || companies[index].employeeCount,
      website: companyData.website || companies[index].website,
      address: companyData.address || companies[index].address,
      description: companyData.description || companies[index].description
    };
    
    return { ...companies[index] };
  },

  // Delete company
  delete: async (id) => {
    const companyId = parseInt(id);
    if (isNaN(companyId)) {
      throw new Error('Invalid company ID');
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = companies.findIndex(c => c.Id === companyId);
    if (index === -1) {
      throw new Error('Company not found');
    }
    
    companies.splice(index, 1);
    return { success: true };
  }
};