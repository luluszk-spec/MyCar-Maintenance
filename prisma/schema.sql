-- Applied directly via the libSQL client (see prisma/init-db.ts).
-- Prisma Migrate does not support libSQL/Turso driver-adapter datasources,
-- so table creation is handled here instead and kept in sync with schema.prisma by hand.

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Vehicle" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "make" TEXT,
  "model" TEXT,
  "year" INTEGER,
  "currentOdometer" INTEGER NOT NULL DEFAULT 0,
  "photoUrl" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Vehicle_userId_idx" ON "Vehicle"("userId");

CREATE TABLE IF NOT EXISTS "MaintenanceType" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "defaultIntervalKm" INTEGER,
  "defaultIntervalMonths" INTEGER,
  "isCustom" BOOLEAN NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "MaintenanceType_userId_idx" ON "MaintenanceType"("userId");

CREATE TABLE IF NOT EXISTS "MaintenanceRecord" (
  "id" TEXT PRIMARY KEY,
  "vehicleId" TEXT NOT NULL REFERENCES "Vehicle"("id") ON DELETE CASCADE,
  "maintenanceTypeId" TEXT REFERENCES "MaintenanceType"("id"),
  "customTitle" TEXT,
  "date" DATETIME NOT NULL,
  "odometer" INTEGER NOT NULL,
  "cost" INTEGER,
  "memo" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "MaintenanceRecord_vehicleId_idx" ON "MaintenanceRecord"("vehicleId");
