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

// CREATE TABLE IF NOT EXISTS in schema.sql only handles brand-new databases.
// Columns added to an already-existing table (like Vehicle.grade below) need
// an explicit ALTER TABLE here so `npm run db:init` also upgrades existing
// databases (local or Turso) in place. Safe to re-run: already-applied
// statements are skipped.
const ALTER_STATEMENTS = [
  `ALTER TABLE "Vehicle" ADD COLUMN "grade" TEXT`,
  `ALTER TABLE "Vehicle" ADD COLUMN "plateNumber" TEXT`,
  `ALTER TABLE "Vehicle" ADD COLUMN "purchaseDate" DATETIME`,
  `ALTER TABLE "MaintenanceType" ADD COLUMN "vehicleType" TEXT`,
  `ALTER TABLE "User" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT 0`,
];

async function main() {
  const schemaSql = readFileSync(path.join(root, "prisma", "schema.sql"), "utf-8");
  await client.executeMultiple(schemaSql);

  for (const statement of ALTER_STATEMENTS) {
    try {
      await client.execute(statement);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!/duplicate column name/i.test(message)) throw err;
    }
  }

  console.log("Schema applied.");
}

main()
  .then(() => client.close())
  .catch((err) => {
    console.error(err);
    client.close();
    process.exit(1);
  });
