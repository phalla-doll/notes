"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useWorkspaceStore } from "@/stores/workspace-store"

export default function Page() {
    const router = useRouter()
    const createWorkspace = useWorkspaceStore((s) => s.createWorkspace)

    const handleCreate = async () => {
        const workspace = await createWorkspace("My Workspace", "local")
        router.push(`/workspace/${workspace.id}`)
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-8">
            <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight">
                    Infinite Markdown Canvas
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Your thoughts deserve infinite space.
                </p>
            </div>
            <Button onClick={handleCreate} size="lg">
                Create Workspace
            </Button>
            <div className="font-mono text-xs text-muted-foreground">
                Press <kbd>d</kbd> to toggle dark mode
            </div>
        </div>
    )
}
