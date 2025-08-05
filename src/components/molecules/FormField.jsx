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
          className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none ${
            error 
              ? "border-error focus:ring-error/50 focus:border-error" 
              : "border-gray-300 hover:border-gray-400"
          }`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem'
          }}
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