import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "react-apexcharts";
import { endOfMonth, format, startOfMonth, subDays } from "date-fns";
import { toast } from "react-toastify";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import { activityService } from "@/services/api/activityService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";

const DashboardPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  })
  
  // Dashboard metrics state
const [metrics, setMetrics] = useState({
    totalContacts: 0,
    activeDeals: 0,
    monthlySalesTarget: 50000,
currentMonthSales: 0,
    winRate: 0,
    pipelineData: [],
    recentActivities: [],
    topPerformers: {
      contacts: [],
      companies: []
    }
  })

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [dateRange])

const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [
        totalContacts,
        deals,
pipelineData,
        winRate,
        recentDeals,
        recentActivities,
        topContactsByValue,
        topCompaniesByOpportunities
      ] = await Promise.all([
        contactService.getTotalCount(),
        dealService.getAll(),
        dealService.getPipelineData(),
        dealService.getWinRate(),
        dealService.getRecentDeals(30),
        activityService.getRecentActivities(8),
        dealService.getTopContactsByValue(5),
        dealService.getTopCompaniesByOpportunities(5)
      ])

      // Filter deals by date range
      const filteredDeals = deals.filter(deal => {
        const dealDate = new Date(deal.createdAt || deal.stageUpdatedAt)
        const start = new Date(dateRange.startDate)
        const end = new Date(dateRange.endDate)
        return dealDate >= start && dealDate <= end
      })

      // Calculate current month sales from filtered deals
      const currentMonthSales = filteredDeals
        .filter(deal => deal.stage === 'closed')
        .reduce((sum, deal) => sum + deal.value, 0)

      setMetrics({
        totalContacts,
        activeDeals: filteredDeals.filter(deal => deal.stage !== 'closed').length,
        monthlySalesTarget: 50000,
currentMonthSales,
        winRate,
        pipelineData,
        recentActivities,
        topPerformers: {
          contacts: topContactsByValue,
          companies: topCompaniesByOpportunities
        }
      })

    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data')
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleQuickDateRange = (days) => {
    const endDate = new Date()
    const startDate = subDays(endDate, days)
    setDateRange({
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    })
  }

  const handleMetricClick = (type) => {
    switch (type) {
      case 'contacts':
        navigate('/contacts')
        break
      case 'deals':
        navigate('/deals')
        break
      case 'target':
        navigate('/deals?filter=closed')
        break
      case 'winrate':
        navigate('/deals?filter=closed')
        break
      default:
        break
    }
  }

  const handlePipelineClick = (event, chartContext, config) => {
    if (config.dataPointIndex >= 0) {
      const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed']
      const selectedStage = stages[config.dataPointIndex]
      navigate(`/deals?stage=${selectedStage}`)
      toast.info(`Navigating to ${selectedStage} deals`)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getProgressPercentage = () => {
    return Math.min((metrics.currentMonthSales / metrics.monthlySalesTarget) * 100, 100)
  }

  // Chart configuration
  const chartOptions = {
    chart: {
      type: 'donut',
      events: {
        dataPointSelection: handlePipelineClick
      }
    },
    labels: ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed'],
    colors: ['#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981'],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Deals',
              formatter: () => metrics.pipelineData.reduce((sum, val) => sum + val, 0)
            }
          }
        }
      }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center'
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} deals`
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 280
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Loading your CRM metrics...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <Card key={i} className="h-32 bg-gray-200 rounded-lg"></Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
        <Card className="p-6">
          <div className="text-center">
            <ApperIcon name="AlertCircle" className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <Button onClick={loadDashboardData} className="mt-4">
              Retry Loading Dashboard
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Overview of your CRM metrics and performance
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateRange(7)}
              className="text-sm"
            >
              7 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateRange(30)}
              className="text-sm"
            >
              30 Days
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="text-sm"
            />
            <Input
              type="date"  
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="text-sm"
            />
          </div>
        </div>
      </div>

{/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 lg:gap-6">
        {/* Total Contacts */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => handleMetricClick('contacts')}
        >
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 truncate">{metrics.totalContacts}</p>
              </div>
              <div className="h-10 w-10 lg:h-12 lg:w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                <ApperIcon name="Users" className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <ApperIcon name="MousePointer2" className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">Click to view all contacts</span>
            </p>
          </CardContent>
        </Card>

        {/* Active Deals */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => handleMetricClick('deals')}
        >
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Active Deals</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 truncate">{metrics.activeDeals}</p>
              </div>
              <div className="h-10 w-10 lg:h-12 lg:w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                <ApperIcon name="TrendingUp" className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <ApperIcon name="MousePointer2" className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">Click to view all deals</span>
            </p>
          </CardContent>
        </Card>

        {/* Monthly Sales Target Progress */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => handleMetricClick('target')}
        >
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Monthly Target</p>
                <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 truncate">
                  {formatCurrency(metrics.currentMonthSales)}
                </p>
                <p className="text-xs lg:text-sm text-gray-500 truncate">
                  of {formatCurrency(metrics.monthlySalesTarget)}
                </p>
              </div>
              <div className="h-10 w-10 lg:h-12 lg:w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                <ApperIcon name="Target" className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <ApperIcon name="MousePointer2" className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{getProgressPercentage().toFixed(1)}% complete</span>
            </p>
          </CardContent>
        </Card>

        {/* Win Rate Percentage */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => handleMetricClick('winrate')}
        >
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Win Rate</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 truncate">{metrics.winRate}%</p>
              </div>
              <div className="h-10 w-10 lg:h-12 lg:w-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                <ApperIcon name="Award" className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <ApperIcon name="MousePointer2" className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">Click to view closed deals</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Grid for Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mt-6">
        {/* Sales Pipeline Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <ApperIcon name="PieChart" className="h-4 w-4 lg:h-5 lg:w-5" />
              Sales Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 lg:h-80 flex items-center justify-center">
              {metrics.pipelineData.length > 0 ? (
                <Chart
                  options={chartOptions}
                  series={metrics.pipelineData}
                  type="donut"
                  height="100%"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <ApperIcon name="PieChart" className="h-8 w-8 lg:h-12 lg:w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pipeline data available</p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 text-center mt-2 flex items-center justify-center">
              <ApperIcon name="MousePointer2" className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">Click segments to filter deals by stage</span>
            </p>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base lg:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ApperIcon name="Activity" className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 lg:space-y-4 max-h-80 lg:max-h-96 overflow-y-auto">
              {metrics.recentActivities.length > 0 ? (
                metrics.recentActivities.map((activity) => {
                  const getActivityIcon = (type) => {
                    const icons = {
                      call: "Phone",
                      email: "Mail", 
                      meeting: "Calendar",
                      note: "FileText",
                      task: "CheckSquare"
                    }
                    return icons[type] || "Activity"
                  }

                  const getActivityColor = (type) => {
                    const colors = {
                      call: "bg-blue-100 text-blue-600",
                      email: "bg-purple-100 text-purple-600",
                      meeting: "bg-orange-100 text-orange-600", 
                      note: "bg-gray-100 text-gray-600",
                      task: "bg-indigo-100 text-indigo-600"
                    }
                    return colors[type] || "bg-gray-100 text-gray-600"
                  }

                  const formatRelativeTime = (date) => {
                    const now = new Date()
                    const activityDate = new Date(date)
                    const diffInHours = Math.floor((now - activityDate) / (1000 * 60 * 60))
                    
                    if (diffInHours < 1) return "Just now"
                    if (diffInHours < 24) return `${diffInHours}h ago`
                    const diffInDays = Math.floor(diffInHours / 24)
                    if (diffInDays < 7) return `${diffInDays}d ago`
                    return format(activityDate, 'MMM d')
                  }

                  return (
                    <div 
                      key={activity.Id}
                      className="flex items-start gap-2 lg:gap-3 p-2 lg:p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        if (activity.entityType === 'contact') {
                          navigate('/contacts')
                        } else if (activity.entityType === 'deal') {
                          navigate('/deals')
                        }
                      }}
                    >
                      <div className={`p-1.5 lg:p-2 rounded-full ${getActivityColor(activity.type)} flex-shrink-0`}>
                        <ApperIcon name={getActivityIcon(activity.type)} className="h-3 w-3 lg:h-4 lg:w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs lg:text-sm font-medium text-gray-900 truncate">
                            {activity.title}
                          </h4>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatRelativeTime(activity.date)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                            <ApperIcon 
                              name={activity.entityType === 'contact' ? 'User' : activity.entityType === 'deal' ? 'TrendingUp' : 'Building2'} 
                              className="h-3 w-3 mr-1" 
                            />
                            <span className="truncate">{activity.entityType}</span>
                          </span>
                          {activity.outcome && (
                            <span className="text-xs text-gray-500 truncate">
                              • {activity.outcome}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-6 lg:py-8">
                  <ApperIcon name="Activity" className="h-8 w-8 lg:h-12 lg:w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-xs lg:text-sm text-gray-500">No recent activities</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers Section */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <ApperIcon name="Award" className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              {/* Top Contacts by Deal Value */}
              <div>
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ApperIcon name="User" className="h-4 w-4 text-primary" />
                  Top Contacts by Deal Value
                </h3>
                <div className="space-y-3">
                  {metrics.topPerformers.contacts.length > 0 ? (
                    metrics.topPerformers.contacts.map((contact, index) => (
                      <div key={contact.name} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-primary/5 hover:to-secondary/5 transition-all duration-200">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs lg:text-sm font-semibold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 text-sm lg:text-base truncate">{contact.name}</div>
                            <div className="text-xs lg:text-sm text-gray-600 truncate">{contact.company || 'No company'}</div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <div className="font-semibold text-primary text-sm lg:text-base">{formatCurrency(contact.totalValue)}</div>
                          <div className="text-xs text-gray-500">{contact.dealCount} deal{contact.dealCount !== 1 ? 's' : ''}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 lg:py-8">
                      <ApperIcon name="User" className="h-8 w-8 lg:h-12 lg:w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-xs lg:text-sm text-gray-500">No contact performance data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Companies by Opportunities */}
              <div>
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ApperIcon name="Building2" className="h-4 w-4 text-primary" />
                  Top Companies by Opportunities
                </h3>
                <div className="space-y-3">
                  {metrics.topPerformers.companies.length > 0 ? (
                    metrics.topPerformers.companies.map((company, index) => (
                      <div key={company.company} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-primary/5 hover:to-secondary/5 transition-all duration-200">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-r from-secondary to-accent text-white text-xs lg:text-sm font-semibold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 text-sm lg:text-base truncate">{company.company}</div>
                            <div className="text-xs lg:text-sm text-gray-600 truncate">Total value: {formatCurrency(company.totalValue)}</div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <div className="font-semibold text-secondary text-sm lg:text-base">{company.opportunityCount}</div>
                          <div className="text-xs text-gray-500">opportunities</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 lg:py-8">
                      <ApperIcon name="Building2" className="h-8 w-8 lg:h-12 lg:w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-xs lg:text-sm text-gray-500">No company performance data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage