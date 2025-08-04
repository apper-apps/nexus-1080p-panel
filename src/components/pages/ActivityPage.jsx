import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import { activityService } from '@/services/api/activityService'
import { contactService } from '@/services/api/contactService'
import { dealService } from '@/services/api/dealService'
import ApperIcon from '@/components/ApperIcon'
import Input from '@/components/atoms/Input'
import Button from '@/components/atoms/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card'
import ActivityTimeline from '@/components/organisms/ActivityTimeline'
import AddActivityModal from '@/components/organisms/AddActivityModal'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'

const ActivityPage = () => {
  const [activities, setActivities] = useState([])
  const [filteredActivities, setFilteredActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [contacts, setContacts] = useState([])
  const [deals, setDeals] = useState([])

  const activityTypes = [
    { value: 'all', label: 'All Activities', icon: 'Activity' },
    { value: 'call', label: 'Calls', icon: 'Phone' },
    { value: 'email', label: 'Emails', icon: 'Mail' },
    { value: 'meeting', label: 'Meetings', icon: 'Calendar' },
    { value: 'note', label: 'Notes', icon: 'FileText' },
    { value: 'task', label: 'Tasks', icon: 'CheckSquare' }
  ]

  const timePeriods = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ]

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterActivities()
  }, [activities, searchTerm, selectedType, selectedPeriod])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [activitiesData, contactsData, dealsData] = await Promise.all([
        activityService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ])

      setActivities(activitiesData)
      setContacts(contactsData)
      setDeals(dealsData)
    } catch (err) {
      console.error('Error loading activity data:', err)
      setError('Failed to load activities. Please try again.')
      toast.error('Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  const filterActivities = () => {
    let filtered = [...activities]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.createdBy?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by activity type
    if (selectedType !== 'all') {
      filtered = filtered.filter(activity => activity.type === selectedType)
    }

    // Filter by time period
    if (selectedPeriod !== 'all') {
      const now = new Date()
      const activityDate = (activity) => new Date(activity.date)

      switch (selectedPeriod) {
        case 'today':
          filtered = filtered.filter(activity => {
            const date = activityDate(activity)
            return date.toDateString() === now.toDateString()
          })
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(activity => activityDate(activity) >= weekAgo)
          break
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          filtered = filtered.filter(activity => activityDate(activity) >= monthAgo)
          break
        case 'quarter':
          const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
          filtered = filtered.filter(activity => activityDate(activity) >= quarterAgo)
          break
      }
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date))

    setFilteredActivities(filtered)
  }

  const handleActivityUpdate = (updatedActivity) => {
    setActivities(prev => prev.map(act => 
      act.Id === updatedActivity.Id ? updatedActivity : act
    ))
    toast.success('Activity updated successfully')
  }

  const handleActivityAdd = (newActivity) => {
    setActivities(prev => [newActivity, ...prev])
    setIsAddModalOpen(false)
    toast.success('Activity added successfully')
  }

  const getActivityStats = () => {
    const stats = {
      total: activities.length,
      completed: activities.filter(a => a.type === 'task' && a.completed).length,
      pending: activities.filter(a => a.type === 'task' && !a.completed).length,
      overdue: activities.filter(a => a.type === 'task' && !a.completed && a.dueDate && new Date(a.dueDate) < new Date()).length
    }
    return stats
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadData} />

  const stats = getActivityStats()

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ApperIcon name="Activity" className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                Activity Feed
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Track all interactions and tasks across your CRM
              </p>
            </div>

            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 self-start sm:self-auto"
            >
              <ApperIcon name="Plus" className="h-4 w-4" />
              Add Activity
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ApperIcon name="Activity" className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-sm text-gray-600">Total Activities</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <ApperIcon name="CheckCircle" className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <ApperIcon name="Clock" className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <ApperIcon name="AlertCircle" className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
                    <p className="text-sm text-gray-600">Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                icon="Search"
              />
            </div>

            {/* Type Filter */}
            <div className="flex-shrink-0">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full lg:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Period Filter */}
            <div className="flex-shrink-0">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full lg:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {timePeriods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            {filteredActivities.length > 0 ? (
              <ActivityTimeline 
                activities={filteredActivities}
                onActivityUpdate={handleActivityUpdate}
              />
            ) : (
              <Empty 
                icon="Activity"
                title="No Activities Found"
                description={searchTerm || selectedType !== 'all' || selectedPeriod !== 'all' 
                  ? "No activities match your current filters. Try adjusting your search criteria."
                  : "No activities have been logged yet. Add your first activity to get started."
                }
                actionLabel="Add Activity"
                onAction={() => setIsAddModalOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Add Activity Modal */}
      <AddActivityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleActivityAdd}
        contacts={contacts}
        deals={deals}
      />
    </div>
  )
}

export default ActivityPage