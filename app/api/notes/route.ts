import { NextResponse, type NextRequest } from "next/server"

const notes = new Map<string, import("@/types/note").NoteNode>()

export async function GET(request: NextRequest) {
    const workspaceId = request.nextUrl.searchParams.get("workspaceId")
    if (!workspaceId) {
        return NextResponse.json(
            { error: "workspaceId is required" },
            { status: 400 }
        )
    }

    const result = Array.from(notes.values()).filter(
        (n) => n.workspaceId === workspaceId
    )
    return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
    const note: import("@/types/note").NoteNode = await request.json()
    notes.set(note.id, note)
    return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
    const { id } = await request.json()
    if (!id) {
        return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    notes.delete(id)
    return NextResponse.json({ ok: true })
}
