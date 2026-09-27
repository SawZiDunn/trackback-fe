import { create } from "zustand";

interface AppState {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: true,
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
}));