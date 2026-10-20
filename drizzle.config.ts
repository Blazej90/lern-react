import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Load .env.local the same way Next.js does.
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Migrations need a direct connection, not the pooler.
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? "" },
  strict: true,
  verbose: true,
});
