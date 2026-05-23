"use client"

import { track, useEditor } from "tldraw"
import { useUIStore } from "@/stores/ui-store"
import { Button } from "@/components/ui/button"

export const CanvasToolbar = track(function CanvasToolbar() {
    const editor = useEditor()
    const toggleSearch = useUIStore((s) => s.toggleSearch)
    const zoom = Math.round(editor.getZoomLevel() * 100)

    return (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1">
            <div className="pointer-events-auto flex items-center gap-1 rounded-lg border border-border bg-background/80 px-2 py-1 shadow-lg backdrop-blur-sm">
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => editor.zoomIn()}
                    title="Zoom in"
                >
                    +
                </Button>
                <span className="min-w-[3rem] text-center text-xs text-muted-foreground">
                    {zoom}%
                </span>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => editor.zoomOut()}
                    title="Zoom out"
                >
                    -
                </Button>
                <div className="mx-1 h-4 w-px bg-border" />
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => editor.zoomToFit()}
                    title="Fit to view"
                >
                    Fit
                </Button>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => editor.resetZoom()}
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
})
