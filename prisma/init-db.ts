import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import dotenv from "dotenv";

const root = path.resolve(import.meta.dirname, "..");
for (const file of [".env.local", ".env"]) {
  const p = path.join(root, file);
  if (existsSync(p)) dotenv.config({ path: p });
}

const url = process.env.DATABASE_URL ?? "file:./local.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

const client = createClient({ url, authToken });

// Per-user default maintenance types are seeded at signup time
// (see src/app/api/auth/signup/route.ts), not here — this script only
// creates tables.

async function main() {
  const schemaSql = readFileSync(path.join(root, "prisma", "schema.sql"), "utf-8");
  await client.executeMultiple(schemaSql);
  console.log("Schema applied.");
}

main()
  .then(() => client.close())
  .catch((err) => {
    console.error(err);
    client.close();
    process.exit(1);
  });
