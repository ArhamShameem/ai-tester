import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name must be less than 100 characters"),

  url: z
    .string()
    .trim()
    .url("Please provide a valid URL (e.g. https://example.com)")
    .refine(
      (val) => val.startsWith("http://") || val.startsWith("https://"),
      "URL must start with http:// or https://"
    )
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name must be less than 100 characters")
    .optional(),

  url: z
    .string()
    .trim()
    .url("Please provide a valid URL (e.g. https://example.com)")
    .refine(
      (val) => val.startsWith("http://") || val.startsWith("https://"),
      "URL must start with http:// or https://"
    )
    .optional()
}).refine(
  (data) => data.name !== undefined || data.url !== undefined,
  "At least one field (name or url) must be provided for update"
);
