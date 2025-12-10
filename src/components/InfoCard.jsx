import './InfoCard.css'

function InfoCard({ title, children, className = '' }) {
  return (
    <div className={`info-card ${className}`}>
      {title && <h3 className="info-card-title">{title}</h3>}
      <div className="info-card-content">
        {children}
      </div>
    </div>
  )
}

function InfoRow({ label, value, colorTheme = 'yellow' }) {
  return (
    <div className={`info-row theme-${colorTheme}`}>
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  )
}

export { InfoCard, InfoRow }