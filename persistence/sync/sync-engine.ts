import type { PersistencePort } from "../types"
import type { NoteNode } from "@/types/note"
import type { Workspace } from "@/types/workspace"

interface SyncQueueItem {
    id: string
    action: "save" | "delete"
    entity: "note" | "workspace"
    data?: NoteNode | Workspace
    timestamp: number
    retries: number
}

const MAX_RETRIES = 3
const SYNC_INTERVAL = 5000

export class SyncEngine {
    private local: PersistencePort
    private remote: PersistencePort
    private queue: SyncQueueItem[] = []
    private syncing = false
    private intervalId: ReturnType<typeof setInterval> | null = null
    private online = true

    constructor(local: PersistencePort, remote: PersistencePort) {
        this.local = local
        this.remote = remote

        if (typeof window !== "undefined") {
            this.online = navigator.onLine
            window.addEventListener("online", () => {
                this.online = true
                this.flush()
            })
            window.addEventListener("offline", () => {
                this.online = false
            })
        }
    }

    start(): void {
        if (this.intervalId) return
        this.intervalId = setInterval(() => this.flush(), SYNC_INTERVAL)
        this.flush()
    }

    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = null
        }
    }

    enqueueSave(entity: "note" | "workspace", data: NoteNode | Workspace) {
        const existing = this.queue.find(
            (item) =>
                item.entity === entity &&
                item.id === data.id &&
                item.action !== "delete"
        )

        if (existing) {
            existing.data = data
            existing.timestamp = Date.now()
            existing.retries = 0
        } else {
            this.queue.push({
                id: data.id,
                action: "save",
                entity,
                data,
                timestamp: Date.now(),
                retries: 0,
            })
        }

        this.flush()
    }

    enqueueDelete(entity: "note" | "workspace", id: string) {
        this.queue = this.queue.filter(
            (item) => !(item.entity === entity && item.id === id)
        )

        this.queue.push({
            id,
            action: "delete",
            entity,
            timestamp: Date.now(),
            retries: 0,
        })

        this.flush()
    }

    async pullWorkspace(workspaceId: string): Promise<NoteNode[]> {
        if (!this.online) {
            return this.local.listNotes(workspaceId)
        }

        try {
            const remoteNotes = await this.remote.listNotes(workspaceId)
            for (const note of remoteNotes) {
                await this.local.saveNote(note)
            }
            return remoteNotes
        } catch {
            return this.local.listNotes(workspaceId)
        }
    }

    async pullWorkspaces(ownerId: string): Promise<Workspace[]> {
        if (!this.online) {
            return this.local.listWorkspaces(ownerId)
        }

        try {
            const remoteWorkspaces = await this.remote.listWorkspaces(ownerId)
            for (const ws of remoteWorkspaces) {
                await this.local.saveWorkspace(ws)
            }
            return remoteWorkspaces
        } catch {
            return this.local.listWorkspaces(ownerId)
        }
    }

    private async flush() {
        if (this.syncing || !this.online || this.queue.length === 0) return

        this.syncing = true

        const batch = this.queue.splice(0, 10)

        for (const item of batch) {
            try {
                await this.processItem(item)
            } catch {
                item.retries++
                if (item.retries < MAX_RETRIES) {
                    this.queue.push(item)
                }
            }
        }

        this.syncing = false

        if (this.queue.length > 0) {
            setTimeout(() => this.flush(), 1000)
        }
    }

    private async processItem(item: SyncQueueItem): Promise<void> {
        if (item.action === "save" && item.data) {
            if (item.entity === "note") {
                await this.remote.saveNote(item.data as NoteNode)
            } else {
                await this.remote.saveWorkspace(item.data as Workspace)
            }
        } else if (item.action === "delete") {
            if (item.entity === "note") {
                await this.remote.deleteNote(item.id)
            } else {
                await this.remote.deleteWorkspace(item.id)
            }
        }
    }
}
