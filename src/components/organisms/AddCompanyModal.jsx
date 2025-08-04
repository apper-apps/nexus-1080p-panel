import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import ApperIcon from '@/components/ApperIcon';
import { industryOptions } from '@/services/api/companyService';

const AddCompanyModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    industry: initialData?.industry || '',
    employeeCount: initialData?.employeeCount || '',
    website: initialData?.website || '',
    address: initialData?.address || '',
    description: initialData?.description || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }

    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }

    if (!formData.employeeCount) {
      newErrors.employeeCount = 'Employee count is required';
    } else if (isNaN(parseInt(formData.employeeCount)) || parseInt(formData.employeeCount) < 1) {
      newErrors.employeeCount = 'Employee count must be a valid number greater than 0';
    }

    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'Website must be a valid URL starting with http:// or https://';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        employeeCount: parseInt(formData.employeeCount)
      };
      
      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      industry: '',
      employeeCount: '',
      website: '',
      address: '',
      description: ''
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {initialData ? 'Edit Company' : 'Add New Company'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {initialData ? 'Update company information' : 'Create a new company profile'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ApperIcon name="X" size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div className="md:col-span-2">
                <FormField
                  label="Company Name"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="Enter company name"
                  required
                />
              </div>

              {/* Industry */}
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                  Industry <span className="text-red-500">*</span>
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.industry ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select industry</option>
                  {industryOptions.map(industry => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
                {errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry}</p>}
              </div>

              {/* Employee Count */}
              <div>
                <FormField
                  label="Employee Count"
                  id="employeeCount"
                  name="employeeCount"
                  type="number"
                  value={formData.employeeCount}
                  onChange={handleChange}
                  error={errors.employeeCount}
                  placeholder="e.g. 100"
                  min="1"
                  required
                />
              </div>

              {/* Website */}
              <div className="md:col-span-2">
                <FormField
                  label="Website"
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  error={errors.website}
                  placeholder="https://company.com"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <FormField
                  label="Address"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                  placeholder="Enter company address"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Brief description of the company..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[100px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  initialData ? 'Update' : 'Add Company'
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddCompanyModal;