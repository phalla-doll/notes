"use client"

import { useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { useCallback } from "react"

interface UseMarkdownEditorOptions {
    markdown: string
    onChange?: (markdown: string) => void
    placeholder?: string
}

export function useMarkdownEditor({
    markdown,
    onChange,
    placeholder = "Start writing...",
}: UseMarkdownEditorOptions) {
    const editor = useEditor({
        extensions: [StarterKit, Placeholder.configure({ placeholder })],
        content: markdown,
        onUpdate: ({ editor: e }) => {
            onChange?.(e.getHTML())
        },
    })

    const getContent = useCallback(() => {
        return editor?.getHTML() ?? ""
    }, [editor])

    const getMarkdown = useCallback(() => {
        if (!editor) return ""
        return htmlToMarkdown(editor.getHTML())
    }, [editor])

    return { editor, getContent, getMarkdown }
}

function htmlToMarkdown(html: string): string {
    const temp = document.createElement("div")
    temp.innerHTML = html
    return temp.textContent ?? ""
}
