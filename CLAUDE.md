# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (lockfile: `pnpm-lock.yaml`).

- `pnpm dev` — run Next.js dev server
- `pnpm build` — production build (`next build`)
- `pnpm start` — serve the production build
- `pnpm lint` — `eslint .` (no test runner is configured)

`next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so `pnpm build` will succeed even with TS errors. To actually type-check, run `pnpm exec tsc --noEmit` separately — don't rely on the build to catch type problems.

## Required environment variables

All three are required. The Supabase ones are read on both client and server; `ANTHROPIC_API_KEY` is server-only.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`

## Architecture

Next.js 16 App Router + React 19 + TypeScript, Tailwind v4, shadcn/ui (`components/ui/*`, see `components.json`), Supabase auth, and the Anthropic Messages API. Path alias `@/*` maps to repo root.

### Two-layer auth/gating

1. **Edge middleware** (`middleware.ts`) runs on every page route (to keep the Supabase session fresh) and on all `/api/{analyse,stress,roast,stakeholder,brief}` routes (to enforce auth). Protected API calls without a session return `401 { error: "auth_required" }`. There is also a **private-beta whitelist** — `ALLOWED_EMAILS` in `middleware.ts`. When non-empty, only those emails can hit protected APIs (returns `403 not_allowed`); when empty, any signed-in user passes. Toggle beta access by editing this array.
2. **Client gating** via `useGatedAction` (`hooks/useGatedAction.ts`) wraps any handler so it opens the login modal instead of firing when the user is signed out. Use it for buttons that trigger protected APIs so users hit the modal before the network round-trip. Auth state lives in `contexts/AuthContext.tsx` (Google OAuth via Supabase, redirect through `/auth/callback`). `app/layout.tsx` mounts `<AuthProvider>` and `<LoginModal>` at the root.

If you add a new protected API route, update **both** `PROTECTED_API_ROUTES` and the `matcher` in `middleware.ts`.

### Supabase clients — pick the right one

- `lib/supabase/client.ts` — browser (`createBrowserClient`). Use in client components.
- `lib/supabase/server.ts` — server (`createServerClient` with `next/headers` cookies). Use in route handlers / server components. Returns a `Promise` — `await createClient()`.
- `middleware.ts` instantiates its own server client because it needs the request/response cookie plumbing.

### AI route handlers — shared shape

`app/api/{analyse,stress,roast,stakeholder,brief}/route.ts` are all variations on the same template:

- `export const maxDuration = 60` (Vercel function timeout)
- POST → call Anthropic Messages API directly via `fetch` (no SDK) with `model: "claude-haiku-4-5-20251001"`
- Each prompt **embeds a strict JSON schema** in the user message and asks for raw JSON (no markdown). The handler strips ```` ```json ```` fences and falls back to slicing at the last `}` if `JSON.parse` fails.
- `analyse`, `stress`, `roast` accept `{ imageBase64, mimeType }`; `brief` takes `{ requirements }`; `stakeholder` takes `{ analysisResult }` and reframes it in business language.

When editing prompts, the JSON shape in the prompt and the keys the frontend reads (`app/page.tsx`, `components/ResultsDashboard.tsx`) must stay in sync — the parser does no schema validation, missing fields just become `undefined`.

### Scoring pipeline (analyse only)

`/api/analyse` is the only route that runs deterministic post-processing on the model output:

1. Claude returns issues with a `type` field constrained to one of: `missing_cta`, `low_contrast`, `too_many_cta`, `cluttered_layout`, `poor_spacing`, `other`.
2. `lib/scoringEngine.ts` maps each `type` to a fixed point deduction and category (clarity / hierarchy / accessibility / cognitive_load / consistency), starting from 100.
3. `lib/benchmarkEngine.ts` turns the score + issue types into a percentile-style benchmark string and message.

Both functions are pure and table-driven — to tune scoring, edit the `DEDUCTIONS` / `CATEGORY_MAX` tables, not the call sites. The other AI routes do **not** go through this pipeline; they return Claude's JSON as-is.

### UI

- `app/page.tsx` is a single ~1200-line client component holding the entire app flow (home, upload, results, multiple modes). New UI usually slots in here or as a sub-component imported from `components/`.
- `components/ui/*` is shadcn/ui (style: "new-york", icons: lucide). Don't hand-roll primitives — extend the existing ones.
- Tailwind v4 with `@tailwindcss/postcss`; design tokens live in `app/globals.css`.
