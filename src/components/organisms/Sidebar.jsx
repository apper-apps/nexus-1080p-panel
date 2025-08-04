import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import NavItem from "@/components/molecules/NavItem"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const navigationItems = [
  { to: "/contacts", icon: "Users", label: "Contacts" },
  { to: "/deals", icon: "TrendingUp", label: "Deals" },
  { to: "/companies", icon: "Building2", label: "Companies" },
  { to: "/dashboard", icon: "BarChart3", label: "Dashboard" },
  { to: "/dashboard", icon: "Activity", label: "Activity Feed" },
  { to: "/reports", icon: "FileText", label: "Reports" }
]

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <ApperIcon name={isMobileOpen ? "X" : "Menu"} className="h-5 w-5 text-gray-700" />
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <ApperIcon name="Zap" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Nexus CRM
              </h1>
              <p className="text-sm text-gray-600">Customer Relations</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="h-8 w-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <ApperIcon name="User" className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Sales Team</p>
              <p className="text-xs text-gray-600 truncate">sales@company.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobile}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="lg:hidden fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                    <ApperIcon name="Zap" className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Nexus CRM
                    </h1>
                    <p className="text-sm text-gray-600">Customer Relations</p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 p-4 space-y-2">
                {navigationItems.map((item) => (
                  <div key={item.to} onClick={toggleMobile}>
                    <NavItem
                      to={item.to}
                      icon={item.icon}
                      label={item.label}
                    />
                  </div>
                ))}
              </nav>

              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="h-8 w-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <ApperIcon name="User" className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">Sales Team</p>
                    <p className="text-xs text-gray-600 truncate">sales@company.com</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar