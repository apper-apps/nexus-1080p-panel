import { useState } from "react"
import Input from "@/components/atoms/Input"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import { Card } from "@/components/atoms/Card"

const AdvancedSearchPanel = ({ 
  type, 
  onSearch, 
  onFilter, 
  filters = {}, 
  placeholder = "Search...",
  className = "" 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchChange = (value) => {
    setSearchQuery(value)
    onSearch?.(value)
  }

  const handleFilterChange = (key, value) => {
    onFilter?.(key, value)
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    onSearch?.("")
    // Clear all filters based on type
    const emptyFilters = getEmptyFilters(type)
    Object.keys(emptyFilters).forEach(key => {
      onFilter?.(key, emptyFilters[key])
    })
  }

  const getEmptyFilters = (type) => {
    switch (type) {
      case 'contacts':
        return {
          company: '',
          jobTitle: '',
          startDate: '',
          endDate: '',
          activityType: ''
        }
      case 'companies':
        return {
          industry: '',
          minEmployees: '',
          maxEmployees: '',
          location: ''
        }
      case 'deals':
        return {
          stage: '',
          minValue: '',
          maxValue: '',
          startDate: '',
          endDate: '',
          contact: ''
        }
      default:
        return {}
    }
  }

  const renderContactFilters = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
        <Input
          placeholder="Filter by company..."
          value={filters.company || ''}
          onChange={(e) => handleFilterChange('company', e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
        <Input
          placeholder="Filter by job title..."
          value={filters.jobTitle || ''}
          onChange={(e) => handleFilterChange('jobTitle', e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Date From</label>
        <Input
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Date To</label>
        <Input
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
        <select
          value={filters.activityType || ''}
          onChange={(e) => handleFilterChange('activityType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        >
          <option value="">All Types</option>
          <option value="call">Call</option>
          <option value="email">Email</option>
          <option value="meeting">Meeting</option>
          <option value="note">Note</option>
        </select>
      </div>
    </div>
  )

  const renderCompanyFilters = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
        <select
          value={filters.industry || ''}
          onChange={(e) => handleFilterChange('industry', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        >
          <option value="">All Industries</option>
          <option value="Technology">Technology</option>
          <option value="Manufacturing">Manufacturing</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Finance">Finance</option>
          <option value="Education">Education</option>
          <option value="Retail">Retail</option>
          <option value="Energy">Energy</option>
          <option value="Transportation">Transportation</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Min Employees</label>
        <Input
          type="number"
          placeholder="0"
          value={filters.minEmployees || ''}
          onChange={(e) => handleFilterChange('minEmployees', e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Max Employees</label>
        <Input
          type="number"
          placeholder="10000"
          value={filters.maxEmployees || ''}
          onChange={(e) => handleFilterChange('maxEmployees', e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <Input
          placeholder="Filter by location..."
          value={filters.location || ''}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  )

  const renderDealFilters = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
        <select
          value={filters.stage || ''}
          onChange={(e) => handleFilterChange('stage', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        >
          <option value="">All Stages</option>
          <option value="lead">Lead</option>
          <option value="qualified">Qualified</option>
          <option value="proposal">Proposal</option>
          <option value="negotiation">Negotiation</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
        <Input
          type="number"
          placeholder="0"
          value={filters.minValue || ''}
          onChange={(e) => handleFilterChange('minValue', e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
        <Input
          type="number"
          placeholder="1000000"
          value={filters.maxValue || ''}
          onChange={(e) => handleFilterChange('maxValue', e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Close Date From</label>
        <Input
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Close Date To</label>
        <Input
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
        <Input
          placeholder="Filter by contact..."
          value={filters.contact || ''}
          onChange={(e) => handleFilterChange('contact', e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  )

  const renderFilters = () => {
    switch (type) {
      case 'contacts':
        return renderContactFilters()
      case 'companies':
        return renderCompanyFilters()
      case 'deals':
        return renderDealFilters()
      default:
        return null
    }
  }

  const hasActiveFilters = () => {
    if (!filters) return false
    return Object.values(filters).some(value => value && value.toString().trim() !== '')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ApperIcon name="Search" className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ApperIcon name="X" className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <ApperIcon name="SlidersHorizontal" size={16} />
            {isExpanded ? 'Hide Filters' : 'Advanced Filters'}
            {hasActiveFilters() && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-white rounded-full">
                {Object.values(filters).filter(v => v && v.toString().trim() !== '').length}
              </span>
            )}
          </Button>
          
          {(hasActiveFilters() || searchQuery) && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="flex items-center gap-2 whitespace-nowrap text-gray-600"
            >
              <ApperIcon name="X" size={16} />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {isExpanded && (
        <Card className="p-4 border-l-4 border-l-primary bg-gray-50">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            <div className="flex-1 w-full">
              {renderFilters()}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default AdvancedSearchPanel