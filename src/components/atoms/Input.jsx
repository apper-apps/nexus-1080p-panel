import { forwardRef } from "react"
import { cn } from "@/utils/cn"

const Input = forwardRef(({ 
  className, 
  type = "text", 
  as = "input",
  error,
  ...props 
}, ref) => {
  const baseClasses = cn(
    "flex w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    error 
      ? "border-error focus:ring-error/50 focus:border-error" 
      : "border-gray-300 hover:border-gray-400",
    className
  )

  if (as === "textarea") {
    return (
      <textarea
        className={cn(baseClasses, "min-h-[80px] resize-y")}
        ref={ref}
        {...props}
      />
    )
  }

  return (
    <input
      type={type}
      className={cn(baseClasses, "h-10")}
      ref={ref}
      {...props}
    />
  )
})

Input.displayName = "Input"

export default Input