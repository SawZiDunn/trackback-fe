import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types/common";

export interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  logout: () => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      logout: () => set({ user: null }),
      isSidebarOpen: true,
      setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
    }),
    {
      name: "trackback-auth",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

// Alias useAuthStore to useAppStore according to PROJECT_SETUP.md conventions
export const useAuthStore = useAppStore;