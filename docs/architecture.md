# Architecture Review — Infinite Markdown Canvas

**Date:** 2026-05-23
**Status:** Greenfield review — proposed module boundaries before code is written.

---

## Context

The codebase is a fresh scaffold — one page with a button. This review proposes module boundaries using the README spec as the domain model. Each candidate identifies a module that should be **deep** from the start, with the interface that gives callers leverage and maintainers locality.

---

## Glossary

- **Module** — anything with an interface and an implementation (function, class, package, slice).
- **Interface** — everything a caller must know to use the module: types, invariants, error modes, ordering, config.
- **Implementation** — the code inside a module.
- **Depth** — leverage at the interface: a lot of behaviour behind a small interface. Deep = high leverage. Shallow = interface nearly as complex as the implementation.
- **Seam** — where an interface lives; a place behaviour can be altered without editing in place.
- **Adapter** — a concrete thing satisfying an interface at a seam.
- **Leverage** — what callers get from depth.
- **Locality** — what maintainers get from depth: change, bugs, knowledge concentrated in one place.
- **One adapter = hypothetical seam. Two adapters = real seam.**

---

## Candidate 1: Note Shape Module

**Strength:** Strong | **Category:** in-process

### Files

- `canvas/excalidraw-canvas.tsx` — Excalidraw adapter and note projection
- `canvas/hooks/use-zoom.ts` — Zoom-derived rendering state
- `editor/markdown-editor.tsx` — TipTap editor (lazy-mounted)
- `lib/markdown.ts` — remark/rehype pipeline

### Problem

If note rendering, zoom, editor mounting, and markdown parsing are spread across the canvas layer, every canvas caller must know zoom thresholds, editor lifecycle, and markdown AST caching. Shallow modules with wide interfaces.

### Solution

One deep **Note Projection** module. Interface: note data + zoom level → canvas elements and editor state. Internally owns markdown parsing, semantic zoom dispatch, and lazy TipTap mounting. Excalidraw sees native elements; the canvas page sees a component.

### Before

```
Canvas Page
  → Excalidraw Component
    → Note Projection
      → Markdown Parser
      → TipTap Editor
      → Zoom Logic
      → Resize Handler
      → Drag Handler
```

All scattered. Shape renderer is shallow — interface nearly matches implementation.

### After

```
Canvas Page
  → Excalidraw Component
    → Note Projection (deep module)
         ├─ Markdown Parser
         ├─ Semantic Zoom
         ├─ TipTap Editor (lazy mount)
         └─ Resize / Drag
```

One deep module. Callers pass note + zoom, get JSX.

### Wins

- **Leverage:** canvas page knows nothing about markdown or zoom
- **Locality:** all note-rendering bugs live in one module
- **Interface shrinks:** callers pass note + zoom, get JSX
- **Tests:** render at each zoom level through one interface

---

## Candidate 2: Persistence Module

**Strength:** Strong | **Category:** ports & adapters

### Files

- `persistence/index.ts` — Public interface (port)
- `persistence/adapters/d1-adapter.ts` — D1 production adapter
- `persistence/adapters/indexeddb-adapter.ts` — Offline cache adapter
- `persistence/adapters/in-memory-adapter.ts` — Test adapter
- `persistence/sync/sync-engine.ts` — Sync engine

### Problem

Without a persistence seam, every component that needs data reaches for `fetch()` or IndexedDB directly. Sync logic (optimistic updates, conflict resolution, offline queue) leaks into the canvas layer. Testing requires real D1 or manual mocking.

### Solution

Define a port: `saveNote()`, `loadWorkspace()`, `sync()`. Three adapters justify the seam: D1 (production), IndexedDB (offline cache), in-memory (tests). Sync engine lives inside the module, invisible to callers.

### Before

```
Canvas Page
  → fetch /api/notes
  → IndexedDB write
  → sync logic (leaked into canvas layer)
```

### After

```
Canvas Page
  → Persistence (deep module)
       ├─ Sync Engine
       │    ├─ seam → D1 Adapter → D1
       │    ├─ seam → IDB Adapter → IndexedDB
       │    └─ seam → In-Memory Adapter (tests)
```

### Wins

- **Two adapters justify the seam:** D1 prod, IDB offline, in-memory test
- **Sync logic concentrated:** optimistic updates, conflict resolution in one place
- **Tests:** use in-memory adapter, no D1 or IndexedDB setup
- **Leverage:** canvas page calls `saveNote()`, sync is automatic

---

## Candidate 3: Canvas Module — Excalidraw as Implementation

**Strength:** Strong | **Category:** in-process

### Files

- `canvas/excalidraw-canvas.tsx`
- `canvas/hooks/use-canvas.ts`
- `canvas/hooks/use-zoom.ts`

### Problem

Canvas engine APIs can leak into every component that touches the canvas. Toolbar, note cards, workspace page, and search should not depend directly on Excalidraw's imperative API.

