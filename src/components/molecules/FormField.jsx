import Label from "@/components/atoms/Label"
import Input from "@/components/atoms/Input"

const FormField = ({ 
  label, 
  id, 
  error, 
  required = false,
  ...inputProps 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={required ? "after:content-['*'] after:text-error after:ml-1" : ""}>
        {label}
      </Label>
      <Input
        id={id}
        error={error}
        {...inputProps}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  )
}

export default FormField