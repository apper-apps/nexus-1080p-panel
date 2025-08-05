import Label from "@/components/atoms/Label"
import Input from "@/components/atoms/Input"

const FormField = ({ 
  label, 
  id, 
  error, 
  required = false,
  type = "text",
  as = "input",
  options = [],
  ...inputProps 
}) => {
  const renderInput = () => {
    if (as === "select") {
      return (
        <select
          id={id}
          className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            error 
              ? "border-error focus:ring-error/50 focus:border-error" 
              : "border-gray-300 hover:border-gray-400"
          }`}
          {...inputProps}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
    }
    
    return (
      <Input
        id={id}
        type={type}
        as={as}
        error={error}
        {...inputProps}
      />
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={required ? "after:content-['*'] after:text-error after:ml-1" : ""}>
        {label}
      </Label>
      {renderInput()}
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  )
}

export default FormField