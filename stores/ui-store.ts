import { create } from "zustand"

interface UIState {
    searchOpen: boolean
    activeNoteId: string | null
    sidebarOpen: boolean

    openSearch: () => void
    closeSearch: () => void
    toggleSearch: () => void
    setActiveNote: (id: string | null) => void
    setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
    searchOpen: false,
    activeNoteId: null,
    sidebarOpen: false,

    openSearch: () => set({ searchOpen: true }),
    closeSearch: () => set({ searchOpen: false }),
    toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
    setActiveNote: (id) => set({ activeNoteId: id }),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
