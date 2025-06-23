import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";
import { toast } from "sonner";
import { Base_Url } from "@/lib/constants";
import { BarChart3, LucideIcon } from "lucide-react";

export interface ActivityCategory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  User: {
    id: string;
    name: string;
  };
}

export interface ActivityCategoryNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface ActivityCategoriesState {
  // State
  categories: ActivityCategory[];
  navItems: ActivityCategoryNavItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCategories: (userRole: string) => Promise<void>;
  createCategory: (name: string) => Promise<boolean>;
  updateCategory: (id: string, name: string) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  clearError: () => void;

  // Helper methods
  getCategoryById: (id: string) => ActivityCategory | undefined;
  refreshCategories: (userRole: string) => Promise<void>;
}

export const useActivityCategoriesStore = create<ActivityCategoriesState>()(
  devtools(
    (set, get) => ({
      // Initial state
      categories: [],
      navItems: [],
      isLoading: false,
      error: null,

      // Fetch categories from API
      fetchCategories: async (userRole: string) => {
        set({ isLoading: true, error: null });

        try {
          const endpoint =
            userRole === "admin"
              ? "get-admin-activity-category"
              : "get-user-activity-category";

          const response = await axios.get(`${Base_Url}/${endpoint}`, {
            withCredentials: true,
          });

          const categories = response.data.data;

          // Transform categories to navigation items
          const navItems = categories.map((category: ActivityCategory) => ({
            name: category.name,
            href: `/admin/activity/${category.id}`,
            icon: BarChart3,
          }));

          set({
            categories,
            navItems,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error("Error fetching activity categories:", error);
          set({
            isLoading: false,
            error: "Failed to fetch activity categories",
          });
          toast.error("Failed", {
            description:
              "An unexpected error occurred while fetching Activity categories",
          });
        }
      },

      // Create new category
      createCategory: async (name: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await axios.post(
            `${Base_Url}/create-activity-category`,
            { name: name },
            { withCredentials: true }
          );

          const newCategory = response.data.data;
          const newNavItem = {
            name: newCategory.name,
            href: `/admin/activity/${newCategory.id}`,
            icon: BarChart3,
          };

          set((state) => ({
            categories: [...state.categories, newCategory],
            navItems: [...state.navItems, newNavItem],
            isLoading: false,
            error: null,
          }));

          toast.success("Success", {
            description: "Activity category created successfully",
          });

          return true;
        } catch (error) {
          console.error("Error creating activity category:", error);
          set({
            isLoading: false,
            error: "Failed to create activity category",
          });
          toast.error("Failed", {
            description:
              "Failed to create activity category. Please try again.",
          });
          return false;
        }
      },

      // Update category
      updateCategory: async (id: string, name: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await axios.put(
            `${Base_Url}/update-activity-category/${id}`,
            { name: name.trim() },
            { withCredentials: true }
          );

          if (response.data.success) {
            set((state) => ({
              categories: state.categories.map((cat) =>
                cat.id === id ? { ...cat, name: name.trim() } : cat
              ),
              navItems: state.navItems.map((item) =>
                item.href === `/admin/activity/${id}`
                  ? { ...item, name: name.trim() }
                  : item
              ),
              isLoading: false,
              error: null,
            }));

            toast.success("Category name updated successfully");
            return true;
          }
          return false;
        } catch (error) {
          console.error("Error updating category name:", error);
          set({
            isLoading: false,
            error: "Failed to update category name",
          });
          toast.error("Failed to update category name");
          return false;
        }
      },

      // Delete category
      deleteCategory: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.delete(
            `${Base_Url}/delete-activity-category/${id}`,
            { withCredentials: true }
          );
          if (response.data.success) {
            set((state) => ({
              categories: state.categories.filter((cat) => cat.id !== id),
              navItems: state.navItems.filter(
                (item) => item.href !== `/admin/activity/${id}`
              ),
              isLoading: false,
              error: null,
            }));

            toast.success("Activity category deleted successfully");
            return true;
          }
          return false;
        } catch (error) {
          console.error("Error deleting category:", error);
          set({
            isLoading: false,
            error: "Failed to delete activity category",
          });
          toast.error("Failed to delete activity category");
          return false;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Get category by ID
      getCategoryById: (id: string) => {
        return get().categories.find((cat) => cat.id === id);
      },

      // Refresh categories (useful after updates)
      refreshCategories: async (userRole: string) => {
        await get().fetchCategories(userRole);
      },
    }),
    {
      name: "activity-categories-store",
    }
  )
);
