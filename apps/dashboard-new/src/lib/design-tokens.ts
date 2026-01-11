/**
 * ============================================================
 * NEXIFY AI - PREMIUM DESIGN TOKENS
 * TypeScript definitions for the design system
 * ============================================================
 *
 * Usage:
 *   import { colors, typography, spacing } from '@/lib/design-tokens'
 *
 * ============================================================
 */

// ============================================================
// COLOR SYSTEM
// ============================================================

export const colors = {
  // Brand Colors - Premium Palette
  brand: {
    // Primary: Royal Blue - Trust, Competence, Premium
    primary: {
      DEFAULT: "#2563eb", // hsl(224, 76%, 48%)
      light: "#3b82f6", // hsl(221, 83%, 53%)
      dark: "#1e40af", // hsl(226, 71%, 40%)
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
      950: "#172554",
    },
    // Accent: Luxurious Gold - Exclusivity, Value, Premium
    gold: {
      DEFAULT: "#d4a00a", // hsl(45, 93%, 47%)
      light: "#eab308", // hsl(48, 96%, 53%)
      dark: "#a16207", // hsl(43, 96%, 40%)
      50: "#fefce8",
      100: "#fef9c3",
      200: "#fef08a",
      300: "#fde047",
      400: "#facc15",
      500: "#eab308",
      600: "#ca8a04",
      700: "#a16207",
      800: "#854d0e",
      900: "#713f12",
      950: "#422006",
    },
    // Secondary: Platinum Silver - Technology, Precision
    silver: {
      DEFAULT: "#9ca3af", // hsl(220, 14%, 71%)
      light: "#e5e7eb", // hsl(220, 13%, 91%)
      dark: "#6b7280", // hsl(220, 9%, 46%)
    },
  },

  // Semantic Colors
  semantic: {
    success: {
      DEFAULT: "#10b981", // Emerald
      light: "#34d399",
      dark: "#059669",
    },
    warning: {
      DEFAULT: "#f59e0b", // Amber
      light: "#fbbf24",
      dark: "#d97706",
    },
    error: {
      DEFAULT: "#dc2626", // Ruby
      light: "#ef4444",
      dark: "#b91c1c",
    },
    info: {
      DEFAULT: "#0ea5e9", // Sapphire
      light: "#38bdf8",
      dark: "#0284c7",
    },
  },

  // Neutral Scale
  neutral: {
    50: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    800: "#27272a",
    900: "#18181b",
    950: "#09090b",
  },

  // Surface Colors
  surface: {
    light: {
      background: "#fafbfd", // Off-white with blue tint
      foreground: "#0a1628", // Near black
      card: "#ffffff",
      cardForeground: "#0a1628",
      muted: "#f4f4f5",
      mutedForeground: "#71717a",
      border: "#e4e4e7",
    },
    dark: {
      background: "#0a1628", // Deep blue-black
      foreground: "#f4f4f5",
      card: "#111827",
      cardForeground: "#f4f4f5",
      muted: "#1f2937",
      mutedForeground: "#9ca3af",
      border: "#374151",
    },
  },
} as const;

// ============================================================
// GRADIENTS
// ============================================================

export const gradients = {
  // Premium gradient: Blue to Gold
  premium: "linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #d4a00a 100%)",

  // Gold gradient
  gold: "linear-gradient(135deg, #a16207 0%, #d4a00a 50%, #eab308 100%)",

  // Royal gradient: Deep to bright blue
  royal: "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)",

  // Surface gradient
  surface: "linear-gradient(180deg, #fafbfd 0%, #f4f4f5 100%)",

  // Dark surface gradient
  surfaceDark: "linear-gradient(180deg, #0a1628 0%, #111827 100%)",

  // Accent glow
  glowPrimary:
    "radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)",
  glowGold:
    "radial-gradient(circle, rgba(212, 160, 10, 0.15) 0%, transparent 70%)",
} as const;

// ============================================================
// TYPOGRAPHY
// ============================================================

export const typography = {
  // Font Families
  fontFamily: {
    sans: [
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "sans-serif",
    ],
    display: ["Plus Jakarta Sans", "Inter", "sans-serif"],
    mono: ["JetBrains Mono", "Fira Code", "monospace"],
  },

  // Font Sizes
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }], // 12px
    sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px
    base: ["1rem", { lineHeight: "1.5rem" }], // 16px
    lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
    xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20px
    "2xl": ["1.5rem", { lineHeight: "2rem" }], // 24px
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
    "5xl": ["3rem", { lineHeight: "1.2" }], // 48px
    "6xl": ["3.75rem", { lineHeight: "1.1" }], // 60px
    "7xl": ["4.5rem", { lineHeight: "1.1" }], // 72px
  },

  // Font Weights
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },

  // Letter Spacing
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },

  // Line Heights
  lineHeight: {
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },
} as const;

// ============================================================
// SPACING
// ============================================================

export const spacing = {
  px: "1px",
  0: "0",
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  1.5: "0.375rem", // 6px
  2: "0.5rem", // 8px
  2.5: "0.625rem", // 10px
  3: "0.75rem", // 12px
  3.5: "0.875rem", // 14px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  7: "1.75rem", // 28px
  8: "2rem", // 32px
  9: "2.25rem", // 36px
  10: "2.5rem", // 40px
  11: "2.75rem", // 44px
  12: "3rem", // 48px
  14: "3.5rem", // 56px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  28: "7rem", // 112px
  32: "8rem", // 128px
  36: "9rem", // 144px
  40: "10rem", // 160px
  44: "11rem", // 176px
  48: "12rem", // 192px
  52: "13rem", // 208px
  56: "14rem", // 224px
  60: "15rem", // 240px
  64: "16rem", // 256px
  72: "18rem", // 288px
  80: "20rem", // 320px
  96: "24rem", // 384px
} as const;

