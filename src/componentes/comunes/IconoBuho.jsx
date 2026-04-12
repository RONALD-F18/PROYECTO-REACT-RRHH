import { useId } from 'react';

/**
 * Mascota RRHH — silueta sencilla, menos “robot con gafas”, legible en claro y oscuro.
 */
function IconoBuho({ className = '', title = 'Talent Sphere', ...rest }) {
  const uid = useId().replace(/:/g, '');
  const gCuerpo = `buho-c-${uid}`;
  const gVientre = `buho-v-${uid}`;

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
        <linearGradient id={gCuerpo} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7eb8e8" />
          <stop offset="55%" stopColor="#4e8fc9" />
          <stop offset="100%" stopColor="#3d6fa8" />
        </linearGradient>
        <linearGradient id={gVientre} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#f0f7fc" />
          <stop offset="100%" stopColor="#c5ddf0" />
        </linearGradient>
      </defs>

      <ellipse cx="60" cy="108" rx="26" ry="4" fill="#1e3a5f" opacity="0.11" />

      {/* Orejas discretas */}
      <path d="M28 44 Q22 22 36 34 Q32 48 28 44 Z" fill={`url(#${gCuerpo})`} opacity="0.95" />
      <path d="M92 44 Q98 22 84 34 Q88 48 92 44 Z" fill={`url(#${gCuerpo})`} opacity="0.95" />

      <ellipse cx="60" cy="62" rx="40" ry="36" fill={`url(#${gCuerpo})`} />
      <ellipse cx="60" cy="68" rx="28" ry="24" fill={`url(#${gVientre})`} opacity="0.92" />

      {/* Ojos pequeños, sin lentes amarillas llamativas */}
      <ellipse cx="46" cy="52" rx="10" ry="11" fill="#fff" />
      <ellipse cx="74" cy="52" rx="10" ry="11" fill="#fff" />
      <circle cx="46" cy="53" r="5" fill="#334155" />
      <circle cx="74" cy="53" r="5" fill="#334155" />
      <circle cx="47.5" cy="50.5" r="1.8" fill="#fff" />
      <circle cx="75.5" cy="50.5" r="1.8" fill="#fff" />

      {/* Pico */}
      <path d="M54 66 L60 74 L66 66 Q60 63 54 66 Z" fill="#e8a87c" stroke="#c97d50" strokeWidth="0.4" />

      {/* Cejas suaves */}
      <path
        d="M36 44 Q46 38 56 42"
        fill="none"
        stroke="#2d4a6f"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        d="M64 42 Q74 38 84 44"
        fill="none"
        stroke="#2d4a6f"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.35"
      />

      <path
        d="M48 82 Q60 88 72 82"
        fill="none"
        stroke="#3d6fa8"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.45"
      />

      <ellipse cx="44" cy="96" rx="9" ry="5" fill={`url(#${gCuerpo})`} />
      <ellipse cx="76" cy="96" rx="9" ry="5" fill={`url(#${gCuerpo})`} />
    </svg>
  );
}

export default IconoBuho;
