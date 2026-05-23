"use client"

import { useState, useCallback } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useNotesStore } from "@/stores/notes-store"
import { useUIStore } from "@/stores/ui-store"
import { useCanvas } from "@/canvas/excalidraw-canvas"

export function SearchDialog() {
    const searchOpen = useUIStore((s) => s.searchOpen)
    const closeSearch = useUIStore((s) => s.closeSearch)
    const notes = useNotesStore((s) => s.notes)
    const [query, setQuery] = useState("")
    const { scrollToNote } = useCanvas()

    const results = query.trim()
        ? notes.filter(
              (n) =>
                  n.title.toLowerCase().includes(query.toLowerCase()) ||
                  n.preview.toLowerCase().includes(query.toLowerCase())
          )
        : []

    const navigateToNote = useCallback(
        (noteId: string) => {
            scrollToNote(noteId)
            closeSearch()
            setQuery("")
        },
        [scrollToNote, closeSearch]
    )

    return (
        <Dialog
            open={searchOpen}
            onOpenChange={(open) => !open && closeSearch()}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Search Notes</DialogTitle>
                </DialogHeader>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by title or content..."
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    autoFocus
                />
                <div className="max-h-64 overflow-y-auto">
                    {results.map((note) => (
                        <button
                            key={note.id}
                            onClick={() => navigateToNote(note.id)}
                            className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                        >
                            <div className="font-medium">{note.title}</div>
                            {note.preview && (
                                <div className="mt-0.5 truncate text-xs text-muted-foreground">
                                    {note.preview}
                                </div>
                            )}
                        </button>
                    ))}
                    {query.trim() && results.length === 0 && (
                        <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                            No notes found
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
