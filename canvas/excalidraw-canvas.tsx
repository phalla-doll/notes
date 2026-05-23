"use client"

import {
    CaptureUpdateAction,
    Excalidraw,
    FONT_FAMILY,
    convertToExcalidrawElements,
} from "@excalidraw/excalidraw"
import "@excalidraw/excalidraw/index.css"
import type {
    ExcalidrawImperativeAPI,
    NormalizedZoomValue,
} from "@excalidraw/excalidraw/types"
import type {
    ExcalidrawElement,
    FontFamilyValues,
} from "@excalidraw/excalidraw/element/types"
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { useTheme } from "next-themes"
import { SearchDialog } from "@/components/search-dialog"
import { NoteEditorPanel } from "@/components/note-editor-panel"
import { Button } from "@/components/ui/button"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useNotesStore } from "@/stores/notes-store"
import { useUIStore } from "@/stores/ui-store"
import type { NoteNode } from "@/types/note"

const NOTE_CARD_ROLE = "note-card"
const NOTE_TITLE_ROLE = "note-title"
const NOTE_PREVIEW_ROLE = "note-preview"
const NOTE_CARD_MIN_WIDTH = 180
const NOTE_CARD_MIN_HEIGHT = 120
const KHMER_FONT_FAMILY_NAME = "Fasthand"
const KHMER_EXCALIDRAW_FONT_FAMILY = 10 as FontFamilyValues

registerKhmerExcalidrawFont()

type NoteElementRole =
    | typeof NOTE_CARD_ROLE
    | typeof NOTE_TITLE_ROLE
    | typeof NOTE_PREVIEW_ROLE

type NoteElementCustomData = {
    noteId: string
    role: NoteElementRole
}

type CanvasContextValue = {
    api: ExcalidrawImperativeAPI | null
    zoom: number
    zoomIn: () => void
    zoomOut: () => void
    resetZoom: () => void
    scrollToNote: (noteId: string) => void
    createNoteAtViewportCenter: () => Promise<void>
}

const CanvasContext = createContext<CanvasContextValue | null>(null)

export function useCanvas() {
    const value = useContext(CanvasContext)
    if (!value) {
        throw new Error("useCanvas must be used inside ExcalidrawCanvas")
    }
    return value
}

