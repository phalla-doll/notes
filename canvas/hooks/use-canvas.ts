"use client"

import { useEditor, type Editor } from "tldraw"

export { type Editor }

export function useCanvas(): Editor {
    return useEditor()
}
