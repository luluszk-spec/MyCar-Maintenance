export type DefaultMaintenanceType = {
  name: string;
  vehicleType: "CAR" | "MOTORCYCLE";
  defaultIntervalKm: number | null;
  defaultIntervalMonths: number | null;
};

/** Seeded into every new user's own maintenance-type list on signup. */
export const DEFAULT_MAINTENANCE_TYPES: DefaultMaintenanceType[] = [
  // 車
  { name: "オイル交換", vehicleType: "CAR", defaultIntervalKm: 5000, defaultIntervalMonths: 6 },
  {
    name: "オイルフィルター交換",
    vehicleType: "CAR",
    defaultIntervalKm: 10000,
    defaultIntervalMonths: 12,
  },
  { name: "車検", vehicleType: "CAR", defaultIntervalKm: null, defaultIntervalMonths: 24 },
  { name: "タイヤ交換", vehicleType: "CAR", defaultIntervalKm: 30000, defaultIntervalMonths: 60 },
  {
    name: "バッテリー交換",
    vehicleType: "CAR",
    defaultIntervalKm: null,
    defaultIntervalMonths: 36,
  },
  {
    name: "ブレーキパッド交換",
    vehicleType: "CAR",
    defaultIntervalKm: 20000,
    defaultIntervalMonths: null,
  },
  {
    name: "ブレーキフルード交換",
    vehicleType: "CAR",
    defaultIntervalKm: null,
    defaultIntervalMonths: 24,
  },
  {
    name: "冷却水（クーラント）交換",
    vehicleType: "CAR",
    defaultIntervalKm: null,
    defaultIntervalMonths: 24,
  },
  {
    name: "エアフィルター交換",
    vehicleType: "CAR",
    defaultIntervalKm: 20000,
    defaultIntervalMonths: 12,
  },
  {
    name: "スパークプラグ交換",
    vehicleType: "CAR",
    defaultIntervalKm: 20000,
    defaultIntervalMonths: null,
  },

  // バイク
  {
    name: "オイル交換",
    vehicleType: "MOTORCYCLE",
    defaultIntervalKm: 3000,
    defaultIntervalMonths: 6,
  },
  {
    name: "オイルフィルター交換",
    vehicleType: "MOTORCYCLE",
    defaultIntervalKm: 6000,
    defaultIntervalMonths: 12,
  },
  {
    name: "車検",
    vehicleType: "MOTORCYCLE",
    defaultIntervalKm: null,
    defaultIntervalMonths: 24,
  },
  {
    name: "タイヤ交換",
    vehicleType: "MOTORCYCLE",
    defaultIntervalKm: 15000,
    defaultIntervalMonths: 36,
  },
  {
    name: "バッテリー交換",
    vehicleType: "MOTORCYCLE",
    defaultIntervalKm: null,
    defaultIntervalMonths: 24,
  },
  {
    name: "ブレーキパッド交換",
    vehicleType: "MOTORCYCLE",
    defaultIntervalKm: 10000,
    defaultIntervalMonths: null,
  },
  {
    name: "ブレーキフルード交換",
    vehicleType: "MOTORCYCLE",
    defaultIntervalKm: null,
    defaultIntervalMonths: 24,
  },
  {
    name: "チェーン・スプロケット交換",
    vehicleType: "MOTORCYCLE",
    defaultIntervalKm: 15000,
    defaultIntervalMonths: null,
  },
  {
    name: "エアフィルター交換",
    vehicleType: "MOTORCYCLE",
    defaultIntervalKm: 10000,
    defaultIntervalMonths: 12,
  },
  {
    name: "スパークプラグ交換",
    vehicleType: "MOTORCYCLE",
    defaultIntervalKm: 10000,
    defaultIntervalMonths: null,
  },
];
