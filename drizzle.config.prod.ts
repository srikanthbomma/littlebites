import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Production Drizzle config: reads the connection string from DATABASE_URL.
// Use this to create your tables on a hosted database (Neon / Supabase / Vercel Postgres):
//
//   DATABASE_URL="postgresql://...your-hosted-url..." npx drizzle-kit push --config=drizzle.config.prod.ts
//
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Run with your hosted connection string, e.g.\n" +
      '  DATABASE_URL="postgresql://user:pass@host/db?sslmode=require" npx drizzle-kit push --config=drizzle.config.prod.ts'
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
