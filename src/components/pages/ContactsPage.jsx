import { useState, useEffect, useCallback } from "react"
import { AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import SearchBar from "@/components/molecules/SearchBar"
import ContactsTable from "@/components/organisms/ContactsTable"
import ContactDetailPanel from "@/components/organisms/ContactDetailPanel"
import AddContactModal from "@/components/organisms/AddContactModal"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { contactService } from "@/services/api/contactService"

const ContactsPage = () => {
  const [contacts, setContacts] = useState([])
  const [filteredContacts, setFilteredContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

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

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query)
    try {
      const results = await contactService.search(query)
      setFilteredContacts(results)
    } catch (err) {
      console.error("Error searching contacts:", err)
      toast.error("Search failed. Please try again.")
    }
  }, [])

  const handleContactSelect = (contact) => {
    setSelectedContact(contact)
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
    toast.info("Edit functionality coming soon!")
    console.log("Edit contact:", contact)
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

  useEffect(() => {
    loadContacts()
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

        {/* Search Bar */}
        <div className="max-w-md">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search contacts by name, email, company..."
          />
        </div>

        {/* Contacts Table */}
        {filteredContacts.length === 0 ? (
          <Empty
            title={searchQuery ? "No contacts found" : "No contacts yet"}
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
      />
    </>
  )
}

export default ContactsPage