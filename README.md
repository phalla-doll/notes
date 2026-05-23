# Infinite Markdown Canvas
## Product Architecture & Technical Specification

---

# Product Vision

An infinite spatial markdown workspace where users can:
- create markdown notes on an infinite canvas
- visually organize ideas spatially
- zoom in/out to explore knowledge
- connect notes with relationships
- navigate information like a map instead of folders

The product combines:
- Infinite canvas UX
- Markdown-first note taking
- Knowledge graph concepts
- Spatial memory
- Semantic zooming
- Modern collaborative web technologies

---

# Core Philosophy

Traditional note-taking apps organize notes using:
- folders
- tags
- search

This product organizes knowledge using:
- space
- visual proximity
- connections
- clusters
- zoom levels

The canvas itself becomes the knowledge system.

---

# Core Product Principles

## 1. Infinite First
No pages.
No folders.
No boundaries.

Everything exists on one infinite workspace.

---

## 2. Markdown Native
Markdown is the source of truth.

Users own:
- plain text
- portability
- easy export
- future-proof notes

---

## 3. Spatial Thinking
Users remember:
- where ideas are
- nearby concepts
- clusters of notes

The system should amplify human spatial memory.

---

## 4. Semantic Zoom
Zoom level changes note detail.

Example:
- Far zoom → only titles
- Medium zoom → previews
- Close zoom → full editor

---

## 5. Fast Always
Performance is critical.

Even with:
- thousands of notes
- large canvases
- markdown rendering
- backlinks
- AI features

The app must remain smooth.

---

# Recommended Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js App Router |
| UI Framework | React |
| Language | TypeScript |
| Canvas Engine | TLDraw |
| Styling | TailwindCSS |
| UI Components | shadcn/ui |
| Database | Cloudflare D1 |
| Auth | WorkOS |
| File Storage | Cloudflare R2 |
| Hosting | Cloudflare Pages |
| Sync Layer | Durable Objects |
| Local Cache | IndexedDB |
| Realtime | Yjs |
| Markdown Parsing | remark + rehype |
| Search | MiniSearch or FlexSearch |
| State Management | Zustand |
| AI Features | OpenAI / Anthropic |
| Analytics | PostHog |
| Background Jobs | Cloudflare Queues |

---

# Why This Stack Works

## Next.js
Perfect for:
- app architecture
- API routes
- server rendering
- edge deployment
- React ecosystem

---

## TLDraw
Handles:
- infinite canvas
- zooming
- panning
- spatial interactions
- shapes
- multiplayer-ready foundation

This removes years of canvas engineering work.

---

## shadcn/ui
Perfect for:
- UI components built on Radix UI primitives
- TailwindCSS-native styling (fits existing stack)
- copy-paste ownership model (no dependency lock-in)
- provides toolbars, dialogs, context menus, dropdowns, tooltips needed for canvas UI
- fully accessible and customizable

---

## Cloudflare Stack
Using:
- D1
- R2
- Durable Objects
- Pages
- Queues

Creates:
- low-cost infra
- edge-native architecture
- global performance
- scalable realtime systems

Excellent for startup cost efficiency.

---

# High-Level Architecture

```txt
┌─────────────────────────────┐
│         Frontend            │
│       Next.js + TLDraw      │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│      API / Edge Layer       │
│      Next.js Route APIs     │
└─────────────┬───────────────┘
              │
    ┌─────────┴─────────┐
    ▼                   ▼
┌───────────┐    ┌────────────┐
│ Cloudflare│    │ Durable    │
│ D1        │    │ Objects    │
└───────────┘    └────────────┘
        │               │
        ▼               ▼
┌────────────┐   ┌────────────┐
│ R2 Storage │   │ Yjs Sync   │
└────────────┘   └────────────┘
```

---

# Core Data Model

---

# Workspace

```ts
type Workspace = {
  id: string
  name: string
  ownerId: string
  createdAt: number
  updatedAt: number
}
```

