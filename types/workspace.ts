import { z } from "zod"

export const WorkspaceSchema = z.object({
    id: z.string(),
    name: z.string(),
    ownerId: z.string(),
    createdAt: z.number(),
    updatedAt: z.number(),
})

export type Workspace = z.infer<typeof WorkspaceSchema>
