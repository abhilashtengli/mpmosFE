import { Base_Url } from "@/lib/constants";
import axios from "axios";

const deleteFileFromCloudflare = async (key: string): Promise<boolean> => {
  if (!key?.trim()) return false;

  const maxRetries = 3;
  const baseDelay = 1000; // 1 second base delay

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Add delay before each attempt (except the first one)
      if (attempt > 1) {
        const delay = baseDelay * Math.pow(2, attempt - 2); // Exponential backoff: 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      const response = await axios.delete(`${Base_Url}/delete-file`, {
        data: { key },
        withCredentials: true,
        timeout: 20000
      });
      if (response.status === 200) {
        return true;
      }
    } catch (error) {
      // Don't retry on certain errors
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        // Don't retry on 404 (already deleted) or 403 (forbidden)
        if (status === 404) {
          // console.log(`File ${key} not found (already deleted)`);
          return true; // Consider 404 as success
        }
        if (status === 403) {
          console.error(`Access denied for key ${key}`);
          return false; // Don't retry on auth issues
        }
      }

      // If this was the last attempt, return false
      if (attempt === maxRetries) {
        return false;
      }
    }
  }

  return false;
};

export default deleteFileFromCloudflare;
