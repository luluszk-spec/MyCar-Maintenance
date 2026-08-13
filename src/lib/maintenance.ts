import type { MaintenanceRecord, MaintenanceType, Vehicle } from "@prisma/client";

export type HistoryEntry = {
  id: string;
  date: Date;
  odometer: number;
  cost: number | null;
  memo: string | null;
};

export type MaintenanceStatus = {
  maintenanceTypeId: string;
  typeName: string;
  lastRecord: { date: Date; odometer: number } | null;
  dueByKm: number | null;
  dueByDate: Date | null;
  remainingKm: number | null;
  remainingDays: number | null;
  isOverdue: boolean;
  /** Lower = more urgent. Roughly normalizes km into day-equivalents for sorting only. */
  urgencyScore: number;
  /** "都度確認" type — no fixed km/date interval, just a periodic manual check. */
  isCheckOnly: boolean;
  /** Populated for isCheckOnly statuses: all past records for this vehicle x type, newest first. */
  history: HistoryEntry[];
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const ASSUMED_KM_PER_DAY = 20;

/**
 * Reminders are only computed for maintenance types that already have at
 * least one recorded entry for the vehicle — without a baseline there's no
 * "last done" point to count an interval from.
 *
 * "都度確認" (isCheckOnly) types are a special case: they only ever produce
 * a status once their check period has actually elapsed — before that
 * they're omitted entirely rather than showing an "あとN日" countdown.
 */
export function computeMaintenanceStatuses(
  vehicle: Vehicle,
  maintenanceTypes: MaintenanceType[],
  records: MaintenanceRecord[]
): MaintenanceStatus[] {
  const now = new Date();
  const statuses: MaintenanceStatus[] = [];

  for (const type of maintenanceTypes) {
    if (type.defaultIntervalKm == null && type.defaultIntervalMonths == null) {
      continue;
    }

    const typeRecords = records
      .filter((r) => r.maintenanceTypeId === type.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    const last = typeRecords[0];
    if (!last) continue;

    if (type.isCheckOnly) {
      const dueByDate =
        type.defaultIntervalMonths != null
          ? addMonths(last.date, type.defaultIntervalMonths)
          : null;
      if (dueByDate == null) continue;
      const remainingDays = Math.ceil((dueByDate.getTime() - now.getTime()) / MS_PER_DAY);
      if (remainingDays > 0) continue; // not due yet — stay silent

      statuses.push({
        maintenanceTypeId: type.id,
        typeName: type.name,
        lastRecord: { date: last.date, odometer: last.odometer },
        dueByKm: null,
        dueByDate,
        remainingKm: null,
        remainingDays,
        isOverdue: true,
        urgencyScore: remainingDays,
        isCheckOnly: true,
        history: typeRecords.map((r) => ({
          id: r.id,
          date: r.date,
          odometer: r.odometer,
          cost: r.cost,
          memo: r.memo,
        })),
      });
      continue;
    }

    const dueByKm =
      type.defaultIntervalKm != null ? last.odometer + type.defaultIntervalKm : null;
    const dueByDate =
      type.defaultIntervalMonths != null
        ? addMonths(last.date, type.defaultIntervalMonths)
        : null;

    const remainingKm = dueByKm != null ? dueByKm - vehicle.currentOdometer : null;
    const remainingDays =
      dueByDate != null ? Math.ceil((dueByDate.getTime() - now.getTime()) / MS_PER_DAY) : null;

    const isOverdue =
      (remainingKm != null && remainingKm <= 0) ||
      (remainingDays != null && remainingDays <= 0);

    const scoreCandidates: number[] = [];
    if (remainingDays != null) scoreCandidates.push(remainingDays);
    if (remainingKm != null) scoreCandidates.push(remainingKm / ASSUMED_KM_PER_DAY);
    const urgencyScore = scoreCandidates.length ? Math.min(...scoreCandidates) : Infinity;

    statuses.push({
      maintenanceTypeId: type.id,
      typeName: type.name,
      lastRecord: { date: last.date, odometer: last.odometer },
      dueByKm,
      dueByDate,
      remainingKm,
      remainingDays,
      isOverdue,
      urgencyScore,
      isCheckOnly: false,
      history: [],
    });
  }

  return statuses.sort((a, b) => a.urgencyScore - b.urgencyScore);
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

const URGENT_WITHIN_DAYS = 30;

/** True when overdue, or due within about a month (km-based intervals use the same day-equivalent as urgencyScore). */
export function isUrgent(status: MaintenanceStatus): boolean {
  if (status.isCheckOnly) return true; // only ever produced once already due
  return status.isOverdue || status.urgencyScore <= URGENT_WITHIN_DAYS;
}

export function formatRemaining(status: MaintenanceStatus): string {
  const parts: string[] = [];
  if (status.remainingKm != null) {
    parts.push(
      status.remainingKm >= 0
        ? `あと${status.remainingKm.toLocaleString()}km`
        : `${Math.abs(status.remainingKm).toLocaleString()}km超過`
    );
  }
  if (status.remainingDays != null) {
    parts.push(
      status.remainingDays >= 0
        ? `あと${status.remainingDays}日`
        : `${Math.abs(status.remainingDays)}日超過`
    );
  }
  return parts.join(" / ") || "-";
}
