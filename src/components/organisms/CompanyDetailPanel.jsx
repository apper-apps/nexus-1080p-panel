import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import ActivityTimeline from "@/components/organisms/ActivityTimeline";
import AddActivityModal from "@/components/organisms/AddActivityModal";
import { activityService } from "@/services/api/activityService";
const CompanyDetailPanel = ({ company, contacts = [], onClose, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState('details')
  const [activities, setActivities] = useState([])
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  const [showAddActivity, setShowAddActivity] = useState(false)

  if (!company) return null;

  useEffect(() => {
    if (activeTab === 'activities') {
      loadActivities()
    }
  }, [activeTab, company.Id])

  const loadActivities = async () => {
    try {
      setActivitiesLoading(true)
      const companyActivities = await activityService.getByEntity('company', company.Id)
      setActivities(companyActivities)
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

  const formatEmployeeCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const formatWebsite = (website) => {
    if (!website) return null;
    return website.startsWith('http') ? website : `https://${website}`;
  };

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
            <h2 className="text-xl font-bold text-gray-900">Company Details</h2>
            <Button onClick={onClose} variant="ghost" size="sm">
              <ApperIcon name="X" className="h-4 w-4" />
            </Button>
          </div>

          {/* Company Avatar & Name */}
          <div className="text-center mb-6">
            <div className="h-20 w-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">
                {company.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{company.name}</h3>
            <p className="text-gray-600">{company.industry}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-6">
            <Button onClick={() => onEdit(company)} variant="secondary" size="sm" className="flex-1">
              <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button onClick={() => onDelete(company)} variant="danger" size="sm" className="flex-1">
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
              onClick={() => setActiveTab('contacts')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'contacts'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Contacts ({contacts.length})
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
              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Building2" className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{company.industry}</p>
                      <p className="text-xs text-gray-500">Industry</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Users" className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{formatEmployeeCount(company.employeeCount)} employees</p>
                      <p className="text-xs text-gray-500">Company Size</p>
                    </div>
                  </div>
                  
                  {company.website && (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                        <ApperIcon name="Globe" className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <a 
                          href={formatWebsite(company.website)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          {company.website}
                        </a>
                        <p className="text-xs text-gray-500">Website</p>
                      </div>
                    </div>
                  )}
                  
                  {company.address && (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                        <ApperIcon name="MapPin" className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{company.address}</p>
                        <p className="text-xs text-gray-500">Address</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Company Description */}
              {company.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 leading-relaxed">{company.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <div className="pt-6 border-t border-gray-200 space-y-3">
                <h4 className="font-medium text-gray-900">Quick Actions</h4>
                <div className="space-y-2">
                  {company.website && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => window.open(formatWebsite(company.website), '_blank')}
                    >
                      <ApperIcon name="ExternalLink" className="h-4 w-4 mr-3" />
                      Visit Website
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => onEdit(company)}
                  >
                    <ApperIcon name="Edit" className="h-4 w-4 mr-3" />
                    Edit Company
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div>
              {contacts.length > 0 ? (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div key={contact.Id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="h-10 w-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 text-sm font-medium">
                          {contact.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.email}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`mailto:${contact.email}`)}
                          className="p-1"
                        >
                          <ApperIcon name="Mail" className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`tel:${contact.phone}`)}
                          className="p-1"
                        >
                          <ApperIcon name="Phone" className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ApperIcon name="UserX" className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No contacts found for this company</p>
                </div>
              )}
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
                  entityType="company"
                  entityId={company.Id}
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
        entityType="company"
        entityId={company.Id}
        onActivityAdded={handleActivityAdded}
      />
    </>
  );
};

export default CompanyDetailPanel;