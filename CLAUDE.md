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
- `analyse` accepts `{ imageBase64, mimeType, context? }` (an optional designer-supplied string injected into the prompt after the role line — empty/missing context produces a byte-identical prompt to before); `stress`, `roast` accept `{ imageBase64, mimeType }`; `brief` takes `{ requirements }`; `stakeholder` takes `{ analysisResult }` and reframes it in business language.

When editing prompts, the JSON shape in the prompt and the keys the frontend reads (`app/analyse/page.tsx`, `components/ResultsDashboard.tsx`) must stay in sync — the parser does no schema validation, missing fields just become `undefined`.

### Scoring pipeline (analyse only)

`/api/analyse` is the only route that runs deterministic post-processing on the model output:

1. Claude returns issues with a `type` field constrained to one of: `missing_cta`, `low_contrast`, `too_many_cta`, `cluttered_layout`, `poor_spacing`, `other`.
2. `lib/scoringEngine.ts` maps each `type` to a fixed point deduction and category (clarity / hierarchy / accessibility / cognitive_load / consistency), starting from 100.
3. `lib/benchmarkEngine.ts` turns the score + issue types into a percentile-style benchmark string and message.

Both functions are pure and table-driven — to tune scoring, edit the `DEDUCTIONS` / `CATEGORY_MAX` tables, not the call sites. The other AI routes do **not** go through this pipeline; they return Claude's JSON as-is.

### UI

- **`app/page.tsx`** — marketing homepage. Single client component with a particle `BlastCanvas`, 3D-parallax hero card, critique typewriter, scroll-snap service cards, and CTAs that open the analyse/brief modals. Uses `lenis` (smooth scroll) and `gsap` + `ScrollTrigger` (scroll-driven reveals) — both dynamic-imported. Returns a fullscreen `#08090F` div until the mount effect resolves so the splash never lets the homepage flash through.
- **`app/analyse/page.tsx`** — the audit tool (single ~1200-line client component holding the home, analysing, results, briefing, stress, roast, and stakeholder screens). On mount it reads `sessionStorage` keys `designBestiPendingAnalyse` / `designBestiPendingBrief` (written by the homepage modals), hydrates `imagePreview` / `fileName` / `context` / `briefText`, and jumps straight to `screen === "analysing"` or `"briefing"` — direct navigation still lands on `HomeScreen`. The page renders a fullscreen `#08090F` div until `bootChecked` flips, so users from the modals never see `HomeScreen`.
- **`components/AnalyseModal.tsx` / `components/BriefModal.tsx`** — overlays on the homepage. Modal-side gating uses `useAuth`; on submit, stashes `{ imagePreview, fileName, context }` (or `{ briefText }`) into `sessionStorage` and `window.location.href = '/analyse'`. A `navigating` state replaces the modal with a fullscreen `#08090F` cover before navigation so the homepage is never visible between submit and route change.
- **`components/SplashScreen.tsx`** — first-visit-only splash. Cycles "Design Besti" through 13 languages, reveals the logo, zoom-dissolves into the homepage. Persistence via `sessionStorage` key `designBestiSplashSeen` — closes-tab-resets, by design.
- **`<html>` and `<body>`** are forced to `background: #08090F` in `app/layout.tsx` so hard navigations between routes never flash a white frame.
- **`components/ui/*`** is shadcn/ui (style: "new-york", icons: lucide). Don't hand-roll primitives — extend the existing ones.
- Tailwind v4 with `@tailwindcss/postcss`; design tokens live in `app/globals.css`.

### Modal → /analyse handoff (the no-flash chain)

Three independent dark-cover gates ensure no homepage frame is ever visible after a modal submit:

1. Modal flips `navigating=true` → renders a fullscreen `#08090F` div instead of the card.
2. Hard navigation begins; `<html>`/`<body>` are already `#08090F` so even raw browser paint stays dark.
3. `/analyse` first render returns a `#08090F` div (`!bootChecked`), then in a single batched effect: reads `sessionStorage`, hydrates state, calls `setScreen("analysing"|"briefing")`, sets `bootChecked=true`. Render-2 is the analysing screen.

Touching any of these three gates — modal `navigating`, layout body bg, or `/analyse` `bootChecked` — risks reintroducing the flash.

## Built today (2026-05-02)

- New homepage at `app/page.tsx` with `BlastCanvas` particles, 3D parallax, critique typewriter, service cards.
- `SplashScreen` at `components/SplashScreen.tsx` — multilingual cycling words, logo reveal, zoom dissolve.
- `AnalyseModal` at `components/AnalyseModal.tsx` — dark-glass theme, drag/drop upload, context field wired through to `/api/analyse`.
- `BriefModal` at `components/BriefModal.tsx` — matching theme.
- Audit tool moved from `app/page.tsx` to `app/analyse/page.tsx`.
- Flash fixes — black-screen transition before analysing, body bg locked to `#08090F`.
- `lenis` and `gsap` installed via pnpm.
- `public/` folder created (still needs `macbook.png`; metadata icons in `app/layout.tsx` will 404 until added).

## Next session priorities

1. **Login flow fix** — urgent, needed before paywall work.
2. **First 5 Seconds Test** — new mode.
3. **Results page redesign** — clearer score, issues, fixes layout.
4. **Show context on results page** (the value submitted via the modal is already in state at `/analyse`, just not displayed).
5. **Modal final polish.**

## Future roadmap

- Shareable results card.
- Debate Mode.
- Conversion Predictor (multi-screen upload).
- Paywall + Stripe — Free 5/month, Starter $9, Pro $19.
- Design Memory — version comparison.
- Figma plugin.
- Accessibility lawsuit risk score.
- Presentation generator — PDF + PPTX.
- Marketing automation — newsletter + social-media AI agent.
