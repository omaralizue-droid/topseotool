import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";
import { comparePassword } from "@/lib/password";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth";

import { logSecurityAudit } from "@/lib/security/audit-logger";

const isProduction = process.env.NODE_ENV === "production";

const nextAuthInstance = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "default_auth_secret_for_topseotool_dev_32chars_long",
  trustHost: true,
  ...(process.env.DATABASE_URL ? { adapter: PrismaAdapter(db) } : {}),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: isProduction ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          void logSecurityAudit({
            eventType: "auth.login.failed",
            status: "DENIED",
            metadata: { reason: "validation_failed" },
          });
          return null;
        }

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.password) {
          void logSecurityAudit({
            eventType: "auth.login.failed",
            actorEmail: email,
            status: "DENIED",
            metadata: { reason: "user_not_found_or_no_password" },
          });
          return null;
        }

        const valid = await comparePassword(password, user.password);
        if (!valid) {
          void logSecurityAudit({
            eventType: "auth.login.failed",
            actorId: user.id,
            actorEmail: email,
            status: "DENIED",
            metadata: { reason: "invalid_password" },
          });
          return null;
        }

        void logSecurityAudit({
          eventType: "auth.login.success",
          actorId: user.id,
          actorEmail: user.email,
          actorRole: user.role,
          status: "SUCCESS",
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});

export const { handlers, signIn, signOut } = nextAuthInstance;

export const auth = async (...args: any[]): Promise<any> => {
  if (BYPASS_AUTH) {
    return MOCK_SESSION as any;
  }
  return (nextAuthInstance.auth as any)(...args);
};