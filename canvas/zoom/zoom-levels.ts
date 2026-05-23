export { ZoomLevel, getZoomLevel } from "@/types/canvas"

export const ZOOM_THRESHOLDS = {
    block: { min: 0, max: 0.2 },
    title: { min: 0.2, max: 0.4 },
    preview: { min: 0.4, max: 0.7 },
    full: { min: 0.7, max: 1.0 },
    editor: { min: 1.0, max: Infinity },
} as const

export const DEFAULT_NOTE_SIZE = {
    width: 280,
    height: 200,
} as const

export const NOTE_COLORS = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#6366f1",
    "#ef4444",
    "#14b8a6",
] as const
