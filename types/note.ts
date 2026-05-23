import { z } from "zod"

export const PositionSchema = z.object({
    x: z.number(),
    y: z.number(),
})

export const SizeSchema = z.object({
    width: z.number().positive(),
    height: z.number().positive(),
})

export const NoteNodeSchema = z.object({
    id: z.string(),
    workspaceId: z.string(),
    title: z.string(),
    markdown: z.string(),
    preview: z.string(),
    position: PositionSchema,
    size: SizeSchema,
    color: z.string().optional(),
    tags: z.array(z.string()),
    links: z.array(z.string()),
    createdAt: z.number(),
    updatedAt: z.number(),
})

export type Position = z.infer<typeof PositionSchema>
export type Size = z.infer<typeof SizeSchema>
export type NoteNode = z.infer<typeof NoteNodeSchema>

export const ConnectionTypeSchema = z.enum([
    "reference",
    "related",
    "dependency",
    "idea",
])

export const NoteConnectionSchema = z.object({
    id: z.string(),
    fromNoteId: z.string(),
    toNoteId: z.string(),
    type: ConnectionTypeSchema,
})

export type ConnectionType = z.infer<typeof ConnectionTypeSchema>
export type NoteConnection = z.infer<typeof NoteConnectionSchema>

export function createPreview(markdown: string, maxLength: number = 120): string {
    const stripped = markdown
        .replace(/^#+\s+/gm, "")
        .replace(/\*\*|__/g, "")
        .replace(/\*|_/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/`{1,3}[^`]*`{1,3}/g, "")
        .replace(/\n{2,}/g, " ")
        .replace(/\n/g, " ")
        .trim()
    return stripped.length > maxLength
        ? stripped.slice(0, maxLength) + "..."
        : stripped
}
