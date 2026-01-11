"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// ============================================================
// PREMIUM BUTTON
// ============================================================

const premiumButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all duration-250 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden",
  {
    variants: {
      variant: {
        primary: [
          "text-white",
          "bg-gradient-to-br from-[#1e40af] via-[#2563eb] to-[#3b82f6]",
          "shadow-[0_4px_14px_0_rgba(37,99,235,0.3)]",
          "hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)]",
          "hover:-translate-y-0.5",
          "active:translate-y-0",
        ],
        gold: [
          "text-black font-bold",
          "bg-gradient-to-br from-[#a16207] via-[#d4a00a] to-[#eab308]",
          "shadow-[0_4px_14px_0_rgba(212,160,10,0.3)]",
          "hover:shadow-[0_6px_20px_rgba(212,160,10,0.4)]",
          "hover:-translate-y-0.5",
          "active:translate-y-0",
        ],
        outline: [
          "border-2 border-[#2563eb] text-[#2563eb]",
          "bg-transparent",
          "hover:bg-gradient-to-br hover:from-[#1e40af] hover:via-[#2563eb] hover:to-[#3b82f6]",
          "hover:text-white hover:border-transparent",
          "hover:shadow-[0_4px_14px_0_rgba(37,99,235,0.3)]",
          "hover:-translate-y-0.5",
        ],
        outlineGold: [
          "border-2 border-[#d4a00a] text-[#d4a00a]",
          "bg-transparent",
          "hover:bg-gradient-to-br hover:from-[#a16207] hover:via-[#d4a00a] hover:to-[#eab308]",
          "hover:text-black hover:border-transparent",
          "hover:shadow-[0_4px_14px_0_rgba(212,160,10,0.3)]",
          "hover:-translate-y-0.5",
        ],
        ghost: ["text-foreground", "hover:bg-muted", "hover:text-foreground"],
        link: ["text-[#2563eb] underline-offset-4", "hover:underline"],
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface PremiumButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof premiumButtonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        className={cn(premiumButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Shine effect overlay */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />

        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);
PremiumButton.displayName = "PremiumButton";

// ============================================================
// PREMIUM CARD
// ============================================================

const premiumCardVariants = cva(
  "relative overflow-hidden rounded-xl transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: [
          "bg-card border border-border/50",
          "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.03)]",
          "hover:border-[#2563eb]/20",
          "hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-4px_rgba(0,0,0,0.03)]",
          "hover:-translate-y-1",
        ],
        elevated: [
          "bg-card border border-border/50",
          "shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)]",
          "hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)]",
          "hover:-translate-y-2",
        ],
        gold: [
          "bg-card",
          "border border-[#d4a00a]/20",
          "shadow-[0_4px_14px_0_rgba(212,160,10,0.1)]",
          "hover:border-[#d4a00a]/40",
          "hover:shadow-[0_0_20px_-5px_rgba(212,160,10,0.3)]",
          "hover:-translate-y-1",
        ],
        glass: [
          "backdrop-blur-xl",
          "bg-background/80",
          "border border-border/50",
          "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]",
        ],
        gradient: [
          "bg-gradient-to-br from-card via-card to-muted/50",
          "border border-border/50",
          "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]",
          "hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)]",
        ],
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  },
);

export interface PremiumCardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof premiumCardVariants> {
  hoverEffect?: boolean;
  glowOnHover?: "primary" | "gold" | false;
}

const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  (
    {
      className,
      variant,
      padding,
      hoverEffect = true,
      glowOnHover = false,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          premiumCardVariants({ variant, padding }),
          !hoverEffect && "hover:transform-none hover:shadow-none",
          className,
        )}
        {...props}
      >
        {/* Gradient overlay on hover */}
        {hoverEffect && (
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-[#2563eb]/[0.02] to-[#d4a00a]/[0.01]" />
        )}

        {/* Glow effect */}
        {glowOnHover && (
          <div
            className={cn(
              "absolute -inset-px rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl",
              glowOnHover === "primary" && "bg-[#2563eb]/20",
              glowOnHover === "gold" && "bg-[#d4a00a]/20",
            )}
          />
        )}

        <div className="relative z-10">{children}</div>
      </div>
    );
  },
);
PremiumCard.displayName = "PremiumCard";

// ============================================================
// PREMIUM BADGE
// ============================================================

const premiumBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200",
  {
    variants: {
      variant: {
        primary: ["text-white", "bg-gradient-to-r from-[#1e40af] to-[#2563eb]"],
        gold: [
          "text-black",
          "bg-gradient-to-r from-[#a16207] via-[#d4a00a] to-[#eab308]",
        ],
        outline: ["border-2 border-[#2563eb] text-[#2563eb]", "bg-transparent"],
        outlineGold: [
          "border-2 border-[#d4a00a] text-[#d4a00a]",
          "bg-transparent",
        ],
        success:
          "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
        error: "bg-red-500/10 text-red-500 border border-red-500/20",
        info: "bg-sky-500/10 text-sky-500 border border-sky-500/20",
      },
      size: {
        sm: "h-5 px-2 text-[10px]",
        md: "h-6 px-2.5 text-xs",
        lg: "h-7 px-3 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface PremiumBadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof premiumBadgeVariants> {
  pulse?: boolean;
}

const PremiumBadge = React.forwardRef<HTMLSpanElement, PremiumBadgeProps>(
  ({ className, variant, size, pulse, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          premiumBadgeVariants({ variant, size }),
          pulse && "animate-pulse",
          className,
        )}
        {...props}
      >
        {children}
      </span>
    );
  },
);
PremiumBadge.displayName = "PremiumBadge";

// ============================================================
// PREMIUM INPUT
// ============================================================

export interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ className, label, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-foreground">{label}</label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "flex h-11 w-full rounded-lg border bg-background px-4 py-2 text-sm transition-all duration-200",
              "border-border",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error &&
                "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);
PremiumInput.displayName = "PremiumInput";

// ============================================================
// PREMIUM DIVIDER
// ============================================================

interface PremiumDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gold" | "gradient";
  label?: string;
}

const PremiumDivider = React.forwardRef<HTMLDivElement, PremiumDividerProps>(
  ({ className, variant = "default", label, ...props }, ref) => {
    const lineClass = cn(
      "h-px flex-1",
      variant === "default" && "bg-border",
      variant === "gold" &&
        "bg-gradient-to-r from-transparent via-[#d4a00a] to-transparent",
      variant === "gradient" &&
        "bg-gradient-to-r from-transparent via-border to-transparent",
    );

    if (label) {
      return (
        <div
          ref={ref}
          className={cn("flex items-center gap-4", className)}
          {...props}
        >
          <div className={lineClass} />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {label}
          </span>
          <div className={lineClass} />
        </div>
      );
    }

    return <div ref={ref} className={cn(lineClass, className)} {...props} />;
  },
);
PremiumDivider.displayName = "PremiumDivider";

// ============================================================
// PREMIUM SECTION HEADER
// ============================================================

interface PremiumSectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  badge?: string;
  align?: "left" | "center";
}

const PremiumSectionHeader = React.forwardRef<
  HTMLDivElement,
  PremiumSectionHeaderProps
>(({ className, title, subtitle, badge, align = "left", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "space-y-2",
        align === "center" && "text-center",
        className,
      )}
      {...props}
    >
      {badge && (
        <PremiumBadge variant="gold" size="sm" className="mb-2">
          {badge}
        </PremiumBadge>
      )}
      <h2 className="relative inline-block text-3xl font-bold tracking-tight">
        <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
          {title}
        </span>
        {/* Gold underline accent */}
        <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-[#d4a00a] to-[#eab308] rounded-full" />
      </h2>
      {subtitle && (
        <p className="text-muted-foreground max-w-2xl">{subtitle}</p>
      )}
    </div>
  );
});
PremiumSectionHeader.displayName = "PremiumSectionHeader";

// ============================================================
// PREMIUM STAT CARD
// ============================================================

interface PremiumStatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  change?: {
    value: number;
    trend: "up" | "down";
  };
  icon?: React.ReactNode;
}

const PremiumStatCard = React.forwardRef<HTMLDivElement, PremiumStatCardProps>(
  ({ className, label, value, change, icon, ...props }, ref) => {
    return (
      <PremiumCard ref={ref} className={className} {...props}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p
                className={cn(
                  "text-sm font-medium flex items-center gap-1",
                  change.trend === "up" ? "text-emerald-500" : "text-red-500",
                )}
              >
                {change.trend === "up" ? "↑" : "↓"}
                {Math.abs(change.value)}%
              </p>
            )}
          </div>
          {icon && (
            <div className="p-2 rounded-lg bg-[#2563eb]/10 text-[#2563eb]">
              {icon}
            </div>
          )}
        </div>
      </PremiumCard>
    );
  },
);
PremiumStatCard.displayName = "PremiumStatCard";

// ============================================================
// EXPORTS
// ============================================================

export {
  PremiumButton,
  premiumButtonVariants,
  PremiumCard,
  premiumCardVariants,
  PremiumBadge,
  premiumBadgeVariants,
  PremiumInput,
  PremiumDivider,
  PremiumSectionHeader,
  PremiumStatCard,
};
