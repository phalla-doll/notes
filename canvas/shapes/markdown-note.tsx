"use client"

import { track, useEditor } from "tldraw"
import { getZoomLevel } from "@/types/canvas"
import { ZoomRenderer } from "../zoom/zoom-renderer"
import type { MarkdownNoteShape } from "./markdown-note-util"

interface ShapeProps {
    shape: MarkdownNoteShape
}

export const MarkdownNoteShapeComponent = track(
    function MarkdownNoteShapeComponent({ shape }: ShapeProps) {
        const editor = useEditor()
        const zoomLevel = getZoomLevel(editor.getZoomLevel())

        return (
            <ZoomRenderer
                note={{
                    title: shape.props.title,
                    preview: shape.props.preview,
                    color: shape.props.color,
                    html: shape.props.html,
                }}
                level={zoomLevel}
            />
        )
    }
)
