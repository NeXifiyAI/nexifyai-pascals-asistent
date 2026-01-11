#!/usr/bin/env tsx

import { validateEnv } from "../lib/env-validator";

console.log("🔍 Validating environment for dashboard-new...\n");

validateEnv();

console.log("\n✅ Environment validation complete");
