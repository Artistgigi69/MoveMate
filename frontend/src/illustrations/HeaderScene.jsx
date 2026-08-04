function HeaderScene({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 260 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label=""
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hs-blob1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9B8CFB" />
          <stop offset="100%" stopColor="#6C5CE7" />
        </linearGradient>
        <linearGradient id="hs-blob2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFB37B" />
          <stop offset="100%" stopColor="#FF7A59" />
        </linearGradient>
        <linearGradient id="hs-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9B8CFB" />
          <stop offset="100%" stopColor="#6C5CE7" />
        </linearGradient>
        <linearGradient id="hs-box1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD98A" />
          <stop offset="100%" stopColor="#FFB020" />
        </linearGradient>
        <linearGradient id="hs-box2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34D8C6" />
          <stop offset="100%" stopColor="#0E9E82" />
        </linearGradient>
        <linearGradient id="hs-leaf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34D8C6" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>
      </defs>

      <circle cx="200" cy="30" r="34" fill="url(#hs-blob1)" opacity="0.14" />
      <circle cx="40" cy="105" r="26" fill="url(#hs-blob2)" opacity="0.14" />

      <ellipse cx="130" cy="122" rx="98" ry="9" fill="#6C5CE7" opacity="0.06" />

      <g transform="translate(90,20)">
        <path d="M40 0 L80 28 L70 28 L70 78 L10 78 L10 28 L0 28 Z" fill="url(#hs-roof)" />
        <rect x="24" y="46" width="16" height="32" rx="3" fill="white" opacity="0.9" />
        <rect x="48" y="44" width="14" height="14" rx="3" fill="white" opacity="0.75" />
      </g>

      <g transform="translate(24,72)">
        <rect x="0" y="10" width="34" height="34" rx="6" fill="url(#hs-box1)" />
        <path d="M0 24 H34 M17 10 V44" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
      </g>

      <g transform="translate(190,80)">
        <rect x="0" y="0" width="30" height="30" rx="6" fill="url(#hs-box2)" />
        <path d="M0 15 H30 M15 0 V30" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
      </g>

      <g transform="translate(196,44)">
        <path d="M12 34 C4 30 2 18 8 10 C11 6 16 5 18 8 C22 3 30 4 32 12 C34 20 28 30 18 34 Z" fill="url(#hs-leaf)" opacity="0.9" />
      </g>
    </svg>
  );
}

export default HeaderScene;
