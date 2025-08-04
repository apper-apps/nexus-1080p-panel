import contactsData from "@/services/mockData/contacts.json"
import { activityService } from "@/services/api/activityService"

let contacts = [...contactsData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const contactService = {
  async getAll() {
    await delay(300)
    return [...contacts]
  },

  async getById(id) {
    await delay(200)
    const contact = contacts.find(c => c.Id === parseInt(id))
    if (!contact) {
      throw new Error("Contact not found")
    }
    return { ...contact }
  },

  async create(contactData) {
    await delay(400)
    const newContact = {
      Id: Math.max(...contacts.map(c => c.Id)) + 1,
      ...contactData,
      // Ensure backward compatibility - if only company name provided, use it
      company: contactData.companyName || contactData.company || "",
      createdAt: new Date().toISOString().split("T")[0],
      lastContactDate: new Date().toISOString().split("T")[0]
    }
    contacts.push(newContact)

    // Log contact creation activity
    try {
      await activityService.create({
        type: 'note',
        title: 'Contact Added to CRM',
        description: `${newContact.name} from ${newContact.company || 'Unknown Company'} was added to the CRM system.`,
        outcome: 'Contact created successfully',
        date: new Date().toISOString(),
        entityType: 'contact',
        entityId: newContact.Id
      })
    } catch (error) {
      console.warn('Failed to log contact creation activity:', error)
    }

    return { ...newContact }
  },

  async update(id, contactData) {
    await delay(350)
    const index = contacts.findIndex(c => c.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Contact not found")
    }
    
    const oldContact = { ...contacts[index] }
    
    // Update contact with new data, ensure company field is set for backward compatibility
    const updatedData = {
      ...contactData,
      company: contactData.companyName || contactData.company || contacts[index].company
    }
    contacts[index] = { ...contacts[index], ...updatedData }

    // Log contact update activity
    try {
      const changes = []
      if (oldContact.name !== contacts[index].name) changes.push(`name changed from "${oldContact.name}" to "${contacts[index].name}"`)
      if (oldContact.email !== contacts[index].email) changes.push(`email updated`)
      if (oldContact.phone !== contacts[index].phone) changes.push(`phone updated`)
      if (oldContact.company !== contacts[index].company) changes.push(`company changed`)

      if (changes.length > 0) {
        await activityService.create({
          type: 'note',
          title: 'Contact Information Updated',
          description: `Contact details modified: ${changes.join(', ')}.`,
          outcome: 'Contact updated successfully',
          date: new Date().toISOString(),
          entityType: 'contact',
          entityId: parseInt(id)
        })
      }
    } catch (error) {
      console.warn('Failed to log contact update activity:', error)
    }

    return { ...contacts[index] }
  },

  async delete(id) {
    await delay(250)
    const index = contacts.findIndex(c => c.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Contact not found")
    }
    const deletedContact = contacts[index]
    contacts.splice(index, 1)
    return { ...deletedContact }
  },

  async search(query) {
    await delay(200)
    if (!query || query.trim() === "") {
      return [...contacts]
    }
    
    const searchTerm = query.toLowerCase().trim()
    const filtered = contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchTerm) ||
      contact.email.toLowerCase().includes(searchTerm) ||
      (contact.company && contact.company.toLowerCase().includes(searchTerm)) ||
      (contact.companyName && contact.companyName.toLowerCase().includes(searchTerm)) ||
      contact.phone.includes(searchTerm)
    )
    
    return [...filtered]
  },

  async getActivities(contactId) {
    try {
      return await activityService.getByEntity('contact', contactId)
    } catch (error) {
      console.error('Error fetching contact activities:', error)
      return []
}
  },

  async getTotalCount() {
    await delay(200)
    return contacts.length
  }
}