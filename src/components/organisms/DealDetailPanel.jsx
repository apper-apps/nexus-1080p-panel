import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import ApperIcon from '@/components/ApperIcon'
import { dealService } from '@/services/api/dealService'

const DealDetailPanel = ({ deal, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false)

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getStageInfo = (stage) => {
    const stages = {
      lead: { name: 'Lead', color: 'bg-blue-500', textColor: 'text-blue-600' },
      qualified: { name: 'Qualified', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
      proposal: { name: 'Proposal', color: 'bg-orange-500', textColor: 'text-orange-600' },
      negotiation: { name: 'Negotiation', color: 'bg-purple-500', textColor: 'text-purple-600' },
      closed: { name: 'Closed', color: 'bg-green-500', textColor: 'text-green-600' }
    }
    return stages[stage] || { name: stage, color: 'bg-gray-500', textColor: 'text-gray-600' }
  }

  // Mock stage history - in real app this would come from the deal data
  const stageHistory = [
    { stage: 'lead', date: deal.createdAt, user: 'System' },
    { stage: 'qualified', date: deal.stageUpdatedAt, user: 'Sales Rep' },
    ...(deal.stage !== 'lead' && deal.stage !== 'qualified' ? [{ stage: deal.stage, date: deal.stageUpdatedAt, user: 'Sales Rep' }] : [])
  ]

  const handleMarkAsClosed = async () => {
    if (deal.stage === 'closed') return
    
    setLoading(true)
    try {
      await dealService.updateStage(deal.Id, 'closed')
      onUpdate?.()
      toast.success('Deal marked as closed')
      onClose()
    } catch (error) {
      toast.error('Failed to update deal')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this deal?')) return
    
    setLoading(true)
    try {
      await dealService.delete(deal.Id)
      onUpdate?.()
      toast.success('Deal deleted successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to delete deal')
    } finally {
      setLoading(false)
    }
  }

  const currentStage = getStageInfo(deal.stage)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="w-full max-w-2xl bg-white shadow-xl overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{deal.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-3 h-3 rounded-full ${currentStage.color}`}></div>
                <span className={`font-medium ${currentStage.textColor}`}>
                  {currentStage.name}
                </span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <ApperIcon name="X" size={20} />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Deal Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ApperIcon name="DollarSign" size={20} />
                Deal Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Value</label>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(deal.value)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact</label>
                  <p className="text-lg font-medium">{deal.contact}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900 mt-1">{deal.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-gray-900">{format(new Date(deal.createdAt), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-gray-900">{format(new Date(deal.stageUpdatedAt), 'MMM d, yyyy')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stage History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ApperIcon name="History" size={20} />
                Stage History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stageHistory.map((entry, index) => {
                  const stageInfo = getStageInfo(entry.stage)
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full ${stageInfo.color} flex items-center justify-center`}>
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{stageInfo.name}</span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(entry.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Updated by {entry.user}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ApperIcon name="Settings" size={20} />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {deal.stage !== 'closed' && (
                  <Button 
                    onClick={handleMarkAsClosed}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ApperIcon name="CheckCircle" size={16} />
                    Mark as Closed
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => toast.info('Edit functionality coming soon')}
                  disabled={loading}
                >
                  <ApperIcon name="Edit" size={16} />
                  Edit Deal
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => toast.info('Contact functionality coming soon')}
                  disabled={loading}
                >
                  <ApperIcon name="Phone" size={16} />
                  Contact Client
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleDelete}
                  disabled={loading}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <ApperIcon name="Trash2" size={16} />
                  Delete Deal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

export default DealDetailPanel