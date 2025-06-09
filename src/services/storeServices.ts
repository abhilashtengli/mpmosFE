import { Base_Url } from "@/lib/constants";
import axios from "axios";

export const fetchProjectsAPI = async () => {
  try {
    const response = await axios.get(`${Base_Url}/ne/getAll`, {
      withCredentials: true
    });
    return response.data;
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
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw error;
  }
};
