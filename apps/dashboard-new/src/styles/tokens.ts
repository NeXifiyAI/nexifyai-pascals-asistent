// ============================================================
// NEXIFY AI - DESIGN TOKENS (TypeScript)
// Use these for programmatic access to design values
// ============================================================

export const colors = {
  brand: {
    primary: "hsl(217, 91%, 60%)",
    secondary: "hsl(187, 85%, 53%)",
    gradient:
      "linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(187, 85%, 53%) 100%)",
  },
  semantic: {
    success: "hsl(142, 76%, 36%)",
    warning: "hsl(38, 92%, 50%)",
    error: "hsl(0, 84%, 60%)",
    info: "hsl(199, 89%, 48%)",
  },
} as const;

export const spacing = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
} as const;

export const typography = {
  fontFamily: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
} as const;

export const radius = {
  none: "0",
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
} as const;

export const transitions = {
  fast: "150ms",
  normal: "200ms",
  slow: "300ms",
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
} as const;

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export const layout = {
  sidebar: {
    width: "16rem",
    widthCollapsed: "4rem",
    widthMobile: "18rem",
  },
  container: {
    maxWidth: "80rem",
    padding: {
      mobile: "1rem",
      tablet: "1.5rem",
      desktop: "2rem",
    },
  },
  touchTarget: {
    min: "44px",
  },
} as const;

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Check if we're on a mobile device
 */
export function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < parseInt(breakpoints.md);
}

/**
 * Check if we're on a tablet device
 */
export function isTablet(): boolean {
  if (typeof window === "undefined") return false;
  const width = window.innerWidth;
  return width >= parseInt(breakpoints.md) && width < parseInt(breakpoints.lg);
}

/**
 * Check if we're on a desktop device
 */
export function isDesktop(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= parseInt(breakpoints.lg);
}

/**
 * Get current breakpoint name
 */
export function getCurrentBreakpoint(): keyof typeof breakpoints | "xs" {
  if (typeof window === "undefined") return "xs";
  const width = window.innerWidth;

  if (width >= parseInt(breakpoints["2xl"])) return "2xl";
  if (width >= parseInt(breakpoints.xl)) return "xl";
  if (width >= parseInt(breakpoints.lg)) return "lg";
  if (width >= parseInt(breakpoints.md)) return "md";
  if (width >= parseInt(breakpoints.sm)) return "sm";
  return "xs";
}

// Export all tokens as default
const designTokens = {
  colors,
  spacing,
  typography,
  radius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  layout,
};

export default designTokens;
