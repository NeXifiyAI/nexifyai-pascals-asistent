"use client";

/**
 * Simplified navigation hook without Clerk RBAC
 * All items are visible - no auth checks needed for now
 */

import { useMemo } from "react";
import type { NavItem } from "@/types";

/**
 * Hook to filter navigation items - simplified version without auth
 */
export function useFilteredNavItems(items: NavItem[]) {
  // Simply return all items - no RBAC filtering needed yet
  const filteredItems = useMemo(() => {
    return items.map((item) => {
      // Keep all items and their children
      return {
        ...item,
        items: item.items || [],
      };
    });
  }, [items]);

  return filteredItems;
}
