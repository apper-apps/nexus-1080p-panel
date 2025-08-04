import { useState } from "react"
import { format } from "date-fns"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const ContactsTable = ({ contacts, onContactSelect, selectedContact }) => {
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedContacts = [...contacts].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]
    
    if (sortField === "lastContactDate") {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }
    
    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }
    
    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const SortHeader = ({ field, children }) => (
    <th
      onClick={() => handleSort(field)}
      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercasetracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
    >
      <div className="flex items-center gap-2">
        {children}
        <div className="flex flex-col">
          <ApperIcon 
            name="ChevronUp" 
            className={cn(
              "h-3 w-3 transition-colors",
              sortField === field && sortDirection === "asc" 
                ? "text-primary" 
                : "text-gray-300"
            )} 
          />
          <ApperIcon 
            name="ChevronDown" 
            className={cn(
              "h-3 w-3 -mt-1 transition-colors",
              sortField === field && sortDirection === "desc" 
                ? "text-primary" 
                : "text-gray-300"
            )} 
          />
        </div>
      </div>
    </th>
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-surface">
            <tr>
              <SortHeader field="name">Name</SortHeader>
              <SortHeader field="company">Company</SortHeader>
              <SortHeader field="email">Email</SortHeader>
              <SortHeader field="phone">Phone</SortHeader>
              <SortHeader field="lastContactDate">Last Contact</SortHeader>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sortedContacts.map((contact) => (
              <tr
                key={contact.Id}
                onClick={() => onContactSelect(contact)}
                className={cn(
                  "hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 cursor-pointer transition-all duration-200 hover:border-l-4 hover:border-primary",
                  selectedContact?.Id === contact.Id 
                    ? "bg-gradient-to-r from-primary/10 to-secondary/10 border-l-4 border-primary" 
                    : ""
                )}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-medium">
                        {contact.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {contact.company}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{contact.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {contact.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {format(new Date(contact.lastContactDate), "MMM d, yyyy")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ContactsTable