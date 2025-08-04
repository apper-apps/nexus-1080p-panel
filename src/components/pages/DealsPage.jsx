import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { toast } from "react-toastify";
import AddDealModal from "@/components/organisms/AddDealModal";
import DealCard from "@/components/organisms/DealCard";
import { dealService } from "@/services/api/dealService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
const PIPELINE_STAGES = [
  { id: 'lead', name: 'Lead', color: 'bg-blue-500', count: 0 },
  { id: 'qualified', name: 'Qualified', color: 'bg-yellow-500', count: 0 },
  { id: 'proposal', name: 'Proposal', color: 'bg-orange-500', count: 0 },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-purple-500', count: 0 },
  { id: 'closed', name: 'Closed Won/Lost', color: 'bg-green-500', count: 0 }
]

const DealsPage = () => {
  const [deals, setDeals] = useState([])
  const [filteredDeals, setFilteredDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    loadDeals()
  }, [])

  useEffect(() => {
    filterDeals()
  }, [deals, searchTerm])

  const loadDeals = async () => {
    try {
      setLoading(true)
      setError(null)
      const dealsData = await dealService.getAll()
      setDeals(dealsData)
    } catch (err) {
      setError('Failed to load deals')
      toast.error('Failed to load deals')
    } finally {
      setLoading(false)
    }
  }

  const filterDeals = () => {
    if (!searchTerm.trim()) {
      setFilteredDeals(deals)
      return
    }

    const filtered = deals.filter(deal =>
      deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.contact.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredDeals(filtered)
  }

  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result
    
    if (source.droppableId === destination.droppableId) return

    try {
      const dealId = parseInt(draggableId)
      const newStage = destination.droppableId
      
      await dealService.updateStage(dealId, newStage)
      
      // Update local state
      setDeals(prevDeals =>
        prevDeals.map(deal =>
          deal.Id === dealId
            ? { ...deal, stage: newStage, stageUpdatedAt: new Date().toISOString() }
            : deal
        )
      )

      toast.success('Deal stage updated successfully')
    } catch (err) {
      toast.error('Failed to update deal stage')
    }
  }

  const handleAddDeal = async (newDeal) => {
    try {
      const createdDeal = await dealService.create(newDeal)
      setDeals(prev => [...prev, createdDeal])
      setIsAddModalOpen(false)
      toast.success('Deal added successfully')
    } catch (err) {
      toast.error('Failed to add deal')
    }
  }

  const getDealsByStage = (stage) => {
    return filteredDeals.filter(deal => deal.stage === stage)
  }

  const getTotalValue = (stage) => {
    return getDealsByStage(stage).reduce((sum, deal) => sum + deal.value, 0)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Sales Pipeline
          </h1>
          <p className="text-gray-600 mt-1">
            Track your sales opportunities and pipeline
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Input
            placeholder="Search deals or contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
            icon={<ApperIcon name="Search" size={16} />}
          />
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="whitespace-nowrap"
          >
            <ApperIcon name="Plus" size={16} />
            Add Deal
          </Button>
        </div>
      </div>

      {filteredDeals.length === 0 ? (
        <Empty 
          title="No deals found"
          description={searchTerm ? "Try adjusting your search criteria" : "Create your first deal to get started"}
          action={!searchTerm && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <ApperIcon name="Plus" size={16} />
              Add Deal
            </Button>
          )}
        />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[600px]">
            {PIPELINE_STAGES.map((stage) => {
              const stageDeals = getDealsByStage(stage.id)
              const stageValue = getTotalValue(stage.id)
              
              return (
                <div key={stage.id} className="flex flex-col">
                  <Card className="mb-4">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                        <CardTitle className="text-sm font-medium">
                          {stage.name}
                        </CardTitle>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{stageDeals.length} deals</span>
                        <span>{formatCurrency(stageValue)}</span>
                      </div>
                    </CardHeader>
                  </Card>

                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 space-y-3 p-2 rounded-lg transition-colors ${
                          snapshot.isDraggingOver 
                            ? 'bg-blue-50 border-2 border-blue-200 border-dashed' 
                            : 'bg-gray-50'
                        }`}
                        style={{ minHeight: '400px' }}
                      >
                        {stageDeals.map((deal, index) => (
                          <Draggable
                            key={deal.Id}
                            draggableId={deal.Id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`transition-transform ${
                                  snapshot.isDragging ? 'rotate-2 scale-105' : ''
                                }`}
                              >
                                <DealCard deal={deal} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      )}

      <AddDealModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddDeal}
      />
    </div>
  )
}

export default DealsPage