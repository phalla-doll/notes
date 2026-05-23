# AGENTS.md

## Project

Infinite Markdown Canvas — a spatial markdown note-taking app built with Next.js + Excalidraw. Early stage; currently uses Excalidraw as the canvas engine with markdown notes projected onto native canvas elements.

## Commands

- `pnpm dev` — dev server (uses Turbopack)
- `pnpm build` — production build
- `pnpm lint` — ESLint (next core-web-vitals + typescript configs)
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm format` — Prettier (writes in-place)

Run `lint` then `typecheck` after changes.

## Stack

- **Runtime**: pnpm, Node, Next.js 16 (App Router), React 19, TypeScript
- **UI**: Tailwind CSS v4, shadcn/ui (radix-nova style, hugeicons), `class-variance-authority`
- **Font**: Geist (sans) + Geist Mono, loaded via `next/font/google`
- **Path alias**: `@/*` maps to repo root

## Conventions

- **Prettier**: 4-space indent, double quotes, no semicolons, trailing comma es5, `prettier-plugin-tailwindcss` for class sorting
- **shadcn/ui**: components live in `components/ui/`; managed via `shadcn` CLI (style `radix-nova`, icon library `hugeicons`)
- **Theme**: dark mode via `next-themes` (`ThemeProvider` in root layout)
- **CSS**: Tailwind v4 with `@tailwindcss/postcss`; global styles in `app/globals.css`; CSS variables enabled

## Directory Layout

- `app/` — Next.js App Router pages/layouts
- `components/` — shared components; `components/ui/` for shadcn
- `hooks/` — custom React hooks
- `lib/` — utilities (`cn` in `lib/utils.ts`)
- `public/` — static assets

## Architecture Notes (from README spec)

The README describes the target architecture: Excalidraw canvas with markdown note projection, semantic zoom, D1/R2/Durable Objects backend, Yjs realtime sync, TipTap editor.
