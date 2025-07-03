// src/stores/useAuthStore.ts
import { Base_Url } from "@/lib/constants";
import { fetchloggedInUser } from "@/services/storeServices";
import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  sessionId: string;
};

type AuthState = {
  handleAuthError: (errorMessage?: string) => void;
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

      logout: async () => {
        const toastLoading = toast.loading("Logging out...");
        try {
          await axios.post(`${Base_Url}/logout`, {}, { withCredentials: true }); // ✅ Correctly placed
        } catch (err) {
          console.warn("Logout API failed:", err);
        }
        // Clear cookie first
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Update state
        set({
          user: null,
          isAuthenticated: false,
          error: null
        });

        // Clear additional localStorage items
        localStorage.removeItem("project-storage");
        localStorage.removeItem("project-storage");
        toast.dismiss(toastLoading);
        toast.success("Logged out successfully", {
          description: "You have been logged out. See you again soon!"
        });
        // Redirect
        setTimeout(() => {
          window.location.href = `${window.location.origin}/admin/signin`;
        }, 1000);
      },
      handleAuthError: async (errorMessage?: string) => {
        try {
          await axios.post(`${Base_Url}/logout`, {}, { withCredentials: true }); // ✅ Correctly placed
        } catch (err) {
          console.warn("Logout API failed:", err);
        }
        // Clear cookie
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        set({
          user: null,
          isAuthenticated: false,
          error: errorMessage || "Authentication error"
        });

        // Clear auth-related localStorage
        localStorage.removeItem("auth-storage");
        localStorage.removeItem("project-storage");

        // Redirect to signin page
        setTimeout(() => {
          window.location.href = `${window.location.origin}/admin/signin`;
        }, 1000);
      },
      clearError: () => set({ error: null })
    }),
    {
      name: "auth-storage", // key in localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }) // only persist `user`
    }
  )
);
