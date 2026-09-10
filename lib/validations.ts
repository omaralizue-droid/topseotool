import { z } from "zod";
import { sanitizeInputString } from "@/lib/security/input-guard";

const cleanString = (min: number, max: number) =>
  z
    .string()
    .min(min)
    .max(max)
    .transform((s) => sanitizeInputString(s.trim()));

export const registerSchema = z.object({
  name: cleanString(2, 64),
  email: z.string().email("Invalid email address").max(128).transform((e) => e.toLowerCase().trim()),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").max(128).transform((e) => e.toLowerCase().trim()),
  password: z.string().min(1, "Password is required").max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").max(128).transform((e) => e.toLowerCase().trim()),
});

export const createProjectSchema = z.object({
  name: cleanString(2, 64),
  domain: z
    .string()
    .min(3, "Domain is required")
    .max(128)
    .regex(
      /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
      "Enter a valid domain (e.g. example.com)"
    )
    .transform((d) => d.toLowerCase().trim()),
  country: z.string().max(64).default("United States"),
  language: z.string().max(64).default("English"),
  searchEngine: z.string().max(64).default("Google"),
  device: z.enum(["Desktop", "Mobile"]).default("Desktop"),
  keywordsCount: z.coerce.number().int().min(1).max(50000).default(5000),
  competitorsCount: z.coerce.number().int().min(1).max(100).default(10),
  seedKeywords: z.string().max(2048).optional(),
  seedCompetitors: z.string().max(2048).optional(),
  description: cleanString(0, 256).optional(),
  color: z.string().max(16).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const triggerSEOAuditSchema = z.object({
  url: z
    .string()
    .url("Please enter a valid URL")
    .max(2048)
    .refine(
      (u) => u.startsWith("https://") || u.startsWith("http://"),
      "Only HTTP and HTTPS URLs are allowed"
    ),
});

export const triggerAIAuditSchema = z.object({
  query: cleanString(3, 256),
  engines: z.array(z.enum(["CHATGPT", "GEMINI", "PERPLEXITY", "CLAUDE", "COPILOT", "GROK"])).min(1),
});

export const addCompetitorSchema = z.object({
  domain: z
    .string()
    .min(3)
    .max(128)
    .regex(
      /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
      "Enter a valid domain"
    )
    .transform((d) => d.toLowerCase().trim()),
  name: cleanString(1, 64).optional(),
});

export const createApiKeySchema = z.object({
  name: cleanString(2, 64),
  scopes: z.array(z.string().max(32)).default(["*"]),
  rateLimitPerMin: z.coerce.number().int().min(10).max(1000).default(120),
});

export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address").max(128).transform((e) => e.toLowerCase().trim()),
  role: z.enum(["ADMIN", "MANAGER", "MEMBER", "API_USER"]).default("MEMBER"),
});

export const updateOrgBrandingSchema = z.object({
  name: cleanString(2, 64).optional(),
  logoUrl: z.string().url().max(1024).optional().or(z.literal("")),
  billingEmail: z.string().email().max(128).optional().or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type TriggerSEOAuditInput = z.infer<typeof triggerSEOAuditSchema>;
export type TriggerAIAuditInput = z.infer<typeof triggerAIAuditSchema>;
export type AddCompetitorInput = z.infer<typeof addCompetitorSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateOrgBrandingInput = z.infer<typeof updateOrgBrandingSchema>;
