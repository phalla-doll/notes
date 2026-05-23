"use client"

import { use, useCallback } from "react"
import { Tldraw, type Editor } from "tldraw"
import "tldraw/tldraw.css"
import { MarkdownNoteShapeUtil } from "@/canvas/shapes/markdown-note-util"
import { NoteSyncLayer } from "./note-sync-layer"
import { CanvasToolbar } from "@/canvas/canvas-toolbar"
import { SearchDialog } from "@/components/search-dialog"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"

export default function WorkspacePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    useKeyboardShortcuts()

    const handleMount = useCallback((editor: Editor) => {
        editor.setCursor({ type: "cross" })
    }, [])

    return (
        <div className="fixed inset-0">
            <Tldraw shapeUtils={[MarkdownNoteShapeUtil]} onMount={handleMount}>
                <NoteSyncLayer workspaceId={id} />
                <CanvasToolbar />
                <SearchDialog />
            </Tldraw>
        </div>
    )
}
