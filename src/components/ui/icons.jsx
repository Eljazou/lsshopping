// Lightweight inline SVG icons (stroke-based, inherit currentColor).
// Kept in one file so we don't pull in an icon dependency.

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
}

export const CartIcon = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
    <path d="M2.5 3.5h2l2.2 11.2a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.6-1.3L21 7H6" />
  </svg>
)

export const SearchIcon = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
)

export const MenuIcon = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
)

export const CloseIcon = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const ChevronDown = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)

export const ArrowRight = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const PlusIcon = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const MinusIcon = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <path d="M5 12h14" />
  </svg>
)

export const TrashIcon = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.7 12a2 2 0 0 1-2 1.9H8.7a2 2 0 0 1-2-1.9L6 7" />
  </svg>
)

export const CheckIcon = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export const StarIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...p}>
    <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5-4.7-4.6 6.5-.9z" />
  </svg>
)

export const HeartIcon = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <path d="M12 20s-7-4.4-9.2-8.6C1.3 8.5 2.6 5.5 5.6 5c1.9-.3 3.4.8 4.4 2 1-1.2 2.5-2.3 4.4-2 3 .5 4.3 3.5 2.8 6.4C19 15.6 12 20 12 20z" />
  </svg>
)

export const TruckIcon = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <path d="M2 6h11v9H2zM13 9h4l3 3v3h-7" />
    <circle cx="6.5" cy="17" r="1.6" />
    <circle cx="17.5" cy="17" r="1.6" />
  </svg>
)

export const ShieldIcon = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

export const GlobeIcon = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
  </svg>
)

export const SparkleIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...p}>
    <path d="M12 2c.6 3.6 1.9 5.9 5 7-3.1 1.1-4.4 3.4-5 7-.6-3.6-1.9-5.9-5-7 3.1-1.1 4.4-3.4 5-7z" />
    <path d="M19 14c.3 1.7.9 2.7 2.3 3.2-1.4.5-2 1.5-2.3 3.2-.3-1.7-.9-2.7-2.3-3.2 1.4-.5 2-1.5 2.3-3.2z" />
  </svg>
)

// ── category icons (used on the Shop filter chips) ──

export const DropletIcon = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <path d="M12 3c3.5 4 6 7.4 6 10.5a6 6 0 1 1-12 0C6 10.4 8.5 7 12 3z" />
  </svg>
)

export const LipstickIcon = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <path d="M9 3h6l1 5-4 3-4-3z" />
    <rect x="8" y="11" width="8" height="10" rx="2" />
  </svg>
)

export const ScissorsIcon = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <circle cx="6" cy="6" r="2.3" />
    <circle cx="6" cy="18" r="2.3" />
    <path d="m20 5-12 14M8 12l12 7" />
  </svg>
)

export const PerfumeIcon = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <path d="M10 2h4M11 2v3h2V2M8 9h8l1 3v8a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-8z" />
    <path d="M12 12v4" />
  </svg>
)

export const LeafIcon = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <path d="M4 20c0-8 5-14 16-15-1 11-7 16-15 16-.4 0-.7 0-1-.1z" />
    <path d="M6 18c3-3 6-6 12-11" />
  </svg>
)

export const BrushIcon = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <path d="M14 4c2 0 4 2 4 4l-6.5 6.5-4-4z" />
    <path d="m7.5 14.5-3 6 6-3z" />
  </svg>
)
