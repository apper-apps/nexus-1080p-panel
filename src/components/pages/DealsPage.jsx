import React, { memo, useCallback, useEffect, useState } from 'react'
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { toast } from 'react-toastify'
import { dealService } from '@/services/api/dealService'
import ApperIcon from '@/components/ApperIcon'
import DealCard from '@/components/organisms/DealCard'
import DealDetailPanel from '@/components/organisms/DealDetailPanel'
import AddDealModal from '@/components/organisms/AddDealModal'
import AdvancedSearchPanel from '@/components/molecules/AdvancedSearchPanel'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import Button from '@/components/atoms/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card'
// Suppress react-beautiful-dnd defaultProps warning for React 18.3+ compatibility
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('defaultProps will be removed from memo components')) {
    return;
  }
  originalWarn(...args);
};

// Modern error boundary component
function ErrorBoundary({ children, fallback }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (event) => {
      if (event.error?.message?.includes('drag') || event.error?.message?.includes('drop')) {
        console.error('Drag and Drop Error:', event.error);
        setHasError(true);
        setError(event.error);
        event.preventDefault();
      }
    };

    const handlePromiseRejection = (event) => {
      if (event.reason?.message?.includes('drag') || event.reason?.message?.includes('drop')) {
        console.error('Drag and Drop Promise Rejection:', event.reason);
        setHasError(true);
        setError(event.reason);
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, []);

  const retry = useCallback(() => {
    setHasError(false);
    setError(null);
  }, []);

  if (hasError) {
    return fallback || (
      <div className="flex-1 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">Drag and drop temporarily unavailable</p>
        <p className="text-gray-500 text-xs mt-1">{error?.message}</p>
        <button 
          onClick={retry}
          className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return children;
}

// Memoized DealCard to prevent unnecessary re-renders
const MemoizedDealCard = memo(DealCard, (prevProps, nextProps) => {
  return prevProps.deal?.Id === nextProps.deal?.Id && 
         prevProps.deal?.Name === nextProps.deal?.Name &&
         prevProps.deal?.Amount === nextProps.deal?.Amount &&
         prevProps.deal?.Stage === nextProps.deal?.Stage;
});

const PIPELINE_STAGES = [
  { id: 'lead', name: 'Lead', color: 'bg-blue-500', count: 0 },
  { id: 'qualified', name: 'Qualified', color: 'bg-yellow-500', count: 0 },
  { id: 'proposal', name: 'Proposal', color: 'bg-orange-500', count: 0 },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-purple-500', count: 0 },
  { id: 'closed', name: 'Closed Won/Lost', color: 'bg-green-500', count: 0 }
];

const DealsPage = () => {
const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [filters, setFilters] = useState({
    stage: '',
    minValue: '',
    maxValue: '',
    startDate: '',
    endDate: '',
    contact: ''
  });

  useEffect(() => {
    loadDeals();
  }, []);

  useEffect(() => {
    filterDeals();
  }, [deals, searchTerm, filters]);

  const loadDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const dealsData = await dealService.getAll();
      setDeals(dealsData);
    } catch (err) {
      setError('Failed to load deals');
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

const filterDeals = useCallback((query, currentFilters) => {
    let filtered = [...deals];

    // Search filter
    if (query && query.trim()) {
      filtered = filtered.filter(deal =>
        deal?.name?.toLowerCase().includes(query.toLowerCase()) ||
        deal?.contact?.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Stage filter
    if (currentFilters.stage) {
      filtered = filtered.filter(deal => deal?.stage === currentFilters.stage);
    }

    // Value range filter
    if (currentFilters.minValue) {
      filtered = filtered.filter(deal => deal?.value >= parseInt(currentFilters.minValue));
    }
    if (currentFilters.maxValue) {
      filtered = filtered.filter(deal => deal?.value <= parseInt(currentFilters.maxValue));
    }

    // Date range filter (using stageUpdatedAt as close date proxy)
    if (currentFilters.startDate) {
      filtered = filtered.filter(deal => 
        deal?.stageUpdatedAt && new Date(deal.stageUpdatedAt) >= new Date(currentFilters.startDate)
      );
    }
    if (currentFilters.endDate) {
      filtered = filtered.filter(deal => 
        deal?.stageUpdatedAt && new Date(deal.stageUpdatedAt) <= new Date(currentFilters.endDate)
      );
    }

    // Contact filter
    if (currentFilters.contact) {
      filtered = filtered.filter(deal =>
        deal?.contact?.toLowerCase().includes(currentFilters.contact.toLowerCase())
      );
    }

    setFilteredDeals(filtered);
  }, [deals]);

const handleSearch = useCallback((query) => {
    setSearchTerm(query);
    filterDeals(query, filters);
  }, [filterDeals, filters]);

  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    filterDeals(searchTerm, newFilters);
  }, [filterDeals, searchTerm, filters]);

  useEffect(() => {
    filterDeals(searchTerm, filters);
  }, [deals, filterDeals, searchTerm, filters]);

  // Handle drag end with error handling
  const handleDragEnd = useCallback(async (result) => {
    if (!result?.destination) return;

    const dealId = parseInt(result.draggableId);
    const newStage = result.destination.droppableId;

    // Validate the drag operation
    if (!dealId || !newStage) {
      console.error('Invalid drag operation:', { dealId, newStage });
      toast.error('Invalid drag operation');
      return;
    }

    try {
      await dealService.updateStage(dealId, newStage);
      
      // Update local state
      setDeals(prevDeals =>
        prevDeals.map(deal =>
          deal.Id === dealId
            ? { ...deal, stage: newStage, stageUpdatedAt: new Date().toISOString() }
            : deal
        )
      );

      toast.success('Deal moved successfully');
    } catch (error) {
      console.error('Error updating deal stage:', error);
      toast.error('Failed to move deal. Please try again.');
      // Reload deals to ensure UI consistency
      await loadDeals();
    }
  }, []);
const handleDealClick = (deal) => {
    setSelectedDeal(deal);
  };

  const handleAddDeal = async (newDeal) => {
    try {
      const createdDeal = await dealService.create(newDeal);
      setDeals(prev => [...prev, createdDeal]);
      setIsAddModalOpen(false);
      toast.success('Deal added successfully');
    } catch (err) {
      toast.error('Failed to add deal');
    }
  };

const getDealsByStage = (stage) => {
    return filteredDeals.filter(deal => deal?.stage === stage);
  };

  const getTotalValue = (stage) => {
    return getDealsByStage(stage).reduce((sum, deal) => sum + (deal?.value || 0), 0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

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
        
<Button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <ApperIcon name="Plus" size={16} />
          Add Deal
        </Button>
      </div>

      {/* Advanced Search Panel */}
      <AdvancedSearchPanel
        type="deals"
        onSearch={handleSearch}
        onFilter={handleFilterChange}
        filters={filters}
        placeholder="Search deals by name or contact..."
        className="max-w-full"
      />
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
                  
                  <div className="flex-1">
<ErrorBoundary 
                      fallback={
                        <div className="flex-1 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-yellow-600 text-sm">Drag and drop unavailable for {stage?.name || 'this stage'}</p>
                          <div className="mt-2 space-y-2">
                            {stageDeals?.map((deal) => deal?.Id ? (
                              <div key={deal.Id} className="cursor-pointer">
                                <MemoizedDealCard 
                                  deal={deal} 
                                  onClick={() => handleDealClick(deal)}
                                />
                              </div>
                            ) : null)}
                          </div>
                        </div>
                      }
                    >
                      <Droppable droppableId={stage?.id || `stage-${Math.random()}`}>
                        {(provided, snapshot) => {
                          if (!provided || !stage?.id) {
                            return (
                              <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-500 text-sm">Loading stage...</p>
                              </div>
                            );
                          }

                          try {
                            return (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`flex-1 space-y-3 p-2 rounded-lg transition-colors ${
                                  snapshot?.isDraggingOver 
                                    ? 'bg-blue-50 border-2 border-blue-200 border-dashed' 
                                    : 'bg-gray-50'
                                }`}
                                style={{ minHeight: '400px' }}
                              >
                                {Array.isArray(stageDeals) && stageDeals.map((deal, index) => {
                                  if (!deal?.Id) return null;
                                  
                                  return (
                                    <Draggable
                                      key={`deal-${deal.Id}`}
                                      draggableId={String(deal.Id)}
                                      index={index}
                                    >
                                      {(provided, snapshot) => {
                                        if (!provided) {
                                          return (
                                            <div className="p-4 bg-gray-100 rounded-lg">
                                              <MemoizedDealCard 
                                                deal={deal} 
                                                onClick={() => handleDealClick(deal)}
                                              />
                                            </div>
                                          );
                                        }

                                        try {
                                          return (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              className={`transition-transform ${
                                                snapshot?.isDragging ? 'rotate-2 scale-105 z-50' : ''
                                              }`}
                                            >
                                              <MemoizedDealCard 
                                                deal={deal} 
                                                onClick={() => handleDealClick(deal)}
                                              />
                                            </div>
                                          );
                                        } catch (error) {
                                          console.error('Draggable render error:', error);
                                          return (
                                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                              <p className="text-red-600 text-sm">Failed to render deal: {deal?.Name || 'Unknown'}</p>
                                            </div>
                                          );
                                        }
                                      }}
                                    </Draggable>
                                  );
                                })}
                                {provided.placeholder}
                              </div>
                            );
                          } catch (error) {
                            console.error('Droppable render error:', error);
                            return (
                              <div className="flex-1 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">Failed to render drop zone for {stage?.name}</p>
                              </div>
                            );
                          }
                        }}
                      </Droppable>
                    </ErrorBoundary>
                  </div>
                </div>
                );
              })}
          </div>
        </DragDropContext>
      )}

<AddDealModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddDeal}
      />

      {selectedDeal && (
        <DealDetailPanel
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onUpdate={loadDeals}
        />
      )}
    </div>
  )
}

export default DealsPage