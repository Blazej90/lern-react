import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function createDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Brakuje DATABASE_URL w środowisku.");
  }
  return drizzle(neon(process.env.DATABASE_URL), { schema });
}

// Created on first use: neon() throws without a connection string, and
// `next build` imports route modules to collect page data.
let db: ReturnType<typeof createDb> | null = null;

export function getDb() {
  db ??= createDb();
  return db;
}
