import { Card, CardContent } from "@/components/atoms/Card"
import ApperIcon from "@/components/ApperIcon"

const DealsPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Deals
        </h1>
        <p className="text-gray-600 mt-1">
          Track your sales opportunities and pipeline
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-20 w-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6">
            <ApperIcon name="TrendingUp" className="h-10 w-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Deals Pipeline Coming Soon
          </h2>
          
          <p className="text-gray-600 text-center max-w-md mb-6">
            Manage your sales opportunities with a powerful pipeline view, deal tracking, and revenue forecasting.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <ApperIcon name="DollarSign" className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Revenue Tracking</h3>
              <p className="text-sm text-gray-600">Monitor deal values</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <ApperIcon name="Calendar" className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Deal Stages</h3>
              <p className="text-sm text-gray-600">Track progress</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DealsPage