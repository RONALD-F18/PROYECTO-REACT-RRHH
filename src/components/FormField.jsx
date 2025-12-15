import './FormField.css'

function FormField({ label, type = 'text', name, value, placeholder, options = [] }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      {type === 'select' ? (
        <select name={name} value={value}>
          <option value="">Seleccione</option>
          {options.map((opt, idx) => (
            <option key={idx} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea name={name} value={value} placeholder={placeholder} />
      ) : (
        <input type={type} name={name} value={value} placeholder={placeholder} />
      )}
    </div>
  )
}

export default FormField