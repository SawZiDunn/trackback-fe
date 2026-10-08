import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserInfo } from "../api/auth";

interface AuthState {
  user: UserInfo | null;
  setUser: (user: UserInfo) => void;
  clearUser: () => void;
}

// Observer pattern: global auth state persisted to localStorage
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "trackback-auth",
    },
  ),
);
