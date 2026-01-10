import { cn } from "@/lib/utils";

// Use system fonts to avoid Google Fonts loading issues
// This prevents the Tailwind v4 + next/font incompatibility

export const fontVariables = cn(
  // Use system stack fonts
  "font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  "font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, 'Cascadia Code', monospace",
);
