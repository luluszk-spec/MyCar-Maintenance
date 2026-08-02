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

type DefaultType = {
  name: string;
  defaultIntervalKm: number | null;
  defaultIntervalMonths: number | null;
};

const DEFAULT_MAINTENANCE_TYPES: DefaultType[] = [
  { name: "オイル交換", defaultIntervalKm: 5000, defaultIntervalMonths: 6 },
  { name: "車検", defaultIntervalKm: null, defaultIntervalMonths: 24 },
  { name: "タイヤ交換", defaultIntervalKm: 30000, defaultIntervalMonths: 48 },
  { name: "バッテリー交換", defaultIntervalKm: null, defaultIntervalMonths: 30 },
  { name: "ブレーキパッド交換", defaultIntervalKm: 20000, defaultIntervalMonths: null },
];

async function main() {
  const schemaSql = readFileSync(path.join(root, "prisma", "schema.sql"), "utf-8");
  await client.executeMultiple(schemaSql);
  console.log("Schema applied.");

  const existing = await client.execute(
    `SELECT COUNT(*) as count FROM "MaintenanceType" WHERE "isCustom" = 0`
  );
  const count = Number(existing.rows[0]?.count ?? 0);

  if (count === 0) {
    for (const t of DEFAULT_MAINTENANCE_TYPES) {
      await client.execute({
        sql: `INSERT INTO "MaintenanceType" ("id", "name", "defaultIntervalKm", "defaultIntervalMonths", "isCustom")
              VALUES (?, ?, ?, ?, 0)`,
        args: [crypto.randomUUID(), t.name, t.defaultIntervalKm, t.defaultIntervalMonths],
      });
    }
    console.log(`Seeded ${DEFAULT_MAINTENANCE_TYPES.length} default maintenance types.`);
  } else {
    console.log("Default maintenance types already present, skipping seed.");
  }
}

main()
  .then(() => client.close())
  .catch((err) => {
    console.error(err);
    client.close();
    process.exit(1);
  });
