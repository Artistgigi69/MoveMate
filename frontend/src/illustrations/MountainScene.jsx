function MountainScene({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Mountains at dusk"
    >
      <defs>
        <linearGradient id="ms-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2C2660" />
          <stop offset="55%" stopColor="#6C5CE7" />
          <stop offset="100%" stopColor="#FF8F6B" />
        </linearGradient>
        <linearGradient id="ms-sun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE1B8" />
          <stop offset="100%" stopColor="#FF7A59" />
        </linearGradient>
        <linearGradient id="ms-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8C7CE8" />
          <stop offset="100%" stopColor="#6C5CE7" />
        </linearGradient>
        <linearGradient id="ms-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5D4FCF" />
          <stop offset="100%" stopColor="#4133A0" />
        </linearGradient>
        <linearGradient id="ms-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#332B70" />
          <stop offset="100%" stopColor="#221D4E" />
        </linearGradient>
        <linearGradient id="ms-snow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFD9C4" />
        </linearGradient>
      </defs>

      <rect width="400" height="300" fill="url(#ms-sky)" />

      <circle cx="200" cy="120" r="46" fill="url(#ms-sun)" opacity="0.9" />

      <circle cx="70" cy="55" r="3" fill="#fff" opacity="0.7" />
      <circle cx="120" cy="35" r="2" fill="#fff" opacity="0.5" />
      <circle cx="320" cy="45" r="2.5" fill="#fff" opacity="0.6" />
      <circle cx="350" cy="80" r="2" fill="#fff" opacity="0.4" />

      <path
        d="M0 190 L60 120 L100 160 L150 100 L210 190 Z"
        fill="url(#ms-far)"
        opacity="0.85"
      />
      <path d="M60 120 L75 140 L100 160 L85 145 Z" fill="url(#ms-snow)" opacity="0.9" />

      <path
        d="M140 210 L220 100 L270 170 L320 130 L400 210 Z"
        fill="url(#ms-mid)"
      />
      <path d="M220 100 L236 132 L270 170 L248 140 Z" fill="url(#ms-snow)" opacity="0.85" />

      <path
        d="M-10 260 L90 160 L160 230 L230 150 L310 220 L410 170 L410 300 L-10 300 Z"
        fill="url(#ms-near)"
      />
      <path d="M90 160 L108 190 L160 230 L136 195 Z" fill="url(#ms-snow)" opacity="0.8" />
      <path d="M230 150 L246 178 L280 205 L260 178 Z" fill="url(#ms-snow)" opacity="0.7" />

      <ellipse cx="200" cy="292" rx="220" ry="18" fill="#1A1640" opacity="0.5" />
    </svg>
  );
}

export default MountainScene;
