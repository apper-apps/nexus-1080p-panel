import { Card, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const DealCard = ({ deal, onClick }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const calculateDaysInStage = (stageUpdatedAt) => {
    const stageDate = new Date(stageUpdatedAt)
    const now = new Date()
    const diffTime = Math.abs(now - stageDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStageColor = (stage) => {
    const colors = {
      lead: 'text-blue-600 bg-blue-50',
      qualified: 'text-yellow-600 bg-yellow-50',
      proposal: 'text-orange-600 bg-orange-50',
      negotiation: 'text-purple-600 bg-purple-50',
      closed: 'text-green-600 bg-green-50'
    }
    return colors[stage] || 'text-gray-600 bg-gray-50'
  }

  const daysInStage = calculateDaysInStage(deal.stageUpdatedAt)

return (
    <Card 
      className="cursor-move hover:shadow-md transition-shadow bg-white border border-gray-200 hover:border-gray-300"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(deal)
      }}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Deal Name */}
<h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">
            {deal.Name}
          </h3>

          {/* Deal Value */}
          <div className="flex items-center gap-2">
            <ApperIcon name="DollarSign" size={14} className="text-green-600" />
            <span className="font-semibold text-green-700">
              {formatCurrency(deal.value)}
            </span>
          </div>

          {/* Contact */}
          <div className="flex items-center gap-2">
            <ApperIcon name="User" size={14} className="text-gray-500" />
<span className="text-sm text-gray-600 truncate">
              {deal.contactName}
            </span>
          </div>

          {/* Days in Stage */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <ApperIcon name="Calendar" size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500">
                {daysInStage} day{daysInStage !== 1 ? 's' : ''} in stage
              </span>
            </div>
            
            {/* Drag Handle */}
            <div className="opacity-50 hover:opacity-100 transition-opacity">
              <ApperIcon name="GripVertical" size={14} className="text-gray-400" />
            </div>
          </div>

          {/* Description (if available) */}
          {deal.description && (
            <p className="text-xs text-gray-500 line-clamp-2 pt-1">
              {deal.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default DealCard