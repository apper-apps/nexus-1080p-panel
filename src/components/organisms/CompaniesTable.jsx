import { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

const CompaniesTable = ({ 
  companies, 
  onCompanySelect, 
  selectedCompany, 
  loading = false 
}) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCompanies = [...companies].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    }
    
    if (typeof aValue === 'number') {
      const comparison = aValue - bValue;
      return sortDirection === 'asc' ? comparison : -comparison;
    }
    
    return 0;
  });

  const formatEmployeeCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const formatLocation = (address) => {
    // Extract city and state from address
    const parts = address.split(',');
    if (parts.length >= 2) {
      return parts.slice(-2).join(',').trim();
    }
    return address;
  };

  const SortHeader = ({ field, children }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        <div className="flex flex-col">
          <ApperIcon 
            name="ChevronUp" 
            size={12}
            className={cn(
              "transition-colors",
              sortField === field && sortDirection === 'asc' 
                ? "text-primary" 
                : "text-gray-300"
            )}
          />
          <ApperIcon 
            name="ChevronDown" 
            size={12}
            className={cn(
              "transition-colors -mt-1",
              sortField === field && sortDirection === 'desc' 
                ? "text-primary" 
                : "text-gray-300"
            )}
          />
        </div>
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center">
          <ApperIcon name="Building2" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
          <p className="text-gray-600">Add your first company to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortHeader field="name">Company Name</SortHeader>
              <SortHeader field="industry">Industry</SortHeader>
              <SortHeader field="employeeCount">Size</SortHeader>
              <SortHeader field="address">Location</SortHeader>
              <SortHeader field="contactCount">Contacts</SortHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCompanies.map((company) => (
              <tr
                key={company.Id}
                className={cn(
                  "hover:bg-gray-50 transition-colors cursor-pointer",
                  selectedCompany?.Id === company.Id && "bg-blue-50"
                )}
                onClick={() => onCompanySelect(company)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                        <ApperIcon name="Building2" className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {company.name}
                      </div>
                      {company.website && (
                        <div className="text-sm text-gray-500">
                          {company.website.replace(/^https?:\/\//, '')}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {company.industry}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatEmployeeCount(company.employeeCount)} employees
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <ApperIcon name="MapPin" size={14} className="text-gray-400 mr-1" />
                    {formatLocation(company.address)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <ApperIcon name="Users" size={14} className="text-gray-400 mr-1" />
                    {company.contactCount}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Edit functionality would go here
                      }}
                      className="text-indigo-600 hover:text-indigo-900 transition-colors"
                    >
                      <ApperIcon name="Edit2" size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Delete functionality would go here
                      }}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompaniesTable;