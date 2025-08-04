import React, { useState, useEffect } from 'react'
import { format, formatDistance } from 'date-fns'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import { Card, CardContent } from '@/components/atoms/Card'
import ApperIcon from '@/components/ApperIcon'
import { activityService } from '@/services/api/activityService'

const ActivityTimeline = ({ entityType, entityId, activities, onActivityUpdate }) => {
  const [expandedActivities, setExpandedActivities] = useState(new Set())
  const [loading, setLoading] = useState(false)

  const getActivityIcon = (type) => {
    const icons = {
      call: 'Phone',
      email: 'Mail',
      meeting: 'Calendar',
      note: 'FileText',
      task: 'CheckSquare'
    }
    return icons[type] || 'Activity'
  }

  const getActivityColor = (type, completed = null) => {
    if (type === 'task' && completed !== null) {
      return completed 
        ? 'bg-green-100 text-green-600 border-green-200'
        : 'bg-yellow-100 text-yellow-600 border-yellow-200'
    }
    
    const colors = {
      call: 'bg-blue-100 text-blue-600 border-blue-200',
      email: 'bg-purple-100 text-purple-600 border-purple-200',
      meeting: 'bg-orange-100 text-orange-600 border-orange-200',
      note: 'bg-gray-100 text-gray-600 border-gray-200',
      task: 'bg-indigo-100 text-indigo-600 border-indigo-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-600 border-gray-200'
  }

  const toggleExpanded = (activityId) => {
    const newExpanded = new Set(expandedActivities)
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId)
    } else {
      newExpanded.add(activityId)
    }
    setExpandedActivities(newExpanded)
  }

  const handleToggleTaskComplete = async (activity) => {
    if (activity.type !== 'task') return
    
    setLoading(true)
    try {
      const updatedActivity = await activityService.markTaskComplete(
        activity.Id, 
        !activity.completed
      )
      toast.success(`Task marked as ${updatedActivity.completed ? 'completed' : 'incomplete'}`)
      onActivityUpdate?.(updatedActivity)
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    } finally {
      setLoading(false)
    }
  }

  const formatActivityDate = (date) => {
    const activityDate = new Date(date)
    const now = new Date()
    const distance = formatDistance(activityDate, now, { addSuffix: true })
    const formatted = format(activityDate, 'MMM d, yyyy h:mm a')
    
    return { distance, formatted }
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ApperIcon name="Clock" className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">No Activities Yet</h3>
        <p className="text-sm text-gray-500">Activities will appear here when logged</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const isExpanded = expandedActivities.has(activity.Id)
        const { distance, formatted } = formatActivityDate(activity.date)
        const isOverdue = activity.type === 'task' && 
          !activity.completed && 
          activity.dueDate && 
          new Date(activity.dueDate) < new Date()

        return (
          <Card key={activity.Id} className={`${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Timeline connector */}
                <div className="flex flex-col items-center">
                  <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${getActivityColor(activity.type, activity.completed)}`}>
                    <ApperIcon 
                      name={getActivityIcon(activity.type)} 
                      className="h-4 w-4" 
                    />
                  </div>
                  {index < activities.length - 1 && (
                    <div className="w-px h-6 bg-gray-200 mt-2"></div>
                  )}
                </div>

                {/* Activity content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {activity.title}
                        </h4>
                        {activity.type === 'task' && (
                          <Button
                            onClick={() => handleToggleTaskComplete(activity)}
                            variant="ghost"
                            size="sm"
                            className="p-1 h-6 w-6"
                            disabled={loading}
                          >
                            <ApperIcon 
                              name={activity.completed ? "CheckCircle2" : "Circle"} 
                              className={`h-3 w-3 ${activity.completed ? 'text-green-600' : 'text-gray-400'}`} 
                            />
                          </Button>
                        )}
                        {isOverdue && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Overdue
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span>{distance}</span>
                        <span>•</span>
                        <span>{formatted}</span>
                        <span>•</span>
                        <span>by {activity.createdBy}</span>
                      </div>

                      {activity.description && (
                        <p className={`text-sm text-gray-700 ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {activity.description}
                        </p>
                      )}

                      {activity.outcome && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {activity.outcome}
                          </span>
                        </div>
                      )}

                      {/* Task-specific fields */}
                      {activity.type === 'task' && activity.dueDate && (
                        <div className="mt-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <ApperIcon name="Clock" className="h-3 w-3" />
                            <span>Due: {format(new Date(activity.dueDate), 'MMM d, yyyy h:mm a')}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expand/Collapse button */}
                    {activity.description && activity.description.length > 100 && (
                      <Button
                        onClick={() => toggleExpanded(activity.Id)}
                        variant="ghost"
                        size="sm"
                        className="p-1 h-6 w-6 flex-shrink-0"
                      >
                        <ApperIcon 
                          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                          className="h-3 w-3" 
                        />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default ActivityTimeline