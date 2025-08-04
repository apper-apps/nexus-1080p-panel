import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Label from '@/components/atoms/Label'
import ApperIcon from '@/components/ApperIcon'
import { activityService } from '@/services/api/activityService'

const AddActivityModal = ({ isOpen, onClose, entityType, entityId, onActivityAdded, prePopulatedData }) => {
const [formData, setFormData] = useState({
    type: prePopulatedData?.type || 'call',
    title: prePopulatedData?.title || '',
    description: prePopulatedData?.description || '',
    outcome: prePopulatedData?.outcome || '',
    date: prePopulatedData?.date || new Date().toISOString().slice(0, 16), // Format for datetime-local input
    dueDate: prePopulatedData?.dueDate || '',
    completed: prePopulatedData?.completed || false
  })
  const [loading, setLoading] = useState(false)

  const activityTypes = [
    { value: 'call', label: 'Call', icon: 'Phone' },
    { value: 'email', label: 'Email', icon: 'Mail' },
    { value: 'meeting', label: 'Meeting', icon: 'Calendar' },
    { value: 'note', label: 'Note', icon: 'FileText' },
    { value: 'task', label: 'Task', icon: 'CheckSquare' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }

    setLoading(true)
    try {
      const activityData = {
        ...formData,
        entityType,
        entityId: parseInt(entityId),
        title: formData.title.trim(),
        description: formData.description.trim(),
        outcome: formData.outcome.trim() || 'Logged'
      }

      // Only include dueDate for tasks
      if (formData.type !== 'task') {
        delete activityData.dueDate
        delete activityData.completed
      }

      const newActivity = await activityService.create(activityData)
      toast.success('Activity logged successfully')
      onActivityAdded?.(newActivity)
      handleClose()
    } catch (error) {
      console.error('Error creating activity:', error)
      toast.error('Failed to log activity')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      type: 'call',
      title: '',
      description: '',
      outcome: '',
      date: new Date().toISOString().slice(0, 16),
      dueDate: '',
      completed: false
    })
onClose()
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Reset form data when modal opens with new pre-populated data
  React.useEffect(() => {
    if (isOpen && prePopulatedData) {
      setFormData({
        type: prePopulatedData.type || 'call',
        title: prePopulatedData.title || '',
        description: prePopulatedData.description || '',
        outcome: prePopulatedData.outcome || '',
        date: prePopulatedData.date || new Date().toISOString().slice(0, 16),
        dueDate: prePopulatedData.dueDate || '',
        completed: prePopulatedData.completed || false
      })
    }
  }, [isOpen, prePopulatedData])
  if (!isOpen) return null

  const selectedType = activityTypes.find(type => type.value === formData.type)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                <ApperIcon name="Plus" className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Log Activity</h2>
                <p className="text-sm text-gray-500">
                  Add new {entityType} activity
                </p>
              </div>
            </div>
            <Button onClick={handleClose} variant="ghost" size="sm">
              <ApperIcon name="X" className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Activity Type */}
          <div>
            <Label htmlFor="type">Activity Type</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {activityTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange('type', type.value)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                    formData.type === type.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ApperIcon name={type.icon} className="h-4 w-4" />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder={`Enter ${selectedType?.label.toLowerCase()} title`}
              className="mt-1"
              required
            />
          </div>

          {/* Date and Time */}
          <div>
            <Label htmlFor="date">Date & Time</Label>
            <Input
              id="date"
              type="datetime-local"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="mt-1"
              required
            />
          </div>

          {/* Due Date (only for tasks) */}
          {formData.type === 'task' && (
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter activity details..."
              rows={4}
              className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          {/* Outcome */}
          <div>
            <Label htmlFor="outcome">Outcome</Label>
            <Input
              id="outcome"
              value={formData.outcome}
              onChange={(e) => handleInputChange('outcome', e.target.value)}
              placeholder="Enter outcome or result..."
              className="mt-1"
            />
          </div>

          {/* Completion Status (only for tasks) */}
          {formData.type === 'task' && (
            <div className="flex items-center gap-3">
              <input
                id="completed"
                type="checkbox"
                checked={formData.completed}
                onChange={(e) => handleInputChange('completed', e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label htmlFor="completed" className="!mb-0">Mark as completed</Label>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                  Logging...
                </>
              ) : (
                <>
                  <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                  Log Activity
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default AddActivityModal