import { Base_Url, SignedUrlResponse } from "@/lib/constants";
import axios from "axios";

type FileData = {
  fileName: string;
  contentType: string;
};

export const getSignedUrl = async (
  fileData: FileData
): Promise<SignedUrlResponse | null> => {
  try {
    const { data } = await axios.post<SignedUrlResponse>(
      `${Base_Url}/getSigned-url`,
      fileData,
      {
        withCredentials: true,
        timeout: 10000 // 10 second timeout
      }
    );

    if (!data) {
      throw new Error("No data received from server");
    }

    return data;
  } catch (error) {
    // Log error for debugging (use proper logging in production)
    console.error("Failed to get signed URL:", error);

    // Return null to indicate failure
    return null;
  }
};
