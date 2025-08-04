import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import AdvancedSearchPanel from "@/components/molecules/AdvancedSearchPanel";
import { contactService } from "@/services/api/contactService";
import { companyService } from "@/services/api/companyService";
import ApperIcon from "@/components/ApperIcon";
import AddContactModal from "@/components/organisms/AddContactModal";
import ContactsTable from "@/components/organisms/ContactsTable";
import AddActivityModal from "@/components/organisms/AddActivityModal";
import ContactDetailPanel from "@/components/organisms/ContactDetailPanel";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
const ContactsPage = () => {
const [contacts, setContacts] = useState([])
  const [companies, setCompanies] = useState([])
  const [filteredContacts, setFilteredContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [activityEntity, setActivityEntity] = useState(null)
  const [activityPreData, setActivityPreData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    company: '',
    jobTitle: '',
    startDate: '',
    endDate: '',
    activityType: ''
  })
const loadContacts = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await contactService.getAll()
      setContacts(data)
      setFilteredContacts(data)
    } catch (err) {
      setError("Failed to load contacts. Please try again.")
      console.error("Error loading contacts:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadCompanies = async () => {
    try {
      const data = await companyService.getAll()
      setCompanies(data)
    } catch (err) {
      console.error("Error loading companies:", err)
    }
  }

const handleSearch = useCallback(async (query) => {
    setSearchQuery(query)
    filterContacts(query, filters)
  }, [filters])

  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    filterContacts(searchQuery, newFilters)
  }, [searchQuery, filters])

  const filterContacts = useCallback(async (query, currentFilters) => {
    try {
      let results = [...contacts]
      
      // Apply search query
      if (query && query.trim()) {
        const searchTerm = query.toLowerCase().trim()
        results = results.filter(contact => 
          contact.name.toLowerCase().includes(searchTerm) ||
          contact.email.toLowerCase().includes(searchTerm) ||
          (contact.company && contact.company.toLowerCase().includes(searchTerm)) ||
          contact.phone.includes(searchTerm)
        )
      }
      
      // Apply company filter
      if (currentFilters.company) {
        results = results.filter(contact =>
          contact.company && contact.company.toLowerCase().includes(currentFilters.company.toLowerCase())
        )
      }
      
      // Apply job title filter (using notes field as proxy)
      if (currentFilters.jobTitle) {
        results = results.filter(contact =>
          contact.notes && contact.notes.toLowerCase().includes(currentFilters.jobTitle.toLowerCase())
        )
      }
      
      // Apply date range filters
      if (currentFilters.startDate) {
        results = results.filter(contact =>
          contact.lastContactDate && new Date(contact.lastContactDate) >= new Date(currentFilters.startDate)
        )
      }
      if (currentFilters.endDate) {
        results = results.filter(contact =>
          contact.lastContactDate && new Date(contact.lastContactDate) <= new Date(currentFilters.endDate)
        )
      }
      
      setFilteredContacts(results)
    } catch (err) {
      console.error("Error filtering contacts:", err)
      toast.error("Filter failed. Please try again.")
    }
  }, [contacts])

const handleContactSelect = (contact) => {
    setSelectedContact(contact)
  }

  const handleCompanySelect = async (companyIdOrName) => {
    try {
      let company
      if (typeof companyIdOrName === 'number') {
        // Company ID provided
        company = await companyService.getById(companyIdOrName)
      } else {
        // Company name provided (backward compatibility)
        const allCompanies = await companyService.getAll()
        company = allCompanies.find(c => c.name === companyIdOrName)
      }
      
      if (company) {
        // Find contacts for this company
        const companyContacts = contacts.filter(contact => 
          contact.companyId === company.Id || 
          contact.company === company.name ||
          contact.companyName === company.name
        )
        
        // You can extend this to show company detail panel or navigate
        // For now, we'll show a toast with company info
        toast.info(`Viewing ${company.name} (${companyContacts.length} contacts)`)
        
        // If you have a company detail panel, you could set it here:
        // setSelectedCompany(company)
      }
    } catch (err) {
      console.error("Error loading company:", err)
      toast.error("Failed to load company details")
    }
  }

  const handleCloseDetailPanel = () => {
    setSelectedContact(null)
  }

  const handleAddContact = async (contactData) => {
    try {
      const newContact = await contactService.create(contactData)
      setContacts(prev => [newContact, ...prev])
      
      // Update filtered contacts if no search query
      if (!searchQuery) {
        setFilteredContacts(prev => [newContact, ...prev])
      }
      
      toast.success("Contact added successfully!")
    } catch (err) {
      console.error("Error adding contact:", err)
      toast.error("Failed to add contact. Please try again.")
      throw err
    }
  }

