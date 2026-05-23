"use client"

import { useEffect } from "react"
import { useUIStore } from "@/stores/ui-store"

export function useKeyboardShortcuts() {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            ) {
                return
            }

            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault()
                useUIStore.getState().toggleSearch()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [])
}