---

# Note Node

```ts
type NoteNode = {
  id: string

  workspaceId: string

  title: string

  markdown: string

  preview: string

  position: {
    x: number
    y: number
  }

  size: {
    width: number
    height: number
  }

  color?: string

  tags: string[]

  links: string[]

  createdAt: number
  updatedAt: number
}
```

---

# Canvas Metadata

```ts
type CanvasState = {
  workspaceId: string

  camera: {
    x: number
    y: number
    zoom: number
  }
}
```

---

# Relationships

```ts
type NoteConnection = {
  id: string

  fromNoteId: string
  toNoteId: string

  type:
    | 'reference'
    | 'related'
    | 'dependency'
    | 'idea'
}
```

---

# Database Schema (D1)

## notes

```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,

  title TEXT NOT NULL,
  markdown TEXT NOT NULL,
  preview TEXT,

  pos_x REAL NOT NULL,
  pos_y REAL NOT NULL,

  width REAL NOT NULL,
  height REAL NOT NULL,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

---

## note_links

```sql
CREATE TABLE note_links (
  id TEXT PRIMARY KEY,

  from_note_id TEXT NOT NULL,
  to_note_id TEXT NOT NULL,

  link_type TEXT NOT NULL
);
```

---

## workspaces

```sql
CREATE TABLE workspaces (
  id TEXT PRIMARY KEY,

  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

---

# Frontend Architecture

```txt
app/
├── workspace/
│   ├── [id]/
│   │   ├── page.tsx
│   │   ├── editor/
│   │   ├── canvas/
│   │   ├── components/
│   │   └── hooks/
```

---

# Main Canvas Flow

```txt
Workspace Page
    ↓
TLDraw Canvas
    ↓
Custom Markdown Shape
    ↓
Virtualized Rendering
    ↓
IndexedDB Cache
    ↓
Sync Engine
```

---

# Custom TLDraw Shape

Core concept:
- each markdown note is a TLDraw shape

```tsx
MarkdownNoteShape
```

Responsibilities:
- markdown preview
- editing state
- semantic zoom
- backlinks
- drag/drop
- resizing

---

# Semantic Zoom System

## Zoom Levels

| Zoom | Display |
|---|---|
| 0%–20% | Colored blocks |
| 20%–40% | Titles only |
| 40%–70% | Preview text |
| 70%–100% | Full markdown |
| 100%+ | Rich editor |

---

# Rendering Optimization

Critical for scalability.

---

## Virtualization

Only render:
- notes visible in viewport
- nearby notes

Avoid rendering:
- offscreen markdown
- hidden editors

---

## Cached Markdown AST

DO NOT parse markdown every render.

Instead:
- parse once
- cache AST
- reuse rendered HTML

---

## Lazy Editor Mounting

Mount editor only:
- on focus
- on zoom threshold

Huge performance win.

---

# Recommended Editor Stack

## Markdown Editor

Recommended:
- TipTap
- Lexical
- Milkdown

Best option:
- TipTap

Why:
- extensible
- collaborative-ready
- React ecosystem
- markdown support

---

# Search System

Use:
- MiniSearch
- FlexSearch

Index:
- titles
- markdown
- tags
- backlinks

Future:
- semantic AI search

---

# Offline Support

Very important.

---

# Local Persistence

Use:
- IndexedDB

Store:
- recent workspaces
- note cache
- pending sync operations

---

# Sync Strategy

## Recommended

Use:
- optimistic updates
- local-first architecture

Flow:
```txt
User edits note
    ↓
Update local state instantly
    ↓
Persist IndexedDB
    ↓
Sync background
    ↓
Conflict resolution
```

---

# Realtime Collaboration

Phase 2 feature.

Recommended:
- Yjs
- Durable Objects

Why:
- CRDT-based
- conflict-free
- edge-friendly

---

# AI Features (Future)

---

# AI Clustering

Automatically:
- group notes
- detect themes
- create visual clusters

---

# AI Summaries

Generate:
- note summaries
- workspace summaries
- cluster summaries

---

# AI Relationships

Suggest:
- related notes
- missing links
- duplicate concepts

---

# AI Semantic Search

Search by meaning:
- not exact keywords

Example:
> "database optimization notes"

Even if exact words do not exist.

---

# Authentication

Recommended:
- WorkOS

Why:
- enterprise-grade SSO and directory sync
- managed authentication with minimal setup
- supports SAML, OIDC, and social login
- ideal for B2B and team collaboration features

---

# Storage Strategy

## D1
Store:
- metadata
- note structures
- relationships

---

## R2
Store:
- images
- attachments
- exports
- backups

---

# Performance Goals

| Metric | Goal |
|---|---|
| Initial Load | <2s |
| Canvas FPS | 60fps |
| Note Open | <50ms |
| Search Response | <100ms |
| Sync Latency | <300ms |

---

# MVP Scope

IMPORTANT:
Keep MVP extremely focused.

---

# MVP Features

## Required
- infinite canvas
- markdown notes
- drag/drop notes
- resize notes
- zoom/pan
- save/load
- backlinks
- search
- semantic zoom

---

## Skip Initially
- AI
- collaboration
- plugins
- mobile apps
- public sharing
- advanced permissions
- themes
- templates

---

# Suggested Development Phases

---

# Phase 1 — Foundation

Goal:
Basic infinite markdown canvas.

Features:
- TLDraw integration
- custom markdown note shape
- D1 persistence
- basic editor
- zoom system

---

# Phase 2 — Knowledge Graph

Features:
- backlinks
- note relationships
- graph navigation
- search engine

---

# Phase 3 — Collaboration

Features:
- realtime sync
- multiplayer
- shared workspaces

---

# Phase 4 — AI Layer

Features:
- AI clustering
- semantic search
- summaries
- smart linking

---

# Security Considerations

## Important
Markdown rendering must sanitize HTML.

Use:
- rehype-sanitize

Avoid:
- XSS injections

---

# Potential Future Features

## Canvas Templates
- project planning
- research maps
- software architecture

---

## Git-Like History
Visual workspace versioning.

---

## Time Machine View
See note evolution over time.

---

## Whiteboard + Markdown Hybrid
Mix:
- drawings
- markdown
- diagrams
- screenshots

---

# Competitive Positioning

| Product | Difference |
|---|---|
| Obsidian | Spatial-first |
| Notion | Infinite canvas |
| Miro | Markdown-native |
| FigJam | Knowledge management |
| Capacities | Better infinite UX |

---

# Product Positioning

## Main Tagline Ideas

### Option 1
"Your thoughts deserve infinite space."

### Option 2
"Markdown meets infinite canvas."

### Option 3
"The spatial note-taking workspace."

### Option 4
"Think visually. Write naturally."

---

# Recommended Open Source Libraries

| Purpose | Library |
|---|---|
| Canvas | TLDraw |
| Markdown | remark |
| Editor | TipTap |
| Search | FlexSearch |
| State | Zustand |
| Realtime | Yjs |
| Validation | Zod |
| Database ORM | Drizzle ORM |
| Animations | Framer Motion |
| UI Components | shadcn/ui |

---

# Suggested Folder Structure

```txt
src/
├── app/
├── components/
├── editor/
├── canvas/
├── database/
├── hooks/
├── lib/
├── services/
├── stores/
├── workers/
└── types/
```

---

# Final Vision

This product should feel like:
- Figma for thoughts
- Obsidian without folders
- Google Maps for knowledge
- A second brain with spatial memory

The key differentiator is not markdown.

The differentiator is:
- infinite spatial organization
- semantic zoom
- visual thinking
- overview at scale

That is the true innovation.
