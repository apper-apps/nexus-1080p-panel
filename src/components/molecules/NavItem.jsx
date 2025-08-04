import { NavLink } from "react-router-dom"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const NavItem = ({ to, icon, label, badge }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
          isActive
            ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-l-4 border-primary"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        )
      }
    >
      {({ isActive }) => (
        <>
          <ApperIcon 
            name={icon} 
            className={cn(
              "h-5 w-5 transition-colors",
              isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600"
            )} 
          />
          <span className="flex-1">{label}</span>
          {badge && (
            <span className="bg-gradient-to-r from-accent to-pink-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

export default NavItem