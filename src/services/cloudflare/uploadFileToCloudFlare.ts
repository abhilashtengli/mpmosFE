// src/utils/uploadFileToCloudflare.ts

import axios, { AxiosError } from "axios";

export type UploadResult = {
  success: boolean;
  error?: string;
};

const uploadFileToCloudflare = async (
  file: File,
  signedUrl: string
): Promise<UploadResult> => {
  // Input validation
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  if (!signedUrl) {
    return { success: false, error: "No upload URL provided" };
  }

  try {
    const response = await axios.put(signedUrl, file, {
      headers: {
        "Content-Type": file.type
      },
      timeout: 60000, // 60 seconds for file uploads
      maxContentLength: 20 * 1024 * 1024, // 20MB max
      maxBodyLength: 20 * 1024 * 1024, // 20MB max
      // Disable automatic JSON parsing since we're uploading a file
      transformResponse: (data) => data
    });

    // Cloudflare R2 typically returns 200 for successful uploads
    if (response.status === 200) {
      return {
        success: true
      };
    } else {
      return {
        success: false,
        error: `Upload failed with status: ${response.status}`
      };
    }
  } catch (error) {
    // Enhanced error handling
    if (error instanceof AxiosError) {
      if (error.code === "ECONNABORTED") {
        return {
          success: false,
          error: "Upload timeout - file too large or slow connection"
        };
      }

      if (error.response) {
        const status = error.response.status;
        switch (status) {
          case 403:
            return {
              success: false,
              error: "Upload URL expired or invalid permissions"
            };
          case 404:
            return { success: false, error: "Upload URL not found" };
          case 413:
            return { success: false, error: "File too large" };
          default:
            return { success: false, error: `Upload failed: ${status}` };
        }
      }

      if (error.request) {
        return {
          success: false,
          error: "Network error - please check your connection"
        };
      }
    }

    // Log error for debugging (use proper logging service in production)
    console.error("Upload error:", error);

    return { success: false, error: "Upload failed - please try again later" };
  }
};

export default uploadFileToCloudflare;
