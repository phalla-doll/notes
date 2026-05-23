"use client"

import { type ZoomLevel } from "@/types/canvas"
import { type NoteNode } from "@/types/note"

interface ZoomRendererProps {
    note: Pick<NoteNode, "title" | "preview" | "color"> & {
        html?: string
    }
    level: ZoomLevel
}

const khmerFontFamily =
    "var(--font-khmer), var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"

export function ZoomRenderer({ note, level }: ZoomRendererProps) {
    const color = note.color ?? "#3b82f6"

    switch (level) {
        case "block":
            return (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        background: color,
                        borderRadius: 8,
                        opacity: 0.8,
                    }}
                />
            )

        case "title":
            return (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        background: "var(--color-background)",
                        borderRadius: 8,
                        border: `2px solid ${color}`,
                        padding: "8px 12px",
                        display: "flex",
                        alignItems: "flex-start",
                        fontFamily: khmerFontFamily,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--color-foreground)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {note.title || "Untitled"}
                </div>
            )

        case "preview":
            return (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        background: "var(--color-background)",
                        borderRadius: 8,
                        border: `2px solid ${color}`,
                        padding: "8px 12px",
                        fontFamily: khmerFontFamily,
                        fontSize: 11,
                        color: "var(--color-foreground)",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            fontWeight: 600,
                            fontSize: 12,
                            marginBottom: 4,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {note.title || "Untitled"}
                    </div>
                    <div
                        style={{
                            opacity: 0.7,
                            lineHeight: 1.4,
                            display: "-webkit-box",
                            WebkitLineClamp: 5,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        {note.preview}
                    </div>
                </div>
            )

        case "full":
        case "editor":
            return (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        background: "var(--color-background)",
                        borderRadius: 8,
                        border: `2px solid ${color}`,
                        padding: "8px 12px",
                        fontFamily: khmerFontFamily,
                        fontSize: 12,
                        color: "var(--color-foreground)",
                        overflow: "auto",
                    }}
                >
                    {note.html ? (
                        <div
                            style={{ lineHeight: 1.5 }}
                            dangerouslySetInnerHTML={{ __html: note.html }}
                        />
                    ) : (
                        <div style={{ opacity: 0.5, fontStyle: "italic" }}>
                            Empty note
                        </div>
                    )}
                </div>
            )
    }
}
