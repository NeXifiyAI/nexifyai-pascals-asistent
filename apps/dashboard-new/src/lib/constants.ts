export const APP_NAME = "NeXify AI Dashboard" as const;
export const APP_VERSION = "1.0.0" as const;
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || ("/api" as const);
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as const;
export const QDRANT_URL = process.env.NEXT_PUBLIC_QDRANT_URL as const;
export const MAX_RETRIES = 3 as const;
export const TIMEOUT_MS = 30000 as const;
export const DEFAULT_PAGE_SIZE = 20 as const;
