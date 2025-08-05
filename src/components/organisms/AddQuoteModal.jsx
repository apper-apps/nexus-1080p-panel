import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { companyService } from '@/services/api/companyService'
import { contactService } from '@/services/api/contactService'
import { dealService } from '@/services/api/dealService'
import ApperIcon from '@/components/ApperIcon'
import FormField from '@/components/molecules/FormField'
import Button from '@/components/atoms/Button'

const AddQuoteModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  mode = 'add'
}) => {
  const [formData, setFormData] = useState({
    Name: '',
    companyId: '',
    contactId: '',
    dealId: '',
    quoteDate: '',
    status: 'Draft',
    deliveryMethod: '',
    expiresOn: '',
    billingBillToName: '',
    billingStreet: '',
    billingCity: '',
    billingState: '',
    billingCountry: '',
    billingPincode: '',
    shippingShipToName: '',
    shippingStreet: '',
    shippingCity: '',
    shippingState: '',
    shippingCountry: '',
    shippingPincode: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState([])
  const [contacts, setContacts] = useState([])
  const [deals, setDeals] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [copyBillingToShipping, setCopyBillingToShipping] = useState(false)

  // Load dropdown options
  const loadOptions = async () => {
    try {
      setLoadingOptions(true)
      const [companiesData, contactsData, dealsData] = await Promise.all([
        companyService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ])
      
      setCompanies(companiesData.data || [])
      setContacts(contactsData.data || [])
      setDeals(dealsData.data || [])
    } catch (error) {
      console.error('Error loading options:', error)
      toast.error('Failed to load form options')
    } finally {
      setLoadingOptions(false)
    }
  }

  // Load options when modal opens
  useEffect(() => {
    if (isOpen) {
      loadOptions()
    }
  }, [isOpen])

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === 'edit') {
        setFormData({
          Name: initialData.Name || '',
          companyId: initialData.companyId?.Id || initialData.companyId || '',
          contactId: initialData.contactId?.Id || initialData.contactId || '',
          dealId: initialData.dealId?.Id || initialData.dealId || '',
          quoteDate: initialData.quoteDate || '',
          status: initialData.status || 'Draft',
          deliveryMethod: initialData.deliveryMethod || '',
          expiresOn: initialData.expiresOn || '',
          billingBillToName: initialData.billingBillToName || '',
          billingStreet: initialData.billingStreet || '',
          billingCity: initialData.billingCity || '',
          billingState: initialData.billingState || '',
          billingCountry: initialData.billingCountry || '',
          billingPincode: initialData.billingPincode || '',
          shippingShipToName: initialData.shippingShipToName || '',
          shippingStreet: initialData.shippingStreet || '',
          shippingCity: initialData.shippingCity || '',
          shippingState: initialData.shippingState || '',
          shippingCountry: initialData.shippingCountry || '',
          shippingPincode: initialData.shippingPincode || ''
        })
      } else {
        // Reset form for add mode
        setFormData({
          Name: '',
          companyId: '',
          contactId: '',
          dealId: '',
          quoteDate: new Date().toISOString().split('T')[0],
          status: 'Draft',
          deliveryMethod: '',
          expiresOn: '',
          billingBillToName: '',
          billingStreet: '',
          billingCity: '',
          billingState: '',
          billingCountry: '',
          billingPincode: '',
          shippingShipToName: '',
          shippingStreet: '',
          shippingCity: '',
          shippingState: '',
          shippingCountry: '',
          shippingPincode: ''
        })
      }
      setErrors({})
      setCopyBillingToShipping(false)
    }
  }, [isOpen, initialData, mode])

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Handle copy billing to shipping
  const handleCopyBillingToShipping = (checked) => {
    setCopyBillingToShipping(checked)
    if (checked) {
      setFormData(prev => ({
        ...prev,
        shippingShipToName: prev.billingBillToName,
        shippingStreet: prev.billingStreet,
        shippingCity: prev.billingCity,
        shippingState: prev.billingState,
        shippingCountry: prev.billingCountry,
        shippingPincode: prev.billingPincode
      }))
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.Name.trim()) {
      newErrors.Name = 'Quote name is required'
    }
    
    if (!formData.companyId) {
      newErrors.companyId = 'Company is required'
    }
    
    if (!formData.contactId) {
      newErrors.contactId = 'Contact is required'
    }
    
    if (!formData.quoteDate) {
      newErrors.quoteDate = 'Quote date is required'
    }

    if (formData.expiresOn && formData.quoteDate && formData.expiresOn <= formData.quoteDate) {
      newErrors.expiresOn = 'Expiry date must be after quote date'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      setLoading(true)
      await onSubmit(formData)
    } catch (error) {
      // Error is handled by parent component
      console.error('Form submission error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle close
  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!isOpen) return null

  const statusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Sent', label: 'Sent' },
    { value: 'Accepted', label: 'Accepted' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Expired', label: 'Expired' }
  ]

  const companyOptions = companies.map(company => ({
    value: company.Id,
    label: company.Name
  }))

  const contactOptions = contacts.map(contact => ({
    value: contact.Id,
    label: contact.Name
  }))

  const dealOptions = deals.map(deal => ({
    value: deal.Id,
    label: deal.Name
  }))

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'edit' ? 'Edit Quote' : 'Add New Quote'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600"
            >
              <ApperIcon name="X" size={20} />
            </Button>
          </div>

          {/* Content */}
          <div className="max-h-[calc(90vh-140px)] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Quote Details Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quote Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Quote Name"
                    id="Name"
                    name="Name"
                    value={formData.Name}
                    onChange={handleChange}
                    error={errors.Name}
                    required
                    disabled={loading || loadingOptions}
                  />
                  
                  <FormField
                    label="Company"
                    id="companyId"
                    name="companyId"
                    as="select"
                    value={formData.companyId}
                    onChange={handleChange}
                    options={companyOptions}
                    error={errors.companyId}
                    required
                    disabled={loading || loadingOptions}
                  />
                  
                  <FormField
                    label="Contact"
                    id="contactId"
                    name="contactId"
                    as="select"
                    value={formData.contactId}
                    onChange={handleChange}
                    options={contactOptions}
                    error={errors.contactId}
                    required
                    disabled={loading || loadingOptions}
                  />
                  
                  <FormField
                    label="Deal"
                    id="dealId"
                    name="dealId"
                    as="select"
                    value={formData.dealId}
                    onChange={handleChange}
                    options={dealOptions}
                    error={errors.dealId}
                    disabled={loading || loadingOptions}
                  />
                  
                  <FormField
                    label="Quote Date"
                    id="quoteDate"
                    name="quoteDate"
                    type="date"
                    value={formData.quoteDate}
                    onChange={handleChange}
                    error={errors.quoteDate}
                    required
                    disabled={loading}
                  />
                  
                  <FormField
                    label="Status"
                    id="status"
                    name="status"
                    as="select"
                    value={formData.status}
                    onChange={handleChange}
                    options={statusOptions}
                    error={errors.status}
                    disabled={loading}
                  />
                  
                  <FormField
                    label="Delivery Method"
                    id="deliveryMethod"
                    name="deliveryMethod"
                    value={formData.deliveryMethod}
                    onChange={handleChange}
                    error={errors.deliveryMethod}
                    disabled={loading}
                  />
                  
                  <FormField
                    label="Expires On"
                    id="expiresOn"
                    name="expiresOn"
                    type="date"
                    value={formData.expiresOn}
                    onChange={handleChange}
                    error={errors.expiresOn}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Billing Address Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Bill To Name"
                    id="billingBillToName"
                    name="billingBillToName"
                    value={formData.billingBillToName}
                    onChange={handleChange}
                    error={errors.billingBillToName}
                    disabled={loading}
                  />
                  
                  <FormField
                    label="Street"
                    id="billingStreet"
                    name="billingStreet"
                    as="textarea"
                    value={formData.billingStreet}
                    onChange={handleChange}
                    error={errors.billingStreet}
                    disabled={loading}
                  />
                  
                  <FormField
                    label="City"
                    id="billingCity"
                    name="billingCity"
                    value={formData.billingCity}
                    onChange={handleChange}
                    error={errors.billingCity}
                    disabled={loading}
                  />
                  
                  <FormField
                    label="State"
                    id="billingState"
                    name="billingState"
                    value={formData.billingState}
                    onChange={handleChange}
                    error={errors.billingState}
                    disabled={loading}
                  />
                  
                  <FormField
                    label="Country"
                    id="billingCountry"
                    name="billingCountry"
                    value={formData.billingCountry}
                    onChange={handleChange}
                    error={errors.billingCountry}
                    disabled={loading}
                  />
                  
                  <FormField
                    label="Pincode"
                    id="billingPincode"
                    name="billingPincode"
                    value={formData.billingPincode}
                    onChange={handleChange}
                    error={errors.billingPincode}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Shipping Address Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={copyBillingToShipping}
                      onChange={(e) => handleCopyBillingToShipping(e.target.checked)}
                      disabled={loading}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    Same as billing address
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Ship To Name"
                    id="shippingShipToName"
                    name="shippingShipToName"
                    value={formData.shippingShipToName}
                    onChange={handleChange}
                    error={errors.shippingShipToName}
                    disabled={loading || copyBillingToShipping}
                  />
                  
                  <FormField
                    label="Street"
                    id="shippingStreet"
                    name="shippingStreet"
                    as="textarea"
                    value={formData.shippingStreet}
                    onChange={handleChange}
                    error={errors.shippingStreet}
                    disabled={loading || copyBillingToShipping}
                  />
                  
                  <FormField
                    label="City"
                    id="shippingCity"
                    name="shippingCity"
                    value={formData.shippingCity}
                    onChange={handleChange}
                    error={errors.shippingCity}
                    disabled={loading || copyBillingToShipping}
                  />
                  
                  <FormField
                    label="State"
                    id="shippingState"
                    name="shippingState"
                    value={formData.shippingState}
                    onChange={handleChange}
                    error={errors.shippingState}
                    disabled={loading || copyBillingToShipping}
                  />
                  
                  <FormField
                    label="Country"
                    id="shippingCountry"
                    name="shippingCountry"
                    value={formData.shippingCountry}
                    onChange={handleChange}
                    error={errors.shippingCountry}
                    disabled={loading || copyBillingToShipping}
                  />
                  
                  <FormField
                    label="Pincode"
                    id="shippingPincode"
                    name="shippingPincode"
                    value={formData.shippingPincode}
                    onChange={handleChange}
                    error={errors.shippingPincode}
                    disabled={loading || copyBillingToShipping}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || loadingOptions}
              className="gap-2"
            >
              {loading && <ApperIcon name="Loader2" size={16} className="animate-spin" />}
              {mode === 'edit' ? 'Update Quote' : 'Create Quote'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AddQuoteModal