import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const createProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters").max(64),
  domain: z
    .string()
    .min(3, "Domain is required")
    .regex(
      /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
      "Enter a valid domain (e.g. example.com)"
    ),
  description: z.string().max(256).optional(),
  color: z.string().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const triggerSEOAuditSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

export const triggerAIAuditSchema = z.object({
  query: z.string().min(3, "Query must be at least 3 characters").max(256),
  engines: z.array(z.enum(["CHATGPT", "GEMINI", "PERPLEXITY", "CLAUDE", "COPILOT", "GROK"])).min(1),
});

export const addCompetitorSchema = z.object({
  domain: z
    .string()
    .min(3)
    .regex(
      /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
      "Enter a valid domain"
    ),
  name: z.string().max(64).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type TriggerSEOAuditInput = z.infer<typeof triggerSEOAuditSchema>;
export type TriggerAIAuditInput = z.infer<typeof triggerAIAuditSchema>;
export type AddCompetitorInput = z.infer<typeof addCompetitorSchema>;
