"use client"

import { Button } from "@/components/ui/button"
import { useNotesStore } from "@/stores/notes-store"
import { useUIStore } from "@/stores/ui-store"

export function NoteEditorPanel() {
    const activeNoteId = useUIStore((s) => s.activeNoteId)
    const setActiveNote = useUIStore((s) => s.setActiveNote)
    const note = useNotesStore((s) =>
        activeNoteId ? s.notes.find((item) => item.id === activeNoteId) : null
    )
    const updateNoteMarkdown = useNotesStore((s) => s.updateNoteMarkdown)

    if (!note) return null

    return (
        <aside className="fixed top-4 right-4 z-50 flex h-[calc(100vh-2rem)] w-[min(28rem,calc(100vw-2rem))] flex-col rounded-lg border border-border bg-background shadow-xl">
            <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                        {note.title || "Untitled"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Markdown
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setActiveNote(null)}
                >
                    Close
                </Button>
            </header>
            <textarea
                value={note.markdown}
                onChange={(event) =>
                    void updateNoteMarkdown(note.id, event.target.value)
                }
                className="font-khmer min-h-0 flex-1 resize-none bg-background px-4 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="# Untitled"
                spellCheck
                autoFocus
            />
        </aside>
    )
}
