# Soefia Deal Lab

A standalone GTM proof-of-value tool. A Soefia rep turns a skeptical prospect's
workforce question into a free, evidence-based **team readiness report** in
minutes — creating a magic moment and a clear paid expansion path.

This is a **self-contained hackathon MVP**. It does not touch the existing
`author-assistant` or `skill-insights` repos. All state is local
(`localStorage`) and all scoring is **deterministic**, so every demo is
repeatable.

## Run it locally

```bash
cd deal-lab
pnpm install
pnpm dev
```

Open **http://localhost:3000**.

| Script           | What it does                          |
| ---------------- | ------------------------------------- |
| `pnpm dev`       | Start the dev server (Turbopack)      |
| `pnpm build`     | Production build                      |
| `pnpm start`     | Serve the production build            |
| `pnpm typecheck` | `tsc --noEmit`                        |
| `pnpm lint`      | ESLint (next config)                  |

## The four screens

| Route          | Screen                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| `/`            | **GTM Launcher** — the rep creates a Proof Pack (prefilled w/ Acme)    |
| `/pack/[id]`   | **Rep workspace** — proof pack details + internal **GTM Follow-up**    |
| `/p/[id]`      | **Prospect checkup** — lightweight 8-question readiness assessment     |
| `/report/[id]` | **Executive Report** — the shareable centerpiece (always demo-ready)   |

A pre-seeded **Acme Health** demo pack always exists at `acme-demo`, so
`/report/acme-demo` works cold without creating anything.

## 2-minute demo script

1. **Launcher** (`/`) — "A prospect is rolling out AI but doesn't know if the
   team is ready." Hit **Create Proof Pack** (Acme Health is prefilled).
2. **Rep workspace** (`/pack/...`) — copy the prospect link, show the skill
   pack, then open the **GTM Follow-up** tab: talk track, intent signals, and a
   ready-to-send email.
3. **Prospect checkup** (`/p/...`) — a buyer's team member answers 8 quick
   questions. Low-effort, no login.
4. **Executive Report** (`/report/...`) — the centerpiece. Readiness verdict,
   recommended lead, skill gaps, build-vs-hire, evidence, and the paid
   benchmark next step.
5. **Viral loop** — **Share report** unlocks 3 more free scoring reports,
   giving GTM a built-in expansion motion.

## How it works

- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 ·
  lucide-react. Design tokens + the Manrope/Fraunces pairing mirror the real
  Soefia product so Deal Lab feels native.
- **Data model** (`lib/types.ts`): `ProofPack`, `Prospect`, `Participant`,
  `Skill`, `SkillScore`, `Recommendation`, `ShareEvent` / free credits.
- **Deterministic engine** (`lib/generate.ts`): scores are seeded from stable
  strings (skill baseline + per-person talent + per-cell variance), so the same
  inputs always produce the same report. Charts are hand-built SVG.
- **Skills** are framed as **BESSI-aligned skill domains** — an indicative
  readiness model for evaluation, not a clinical or certified instrument.

> Hackathon scope: no real auth, email, or backend. To reset all local state,
> clear the site's `localStorage`.
