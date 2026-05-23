"use client"

import dynamic from "next/dynamic"
import { use } from "react"

const ExcalidrawCanvas = dynamic(
    async () => (await import("@/canvas/excalidraw-canvas")).default,
    { ssr: false }
)

export default function WorkspacePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)

    return <ExcalidrawCanvas workspaceId={id} />
}
