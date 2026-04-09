import { useId } from 'react';

/**
 * Mascota búho — SVG en tonos azules claros (legible en header blanco y FAB con gradiente).
 */
function IconoBuho({ className = '', title = 'Talent Sphere', ...rest }) {
  const uid = useId().replace(/:/g, '');
  const gBody = `buho-body-${uid}`;
  const gBelly = `buho-belly-${uid}`;
  const gBeak = `buho-beak-${uid}`;

  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      width="120"
      height="120"
      role="img"
      aria-hidden={title ? undefined : true}
      aria-label={title || undefined}
      {...rest}
    >
      <defs>
        <radialGradient id={gBody} cx="42%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="45%" stopColor="#3b82f6" />
          <stop offset="85%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </radialGradient>
        <linearGradient id={gBelly} x1="50%" y1="10%" x2="50%" y2="95%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="35%" stopColor="#7dd3fc" />
          <stop offset="70%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id={gBeak} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      <ellipse cx="60" cy="108" rx="28" ry="5" fill="#1e3a8a" opacity="0.12" />

      <path
        d="M18 68 Q8 52 14 38 Q22 44 26 60 Q22 76 16 82 Q12 74 18 68 Z"
        fill="#2563eb"
      />
      <path
        d="M102 68 Q112 52 106 38 Q98 44 94 60 Q98 76 104 82 Q108 74 102 68 Z"
        fill="#2563eb"
      />

      <ellipse cx="60" cy="66" rx="44" ry="40" fill={`url(#${gBody})`} />

      <ellipse cx="60" cy="72" rx="30" ry="28" fill={`url(#${gBelly})`} opacity="0.98" />
      <ellipse cx="60" cy="68" rx="24" ry="9" fill="#fff" opacity="0.35" />

      <circle cx="60" cy="44" r="38" fill="#3b82f6" />
      <circle cx="60" cy="44" r="36" fill={`url(#${gBody})`} opacity="0.55" />

      <path d="M42 12 Q36 2 44 10 Q48 6 46 16 Z" fill="#1d4ed8" />
      <path d="M78 12 Q84 2 76 10 Q72 6 74 16 Z" fill="#1d4ed8" />

      <ellipse cx="60" cy="46" rx="34" ry="30" fill="#bfdbfe" opacity="0.5" />

      <circle cx="38" cy="52" r="5" fill="#f472b6" opacity="0.35" />
      <circle cx="82" cy="52" r="5" fill="#f472b6" opacity="0.35" />

      <ellipse cx="44" cy="42" rx="16" ry="17" fill="#fff" />
      <ellipse cx="76" cy="42" rx="16" ry="17" fill="#fff" />
      <circle cx="44" cy="42" r="13" fill="#facc15" />
      <circle cx="76" cy="42" r="13" fill="#facc15" />
      <circle cx="44" cy="42" r="8.5" fill="#fef9c3" />
      <circle cx="76" cy="42" r="8.5" fill="#fef9c3" />
      <circle cx="45" cy="43" r="5" fill="#334155" />
      <circle cx="77" cy="43" r="5" fill="#334155" />
      <circle cx="47.5" cy="39" r="2.5" fill="#fff" />
      <circle cx="79.5" cy="39" r="2.5" fill="#fff" />

      <path
        d="M52 58 L60 72 L68 58 Q60 54 52 58 Z"
        fill={`url(#${gBeak})`}
        stroke="#b45309"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />

      <path d="M46 98 L42 112 L52 112 L50 98 Z" fill="#2563eb" />
      <path d="M70 98 L66 112 L76 112 L74 98 Z" fill="#2563eb" />
      <ellipse cx="47" cy="113" rx="7" ry="3.5" fill="#1d4ed8" />
      <ellipse cx="73" cy="113" rx="7" ry="3.5" fill="#1d4ed8" />
    </svg>
  );
}

export default IconoBuho;
