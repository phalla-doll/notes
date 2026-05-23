import { NextResponse, type NextRequest } from "next/server"

const workspaces = new Map<string, import("@/types/workspace").Workspace>()

export async function GET(request: NextRequest) {
    const ownerId = request.nextUrl.searchParams.get("ownerId")
    if (!ownerId) {
        return NextResponse.json(
            { error: "ownerId is required" },
            { status: 400 },
        )
    }

    const result = Array.from(workspaces.values()).filter(
        (w) => w.ownerId === ownerId,
    )
    return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
    const workspace: import("@/types/workspace").Workspace =
        await request.json()
    workspaces.set(workspace.id, workspace)
    return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
    const { id } = await request.json()
    if (!id) {
        return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    workspaces.delete(id)
    return NextResponse.json({ ok: true })
}