export default function ExcalidrawCanvas({
    workspaceId,
}: {
    workspaceId: string
}) {
    useKeyboardShortcuts()

    const { resolvedTheme } = useTheme()
    const notes = useNotesStore((s) => s.notes)
    const loadNotes = useNotesStore((s) => s.loadNotes)
    const createNote = useNotesStore((s) => s.createNote)
    const updateNote = useNotesStore((s) => s.updateNote)
    const setActiveNote = useUIStore((s) => s.setActiveNote)

    const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null)
    const [zoom, setZoom] = useState(1)
    const [fontLoadToken, setFontLoadToken] = useState(0)
    const syncingRef = useRef(false)
    const notesRef = useRef(notes)

    useEffect(() => {
        notesRef.current = notes
    }, [notes])

    useEffect(() => {
        loadNotes(workspaceId)
    }, [workspaceId, loadNotes])

    useEffect(() => {
        if (typeof document === "undefined" || !("fonts" in document)) return

        let cancelled = false

        void Promise.all([
            document.fonts.load(`20px "${KHMER_FONT_FAMILY_NAME}"`),
            document.fonts.load(`14px "${KHMER_FONT_FAMILY_NAME}"`),
            document.fonts.ready,
        ]).then(() => {
            if (!cancelled) {
                setFontLoadToken((value) => value + 1)
            }
        })

        return () => {
            cancelled = true
        }
    }, [])

    useEffect(() => {
        if (!api) return

        syncingRef.current = true
        const existingElements = api.getSceneElementsIncludingDeleted()
        const existingNonNoteElements = existingElements.filter(
            (element) => !getNoteElementData(element)
        )

        api.updateScene({
            elements: [
                ...existingNonNoteElements,
                ...notes.flatMap(noteToExcalidrawElements),
            ],
            captureUpdate: CaptureUpdateAction.NEVER,
        })

        queueMicrotask(() => {
            syncingRef.current = false
        })
    }, [api, notes, fontLoadToken])

    const persistMovedNotes = useCallback(
        async (elements: readonly ExcalidrawElement[]) => {
            const cards = elements.filter((element) => {
                const data = getNoteElementData(element)
                return data?.role === NOTE_CARD_ROLE && !element.isDeleted
            })

            await Promise.all(
                cards.map(async (element) => {
                    const note = notesRef.current.find(
                        (item) =>
                            item.id === getNoteElementData(element)?.noteId
                    )
                    if (!note) return

                    const width = Math.max(NOTE_CARD_MIN_WIDTH, element.width)
                    const height = Math.max(
                        NOTE_CARD_MIN_HEIGHT,
                        element.height
                    )
                    const positionChanged =
                        Math.round(note.position.x) !== Math.round(element.x) ||
                        Math.round(note.position.y) !== Math.round(element.y)
                    const sizeChanged =
                        Math.round(note.size.width) !== Math.round(width) ||
                        Math.round(note.size.height) !== Math.round(height)

                    if (!positionChanged && !sizeChanged) return

                    await updateNote(note.id, {
                        position: { x: element.x, y: element.y },
                        size: { width, height },
                    })
                })
            )
        },
        [updateNote]
    )

    useEffect(() => {
        if (!api) return

        const unsubscribeChange = api.onChange((elements, appState) => {
            setZoom(appState.zoom.value)
            if (syncingRef.current) return

            void persistMovedNotes(elements)
        })

        const unsubscribeScroll = api.onScrollChange((_x, _y, nextZoom) => {
            setZoom(nextZoom.value)
        })

        return () => {
            unsubscribeChange()
            unsubscribeScroll()
        }
    }, [api, persistMovedNotes])

    const scrollToNote = useCallback(
        (noteId: string) => {
            if (!api) return

            const elements = api
                .getSceneElements()
                .filter(
                    (element) => getNoteElementData(element)?.noteId === noteId
                )

            if (elements.length > 0) {
                api.updateScene({
                    appState: {
                        selectedElementIds: Object.fromEntries(
                            elements.map((element) => [element.id, true])
                        ),
                    },
                    captureUpdate: CaptureUpdateAction.NEVER,
                })
                api.scrollToContent(elements, {
                    fitToViewport: true,
                    viewportZoomFactor: 0.7,
                    animate: true,
                    duration: 300,
                })
            }
        },
        [api]
    )

    const createNoteAtViewportCenter = useCallback(async () => {
        const appState = api?.getAppState()
        const width = typeof window === "undefined" ? 1280 : window.innerWidth
        const height = typeof window === "undefined" ? 720 : window.innerHeight
        const zoomValue = appState?.zoom.value ?? 1
        const position = {
            x: (width / 2 - (appState?.scrollX ?? 0)) / zoomValue,
            y: (height / 2 - (appState?.scrollY ?? 0)) / zoomValue,
        }

        const note = await createNote(workspaceId, position)
        setActiveNote(note.id)
    }, [api, createNote, setActiveNote, workspaceId])

    const zoomIn = useCallback(() => {
        if (!api) return
        const appState = api.getAppState()
        api.updateScene({
            appState: {
                zoom: {
                    value: normalizeZoom(appState.zoom.value * 1.2),
                },
            },
            captureUpdate: CaptureUpdateAction.NEVER,
        })
    }, [api])

    const zoomOut = useCallback(() => {
        if (!api) return
        const appState = api.getAppState()
        api.updateScene({
            appState: {
                zoom: {
                    value: normalizeZoom(appState.zoom.value / 1.2),
                },
            },
            captureUpdate: CaptureUpdateAction.NEVER,
        })
    }, [api])

    const resetZoom = useCallback(() => {
        api?.updateScene({
            appState: { zoom: { value: normalizeZoom(1) } },
            captureUpdate: CaptureUpdateAction.NEVER,
        })
    }, [api])

    const contextValue = useMemo<CanvasContextValue>(
        () => ({
            api,
            zoom,
            zoomIn,
            zoomOut,
            resetZoom,
            scrollToNote,
            createNoteAtViewportCenter,
        }),
        [
            api,
            zoom,
            zoomIn,
            zoomOut,
            resetZoom,
            scrollToNote,
            createNoteAtViewportCenter,
        ]
    )

    return (
        <CanvasContext.Provider value={contextValue}>
            <div className="fixed inset-0">
                <Excalidraw
                    excalidrawAPI={setApi}
                    theme={resolvedTheme === "dark" ? "dark" : "light"}
                    initialData={{
                        appState: {
                            viewBackgroundColor: "var(--color-background)",
                        },
                    }}
                />
                <CanvasToolbar />
                <SearchDialog />
                <NoteEditorPanel />
            </div>
        </CanvasContext.Provider>
    )
}

