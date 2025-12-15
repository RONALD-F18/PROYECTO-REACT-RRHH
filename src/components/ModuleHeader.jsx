import "./ModuleHeader.css";

function ModuleHeader({
  title,
  subtitle,
  buttonText,
  onButtonClick,
  showButton = true,
}) {
  return (
    <header className="module-header">
      <div className="module-header-left">
        <div className="module-logo">
          <svg width="38" height="38" viewBox="0 0 38 38">
            <circle cx="19" cy="19" r="17" fill="url(#modGrad)" />
            <ellipse
              cx="19"
              cy="19"
              rx="12"
              ry="4.5"
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1"
            />
            <ellipse
              cx="19"
              cy="19"
              rx="12"
              ry="4.5"
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1"
              transform="rotate(60 19 19)"
            />
            <ellipse
              cx="19"
              cy="19"
              rx="12"
              ry="4.5"
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1"
              transform="rotate(-60 19 19)"
            />
            <circle cx="19" cy="19" r="3" fill="#fbbf24" />
            <circle cx="12" cy="14" r="2" fill="#60a5fa" />
            <circle cx="26" cy="14" r="2" fill="#f472b6" />
            <circle cx="19" cy="27" r="2" fill="#a78bfa" />
            <defs>
              <linearGradient id="modGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="module-info">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      {showButton && (
        <button className="module-btn" onClick={onButtonClick}>
          <span className="btn-icon"></span>
          {buttonText}
        </button>
      )}
    </header>
  );
}

export default ModuleHeader;
