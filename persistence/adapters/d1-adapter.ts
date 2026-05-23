import type { NoteNode, NoteConnection } from "@/types/note"
import type { Workspace } from "@/types/workspace"
import type { PersistencePort } from "../types"

class D1Adapter implements PersistencePort {
    private baseUrl: string

    constructor(baseUrl: string = "") {
        this.baseUrl = baseUrl
    }

    async saveNote(note: NoteNode): Promise<void> {
        await this.fetch("/api/notes", {
            method: "POST",
            body: JSON.stringify(note),
        })
    }

    async loadNote(id: string): Promise<NoteNode | null> {
        const all = await this.listNotes("")
        return all.find((n) => n.id === id) ?? null
    }

    async deleteNote(id: string): Promise<void> {
        await this.fetch("/api/notes", {
            method: "DELETE",
            body: JSON.stringify({ id }),
        })
    }

    async listNotes(workspaceId: string): Promise<NoteNode[]> {
        const params = new URLSearchParams({ workspaceId })
        return this.fetch(`/api/notes?${params}`)
    }

    async saveWorkspace(workspace: Workspace): Promise<void> {
        await this.fetch("/api/workspaces", {
            method: "POST",
            body: JSON.stringify(workspace),
        })
    }

    async loadWorkspace(id: string): Promise<Workspace | null> {
        const all = await this.listWorkspaces("")
        return all.find((w) => w.id === id) ?? null
    }

    async listWorkspaces(ownerId: string): Promise<Workspace[]> {
        const params = new URLSearchParams({ ownerId })
        return this.fetch(`/api/workspaces?${params}`)
    }

    async deleteWorkspace(id: string): Promise<void> {
        await this.fetch("/api/workspaces", {
            method: "DELETE",
            body: JSON.stringify({ id }),
        })
    }

    async saveConnection(_connection: NoteConnection): Promise<void> {
        void _connection
    }

    async deleteConnection(_id: string): Promise<void> {
        void _id
    }

    async listConnections(
        _workspaceId: string,
    ): Promise<NoteConnection[]> {
        void _workspaceId
        return []
    }

    private async fetch<T = unknown>(
        path: string,
        init?: RequestInit,
    ): Promise<T> {
        const url = `${this.baseUrl}${path}`
        const res = await globalThis.fetch(url, {
            ...init,
            headers: {
                "Content-Type": "application/json",
                ...init?.headers,
            },
        })

        if (!res.ok) {
            throw new Error(`API error: ${res.status} ${res.statusText}`)
        }

        return res.json()
    }
}

export function createD1Adapter(baseUrl?: string): PersistencePort {
    return new D1Adapter(baseUrl)
}
