import { Base_Url } from "@/lib/constants";
import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";
import { toast } from "sonner";

export const fetchProjectsAPI = async () => {
  try {
    const user = useAuthStore.getState().user;
    const handleAuthError = useAuthStore.getState().handleAuthError;
    let response;
    if (user?.role === "admin") {
      response = await axios.get(`${Base_Url}/get-admin-projects`, {
        withCredentials: true
      });
    } else {
      response = await axios.get(`${Base_Url}/get-user-projects`, {
        withCredentials: true
      });
    }
    // console.log("Re : ", response?.data);
    if (response.data.code === "NO_PROJECTS_FOUND") {
      toast.info("No Projects Found", {
        description: "No project data available. Please add new project."
      });
    } else if (
      [
        "UNAUTHORIZED",
        "USER_NOT_FOUND",
        "SESSION_NOT_FOUND",
        "SESSION_EXPIRED"
      ].includes(response.data.code)
    ) {
      toast.info("You're logged out", {
        description:
          response.data?.message ||
          "Your session has expired or your account was signed in from another device. Please sign in again."
      });
      handleAuthError(response.data.message);
      return;
    }
    return response?.data;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    throw error;
  }
};

export const fetchloggedInUser = async () => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const response = await axios.get(`${Base_Url}/get-me`, {
      withCredentials: true
    });
    // console.log("ME : ", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw error;
  }
};
