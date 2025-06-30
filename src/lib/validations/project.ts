import { z } from "zod";

//Frontend validations
export const createProjectValidation = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, { message: "Title must be atleast of 2 characters" })
      .max(255, { message: "Title cannot exceed 255 characters" }),
    implementingAgency: z
      .string()
      .trim()
      .min(2, {
        message: "Implementing agency must be atleast of 2 characters"
      })
      .max(40, {
        message: "Implementing agency cannot exceed 40 characters"
      }),
    locationState: z
      .string()
      .trim()
      .min(2, { message: "State must be atleast of 2 characters" })
      .max(40, { message: "State cannot exceed 30 characters" }),
    director: z
      .string()
      .trim()
      .min(2, { message: "Director name must be atleast of 2 characters" })
      .max(40, { message: "Director name cannot exceed 30 characters" }),
    budget: z
      .number({ invalid_type_error: "Budget must be a number" })
      .nonnegative({ message: "Budget must be zero or positive" })
      .min(0, { message: "Budget must be a positive number" })
      .max(9999999999.99, {
        message: "Budget exceeds the maximum allowed value"
      })
      .transform((val) => Number(val.toFixed(2)))
      .optional()
      .nullable(),
    status: z.enum(["Active", "Completed"], {
      errorMap: () => ({
        message: "Status must be either 'Active' or 'Completed'"
      })
    }),
    startDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Invalid date format")
      .transform((date) => new Date(date))
      .optional()
      .nullable(),
    endDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Invalid date format")
      .transform((date) => new Date(date))
      .optional()
      .nullable()
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate && data.endDate < data.startDate) {
        return false;
      }
      return true;
    },
    {
      message: "End date cannot be earlier than start date",
      path: ["endDate"]
    }
  )
  .refine(
    (data) => {
      if (data.status === "Completed" && !data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: "End date is required for completed projects",
      path: ["endDate"]
    }
  );

export const updateProjectValidation = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, { message: "Title must be atleast of 2 characters" })
      .max(255, { message: "Title cannot exceed 255 characters" })
      .optional(),

    implementingAgency: z
      .string()
      .trim()
      .min(2, {
        message: "Implementing agency must be atleast of 2 characters"
      })
      .max(40, {
        message: "Implementing agency cannot exceed 40 characters"
      })
      .optional(),
    locationState: z
      .string()
      .trim()
      .min(2, { message: "State must be atleast of 2 characters" })
      .max(40, { message: "State cannot exceed 30 characters" })
      .optional(),
    director: z
      .string()
      .trim()
      .min(2, { message: "Director name must be atleast of 2 characters" })
      .max(40, { message: "Director name cannot exceed 30 characters" })
      .optional(),
    budget: z
      .number({ invalid_type_error: "Budget must be a number" })
      .nonnegative({ message: "Budget must be zero or positive" })
      .min(0, { message: "Budget must be a positive number" })
      .max(9999999999.99, {
        message: "Budget exceeds the maximum allowed value"
      })
      .transform((val) => Number(val.toFixed(2)))
      .optional()
      .nullable(),
    status: z
      .enum(["Active", "Completed"], {
        errorMap: () => ({
          message: "Status must be either 'Active' or 'Completed'"
        })
      })
      .optional(),
    startDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Invalid date format")
      .transform((date) => new Date(date))
      .optional()
      .nullable(),
    endDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Invalid date format")
      .transform((date) => new Date(date))
      .optional()
      .nullable()
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate && data.endDate < data.startDate) {
        return false;
      }
      return true;
    },
    {
      message: "End date cannot be earlier than start date",
      path: ["endDate"]
    }
  );