// ============================================================
// BORDER RADIUS
// ============================================================

export const borderRadius = {
  none: "0",
  sm: "0.25rem", // 4px
  DEFAULT: "0.5rem", // 8px
  md: "0.375rem", // 6px
  lg: "0.75rem", // 12px
  xl: "1rem", // 16px
  "2xl": "1.5rem", // 24px
  "3xl": "2rem", // 32px
  full: "9999px",
} as const;

// ============================================================
// SHADOWS
// ============================================================

export const shadows = {
  // Standard shadows
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",

  // Premium shadows with subtle glow
  premium: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03), 0 0 0 1px rgba(0, 0, 0, 0.02)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.03), 0 0 0 1px rgba(0, 0, 0, 0.02)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03), 0 0 0 1px rgba(0, 0, 0, 0.02)",
  },

  // Glow shadows
  glow: {
    primary:
      "0 0 20px -5px rgba(37, 99, 235, 0.3), 0 0 40px -10px rgba(37, 99, 235, 0.2)",
    gold: "0 0 20px -5px rgba(212, 160, 10, 0.3), 0 0 40px -10px rgba(212, 160, 10, 0.2)",
    success:
      "0 0 20px -5px rgba(16, 185, 129, 0.3), 0 0 40px -10px rgba(16, 185, 129, 0.2)",
  },

  // Inner shadow for depth
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",

  none: "none",
} as const;

// ============================================================
// ANIMATION
// ============================================================

export const animation = {
  // Durations
  duration: {
    fast: "150ms",
    normal: "250ms",
    slow: "400ms",
    slower: "600ms",
  },

  // Easing
  easing: {
    DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
    linear: "linear",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    elegant: "cubic-bezier(0.23, 1, 0.32, 1)",
  },

  // Keyframes
  keyframes: {
    fadeIn: {
      from: { opacity: "0" },
      to: { opacity: "1" },
    },
    fadeOut: {
      from: { opacity: "1" },
      to: { opacity: "0" },
    },
    slideUp: {
      from: { transform: "translateY(10px)", opacity: "0" },
      to: { transform: "translateY(0)", opacity: "1" },
    },
    slideDown: {
      from: { transform: "translateY(-10px)", opacity: "0" },
      to: { transform: "translateY(0)", opacity: "1" },
    },
    scaleIn: {
      from: { transform: "scale(0.95)", opacity: "0" },
      to: { transform: "scale(1)", opacity: "1" },
    },
    shimmer: {
      "0%": { backgroundPosition: "200% 0" },
      "100%": { backgroundPosition: "-200% 0" },
    },
    pulse: {
      "0%, 100%": { opacity: "1" },
      "50%": { opacity: "0.5" },
    },
    float: {
      "0%, 100%": { transform: "translateY(0)" },
      "50%": { transform: "translateY(-5px)" },
    },
  },
} as const;

// ============================================================
// BREAKPOINTS
// ============================================================

export const breakpoints = {
  sm: "640px", // Mobile landscape
  md: "768px", // Tablet
  lg: "1024px", // Desktop
  xl: "1280px", // Large desktop
  "2xl": "1536px", // Extra large
} as const;

// ============================================================
// Z-INDEX
// ============================================================

export const zIndex = {
  hide: -1,
  auto: "auto",
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1020,
  banner: 1030,
  overlay: 1040,
  modal: 1050,
  popover: 1060,
  skipLink: 1070,
  toast: 1080,
  tooltip: 1090,
} as const;

// ============================================================
// COMPONENT TOKENS
// ============================================================

export const components = {
  // Button sizes
  button: {
    sm: { height: "32px", padding: "0 12px", fontSize: "14px" },
    md: { height: "40px", padding: "0 16px", fontSize: "14px" },
    lg: { height: "48px", padding: "0 24px", fontSize: "16px" },
    xl: { height: "56px", padding: "0 32px", fontSize: "18px" },
  },

  // Input sizes
  input: {
    sm: { height: "32px", padding: "0 12px", fontSize: "14px" },
    md: { height: "40px", padding: "0 14px", fontSize: "14px" },
    lg: { height: "48px", padding: "0 16px", fontSize: "16px" },
  },

  // Card variants
  card: {
    padding: { sm: "16px", md: "24px", lg: "32px" },
    borderRadius: "12px",
  },

  // Avatar sizes
  avatar: {
    xs: "24px",
    sm: "32px",
    md: "40px",
    lg: "48px",
    xl: "64px",
    "2xl": "96px",
  },

  // Badge sizes
  badge: {
    sm: { height: "20px", padding: "0 6px", fontSize: "11px" },
    md: { height: "24px", padding: "0 8px", fontSize: "12px" },
    lg: { height: "28px", padding: "0 10px", fontSize: "13px" },
  },
} as const;

// ============================================================
// CSS VARIABLES HELPER
// ============================================================

export function cssVar(name: string): string {
  return `var(--${name})`;
}

export function hsl(variable: string): string {
  return `hsl(var(--${variable}))`;
}

export function hsla(variable: string, alpha: number): string {
  return `hsla(var(--${variable}), ${alpha})`;
}

// ============================================================
// EXPORT ALL
// ============================================================

export const designTokens = {
  colors,
  gradients,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  breakpoints,
  zIndex,
  components,
} as const;

export default designTokens;
