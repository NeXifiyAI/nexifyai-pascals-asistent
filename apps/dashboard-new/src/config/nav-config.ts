import { NavItem } from "@/types";

/**
 * NeXify AI Navigation Configuration
 *
 * Main sections:
 * - Chat: AI conversation interface (main feature)
 * - Brain: Knowledge management and memory
 * - Tools: MCP tools and capabilities
 * - Analytics: Usage stats and insights
 * - Settings: Configuration
 */
export const navItems: NavItem[] = [
  {
    title: "Chat",
    url: "/dashboard/chat",
    icon: "chat",
    isActive: false,
    shortcut: ["c", "c"],
    items: [],
  },
  {
    title: "Brain",
    url: "/dashboard/brain",
    icon: "brain",
    isActive: false,
    shortcut: ["b", "b"],
    items: [],
  },
  {
    title: "Tools",
    url: "/dashboard/tools",
    icon: "tools",
    isActive: false,
    shortcut: ["t", "t"],
    items: [],
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: "dashboard",
    isActive: false,
    shortcut: ["a", "a"],
    items: [],
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: "settings",
    isActive: false,
    shortcut: ["s", "s"],
    items: [],
  },
];
