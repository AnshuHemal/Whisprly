import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 configuration file.
 * Database connection URLs are defined here instead of in schema.prisma.
 * @see https://pris.ly/d/config-datasource
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Use process.env directly so `prisma generate` works without DATABASE_URL set
    url: process.env.DATABASE_URL ?? "",
  },
});
