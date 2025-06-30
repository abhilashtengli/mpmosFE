import { fetchProjectsAPI } from "@/services/storeServices";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Project = {
  id: string;
  implementingAgency: string;
  title: string;
  locationState: string;
  director: string;
  budget: number;
  status: "Active" | "Completed";
  startDate: string;
  endDate: string;
  createdAt: string;
};

type ProjectStore = {
  hasHydrated: boolean;
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchProjects: (force?: boolean) => Promise<void>;
  clearProjects: () => void;
  clearError: () => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: [],
      isLoading: false,
      error: null,
      lastFetched: null,
      hasHydrated: false,

      fetchProjects: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetchProjectsAPI();
          set({
            projects: response.data,
            lastFetched: Date.now(),
            error: null,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to load projects";

          console.error("Could not load projects", error);
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      clearProjects: () =>
        set({
          projects: [],
          lastFetched: null,
          error: null,
        }),

      clearError: () => set({ error: null }),

      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, project],
        })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...updates } : project
          ),
        })),

      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        })),
    }),
    {
      name: "project-storage",
      partialize: (state) => ({
        projects: state.projects,
        lastFetched: state.lastFetched,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            state.hasHydrated = true;
          }
        };
      },
    }
  )
);
