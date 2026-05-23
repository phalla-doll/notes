import type { NoteNode, NoteConnection } from "@/types/note"
import type { Workspace } from "@/types/workspace"
import type { PersistencePort } from "../types"

const DB_NAME = "infinite-markdown-canvas"
const DB_VERSION = 1

const STORES = {
    workspaces: "workspaces",
    notes: "notes",
    connections: "connections",
} as const

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = () => {
            const db = request.result
            if (!db.objectStoreNames.contains(STORES.workspaces)) {
                db.createObjectStore(STORES.workspaces, { keyPath: "id" })
            }
            if (!db.objectStoreNames.contains(STORES.notes)) {
                const noteStore = db.createObjectStore(STORES.notes, {
                    keyPath: "id",
                })
                noteStore.createIndex("workspaceId", "workspaceId", {
                    unique: false,
                })
            }
            if (!db.objectStoreNames.contains(STORES.connections)) {
                db.createObjectStore(STORES.connections, { keyPath: "id" })
            }
        }

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

function tx<T>(
    db: IDBDatabase,
    store: string,
    mode: IDBTransactionMode,
    fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(store, mode)
        const objectStore = transaction.objectStore(store)
        const request = fn(objectStore)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

class IndexedDBAdapter implements PersistencePort {
    private db: IDBDatabase | null = null

    private async getDB(): Promise<IDBDatabase> {
        if (!this.db) {
            this.db = await openDB()
        }
        return this.db
    }

    async saveNote(note: NoteNode): Promise<void> {
        const db = await this.getDB()
        await tx(db, STORES.notes, "readwrite", (s) => s.put(note))
    }

    async loadNote(id: string): Promise<NoteNode | null> {
        const db = await this.getDB()
        return tx(db, STORES.notes, "readonly", (s) => s.get(id))
    }

    async deleteNote(id: string): Promise<void> {
        const db = await this.getDB()
        await tx(db, STORES.notes, "readwrite", (s) => s.delete(id))
    }

    async listNotes(workspaceId: string): Promise<NoteNode[]> {
        const db = await this.getDB()
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORES.notes, "readonly")
            const store = transaction.objectStore(STORES.notes)
            const request = store.index("workspaceId").getAll(workspaceId)
            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
        })
    }

    async saveWorkspace(workspace: Workspace): Promise<void> {
        const db = await this.getDB()
        await tx(db, STORES.workspaces, "readwrite", (s) => s.put(workspace))
    }

    async loadWorkspace(id: string): Promise<Workspace | null> {
        const db = await this.getDB()
        return tx(db, STORES.workspaces, "readonly", (s) => s.get(id))
    }

    async listWorkspaces(ownerId: string): Promise<Workspace[]> {
        void ownerId
        const db = await this.getDB()
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORES.workspaces, "readonly")
            const store = transaction.objectStore(STORES.workspaces)
            const request = store.getAll()
            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
        })
    }

    async deleteWorkspace(id: string): Promise<void> {
        const db = await this.getDB()
        await tx(db, STORES.workspaces, "readwrite", (s) => s.delete(id))
    }

    async saveConnection(connection: NoteConnection): Promise<void> {
        const db = await this.getDB()
        await tx(db, STORES.connections, "readwrite", (s) => s.put(connection))
    }

    async deleteConnection(id: string): Promise<void> {
        const db = await this.getDB()
        await tx(db, STORES.connections, "readwrite", (s) => s.delete(id))
    }

    async listConnections(_workspaceId: string): Promise<NoteConnection[]> {
        void _workspaceId
        const db = await this.getDB()
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORES.connections, "readonly")
            const store = transaction.objectStore(STORES.connections)
            const request = store.getAll()
            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
        })
    }
}

export function createIndexedDBAdapter(): PersistencePort {
    return new IndexedDBAdapter()
}
