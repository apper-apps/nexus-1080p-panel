import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { companyService } from '@/services/api/companyService'
import ApperIcon from '@/components/ApperIcon'
import FormField from '@/components/molecules/FormField'
import Button from '@/components/atoms/Button'
const AddContactModal = ({ isOpen, onClose, onSubmit, editingContact = null, isEditMode = false }) => {
  const [companies, setCompanies] = useState([])
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyId: null,
    companyName: "",
    jobTitle: "",
    notes: ""
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load companies when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCompanies()
    }
  }, [isOpen])

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true)
      const { companyService } = await import('@/services/api/companyService')
      const data = await companyService.getAll()
      setCompanies(data)
    } catch (err) {
      console.error("Error loading companies:", err)
      toast.error("Failed to load companies")
    } finally {
      setLoadingCompanies(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && editingContact) {
      const nameParts = editingContact.name?.split(' ') || []
      setFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(' ') || "",
        email: editingContact.email || "",
        phone: editingContact.phone || "",
        companyId: editingContact.companyId || null,
        companyName: editingContact.companyName || editingContact.company || "",
        jobTitle: editingContact.jobTitle || "",
        notes: editingContact.notes || ""
      })
    } else if (!isEditMode) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        companyId: null,
        companyName: "",
        jobTitle: "",
        notes: ""
      })
    }
  }, [isEditMode, editingContact])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }
    
if (!formData.companyId) {
      newErrors.companyId = "Company is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      // Combine first and last name for submission
      const submitData = {
        ...formData,
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim()
      }
      // Remove firstName and lastName from submit data
      delete submitData.firstName
      delete submitData.lastName
      
      await onSubmit(submitData)
      
      if (!isEditMode) {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
phone: "",
          companyId: null,
          companyName: "",
          jobTitle: "",
          notes: ""
        })
      }
      setErrors({})
      onClose()
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} contact:`, error)
    } finally {
      setIsSubmitting(false)
    }
  }

const handleClose = () => {
    if (!isSubmitting) {
      if (!isEditMode) {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          companyId: null,
          companyName: "",
          jobTitle: "",
          notes: ""
        })
      }
      setErrors({})
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                      <ApperIcon name="UserPlus" className="h-5 w-5 text-white" />
                    </div>
<h2 className="text-xl font-bold text-gray-900">
                      {isEditMode ? 'Edit Contact' : 'Add New Contact'}
                    </h2>
                  </div>
                  <Button onClick={handleClose} variant="ghost" size="sm" disabled={isSubmitting}>
                    <ApperIcon name="X" className="h-4 w-4" />
                  </Button>
                </div>

<form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="First Name"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      error={errors.firstName}
                      required
                      placeholder="Enter first name"
                      disabled={isSubmitting}
                    />

                    <FormField
                      label="Last Name"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      error={errors.lastName}
                      required
                      placeholder="Enter last name"
                      disabled={isSubmitting}
                    />
                  </div>

                  <FormField
                    label="Email Address"
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                    placeholder="Enter email address"
                    disabled={isSubmitting}
                  />

                  <FormField
                    label="Phone Number"
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    required
                    placeholder="Enter phone number"
                    disabled={isSubmitting}
                  />

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">
                        Company <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="companyId"
                        name="companyId"
                        value={formData.companyId || ''}
                        onChange={(e) => {
                          const selectedCompanyId = e.target.value ? parseInt(e.target.value) : null
                          const selectedCompany = companies.find(c => c.Id === selectedCompanyId)
                          setFormData(prev => ({
                            ...prev,
                            companyId: selectedCompanyId,
                            companyName: selectedCompany ? selectedCompany.name : ""
                          }))
                        }}
                        disabled={isSubmitting || loadingCompanies}
                        className={`
                          w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                          ${errors.companyId ? 'border-red-500' : 'border-gray-300'}
                        `}
                      >
                        <option value="">
                          {loadingCompanies ? 'Loading companies...' : 'Select a company'}
                        </option>
                        {companies.map(company => (
                          <option key={company.Id} value={company.Id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                      {errors.companyId && (
                        <p className="text-red-500 text-sm mt-1">{errors.companyId}</p>
                      )}
                    </div>

                    <FormField
                      label="Job Title"
                      id="jobTitle"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      error={errors.jobTitle}
                      placeholder="Enter job title"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="notes" className="text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Add any additional notes..."
                      disabled={isSubmitting}
                      className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      onClick={handleClose}
                      variant="secondary"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
{isSubmitting ? (
                        <>
                          <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                          {isEditMode ? 'Updating...' : 'Adding...'}
                        </>
                      ) : (
                        <>
                          <ApperIcon name={isEditMode ? "Save" : "UserPlus"} className="h-4 w-4 mr-2" />
                          {isEditMode ? 'Update Contact' : 'Add Contact'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AddContactModal