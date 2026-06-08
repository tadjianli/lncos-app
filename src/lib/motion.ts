/**
 * LN COS — Centralized motion architecture
 * Single source of truth for all animation tokens.
 * Use these in inline styles, Framer Motion props, and CSS transitions.
 */

/* ─── Easing tokens ──────────────────────────────────────────────────── */

export const ease = {
  /** Standard exit / enter — silky deceleration */
  out:     [0.2, 0.8, 0.2, 1]    as const,
  /** Subtle overshoot — buttons, badges, micro-interactions */
  spring:  [0.34, 1.56, 0.64, 1] as const,
  /** Cinematic luxury glide — editorial reveals */
  lux:     [0.22, 0.68, 0, 1]    as const,
  /** Snap — instant feedback, toggles */
  snap:    [0.4, 0, 0.2, 1]      as const,
  /** Press — quick compression */
  press:   [0.4, 0, 1, 1]        as const,
} as const;

/** CSS cubic-bezier strings — for use in `transition:` and style props */
export const easeCss = {
  out:    "cubic-bezier(0.2, 0.8, 0.2, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  lux:    "cubic-bezier(0.22, 0.68, 0, 1)",
  snap:   "cubic-bezier(0.4, 0, 0.2, 1)",
  press:  "cubic-bezier(0.4, 0, 1, 1)",
} as const;

/* ─── Duration tokens (ms) ───────────────────────────────────────────── */

export const dur = {
  instant: 80,
  fast:    180,
  base:    250,
  slow:    400,
  drift:   700,
} as const;

/* ─── Framer Motion spring presets ───────────────────────────────────── */

export const spring = {
  /** Default interactive spring — buttons, cards */
  gentle: {
    type: "spring" as const,
    stiffness: 300,
    damping: 28,
    mass: 0.8,
  },
  /** Snappy spring — badges, notifications, pops */
  snappy: {
    type: "spring" as const,
    stiffness: 500,
    damping: 32,
    mass: 0.6,
  },
  /** Soft luxury spring — page entries, reveals */
  soft: {
    type: "spring" as const,
    stiffness: 160,
    damping: 24,
    mass: 1,
  },
  /** Wobbly spring — cart badge bump, +1 float */
  pop: {
    type: "spring" as const,
    stiffness: 600,
    damping: 20,
    mass: 0.5,
  },
} as const;

/* ─── Stagger presets ────────────────────────────────────────────────── */

export const stagger = {
  /** List items — cards, rows */
  list:      0.05,
  /** Section reveals — home page sections */
  section:   0.08,
  /** Fast cascade — nav items, chips */
  fast:      0.03,
  /** Slow editorial — hero elements */
  editorial: 0.14,
} as const;

/** Framer Motion staggerChildren variants */
export const staggerContainer = (delay = stagger.list) => ({
  hidden: {},
  show: {
    transition: { staggerChildren: delay },
  },
});

export const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { ...spring.soft } },
};

/* ─── Hover transitions ──────────────────────────────────────────────── */

/** Inline style string for CSS hover transitions */
export const hoverTransition = {
  /** Product card lift */
  card: `transform ${dur.slow}ms ${easeCss.lux}, box-shadow ${dur.slow}ms ${easeCss.lux}, border-color 300ms`,
  /** CTA button */
  btn:  `transform ${dur.base}ms ${easeCss.spring}, box-shadow ${dur.base}ms`,
  /** Navigation items */
  nav:  `color ${dur.fast}ms ${easeCss.snap}, opacity ${dur.fast}ms`,
  /** Image zoom */
  img:  `transform ${dur.slow}ms ${easeCss.lux}`,
} as const;

/* ─── Framer Motion page / screen transition presets ─────────────────── */

export const pageTransition = {
  /** Slide up — default screen entry (mobile-native feel) */
  slideUp: {
    initial:   { opacity: 0, y: 28 },
    animate:   { opacity: 1, y: 0, transition: { ...spring.soft } },
    exit:      { opacity: 0, y: -14, transition: { duration: dur.fast / 1000, ease: ease.press } },
  },
  /** Fade — overlay screens (product detail, search) */
  fade: {
    initial:   { opacity: 0 },
    animate:   { opacity: 1, transition: { duration: dur.base / 1000, ease: ease.out } },
    exit:      { opacity: 0, transition: { duration: dur.fast / 1000 } },
  },
  /** Slide from right — sub-screens, details */
  slideRight: {
    initial:   { opacity: 0, x: 32 },
    animate:   { opacity: 1, x: 0, transition: { ...spring.soft } },
    exit:      { opacity: 0, x: -24, transition: { duration: dur.fast / 1000, ease: ease.press } },
  },
  /** Slide from bottom — drawers, modals */
  sheet: {
    initial:   { opacity: 0, y: "100%" },
    animate:   { opacity: 1, y: 0, transition: { ...spring.gentle } },
    exit:      { opacity: 0, y: "100%", transition: { duration: dur.base / 1000, ease: ease.press } },
  },
} as const;

/* ─── Micro-interaction presets ──────────────────────────────────────── */

export const micro = {
  /** Tap feedback — scale down on press */
  tap:     { scale: 0.94 },
  /** Hover lift — cards */
  hover:   { y: -6 },
  /** Button hover */
  btnHover: { y: -2 },
} as const;

/* ─── Ambient animation config (home orbs, particles) ───────────────── */

export const ambient = {
  orb: {
    a: { duration: 19, x: 30, y: -26, scale: 1.12 },
    b: { duration: 23, x: -34, y: 28, scale: 1.1 },
    c: { duration: 27, x: 20, y: -18, scale: 1.08 },
  },
  particleDurations: [14, 17, 15, 19, 16],
} as const;
