import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card"
import ApperIcon from "@/components/ApperIcon"

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Overview of your CRM metrics and performance
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-20 w-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-6">
            <ApperIcon name="BarChart3" className="h-10 w-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard Coming Soon
          </h2>
          
          <p className="text-gray-600 text-center max-w-md mb-6">
            We're working on an amazing dashboard that will show you insights about your contacts, deals, and business performance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <ApperIcon name="TrendingUp" className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Sales Analytics</h3>
              <p className="text-sm text-gray-600">Track your sales performance</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <ApperIcon name="Users" className="h-8 w-8 text-secondary mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Contact Insights</h3>
              <p className="text-sm text-gray-600">Analyze customer relationships</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <ApperIcon name="Target" className="h-8 w-8 text-accent mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Goal Tracking</h3>
              <p className="text-sm text-gray-600">Monitor your targets</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardPage