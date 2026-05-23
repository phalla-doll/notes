import { create } from "zustand"
import type { NoteNode } from "@/types/note"
import { createPreview } from "@/types/note"
import { getPersistence } from "@/persistence"
import { generateId } from "@/lib/id"
import { extractTitle } from "@/lib/markdown"

interface NotesState {
    notes: NoteNode[]
    loading: boolean

    loadNotes: (workspaceId: string) => Promise<void>
    createNote: (
        workspaceId: string,
        position: { x: number; y: number },
        markdown?: string
    ) => Promise<NoteNode>
    updateNote: (id: string, updates: Partial<NoteNode>) => Promise<void>
    updateNotePosition: (
        id: string,
        position: { x: number; y: number }
    ) => Promise<void>
    updateNoteSize: (
        id: string,
        size: { width: number; height: number }
    ) => Promise<void>
    updateNoteMarkdown: (id: string, markdown: string) => Promise<void>
    deleteNote: (id: string) => Promise<void>
    getNote: (id: string) => NoteNode | undefined
}

export const useNotesStore = create<NotesState>((set, get) => ({
    notes: [],
    loading: false,

    async loadNotes(workspaceId) {
        set({ loading: true })
        const persistence = getPersistence()
        const notes = await persistence.listNotes(workspaceId)
        set({ notes, loading: false })
    },

    async createNote(workspaceId, position, markdown = "") {
        const now = Date.now()
        const note: NoteNode = {
            id: generateId("note"),
            workspaceId,
            title: extractTitle(markdown) || "Untitled",
            markdown,
            preview: createPreview(markdown),
            position,
            size: { width: 280, height: 200 },
            tags: [],
            links: [],
            createdAt: now,
            updatedAt: now,
        }

        set((state) => ({
            notes: [...state.notes, note],
        }))

        const persistence = getPersistence()
        await persistence.saveNote(note)

        return note
    },

    async updateNote(id, updates) {
        const { notes } = get()
        const index = notes.findIndex((n) => n.id === id)
        if (index === -1) return

        const updated = {
            ...notes[index],
            ...updates,
            updatedAt: Date.now(),
        }

        set((state) => ({
            notes: state.notes.map((n) => (n.id === id ? updated : n)),
        }))

        const persistence = getPersistence()
        await persistence.saveNote(updated)
    },

    async updateNotePosition(id, position) {
        await get().updateNote(id, { position })
    },

    async updateNoteSize(id, size) {
        await get().updateNote(id, { size })
    },

    async updateNoteMarkdown(id, markdown) {
        await get().updateNote(id, {
            markdown,
            title: extractTitle(markdown) || "Untitled",
            preview: createPreview(markdown),
        })
    },

    async deleteNote(id) {
        set((state) => ({
            notes: state.notes.filter((n) => n.id !== id),
        }))

        const persistence = getPersistence()
        await persistence.deleteNote(id)
    },

    getNote(id) {
        return get().notes.find((n) => n.id === id)
    },
}))
