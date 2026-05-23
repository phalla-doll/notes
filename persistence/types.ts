import type { NoteNode, NoteConnection } from "@/types/note"
import type { Workspace } from "@/types/workspace"

export interface PersistencePort {
    saveNote(note: NoteNode): Promise<void>
    loadNote(id: string): Promise<NoteNode | null>
    deleteNote(id: string): Promise<void>
    listNotes(workspaceId: string): Promise<NoteNode[]>
    saveWorkspace(workspace: Workspace): Promise<void>
    loadWorkspace(id: string): Promise<Workspace | null>
    listWorkspaces(ownerId: string): Promise<Workspace[]>
    deleteWorkspace(id: string): Promise<void>
    saveConnection(connection: NoteConnection): Promise<void>
    deleteConnection(id: string): Promise<void>
    listConnections(workspaceId: string): Promise<NoteConnection[]>
}