function CanvasToolbar() {
    const { zoom, zoomIn, zoomOut, resetZoom, createNoteAtViewportCenter } =
        useCanvas()
    const toggleSearch = useUIStore((s) => s.toggleSearch)

    return (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1">
            <div className="pointer-events-auto flex items-center gap-1 rounded-lg border border-border bg-background/80 px-2 py-1 shadow-lg backdrop-blur-sm">
                <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => void createNoteAtViewportCenter()}
                    title="New note"
                >
                    Note
                </Button>
                <div className="mx-1 h-4 w-px bg-border" />
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={zoomIn}
                    title="Zoom in"
                >
                    +
                </Button>
                <span className="min-w-[3rem] text-center text-xs text-muted-foreground">
                    {Math.round(zoom * 100)}%
                </span>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={zoomOut}
                    title="Zoom out"
                >
                    -
                </Button>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={resetZoom}
                    title="Reset zoom"
                >
                    1:1
                </Button>
                <div className="mx-1 h-4 w-px bg-border" />
                <Button
                    variant="ghost"
                    size="xs"
                    onClick={toggleSearch}
                    title="Search (Ctrl+K)"
                >
                    Search
                </Button>
            </div>
        </div>
    )
}

function noteToExcalidrawElements(note: NoteNode): ExcalidrawElement[] {
    const groupId = `${note.id}:group`
    const width = Math.max(NOTE_CARD_MIN_WIDTH, note.size.width)
    const height = Math.max(NOTE_CARD_MIN_HEIGHT, note.size.height)
    const color = note.color ?? "#3b82f6"

    return convertToExcalidrawElements(
        [
            {
                id: `${note.id}:card`,
                type: "rectangle",
                x: note.position.x,
                y: note.position.y,
                width,
                height,
                strokeColor: color,
                backgroundColor: "transparent",
                fillStyle: "solid",
                strokeWidth: 2,
                roughness: 0,
                roundness: { type: 3 },
                groupIds: [groupId],
                customData: {
                    noteId: note.id,
                    role: NOTE_CARD_ROLE,
                } satisfies NoteElementCustomData,
            },
            {
                id: `${note.id}:title`,
                type: "text",
                x: note.position.x + 16,
                y: note.position.y + 14,
                width: Math.max(120, width - 32),
                fontSize: 20,
                fontFamily: KHMER_EXCALIDRAW_FONT_FAMILY,
                text: note.title || "Untitled",
                strokeColor: color,
                backgroundColor: "transparent",
                groupIds: [groupId],
                customData: {
                    noteId: note.id,
                    role: NOTE_TITLE_ROLE,
                } satisfies NoteElementCustomData,
            },
            {
                id: `${note.id}:preview`,
                type: "text",
                x: note.position.x + 16,
                y: note.position.y + 54,
                width: Math.max(120, width - 32),
                fontSize: 14,
                fontFamily: KHMER_EXCALIDRAW_FONT_FAMILY,
                text: note.preview || "Empty note",
                strokeColor: "#64748b",
                backgroundColor: "transparent",
                groupIds: [groupId],
                customData: {
                    noteId: note.id,
                    role: NOTE_PREVIEW_ROLE,
                } satisfies NoteElementCustomData,
            },
        ],
        { regenerateIds: false }
    ) as ExcalidrawElement[]
}

function registerKhmerExcalidrawFont() {
    const excalidrawFontFamilies = FONT_FAMILY as Record<string, number>
    excalidrawFontFamilies[KHMER_FONT_FAMILY_NAME] =
        KHMER_EXCALIDRAW_FONT_FAMILY
}

function getNoteElementData(
    element: ExcalidrawElement
): NoteElementCustomData | null {
    const data = element.customData
    if (
        typeof data?.noteId === "string" &&
        (data.role === NOTE_CARD_ROLE ||
            data.role === NOTE_TITLE_ROLE ||
            data.role === NOTE_PREVIEW_ROLE)
    ) {
        return data as NoteElementCustomData
    }
    return null
}

function normalizeZoom(value: number): NormalizedZoomValue {
    return Math.min(Math.max(value, 0.1), 4) as NormalizedZoomValue
}
