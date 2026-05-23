"use client"

import { Tldraw, type Editor } from "tldraw"
import "tldraw/tldraw.css"
import { type ReactNode, useCallback, useRef } from "react"

interface CanvasProviderProps {
    children?: ReactNode
    onMount?: (editor: Editor) => void
}

export function CanvasProvider({ children, onMount }: CanvasProviderProps) {
    const editorRef = useRef<Editor | null>(null)

    const handleMount = useCallback(
        (editor: Editor) => {
            editorRef.current = editor
            onMount?.(editor)
        },
        [onMount]
    )

    return (
        <div style={{ position: "fixed", inset: 0 }}>
            <Tldraw onMount={handleMount}>{children}</Tldraw>
        </div>
    )
}
