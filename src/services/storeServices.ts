import { Base_Url } from "@/lib/constants";
import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";

export const fetchProjectsAPI = async () => {
  try {
    const user = useAuthStore.getState().user;
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
    console.log("Re : ", response?.data);
    return response?.data;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    throw error;
  }
};

export const fetchloggedInUser = async () => {
  try {
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
