import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createSafeDb(): PrismaClient {
  try {
    if (globalForPrisma.prisma) return globalForPrisma.prisma;
    
    // Only instantiate real PrismaClient if DATABASE_URL is set
    if (process.env.DATABASE_URL) {
      const client = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = client;
      }
      return client;
    }
  } catch (err) {
    console.warn("Prisma initialization skipped (no valid DATABASE_URL):", err);
  }

  // Safe fallback proxy so DB calls gracefully return null instead of crashing Serverless functions
  const fallbackHandler: ProxyHandler<any> = {
    get(_target, prop) {
      if (typeof prop === "string" && (prop.startsWith("$") || prop === "then")) {
        return () => Promise.resolve(null);
      }
      return new Proxy({}, {
        get() {
          return () => Promise.resolve(null);
        },
      });
    },
  };

  return new Proxy({} as PrismaClient, fallbackHandler);
}

export const db = createSafeDb();
