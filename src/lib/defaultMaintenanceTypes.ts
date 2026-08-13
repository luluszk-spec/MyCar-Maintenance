export type DefaultMaintenanceType = {
  name: string;
  defaultIntervalKm: number | null;
  defaultIntervalMonths: number | null;
};

/** Seeded into every new user's own maintenance-type list on signup. */
export const DEFAULT_MAINTENANCE_TYPES: DefaultMaintenanceType[] = [
  { name: "オイル交換", defaultIntervalKm: 5000, defaultIntervalMonths: 6 },
  { name: "オイルフィルター交換", defaultIntervalKm: 10000, defaultIntervalMonths: 12 },
  { name: "車検", defaultIntervalKm: null, defaultIntervalMonths: 24 },
  { name: "タイヤ交換", defaultIntervalKm: 30000, defaultIntervalMonths: 60 },
  { name: "バッテリー交換", defaultIntervalKm: null, defaultIntervalMonths: 36 },
  { name: "ブレーキパッド交換", defaultIntervalKm: 20000, defaultIntervalMonths: null },
  { name: "ブレーキフルード交換", defaultIntervalKm: null, defaultIntervalMonths: 24 },
  { name: "冷却水（クーラント）交換", defaultIntervalKm: null, defaultIntervalMonths: 24 },
  { name: "チェーン・スプロケット交換", defaultIntervalKm: 15000, defaultIntervalMonths: null },
  { name: "エアフィルター交換", defaultIntervalKm: 20000, defaultIntervalMonths: 12 },
  { name: "スパークプラグ交換", defaultIntervalKm: 20000, defaultIntervalMonths: null },
];
