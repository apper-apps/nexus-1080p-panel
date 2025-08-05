import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { quoteService } from '@/services/api/quoteService'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import AddQuoteModal from '@/components/organisms/AddQuoteModal'
import ConfirmationDialog from '@/components/organisms/ConfirmationDialog'
import SearchBar from '@/components/molecules/SearchBar'

const QuotesPage = () => {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingQuote, setEditingQuote] = useState(null)
  const [deleteQuote, setDeleteQuote] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Load quotes
  const loadQuotes = async (search = '', status = '') => {
    try {
      setLoading(true)
      setError(null)
      
      const filters = {}
      if (search) {
        filters.search = search
      }
      
      if (status) {
        filters.where = [{
          FieldName: "status",
          Operator: "EqualTo",
          Values: [status]
        }]
      }

      const result = await quoteService.getAll(filters)
      setQuotes(result.data || [])
    } catch (err) {
      setError(err.message)
      setQuotes([])
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadQuotes(searchTerm, statusFilter)
  }, [searchTerm, statusFilter])

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  // Handle status filter
  const handleStatusFilter = (status) => {
    setStatusFilter(status)
  }

  // Handle add quote
  const handleAddQuote = async (quoteData) => {
    try {
      await quoteService.create(quoteData)
      toast.success('Quote created successfully!')
      setIsAddModalOpen(false)
      loadQuotes(searchTerm, statusFilter)
    } catch (error) {
      toast.error(error.message || 'Failed to create quote')
      throw error
    }
  }

  // Handle edit quote
  const handleEditQuote = async (quoteData) => {
    try {
      await quoteService.update(editingQuote.Id, quoteData)
      toast.success('Quote updated successfully!')
      setEditingQuote(null)
      loadQuotes(searchTerm, statusFilter)
    } catch (error) {
      toast.error(error.message || 'Failed to update quote')
      throw error
    }
  }

  // Handle delete quote
  const handleDeleteQuote = async () => {
    try {
      setDeleting(true)
      await quoteService.delete(deleteQuote.Id)
      toast.success('Quote deleted successfully!')
      setDeleteQuote(null)
      loadQuotes(searchTerm, statusFilter)
    } catch (error) {
      toast.error(error.message || 'Failed to delete quote')
    } finally {
      setDeleting(false)
    }
  }

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusColors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Sent': 'bg-blue-100 text-blue-800',
      'Accepted': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Expired': 'bg-orange-100 text-orange-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={() => loadQuotes(searchTerm, statusFilter)} />

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-600">Manage your sales quotes and proposals</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
          <ApperIcon name="Plus" size={16} />
          Add Quote
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Search quotes..."
                onSearch={handleSearch}
                className="w-full"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes List */}
      {quotes.length === 0 ? (
        <Empty
          title="No quotes found"
          description="Get started by creating your first quote"
          actionLabel="Add Quote"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid gap-4">
          {quotes.map((quote) => (
            <motion.div
              key={quote.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {quote.Name || `Quote #${quote.Id}`}
                      </h3>
                      <StatusBadge status={quote.status} />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Company:</span>
                        <p className="mt-1">{quote.companyId?.Name || '-'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Contact:</span>
                        <p className="mt-1">{quote.contactId?.Name || '-'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Quote Date:</span>
                        <p className="mt-1">{formatDate(quote.quoteDate)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Deal:</span>
                        <p className="mt-1">{quote.dealId?.Name || '-'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Delivery Method:</span>
                        <p className="mt-1">{quote.deliveryMethod || '-'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Expires On:</span>
                        <p className="mt-1">{formatDate(quote.expiresOn)}</p>
                      </div>
                    </div>

                    {(quote.billingBillToName || quote.shippingShipToName) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                        {quote.billingBillToName && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">Billing Address:</span>
                            <p className="mt-1 text-gray-600">
                              {quote.billingBillToName}<br />
                              {quote.billingStreet && `${quote.billingStreet}`}
                              {quote.billingCity && (quote.billingStreet ? `, ${quote.billingCity}` : quote.billingCity)}
                              {quote.billingState && `, ${quote.billingState}`}
                              {quote.billingCountry && `, ${quote.billingCountry}`}
                              {quote.billingPincode && ` ${quote.billingPincode}`}
                            </p>
                          </div>
                        )}
                        {quote.shippingShipToName && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">Shipping Address:</span>
                            <p className="mt-1 text-gray-600">
                              {quote.shippingShipToName}<br />
                              {quote.shippingStreet && `${quote.shippingStreet}`}
                              {quote.shippingCity && (quote.shippingStreet ? `, ${quote.shippingCity}` : quote.shippingCity)}
                              {quote.shippingState && `, ${quote.shippingState}`}
                              {quote.shippingCountry && `, ${quote.shippingCountry}`}
                              {quote.shippingPincode && ` ${quote.shippingPincode}`}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingQuote(quote)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <ApperIcon name="Edit" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteQuote(quote)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Quote Modal */}
      <AddQuoteModal
        isOpen={isAddModalOpen || !!editingQuote}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingQuote(null)
        }}
        onSubmit={editingQuote ? handleEditQuote : handleAddQuote}
        initialData={editingQuote}
        mode={editingQuote ? 'edit' : 'add'}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteQuote}
        onClose={() => setDeleteQuote(null)}
        onConfirm={handleDeleteQuote}
        title="Delete Quote"
        message={`Are you sure you want to delete "${deleteQuote?.Name || `Quote #${deleteQuote?.Id}`}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleting}
        variant="danger"
      />
    </div>
  )
}

export default QuotesPage