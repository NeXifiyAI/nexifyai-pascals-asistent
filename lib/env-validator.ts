#!/usr/bin/env tsx

const requiredEnvVars = [
  "OPENAI_API_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_QDRANT_URL",
  "NEXT_PUBLIC_API_URL",
];

const optionalEnvVars = [
  "NEXT_PUBLIC_VERCEL_URL",
  "NEXT_PUBLIC_APP_NAME",
  "VERCEL_TOKEN",
];

export function validateEnv(requiredOnly: boolean = false) {
  const missing: string[] = [];
  const missingOptional: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (!requiredOnly) {
    for (const envVar of optionalEnvVars) {
      if (!process.env[envVar]) {
        missingOptional.push(envVar);
      }
    }
  }

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((envVar) => console.error(`   - ${envVar}`));
    console.error(
      "\nPlease set these in your .env.local file or environment variables.",
    );
    process.exit(1);
  }

  if (missingOptional.length > 0) {
    console.warn("⚠️  Missing optional environment variables:");
    missingOptional.forEach((envVar) => console.warn(`   - ${envVar}`));
  }

  console.log("✅ Environment validation passed");
  console.log(
    `   Required: ${requiredEnvVars.length}/${requiredEnvVars.length - missing.length} set`,
  );
  console.log(
    `   Optional: ${optionalEnvVars.length - missingOptional.length}/${optionalEnvVars.length} set`,
  );
}

// Run validation if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateEnv();
}
