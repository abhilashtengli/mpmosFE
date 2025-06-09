import { z } from "zod";

export const createInputDistributionValidation = z
  .object({
    projectId: z.string().uuid({ message: "Valid project ID is required" }),

    quarterId: z.string().uuid({ message: "Valid quarter ID is required" }),

    activityType: z
      .string()
      .trim()
      .min(2, { message: "Activity type must be at least 2 characters" })
      .max(100, { message: "Activity type cannot exceed 100 characters" }),

    name: z
      .string()
      .trim()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(200, { message: "Name cannot exceed 200 characters" }),

    target: z
      .number({ invalid_type_error: "Target must be a number" })
      .int({ message: "Target must be an integer" })
      .positive({ message: "Target must be a positive number" }),

    achieved: z
      .number({ invalid_type_error: "Achieved must be a number" })
      .int({ message: "Achieved must be an integer" })
      .nonnegative({ message: "Achieved must be zero or positive" }),

    district: z
      .string()
      .trim()
      .min(2, { message: "District must be at least 2 characters" })
      .max(100, { message: "District cannot exceed 100 characters" }),

    village: z
      .string()
      .trim()
      .min(2, { message: "Village must be at least 2 characters" })
      .max(100, { message: "Village cannot exceed 100 characters" }),

    block: z
      .string()
      .trim()
      .min(2, { message: "Block must be at least 2 characters" })
      .max(100, { message: "Block cannot exceed 100 characters" }),

    remarks: z
      .string()
      .trim()
      .max(300, { message: "Remarks cannot exceed 300 characters" })
      .optional()
      .nullable(),

    units: z
      .string()
      .trim()
      .max(20, { message: "Units cannot exceed 20 characters" })
      .optional()
      .nullable(),

    imageUrl: z
      .string()
      .url({ message: "Invalid image URL format" })
      .optional()
      .nullable(),

    imageKey: z.string().trim().optional().nullable()
  })
  .refine(
    data => {
      return data.achieved <= data.target;
    },
    {
      message: "Achieved count cannot exceed target count",
      path: ["achieved"]
    }
  )
  .refine(
    data => {
      // If imageUrl is provided, imageKey must also be provided
      if (data.imageUrl && !data.imageKey) {
        return false;
      }
      return true;
    },
    {
      message: "Image key is required when image URL is provided",
      path: ["imageKey"]
    }
  );

export const updateInputDistributionValidation = z
  .object({
    projectId: z
      .string()
      .uuid({ message: "Valid project ID is required" })
      .optional(),

    quarterId: z
      .string()
      .uuid({ message: "Valid quarter ID is required" })
      .optional(),

    activityType: z
      .string()
      .trim()
      .min(2, { message: "Activity type must be at least 2 characters" })
      .max(100, { message: "Activity type cannot exceed 100 characters" })
      .optional(),

    name: z
      .string()
      .trim()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(200, { message: "Name cannot exceed 200 characters" })
      .optional(),

    target: z
      .number({ invalid_type_error: "Target must be a number" })
      .int({ message: "Target must be an integer" })
      .positive({ message: "Target must be a positive number" })
      .optional(),

    achieved: z
      .number({ invalid_type_error: "Achieved must be a number" })
      .int({ message: "Achieved must be an integer" })
      .nonnegative({ message: "Achieved must be zero or positive" })
      .optional(),

    district: z
      .string()
      .trim()
      .min(2, { message: "District must be at least 2 characters" })
      .max(100, { message: "District cannot exceed 100 characters" })
      .optional(),

    village: z
      .string()
      .trim()
      .min(2, { message: "Village must be at least 2 characters" })
      .max(100, { message: "Village cannot exceed 100 characters" })
      .optional(),

    block: z
      .string()
      .trim()
      .min(2, { message: "Block must be at least 2 characters" })
      .max(100, { message: "Block cannot exceed 100 characters" })
      .optional(),

    remarks: z
      .string()
      .trim()
      .max(300, { message: "Remarks cannot exceed 300 characters" })
      .optional()
      .nullable(),

    units: z
      .string()
      .trim()
      .max(20, { message: "Units cannot exceed 20 characters" })
      .optional()
      .nullable(),

    imageUrl: z
      .string()
      .url({ message: "Invalid image URL format" })
      .optional()
      .nullable(),

    imageKey: z.string().optional().nullable()
  })
  .refine(
    data => {
      // Skip refinement if we don't have both target and achieved
      if (data.target === undefined || data.achieved === undefined) {
        return true;
      }
      // For update validation, we need to compare the values only if both are provided
      return data.achieved <= data.target;
    },
    {
      message: "Achieved count cannot exceed target count",
      path: ["achieved"]
    }
  )
  .refine(
    data => {
      // Skip if imageUrl is not being updated
      if (data.imageUrl === undefined) {
        return true;
      }
      // If imageUrl is null, we don't need to check for imageKey
      if (data.imageUrl === null) {
        return true;
      }
      // If setting a new imageUrl, ensure imageKey is also set
      if (data.imageUrl && !data.imageKey) {
        return false;
      }
      return true;
    },
    {
      message: "Image key is required when image URL is provided",
      path: ["imageKey"]
    }
  );
