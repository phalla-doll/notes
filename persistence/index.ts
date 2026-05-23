import type { PersistencePort } from "./types"
import type { NoteNode, NoteConnection } from "@/types/note"
import type { Workspace } from "@/types/workspace"
import { createIndexedDBAdapter } from "./adapters/indexeddb-adapter"
import { createD1Adapter } from "./adapters/d1-adapter"
import { getInMemoryAdapter } from "./adapters/in-memory-adapter"
import { SyncEngine } from "./sync/sync-engine"

class SyncedPersistenceAdapter implements PersistencePort {
    private local: PersistencePort
    private syncEngine: SyncEngine

    constructor(local: PersistencePort, remote: PersistencePort) {
        this.local = local
        this.syncEngine = new SyncEngine(local, remote)
    }

    start() {
        this.syncEngine.start()
    }

    stop() {
        this.syncEngine.stop()
    }

    async saveNote(note: NoteNode): Promise<void> {
        await this.local.saveNote(note)
        this.syncEngine.enqueueSave("note", note)
    }

    async loadNote(id: string): Promise<NoteNode | null> {
        return this.local.loadNote(id)
    }

    async deleteNote(id: string): Promise<void> {
        await this.local.deleteNote(id)
        this.syncEngine.enqueueDelete("note", id)
    }

    async listNotes(workspaceId: string): Promise<NoteNode[]> {
        return this.local.listNotes(workspaceId)
    }

    async saveWorkspace(workspace: Workspace): Promise<void> {
        await this.local.saveWorkspace(workspace)
        this.syncEngine.enqueueSave("workspace", workspace)
    }

    async loadWorkspace(id: string): Promise<Workspace | null> {
        return this.local.loadWorkspace(id)
    }

    async listWorkspaces(ownerId: string): Promise<Workspace[]> {
        return this.local.listWorkspaces(ownerId)
    }

    async deleteWorkspace(id: string): Promise<void> {
        await this.local.deleteWorkspace(id)
        this.syncEngine.enqueueDelete("workspace", id)
    }

    async saveConnection(connection: NoteConnection): Promise<void> {
        await this.local.saveConnection(connection)
    }

    async deleteConnection(id: string): Promise<void> {
        await this.local.deleteConnection(id)
    }

    async listConnections(workspaceId: string): Promise<NoteConnection[]> {
        return this.local.listConnections(workspaceId)
    }

    async pullWorkspace(workspaceId: string): Promise<NoteNode[]> {
        return this.syncEngine.pullWorkspace(workspaceId)
    }

    async pullWorkspaces(ownerId: string): Promise<Workspace[]> {
        return this.syncEngine.pullWorkspaces(ownerId)
    }
}

let syncedAdapter: SyncedPersistenceAdapter | null = null

export function getPersistence(): PersistencePort {
    if (syncedAdapter) return syncedAdapter

    if (typeof window === "undefined") {
        return getInMemoryAdapter()
    }

    const local = createIndexedDBAdapter()
    const remote = createD1Adapter()
    syncedAdapter = new SyncedPersistenceAdapter(local, remote)
    syncedAdapter.start()

    return syncedAdapter
}

export function setPersistence(adapter: PersistencePort): void {
    if (syncedAdapter) {
        syncedAdapter.stop()
    }
    syncedAdapter = null
    ;(globalThis as Record<string, unknown>).__persistence_override =
        adapter
}

export type { PersistencePort } from "./types"