### Solution

A Canvas module wraps Excalidraw as its implementation. Public interface: `useCanvas()`, `useZoom()`, and `ExcalidrawCanvas`. Callers never import from Excalidraw directly. Scene projection, event handling, note movement persistence, and camera control are internal.

### Before

```
Canvas Page   → Excalidraw API
Toolbar       → api.updateScene()
Note Card     → scene elements
```

All depend on canvas engine internals.

### After

```
Canvas Page  → ExcalidrawCanvas → Canvas Module (deep)
Toolbar      → zoomIn()         → Canvas Module
Note Card    → updateNote()     → Canvas Module
```

Callers use domain hooks, not Excalidraw APIs.

### Wins

- **Locality:** Excalidraw API changes break one module, not N components
- **Leverage:** domain hooks (`useZoom`) replace raw Excalidraw calls
- **Interface shrinks:** callers use `createNote()`, not `updateScene()`
- **Test surface:** mock the canvas module, not Excalidraw internals

---

## Candidate 4: Editor Module — TipTap as Implementation

**Strength:** Worth exploring | **Category:** in-process

### Files

- `editor/markdown-editor.tsx`
- `editor/extensions/markdown.ts`
- `editor/hooks/use-editor.ts`

### Problem

TipTap has its own extension system, ProseMirror schema, and lifecycle. If every note shape directly configures TipTap, the note shape module couples to editor internals. Swapping to Lexical or Milkdown later means rewriting every call site.

### Solution

Editor module with a thin interface: `mountEditor(container, markdown)` → `getContent()`. TipTap is the current implementation. The Note Shape module calls the editor interface, not TipTap directly. If Yjs collaboration arrives (Phase 3), it's an internal extension.

### Wins

- **Leverage:** NoteShape doesn't know about ProseMirror schemas
- **Locality:** editor config, extensions, keymaps in one place
- One adapter now, second adapter (Lexical?) later justifies the seam

---

## Candidate 5: State Architecture — Zustand Stores Aligned to Domain

**Strength:** Worth exploring | **Category:** in-process

### Files

- `stores/workspace-store.ts`
- `stores/notes-store.ts`
- `stores/ui-store.ts`

### Problem

A single monolithic Zustand store mixes canvas camera state with note content with UI panel state. Changes to note rendering trigger re-renders of unrelated UI. Or, many tiny stores create a web of cross-store imports with no clear ownership.

### Solution

Three stores aligned to domain concepts:

| Store | Owns | Consumers |
|-------|------|-----------|
| `WorkspaceStore` | current workspace, workspace list | Workspace page, persistence |
| `NotesStore` | note collection, CRUD, optimistic updates | Canvas module, search |
| `UIStore` | panels, modals, toolbar state | Toolbar, dialogs |

Canvas state stays inside the Canvas module as internal state. NotesStore is the seam between Persistence and the canvas.

### Wins

- **Locality:** note bugs stay in NotesStore, UI bugs in UIStore
- Each store is independently testable through its interface
- Canvas module keeps camera state internal — not in a global store

---

## Proposed Directory Structure

```
app/
├── layout.tsx
├── page.tsx                          # Landing
├── globals.css
└── workspace/
    └── [id]/
        ├── layout.tsx                # Workspace shell
        ├── page.tsx                  # Canvas page
        └── loading.tsx

canvas/                               # Canvas module (deep)
├── index.ts                          # Public interface
├── excalidraw-canvas.tsx             # Excalidraw adapter
├── zoom/
│   ├── zoom-levels.ts                # Semantic zoom config
│   └── zoom-renderer.tsx             # Level-based dispatch
└── hooks/
    ├── use-canvas.ts
    └── use-zoom.ts

editor/                               # Editor module (deep)
├── index.ts                          # Public interface
├── markdown-editor.tsx
├── extensions/
│   └── markdown.ts
└── hooks/
    └── use-editor.ts

persistence/                          # Persistence module (deep + seam)
├── index.ts                          # Public interface (port)
├── types.ts
├── adapters/
│   ├── d1-adapter.ts
│   ├── indexeddb-adapter.ts
│   └── in-memory-adapter.ts
└── sync/
    └── sync-engine.ts

stores/                               # Zustand stores (domain-aligned)
├── workspace-store.ts
├── notes-store.ts
└── ui-store.ts

components/                           # Shared UI
├── ui/                               # shadcn/ui
├── theme-provider.tsx
├── toolbar.tsx
└── search-dialog.tsx

hooks/                                # Shared hooks
├── use-keyboard-shortcuts.ts
└── use-note-actions.ts

lib/                                  # Utilities
├── utils.ts
├── markdown.ts                       # remark/rehype pipeline
└── id.ts

types/                                # Shared types
├── note.ts
├── workspace.ts
└── canvas.ts
```

---

## Module Dependency Graph

