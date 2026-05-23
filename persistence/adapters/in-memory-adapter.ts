import type { NoteNode, NoteConnection } from "@/types/note"
import type { Workspace } from "@/types/workspace"
import type { PersistencePort } from "../types"

class InMemoryAdapter implements PersistencePort {
    private notes = new Map<string, NoteNode>()
    private workspaces = new Map<string, Workspace>()
    private connections = new Map<string, NoteConnection>()

    async saveNote(note: NoteNode): Promise<void> {
        this.notes.set(note.id, { ...note })
    }

    async loadNote(id: string): Promise<NoteNode | null> {
        const note = this.notes.get(id)
        return note ? { ...note } : null
    }

    async deleteNote(id: string): Promise<void> {
        this.notes.delete(id)
        for (const [connId, conn] of this.connections) {
            if (conn.fromNoteId === id || conn.toNoteId === id) {
                this.connections.delete(connId)
            }
        }
    }

    async listNotes(workspaceId: string): Promise<NoteNode[]> {
        return Array.from(this.notes.values())
            .filter((n) => n.workspaceId === workspaceId)
            .map((n) => ({ ...n }))
    }

    async saveWorkspace(workspace: Workspace): Promise<void> {
        this.workspaces.set(workspace.id, { ...workspace })
    }

    async loadWorkspace(id: string): Promise<Workspace | null> {
        const ws = this.workspaces.get(id)
        return ws ? { ...ws } : null
    }

    async listWorkspaces(ownerId: string): Promise<Workspace[]> {
        return Array.from(this.workspaces.values())
            .filter((w) => w.ownerId === ownerId)
            .map((w) => ({ ...w }))
    }

    async deleteWorkspace(id: string): Promise<void> {
        this.workspaces.delete(id)
        for (const [noteId, note] of this.notes) {
            if (note.workspaceId === id) {
                this.notes.delete(noteId)
            }
        }
    }

    async saveConnection(connection: NoteConnection): Promise<void> {
        this.connections.set(connection.id, { ...connection })
    }

    async deleteConnection(id: string): Promise<void> {
        this.connections.delete(id)
    }

    async listConnections(_workspaceId: string): Promise<NoteConnection[]> {
        void _workspaceId
        return Array.from(this.connections.values()).map((c) => ({ ...c }))
    }

    clear(): void {
        this.notes.clear()
        this.workspaces.clear()
        this.connections.clear()
    }
}

let adapter: InMemoryAdapter | null = null

export function getInMemoryAdapter(): PersistencePort {
    if (!adapter) {
        adapter = new InMemoryAdapter()
    }
    return adapter
}
