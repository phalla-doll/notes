import { create } from "zustand"
import type { Workspace } from "@/types/workspace"
import { getPersistence } from "@/persistence"
import { generateId } from "@/lib/id"

interface WorkspaceState {
    workspaces: Workspace[]
    currentWorkspace: Workspace | null
    loading: boolean

    loadWorkspaces: (ownerId: string) => Promise<void>
    createWorkspace: (name: string, ownerId: string) => Promise<Workspace>
    setCurrentWorkspace: (workspace: Workspace | null) => void
    deleteWorkspace: (id: string) => Promise<void>
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
    workspaces: [],
    currentWorkspace: null,
    loading: false,

    async loadWorkspaces(ownerId) {
        set({ loading: true })
        const persistence = getPersistence()
        const workspaces = await persistence.listWorkspaces(ownerId)
        set({ workspaces, loading: false })
    },

    async createWorkspace(name, ownerId) {
        const now = Date.now()
        const workspace: Workspace = {
            id: generateId("ws"),
            name,
            ownerId,
            createdAt: now,
            updatedAt: now,
        }
        const persistence = getPersistence()
        await persistence.saveWorkspace(workspace)
        set((state) => ({
            workspaces: [...state.workspaces, workspace],
        }))
        return workspace
    },

    setCurrentWorkspace(workspace) {
        set({ currentWorkspace: workspace })
    },

    async deleteWorkspace(id) {
        const persistence = getPersistence()
        await persistence.deleteWorkspace(id)
        set((state) => ({
            workspaces: state.workspaces.filter((w) => w.id !== id),
            currentWorkspace:
                state.currentWorkspace?.id === id
                    ? null
                    : state.currentWorkspace,
        }))
    },
}))