```
┌─────────────────────────────────────────────┐
│                  App Layer                   │
│         app/workspace/[id]/page              │
└──────────┬──────────────┬────────────────────┘
           │              │
           ▼              ▼
  ┌─────────────┐  ┌──────────────────┐
  │   Canvas     │  │   Persistence    │
  │   Module     │  │   Module         │
  │   (deep)     │  │   (deep + seam)  │
  └──────┬───────┘  └────────┬─────────┘
         │                   │
    ┌────┴─────┐        ┌────┴─────────┐
    ▼          ▼        ▼              ▼
┌────────┐ ┌──────┐ ┌──────┐ ┌───────────┐
│Editor  │ │Notes │ │Notes │ │D1/IDB/    │
│Module  │ │Store │ │Store │ │In-Memory   │
│(deep)  │ │      │ │      │ │Adapters    │
└────────┘ └──┬───┘ └──────┘ └───────────┘
              │
              ▼
         ┌────────┐
         │UIStore │
         └────────┘
```

### Data Flow

```
User double-clicks canvas
  → Canvas Module creates note
    → NotesStore (optimistic update)
      → Persistence Module
        → Sync Engine
          → D1 Adapter (INSERT note)
        ← confirmed
      ← note saved
    ← note created
  → NoteShape renders
```

---

## Semantic Zoom System

The zoom system lives **inside** the NoteShape module — it is not a separate seam. The interface is: given a zoom level (0%–100%+), render the appropriate content.

| Zoom Range | Display | Implementation |
|------------|---------|---------------|
| 0%–20%     | Colored blocks | Simple colored `<div>` |
| 20%–40%    | Titles only | Render title from cached AST |
| 40%–70%    | Preview text | Render first N chars from preview |
| 70%–100%   | Full markdown | Render full markdown via cached HTML |
| 100%+      | Rich editor | Lazy-mount TipTap editor |

### Key: Cached Markdown AST

**Do not parse markdown every render.**

- Parse once on save/edit
- Cache the AST and rendered HTML
- Reuse at each zoom level
- Only re-parse when markdown content changes

---

## Phase 1 MVP — Build Order

Ordered by dependency. Each step produces a testable increment.

### Step 01: Types + lib utilities

```
types/note.ts, types/workspace.ts, lib/markdown.ts, lib/id.ts
```

Domain types first. Markdown parsing pipeline (remark → rehype → sanitize). ID generation.

### Step 02: Persistence module — in-memory adapter

```
persistence/index.ts, persistence/adapters/in-memory-adapter.ts
```

Port definition + in-memory adapter. No D1 yet — test everything against in-memory.

### Step 03: Zustand stores

```
stores/workspace-store.ts, stores/notes-store.ts, stores/ui-store.ts
```

Wire stores to persistence module. CRUD operations, optimistic updates.

### Step 04: Canvas module — Excalidraw integration

```
canvas/excalidraw-canvas.tsx, canvas/hooks/use-canvas.ts
```

Excalidraw wrapper, custom hooks. Canvas renders and app controls route through the adapter.

### Step 05: Note Projection module — rendering without editor

```
canvas/excalidraw-canvas.tsx, canvas/zoom/*
```

Project notes into Excalidraw rectangle/text elements. Semantic zoom: colored block → title → preview. No editor yet.

### Step 06: Editor module — TipTap integration

```
editor/markdown-editor.tsx, editor/extensions/*
```

TipTap with markdown extensions. Lazy-mounted when zoom ≥ 100%. Full editing.

### Step 07: Wire it together — workspace page

```
app/workspace/[id]/page.tsx, canvas-toolbar, search-dialog
```

Full flow: canvas + notes + editor + toolbar + save/load.

### Step 08: Persistence module — D1 adapter

```
persistence/adapters/d1-adapter.ts, app/api/*
```

Swap in-memory for D1. API routes. Real persistence. IndexedDB adapter for offline.

---

## Top Recommendation

**Start with the Note Shape Module (Candidate 1).**

It's the core domain concept — everything else exists to put notes on a canvas and edit them. If NoteShape is deep, the canvas page becomes thin. If it's shallow, zoom logic, markdown rendering, and editor lifecycle leak everywhere.

Build the persistence port first (in-memory adapter only), then iterate on NoteShape until the semantic zoom feels right.

---

## Future Considerations (Not in MVP)

These are recorded here for awareness but should **not** influence Phase 1 architecture decisions:

- **Realtime collaboration** (Phase 3) — Yjs + Durable Objects. The Persistence module's seam supports this: add a Yjs adapter alongside D1/IDB.
- **AI features** (Phase 4) — clustering, semantic search, summaries. These consume the NotesStore interface; they don't change it.
- **Search** — MiniSearch or FlexSearch indexing titles + markdown + tags. Lives behind a search seam in the Persistence module.
- **Auth** — WorkOS. Adds a user concept to WorkspaceStore but doesn't change module boundaries.
