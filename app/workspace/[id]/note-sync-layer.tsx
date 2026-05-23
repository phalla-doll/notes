"use client"

import { useEffect } from "react"
import { useEditor, type TLShapeId } from "tldraw"
import { useNotesStore } from "@/stores/notes-store"
import { useUIStore } from "@/stores/ui-store"
import { markdownToHtml } from "@/lib/markdown"
import { MARKDOWN_NOTE_TYPE } from "@/canvas/shapes/markdown-note-util"

export function NoteSyncLayer({ workspaceId }: { workspaceId: string }) {
    const editor = useEditor()
    const loadNotes = useNotesStore((s) => s.loadNotes)
    const createNote = useNotesStore((s) => s.createNote)
    const setActiveNote = useUIStore((s) => s.setActiveNote)

    useEffect(() => {
        loadNotes(workspaceId)
    }, [workspaceId, loadNotes])

    useEffect(() => {
        const unsub = useNotesStore.subscribe((state) => {
            syncNotesToCanvas(editor, state.notes)
        })

        const notes = useNotesStore.getState().notes
        if (notes.length > 0) {
            syncNotesToCanvas(editor, notes)
        }

        return unsub
    }, [editor])

    useEffect(() => {
        const handleDoubleClick = (e: PointerEvent) => {
            const target = e.target as HTMLElement
            if (target.closest(".tl-container")) return

            const point = editor.screenToPage({ x: e.clientX, y: e.clientY })
            createNote(workspaceId, { x: point.x, y: point.y }).then((note) => {
                setActiveNote(note.id)
            })
        }

        const el = editor.getContainer()
        el.addEventListener("dblclick", handleDoubleClick as EventListener)
        return () => {
            el.removeEventListener(
                "dblclick",
                handleDoubleClick as EventListener
            )
        }
    }, [editor, workspaceId, createNote, setActiveNote])

    return null
}

const syncedIds = new Set<string>()

async function syncNotesToCanvas(
    editor: ReturnType<typeof useEditor>,
    notes: import("@/types/note").NoteNode[]
) {
    for (const note of notes) {
        const shapeId = note.id as TLShapeId
        const existing = editor.getShape(shapeId)

        if (!existing) {
            let html = ""
            if (note.markdown) {
                html = await markdownToHtml(note.markdown)
            }

            editor.createShape({
                id: shapeId,
                type: MARKDOWN_NOTE_TYPE,
                x: note.position.x,
                y: note.position.y,
                props: {
                    noteId: note.id,
                    title: note.title,
                    preview: note.preview,
                    markdown: note.markdown,
                    html,
                    color: note.color ?? "#3b82f6",
                    w: note.size.width,
                    h: note.size.height,
                },
            })
            syncedIds.add(note.id)
        } else if (!syncedIds.has(note.id)) {
            editor.updateShape({
                id: shapeId,
                type: MARKDOWN_NOTE_TYPE,
                props: {
                    noteId: note.id,
                    title: note.title,
                    preview: note.preview,
                    markdown: note.markdown,
                    color: note.color ?? "#3b82f6",
                    w: note.size.width,
                    h: note.size.height,
                },
            })
            syncedIds.add(note.id)
        }
    }
}
