import { Card, CardContent } from "@/components/atoms/Card"
import ApperIcon from "@/components/ApperIcon"

const CompaniesPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Companies
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your business relationships and accounts
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-20 w-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-6">
            <ApperIcon name="Building2" className="h-10 w-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Company Management Coming Soon
          </h2>
          
          <p className="text-gray-600 text-center max-w-md mb-6">
            Organize and manage company profiles, track business relationships, and maintain detailed account information.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <ApperIcon name="Users" className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Team Management</h3>
              <p className="text-sm text-gray-600">Manage company contacts</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <ApperIcon name="MapPin" className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Location Tracking</h3>
              <p className="text-sm text-gray-600">Track office locations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CompaniesPage