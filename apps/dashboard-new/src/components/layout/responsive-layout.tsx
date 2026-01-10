"use client";

// ============================================================
// NEXIFY AI - RESPONSIVE LAYOUT
// Mobile-First, Touch-Optimized Layout System
// ============================================================

import * as React from "react";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// ============================================================
// RESPONSIVE CONTEXT
// ============================================================

interface ResponsiveContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const ResponsiveContext = React.createContext<
  ResponsiveContextType | undefined
>(undefined);

export function useResponsive() {
  const context = React.useContext(ResponsiveContext);
  if (!context) {
    throw new Error("useResponsive must be used within ResponsiveProvider");
  }
  return context;
}

// ============================================================
// RESPONSIVE PROVIDER
// ============================================================

interface ResponsiveProviderProps {
  children: React.ReactNode;
}

export function ResponsiveProvider({ children }: ResponsiveProviderProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(true);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  React.useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);

      // Auto-close mobile sidebar on resize to desktop
      if (width >= 1024) {
        setSidebarOpen(false);
      }
    };

    checkBreakpoint();
    window.addEventListener("resize", checkBreakpoint);
    return () => window.removeEventListener("resize", checkBreakpoint);
  }, []);

  const value = React.useMemo(
    () => ({
      isMobile,
      isTablet,
      isDesktop,
      sidebarOpen,
      setSidebarOpen,
      sidebarCollapsed,
      setSidebarCollapsed,
    }),
    [isMobile, isTablet, isDesktop, sidebarOpen, sidebarCollapsed],
  );

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
}

// ============================================================
// APP SHELL - Main Layout Container
// ============================================================

interface AppShellProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}

export function AppShell({
  children,
  sidebar,
  header,
  className,
}: AppShellProps) {
  const { isMobile, sidebarOpen, setSidebarOpen, sidebarCollapsed } =
    useResponsive();

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Mobile Sidebar (Sheet) */}
      {isMobile && sidebar && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent
            side="left"
            className="w-[var(--sidebar-width-mobile)] p-0"
          >
            {sidebar}
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && sidebar && (
        <aside
          className={cn(
            "fixed left-0 top-0 z-30 h-screen border-r bg-card transition-all duration-300",
            sidebarCollapsed
              ? "w-[var(--sidebar-width-collapsed)]"
              : "w-[var(--sidebar-width)]",
          )}
        >
          {sidebar}
        </aside>
      )}

      {/* Main Content */}
      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          !isMobile &&
            sidebar &&
            (sidebarCollapsed
              ? "ml-[var(--sidebar-width-collapsed)]"
              : "ml-[var(--sidebar-width)]"),
        )}
      >
        {/* Header */}
        {header && (
          <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {header}
          </header>
        )}

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

// ============================================================
// MOBILE HEADER
// ============================================================

interface MobileHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export function MobileHeader({
  title,
  showBackButton,
  onBack,
  actions,
  className,
}: MobileHeaderProps) {
  const { isMobile, setSidebarOpen } = useResponsive();

  if (!isMobile) return null;

  return (
    <div
      className={cn("flex h-14 items-center gap-2 px-4 safe-top", className)}
    >
      {showBackButton ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="touch-target shrink-0"
          aria-label="Zurück"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="touch-target shrink-0"
          aria-label="Menü öffnen"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {title && (
        <h1 className="flex-1 truncate text-lg font-semibold">{title}</h1>
      )}

      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </div>
  );
}

// ============================================================
// PAGE CONTAINER - Responsive padding and max-width
// ============================================================

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: boolean;
}

export function PageContainer({
  children,
  className,
  maxWidth = "xl",
  padding = true,
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "mx-auto w-full",
        maxWidthClasses[maxWidth],
        padding && "px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ============================================================
// RESPONSIVE GRID
// ============================================================

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "none" | "sm" | "md" | "lg";
}

export function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, sm: 2, lg: 3, xl: 4 },
  gap = "md",
}: ResponsiveGridProps) {
  const gapClasses = {
    none: "gap-0",
    sm: "gap-2 sm:gap-3",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8",
  };

  // Build grid-cols classes
  const colClasses = [
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("grid", colClasses, gapClasses[gap], className)}>
      {children}
    </div>
  );
}

// ============================================================
// BOTTOM NAVIGATION (Mobile)
// ============================================================

interface BottomNavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

interface BottomNavProps {
  items: BottomNavItem[];
  onNavigate?: (href: string) => void;
  className?: string;
}

export function BottomNav({ items, onNavigate, className }: BottomNavProps) {
  const { isMobile } = useResponsive();

  if (!isMobile) return null;

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur safe-bottom",
        "supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      <div className="flex h-16 items-center justify-around">
        {items.map((item) => (
          <button
            key={item.href}
            onClick={() => onNavigate?.(item.href)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2 touch-target",
              "text-muted-foreground transition-colors",
              item.active && "text-primary",
            )}
            aria-label={item.label}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ============================================================
// FLOATING ACTION BUTTON (Mobile)
// ============================================================

interface FABProps {
  icon: React.ReactNode;
  onClick?: () => void;
  label: string;
  className?: string;
  position?: "bottom-right" | "bottom-center";
}

export function FAB({
  icon,
  onClick,
  label,
  className,
  position = "bottom-right",
}: FABProps) {
  const { isMobile } = useResponsive();

  const positionClasses = {
    "bottom-right": "right-4 bottom-20",
    "bottom-center": "left-1/2 -translate-x-1/2 bottom-20",
  };

  return (
    <Button
      size="lg"
      onClick={onClick}
      className={cn(
        "fixed z-40 h-14 w-14 rounded-full shadow-lg",
        "bg-brand-gradient hover:opacity-90",
        positionClasses[position],
        isMobile && "safe-bottom",
        className,
      )}
      aria-label={label}
    >
      {icon}
    </Button>
  );
}

// ============================================================
// PULL TO REFRESH (Mobile)
// ============================================================

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  className,
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const startY = React.useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0 && !isRefreshing) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;
      if (diff > 50) {
        setIsPulling(true);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (isPulling && !isRefreshing) {
      setIsPulling(false);
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn("overflow-auto", className)}
    >
      {(isPulling || isRefreshing) && (
        <div className="flex items-center justify-center py-4">
          <div
            className={cn(
              "h-6 w-6 rounded-full border-2 border-primary border-t-transparent",
              isRefreshing && "animate-spin",
            )}
          />
        </div>
      )}
      {children}
    </div>
  );
}

// ============================================================
// EXPORTS
// ============================================================

export {
  type ResponsiveContextType,
  type AppShellProps,
  type MobileHeaderProps,
  type PageContainerProps,
  type ResponsiveGridProps,
  type BottomNavItem,
  type BottomNavProps,
  type FABProps,
  type PullToRefreshProps,
};
