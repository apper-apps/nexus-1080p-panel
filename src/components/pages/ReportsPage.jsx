import { Card, CardContent } from "@/components/atoms/Card"
import ApperIcon from "@/components/ApperIcon"

const ReportsPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Reports
        </h1>
        <p className="text-gray-600 mt-1">
          Analytics and insights for your business
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-20 w-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-6">
            <ApperIcon name="FileText" className="h-10 w-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Advanced Reports Coming Soon
          </h2>
          
          <p className="text-gray-600 text-center max-w-md mb-6">
            Generate detailed reports and analytics to gain insights into your sales performance, customer behavior, and business growth.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <ApperIcon name="PieChart" className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Sales Reports</h3>
              <p className="text-sm text-gray-600">Revenue analytics</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <ApperIcon name="Activity" className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Activity Reports</h3>
              <p className="text-sm text-gray-600">Contact interactions</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <ApperIcon name="Download" className="h-8 w-8 text-pink-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Export Data</h3>
              <p className="text-sm text-gray-600">Download reports</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ReportsPage