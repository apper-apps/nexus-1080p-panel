import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card"
import ApperIcon from "@/components/ApperIcon"
import ActivityTimeline from "@/components/organisms/ActivityTimeline"
import AddActivityModal from "@/components/organisms/AddActivityModal"
import { activityService } from "@/services/api/activityService"
const ContactDetailPanel = ({ contact, onClose, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState('details')
  const [activities, setActivities] = useState([])
  const [activitiesLoading, setActivitiesLoading] = useState(false)
const [showAddActivity, setShowAddActivity] = useState(false)

  useEffect(() => {
    if (contact && activeTab === 'activities') {
      loadActivities()
    }
  }, [activeTab, contact?.Id])

  if (!contact) return null

  const loadActivities = async () => {
    try {
      setActivitiesLoading(true)
      const contactActivities = await activityService.getByEntity('contact', contact.Id)
      setActivities(contactActivities)
    } catch (error) {
      console.error('Error loading activities:', error)
      toast.error('Failed to load activities')
    } finally {
      setActivitiesLoading(false)
    }
  }

  const handleActivityAdded = (newActivity) => {
    setActivities(prev => [newActivity, ...prev])
    setActiveTab('activities')
  }

  const handleActivityUpdate = (updatedActivity) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.Id === updatedActivity.Id ? updatedActivity : activity
      )
    )
  }

  return (
<>
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 z-30 overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Contact Details</h2>
            <Button onClick={onClose} variant="ghost" size="sm">
              <ApperIcon name="X" className="h-4 w-4" />
            </Button>
          </div>

          {/* Contact Avatar & Name */}
          <div className="text-center mb-6">
            <div className="h-20 w-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">
                {contact.name.split(" ").map(n => n[0]).join("").toUpperCase()}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{contact.name}</h3>
            <p className="text-gray-600">{contact.company}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-6">
            <Button onClick={() => onEdit(contact)} variant="secondary" size="sm" className="flex-1">
              <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button onClick={() => onDelete(contact)} variant="danger" size="sm" className="flex-1">
              <ApperIcon name="Trash2" className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button onClick={() => setShowAddActivity(true)} variant="primary" size="sm" className="flex-1">
              <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
              Log Activity
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'activities'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Activities ({activities.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Mail" className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{contact.email}</p>
                      <p className="text-xs text-gray-500">Email</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Phone" className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{contact.phone}</p>
                      <p className="text-xs text-gray-500">Phone</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Building2" className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{contact.company}</p>
                      <p className="text-xs text-gray-500">Company</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Calendar" className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(contact.lastContactDate), "MMMM d, yyyy")}
                      </p>
                      <p className="text-xs text-gray-500">Last Contact</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <ApperIcon name="UserPlus" className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(contact.createdAt), "MMMM d, yyyy")}
                      </p>
                      <p className="text-xs text-gray-500">Added to CRM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {contact.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 leading-relaxed">{contact.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <div className="pt-6 border-t border-gray-200 space-y-3">
                <h4 className="font-medium text-gray-900">Quick Actions</h4>
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => window.open(`mailto:${contact.email}`)}
                  >
                    <ApperIcon name="Mail" className="h-4 w-4 mr-3" />
                    Send Email
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => window.open(`tel:${contact.phone}`)}
                  >
                    <ApperIcon name="Phone" className="h-4 w-4 mr-3" />
                    Call Contact
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div>
              {activitiesLoading ? (
                <div className="text-center py-8">
                  <ApperIcon name="Loader2" className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Loading activities...</p>
                </div>
              ) : (
                <ActivityTimeline
                  entityType="contact"
                  entityId={contact.Id}
                  activities={activities}
                  onActivityUpdate={handleActivityUpdate}
                />
              )}
            </div>
          )}
        </div>
      </motion.div>

      <AddActivityModal
        isOpen={showAddActivity}
        onClose={() => setShowAddActivity(false)}
        entityType="contact"
        entityId={contact.Id}
        onActivityAdded={handleActivityAdded}
      />
    </>
  )
}

export default ContactDetailPanel