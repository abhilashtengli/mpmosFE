// Minimal improvement version
import { Base_Url } from "@/lib/constants";
import axios from "axios";

const deleteFileFromCloudflare = async (key: string): Promise<boolean> => {
  if (!key?.trim()) return false;

  try {
    const response = await axios.delete(`${Base_Url}/delete-file`, {
      data: { key: key.trim() },
      withCredentials: true,
      timeout: 15000
    });

    return response.status === 200;
  } catch (error) {
    console.error("Failed to delete file:", error);
    return false;
  }
};

export default deleteFileFromCloudflare;
