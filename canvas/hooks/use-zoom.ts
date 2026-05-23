"use client"

import { type ZoomLevel, getZoomLevel } from "@/types/canvas"
import { useCanvas } from "./use-canvas"

export function useZoom() {
    const { zoom } = useCanvas()
    const level: ZoomLevel = getZoomLevel(zoom)

    return { zoom, level }
}
