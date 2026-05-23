"use client"

import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { useEffect } from "react"

interface MarkdownEditorProps {
    markdown: string
    onChange?: (markdown: string) => void
    onFocus?: () => void
    onBlur?: () => void
    placeholder?: string
    autoFocus?: boolean
}

export function MarkdownEditor({
    markdown,
    onChange,
    onFocus,
    onBlur,
    placeholder = "Start writing...",
    autoFocus = false,
}: MarkdownEditorProps) {
    const editor = useEditor({
        extensions: [StarterKit, Placeholder.configure({ placeholder })],
        content: markdown,
        editorProps: {
            attributes: {
                class: "markdown-editor-content",
            },
        },
        onUpdate: ({ editor: e }) => {
            const html = e.getHTML()
            onChange?.(html)
        },
        onFocus: () => onFocus?.(),
        onBlur: () => onBlur?.(),
        autofocus: autoFocus,
    })

    useEffect(() => {
        if (editor && markdown !== editor.getHTML()) {
            editor.commands.setContent(markdown)
        }
    }, [markdown, editor])

    if (!editor) return null

    return <EditorContent editor={editor} />
}

export type { Editor }
