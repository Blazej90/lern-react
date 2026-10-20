import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Load .env.local the same way `next dev` does. Development mode ignores
// .env.production*, so a pulled production env never redirects migrations.
loadEnvConfig(process.cwd(), true);

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Migrations need a direct connection, not the pooler.
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? "" },
  strict: true,
  verbose: true,
});
