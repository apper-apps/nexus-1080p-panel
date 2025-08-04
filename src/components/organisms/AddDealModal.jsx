import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Label from '@/components/atoms/Label'
import ApperIcon from '@/components/ApperIcon'
import { contactService } from '@/services/api/contactService'
import { companyService } from '@/services/api/companyService'
import FormField from '@/components/molecules/FormField'

const STAGE_OPTIONS = [
  { value: 'lead', label: 'Lead' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed', label: 'Closed Won/Lost' }
]

const AddDealModal = ({ isOpen, onClose, onAdd }) => {
const [formData, setFormData] = useState({
    name: '',
    value: '',
    closeDate: '',
    stage: 'lead',
    contactId: '',
    companyId: '',
    description: ''
  })
  const [contacts, setContacts] = useState([])
  const [companies, setCompanies] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Deal name is required'
    }

    if (!formData.value || isNaN(formData.value) || parseFloat(formData.value) <= 0) {
      newErrors.value = 'Valid deal value is required'
    }

    if (!formData.closeDate) {
      newErrors.closeDate = 'Close date is required'
    }

    if (!formData.contactId) {
      newErrors.contactId = 'Associated contact is required'
    }

    if (!formData.companyId) {
      newErrors.companyId = 'Associated company is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const selectedContact = contacts.find(c => c.Id === parseInt(formData.contactId))
      const selectedCompany = companies.find(c => c.Id === parseInt(formData.companyId))
      
      await onAdd({
        ...formData,
        value: parseFloat(formData.value),
        contactName: selectedContact?.name || '',
        companyName: selectedCompany?.name || ''
      })
      
      // Reset form
      setFormData({
        name: '',
        value: '',
        closeDate: '',
        stage: 'lead',
        contactId: '',
        companyId: '',
        description: ''
      })
      setErrors({})
    } catch (error) {
      console.error('Error adding deal:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Load contacts and companies when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        setLoadingData(true)
        try {
          const [contactsData, companiesData] = await Promise.all([
            contactService.getAll(),
            companyService.getAll()
          ])
          setContacts(contactsData)
          setCompanies(companiesData)
        } catch (error) {
          console.error('Error loading data:', error)
        } finally {
          setLoadingData(false)
        }
      }
      loadData()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add New Deal</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <ApperIcon name="X" size={16} />
          </Button>
        </CardHeader>
        
<CardContent>
          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <ApperIcon name="Loader2" size={24} className="animate-spin" />
              <span className="ml-2">Loading...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Deal Name" error={errors.name}>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter deal name"
                  className={errors.name ? 'border-red-500' : ''}
                />
              </FormField>

              <FormField label="Deal Value" error={errors.value}>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.value}
                  onChange={(e) => handleChange('value', e.target.value)}
                  placeholder="Enter deal value"
                  className={errors.value ? 'border-red-500' : ''}
                  icon={<ApperIcon name="DollarSign" size={16} />}
                />
              </FormField>

              <FormField label="Close Date" error={errors.closeDate}>
                <Input
                  type="date"
                  value={formData.closeDate}
                  onChange={(e) => handleChange('closeDate', e.target.value)}
                  className={errors.closeDate ? 'border-red-500' : ''}
                  icon={<ApperIcon name="Calendar" size={16} />}
                />
              </FormField>

              <FormField label="Pipeline Stage">
                <select
                  value={formData.stage}
                  onChange={(e) => handleChange('stage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {STAGE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Associated Contact" error={errors.contactId}>
                <select
                  value={formData.contactId}
                  onChange={(e) => handleChange('contactId', e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${errors.contactId ? 'border-red-500' : ''}`}
                >
                  <option value="">Select a contact</option>
                  {contacts.map(contact => (
                    <option key={contact.Id} value={contact.Id}>
                      {contact.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Associated Company" error={errors.companyId}>
                <select
                  value={formData.companyId}
                  onChange={(e) => handleChange('companyId', e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${errors.companyId ? 'border-red-500' : ''}`}
                >
                  <option value="">Select a company</option>
                  {companies.map(company => (
                    <option key={company.Id} value={company.Id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Description (Optional)">
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Enter deal description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </FormField>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || loadingData} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <ApperIcon name="Loader2" size={16} className="animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Plus" size={16} />
                      Add Deal
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AddDealModal