const handleEditContact = (contact) => {
    setEditingContact(contact)
    setIsEditModalOpen(true)
  }

  const handleUpdateContact = async (contactData) => {
    try {
      const updatedContact = await contactService.update(editingContact.Id, contactData)
      setContacts(prev => prev.map(c => c.Id === editingContact.Id ? updatedContact : c))
      setFilteredContacts(prev => prev.map(c => c.Id === editingContact.Id ? updatedContact : c))
      
      // Update selected contact if it's the one being edited
      if (selectedContact?.Id === editingContact.Id) {
        setSelectedContact(updatedContact)
      }
      
      toast.success("Contact updated successfully!")
    } catch (err) {
      console.error("Error updating contact:", err)
      toast.error("Failed to update contact. Please try again.")
      throw err
    }
  }

  const handleDeleteContact = async (contact) => {
    if (window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
      try {
        await contactService.delete(contact.Id)
        setContacts(prev => prev.filter(c => c.Id !== contact.Id))
        setFilteredContacts(prev => prev.filter(c => c.Id !== contact.Id))
        setSelectedContact(null)
        toast.success("Contact deleted successfully!")
      } catch (err) {
        console.error("Error deleting contact:", err)
        toast.error("Failed to delete contact. Please try again.")
      }
    }
  }

const handleQuickAction = (contact, actionType) => {
    let preData = {}
    
    if (actionType === 'call') {
      preData = {
        type: 'call',
        title: `Call with ${contact.name}`,
        description: `Phone call with ${contact.name}`,
        outcome: '',
        date: new Date().toISOString().slice(0, 16)
      }
    } else if (actionType === 'follow-up') {
      const followUpDate = new Date()
      followUpDate.setDate(followUpDate.getDate() + 1) // Default to tomorrow
      
      preData = {
        type: 'task',
        title: `Follow up with ${contact.name}`,
        description: `Schedule follow-up with ${contact.name}`,
        outcome: '',
        date: new Date().toISOString().slice(0, 16),
        dueDate: followUpDate.toISOString().slice(0, 16),
        completed: false
      }
    }
    
    setActivityEntity({ type: 'contact', id: contact.Id })
    setActivityPreData(preData)
    setIsActivityModalOpen(true)
  }

  const handleActivityAdded = (newActivity) => {
    toast.success('Activity logged successfully')
    // Optionally refresh data or update UI
  }

  useEffect(() => {
    loadContacts()
    loadCompanies()
  }, [])

  if (loading) {
    return <Loading />
  }

  if (error) {
    return <Error message={error} onRetry={loadContacts} />
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Contacts
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your customer relationships and contacts
            </p>
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
            className="sm:w-auto"
          >
<ApperIcon name="UserPlus" className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Advanced Search Panel */}
      <AdvancedSearchPanel
        type="contacts"
        onSearch={handleSearch}
        onFilter={handleFilterChange}
        filters={filters}
        placeholder="Search contacts by name, email, company, phone..."
        className="max-w-full"
      />

      {/* Contacts Table */}
      {filteredContacts.length === 0 ? (
        <Empty
          title={searchQuery || Object.values(filters).some(f => f) ? "No contacts found" : "No contacts yet"}
            description={
              searchQuery 
                ? `No contacts match "${searchQuery}". Try adjusting your search terms.`
                : "Get started by adding your first contact to begin building your customer relationships."
            }
            actionLabel="Add First Contact"
            onAction={() => setIsAddModalOpen(true)}
            icon="Users"
          />
        ) : (
<ContactsTable
            contacts={filteredContacts}
            onContactSelect={handleContactSelect}
            selectedContact={selectedContact}
            onEditContact={handleEditContact}
            onDeleteContact={handleDeleteContact}
            onCompanySelect={handleCompanySelect}
            onQuickAction={handleQuickAction}
          />
        )}

        {/* Contact Stats */}
        {contacts.length > 0 && (
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {contacts.length}
                </div>
                <div className="text-sm text-gray-600">Total Contacts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {new Set(contacts.map(c => c.company)).size}
                </div>
                <div className="text-sm text-gray-600">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {searchQuery ? filteredContacts.length : contacts.length}
                </div>
                <div className="text-sm text-gray-600">
                  {searchQuery ? "Search Results" : "Active Contacts"}
                </div>
              </div>
</div>
          </div>
        )}
      </div>
      </>

      {/* Contact Detail Panel */}
      <AnimatePresence>
        {selectedContact && (
          <ContactDetailPanel
            contact={selectedContact}
            onClose={handleCloseDetailPanel}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
          />
        )}
      </AnimatePresence>

      {/* Add Contact Modal */}
<AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddContact}
        companies={companies}
      />

<AddContactModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingContact(null)
        }}
        onSubmit={handleUpdateContact}
        editingContact={editingContact}
        isEditMode={true}
        companies={companies}
      />
{/* Activity Modal */}
      <AddActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false)
          setActivityEntity(null)
          setActivityPreData(null)
        }}
        entityType={activityEntity?.type}
        entityId={activityEntity?.id}
        onActivityAdded={handleActivityAdded}
        prePopulatedData={activityPreData}
      />
    </>
  )
}

export default ContactsPage