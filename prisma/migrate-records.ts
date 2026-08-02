// One-off script to migrate Vehicle / MaintenanceType / MaintenanceRecord rows
// from another deployment's database into this app's database.
//
// Usage:
//   SOURCE_DATABASE_URL="libsql://old-app-xxx.turso.io" \
//   SOURCE_DATABASE_AUTH_TOKEN="..." \
//   npm run db:migrate-records
//
// Target DB is read the same way as prisma/init-db.ts (DATABASE_URL /
// DATABASE_AUTH_TOKEN from .env.local or .env, i.e. this app's own DB).
//
// Safe to re-run: existing rows (matched by id) are left untouched.

import { existsSync } from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import dotenv from "dotenv";

const root = path.resolve(import.meta.dirname, "..");
for (const file of [".env.local", ".env"]) {
  const p = path.join(root, file);
  if (existsSync(p)) dotenv.config({ path: p });
}

const sourceUrl = process.env.SOURCE_DATABASE_URL;
const sourceAuthToken = process.env.SOURCE_DATABASE_AUTH_TOKEN;
if (!sourceUrl) {
  console.error("SOURCE_DATABASE_URL is not set. See usage comment at the top of this script.");
  process.exit(1);
}

const targetUrl = process.env.DATABASE_URL ?? "file:./local.db";
const targetAuthToken = process.env.DATABASE_AUTH_TOKEN;

const source = createClient({ url: sourceUrl, authToken: sourceAuthToken });
const target = createClient({ url: targetUrl, authToken: targetAuthToken });

async function copyTable(table: string, columns: string[]) {
  const { rows } = await source.execute(`SELECT ${columns.map((c) => `"${c}"`).join(", ")} FROM "${table}"`);

  const placeholders = columns.map(() => "?").join(", ");
  const columnList = columns.map((c) => `"${c}"`).join(", ");

  let inserted = 0;
  let skipped = 0;
  for (const row of rows) {
    const args = columns.map((c) => row[c]);
    const result = await target.execute({
      sql: `INSERT OR IGNORE INTO "${table}" (${columnList}) VALUES (${placeholders})`,
      args,
    });
    if (result.rowsAffected > 0) inserted++;
    else skipped++;
  }

  console.log(`${table}: ${rows.length} found, ${inserted} inserted, ${skipped} already present (skipped)`);
}

async function main() {
  // Order matters: MaintenanceRecord has foreign keys into Vehicle / MaintenanceType.
  await copyTable("Vehicle", [
    "id",
    "name",
    "type",
    "make",
    "model",
    "year",
    "currentOdometer",
    "createdAt",
  ]);
  await copyTable("MaintenanceType", [
    "id",
    "name",
    "defaultIntervalKm",
    "defaultIntervalMonths",
    "isCustom",
    "createdAt",
  ]);
  await copyTable("MaintenanceRecord", [
    "id",
    "vehicleId",
    "maintenanceTypeId",
    "customTitle",
    "date",
    "odometer",
    "cost",
    "memo",
    "createdAt",
  ]);
}

async function closeAll(clients: Client[]) {
  for (const c of clients) c.close();
}

main()
  .then(() => closeAll([source, target]))
  .catch((err) => {
    console.error(err);
    closeAll([source, target]);
    process.exit(1);
  });
