import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "react-apexcharts";
import { endOfMonth, format, startOfMonth, subDays } from "date-fns";
import { toast } from "react-toastify";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
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
    pipelineData: []
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
        recentDeals
      ] = await Promise.all([
        contactService.getTotalCount(),
        dealService.getAll(),
        dealService.getPipelineData(),
        dealService.getWinRate(),
        dealService.getRecentDeals(30)
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
        pipelineData
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Contacts */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => handleMetricClick('contacts')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.totalContacts}</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="Users" className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <ApperIcon name="MousePointer2" className="h-3 w-3 mr-1" />
              Click to view all contacts
            </p>
          </CardContent>
        </Card>

        {/* Active Deals */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => handleMetricClick('deals')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Deals</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.activeDeals}</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="TrendingUp" className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <ApperIcon name="MousePointer2" className="h-3 w-3 mr-1" />
              Click to view all deals
            </p>
          </CardContent>
        </Card>

        {/* Monthly Sales Target Progress */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => handleMetricClick('target')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Target</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(metrics.currentMonthSales)}
                </p>
                <p className="text-sm text-gray-500">
                  of {formatCurrency(metrics.monthlySalesTarget)}
                </p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="Target" className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <ApperIcon name="MousePointer2" className="h-3 w-3 mr-1" />
              {getProgressPercentage().toFixed(1)}% complete
            </p>
          </CardContent>
        </Card>

        {/* Win Rate Percentage */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => handleMetricClick('winrate')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Win Rate</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.winRate}%</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="Award" className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <ApperIcon name="MousePointer2" className="h-3 w-3 mr-1" />
              Click to view closed deals
            </p>
          </CardContent>
        </Card>

        {/* Sales Pipeline Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ApperIcon name="PieChart" className="h-5 w-5" />
              Sales Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              {metrics.pipelineData.length > 0 ? (
                <Chart
                  options={chartOptions}
                  series={metrics.pipelineData}
                  type="donut"
                  height={280}
                />
              ) : (
                <div className="text-center text-gray-500">
                  <ApperIcon name="PieChart" className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No pipeline data available</p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 text-center mt-2 flex items-center justify-center">
              <ApperIcon name="MousePointer2" className="h-3 w-3 mr-1" />
              Click segments to filter deals by stage
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
