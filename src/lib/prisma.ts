import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma client singleton with the pg driver adapter.
 * Prisma 7 requires an explicit driver adapter — the classic binary engine
 * is no longer used. PrismaPg connects via the `pg` Node.js driver.
 *
 * Prevents multiple instances during hot reload in development.
 * @see https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
