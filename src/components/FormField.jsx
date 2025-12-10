import './FormField.css'

function FormField({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  options = [], 
  required = false,
  rows = 4 
}) {
  const handleChange = (e) => {
    onChange(name, e.target.value)
  }

  return (
    <div className="form-field">
      <label>
        {label}{required && '*'}
      </label>
      {type === 'select' ? (
        <select name={name} value={value} onChange={handleChange}>
          <option value="">Seleccione</option>
          {options.map((opt, idx) => (
            <option key={idx} value={opt.value || opt}>
              {opt.label || opt}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea 
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <input 
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
        />
      )}
    </div>
  )
}

export default FormField