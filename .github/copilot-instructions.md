# NeXify AI - GitHub Copilot Instructions

## 🎯 Project Goal
Build a production-ready, autonomous AI assistant with "Dual-Brain" architecture (OpenAI fast-path + Qdrant deep-memory). Focus on performance (Next.js 14, BiomeJS), type-safety, and self-optimization.

## 🏗 Tech Stack & Architecture
- **Monorepo**: Turborepo, `pnpm` workspace (`apps/web`, `packages/mcp-server`).
- **Framework**: Next.js 14 (App Router), Vercel AI SDK.
- **Database**: PostgreSQL (Drizzle ORM), Qdrant (Vector DB), Redis.
- **Code Quality**: BiomeJS (Linter/Formatter). **DO NOT** use ESLint/Prettier.

## 🚨 Critical Rules (Ultracite Strict Mode)
1. **Accessibility**: NO `tabIndex > 0`. NO interactive roles on non-interactive elements. ALWAYS `alt` text.
2. **React**: Hooks only at top-level. NO array indices as keys. Don't pass `children` as props.
3. **TypeScript**: NO `any`. Prefer `interface` over `type`. Use generic `Array<T>` syntax.
4. **JS/TS Patterns**:
   - NO `arguments` object. NO `void` operators.
   - Use `date.now()` over `new Date()`.
   - Use `?.` (optional chaining) and `??` (nullish coalescing).
   - Use `for...of` instead of `forEach`.
5. **Imports**: No unused imports. Optimize `lucide-react` imports.

## 🛠️ Development Workflows
- **Package Manager**: ALWAYS use `pnpm` (never `npm` or `yarn`).
- **Start Dev**: `pnpm dev` (starts full turborepo stack).
- **Database Changes**:
  1. Modify `lib/db/schema.ts`.
  2. Run `pnpm db:generate`.
  3. Run `pnpm db:migrate`.
  4. **NEVER** modify SQL manually or skipping migration generation.
- **Docker**: `pnpm docker:up` initializes Postgres, Redis, and Qdrant.
- **Testing**: `pnpm test` (Vitest), `pnpm test:e2e` (Playwright).

## 🤖 AI & Artifacts
- **Model IDs**: Always use full provider prefix (e.g., `google/gemini-2.5-flash-lite`, `openai/gpt-5.2`).
- **Artifacts**: Use `functions` components in `artifacts/` for generating UI.
- **Message Schema**: Use `Message_v2` table. Stick to the `parts` array structure for multi-modal content.

## 📂 Key Files
- Config: `biome.jsonc`, `drizzle.config.ts`, `turbo.json`
- Logic: `lib/db/schema.ts` (DB Source of Truth), `lib/ai/models.ts` (Model Registry)
- Server: `app/api/mcp/` (MCP Protocol Implementation)
- UI: `components/ui/` (Shadcn - do not modify manually, use CLI)

## ❌ Common Pitfalls
- **Do not** use `npm install`. Use `pnpm install` at root.
- **Do not** create `eslint` configs. Biome handles everything.
- **Do not** hardcode API keys. Use `.env.local`.
