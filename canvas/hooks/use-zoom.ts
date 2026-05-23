"use client"

import { useEffect, useState } from "react"
import { useEditor } from "tldraw"
import { type ZoomLevel, getZoomLevel } from "@/types/canvas"

export function useZoom() {
    const editor = useEditor()
    const [zoom, setZoom] = useState(() => editor.getZoomLevel())
    const [level, setLevel] = useState<ZoomLevel>(() =>
        getZoomLevel(editor.getZoomLevel())
    )

    useEffect(() => {
        const unsubscribe = editor.store.listen(() => {
            const currentZoom = editor.getZoomLevel()
            setZoom(currentZoom)
            setLevel(getZoomLevel(currentZoom))
        })

        return unsubscribe
    }, [editor])

    return { zoom, level }
}
