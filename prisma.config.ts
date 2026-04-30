import { config } from "dotenv";
import { resolve } from "path";
import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma 7 configuration file.
 *
 * Prisma 7 requires the driver adapter to be provided both:
 *  1. In prisma.config.ts (for CLI commands like db push, migrate)
 *  2. In PrismaClient constructor (for runtime queries)
 *
 * Connection strategy:
 *  - DIRECT_URL  → used by Prisma CLI (db push, migrate) — session pooler port 5432
 *  - DATABASE_URL → used by PrismaClient at runtime — transaction pooler port 6543
 */

// Load .env.local first (Next.js convention, highest priority)
config({ path: resolve(process.cwd(), ".env.local"), override: false });
// Fall back to .env (standard dotenv convention)
config({ path: resolve(process.cwd(), ".env"), override: false });

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: connectionString,
  },
  ...(connectionString
    ? {
        adapter: async () => {
          return new PrismaPg({ connectionString });
        },
      }
    : {}),
});
