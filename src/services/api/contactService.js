import contactsData from "@/services/mockData/contacts.json"

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
    return { ...newContact }
  },

  async update(id, contactData) {
await delay(350)
    const index = contacts.findIndex(c => c.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Contact not found")
    }
    // Update contact with new data, ensure company field is set for backward compatibility
    const updatedData = {
      ...contactData,
      company: contactData.companyName || contactData.company || contacts[index].company
    }
    contacts[index] = { ...contacts[index], ...updatedData }
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
  }
}