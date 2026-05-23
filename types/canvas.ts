export type CameraState = {
    x: number
    y: number
    zoom: number
}

export type CanvasState = {
    workspaceId: string
    camera: CameraState
}

export enum ZoomLevel {
    Block = "block",
    Title = "title",
    Preview = "preview",
    Full = "full",
    Editor = "editor",
}

export function getZoomLevel(zoom: number): ZoomLevel {
    if (zoom < 0.2) return ZoomLevel.Block
    if (zoom < 0.4) return ZoomLevel.Title
    if (zoom < 0.7) return ZoomLevel.Preview
    if (zoom < 1.0) return ZoomLevel.Full
    return ZoomLevel.Editor
}
