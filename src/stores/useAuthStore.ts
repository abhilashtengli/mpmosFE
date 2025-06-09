// src/stores/useAuthStore.ts
import { fetchloggedInUser } from "@/services/storeServices";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
};

type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  fetchUser: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
          error: null
        }),

      fetchUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await fetchloggedInUser();
          set({
            user: data,
            isAuthenticated: true,
            error: null
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch user information";

          console.error("Error fetching user:", error);
          set({
            user: null,
            isAuthenticated: false,
            error: errorMessage
          });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null
        });
        // Only clear auth-related localStorage
        localStorage.removeItem("auth-storage");
      },
      clearError: () => set({ error: null })
    }),
    {
      name: "auth-storage", // key in localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }) // only persist `user`
    }
  )
);
