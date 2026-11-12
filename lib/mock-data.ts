// shortcut: deterministic prototype data, replace with the Firebase contract when supplied.
export const PARAMETERS = {
  do: { n: "Dissolved oxygen", s: "DO", u: "mg/L", lo: 5, hi: 9, y: [2, 10], d: 1 },
  temp: { n: "Temperature", s: "Temp", u: "°C", lo: 25, hi: 32, y: [20, 34], d: 1 },
  ph: { n: "pH", s: "pH", u: "", lo: 6.5, hi: 8.5, y: [5.5, 9.5], d: 1 },
  tur: { n: "Turbidity", s: "Turbidity", u: "NTU", lo: 1, hi: 50, y: [0, 60], d: 0 },
  tds: { n: "TDS", s: "TDS", u: "µS/cm", lo: 50, hi: 800, y: [0, 900], d: 0 },
};

export type Parameter = keyof typeof PARAMETERS;
export const PARAMETER_KEYS = Object.keys(PARAMETERS) as Parameter[];
export const STATIONS = [
  { id: 1, minutesAgo: 20, v: { do: 7.2, temp: 27.1, ph: 7.4, tur: 14, tds: 182 } },
  { id: 2, minutesAgo: 80, v: { do: 4.1, temp: 28, ph: 7.1, tur: 22, tds: 205 } },
  { id: 3, minutesAgo: 4320, v: { do: 6.8, temp: 27.6, ph: 7.8, tur: 9, tds: 168 } },
];

export function rangeStatus(key: Parameter, value: number | null) {
  if (value === null || !Number.isFinite(value)) return "Unavailable";
  return value < PARAMETERS[key].lo ? "Below Normal" : value > PARAMETERS[key].hi ? "Above Normal" : "Normal";
}

export function stationStatus(values: Record<Parameter, number>) {
  const statuses = PARAMETER_KEYS.map((key) => rangeStatus(key, values[key]));
  if (statuses.includes("Unavailable")) return "Unavailable";
  const below = statuses.includes("Below Normal"), above = statuses.includes("Above Normal");
  return below && above ? "Outside Normal" : below ? "Below Normal" : above ? "Above Normal" : "Normal";
}

export const formatValue = (key: Parameter, value: number) => value.toFixed(PARAMETERS[key].d);
export const unit = (key: Parameter) => PARAMETERS[key].u ? " " + PARAMETERS[key].u : "";

export function series(key: Parameter, station: number, count: number): number[] {
  const p = PARAMETERS[key], span = p.y[1] - p.y[0], base = STATIONS[station].v[key];
  const values = Array.from({ length: count }, (_, i) => Math.max(p.y[0] + .2, Math.min(p.y[1] - .2,
    base + Math.sin(i * .7 + station + key.length) * span * .07 + Math.sin(i * .23 + station * 2) * span * .05)));
  values[count - 1] = base;
  return values;
}

export type Reading = { id: string; stationId: number; timestamp: number; values: Record<Parameter, number> };
export const DEMO_TIME = Date.parse("2026-11-12T02:40:00Z");
const DAY = 86400000;

export function createDemoReadings(): Reading[] {
  return STATIONS.flatMap((station, index) => {
    const parameters = PARAMETER_KEYS.map((key) => series(key, index, 30));
    return Array.from({ length: 30 }, (_, day) => ({
      id: `sample-${station.id}-${day}`,
      stationId: station.id,
      timestamp: DEMO_TIME - station.minutesAgo * 60000 - (29 - day) * DAY,
      values: Object.fromEntries(PARAMETER_KEYS.map((key, k) => [key, parameters[k][day]])) as Record<Parameter, number>,
    }));
  }).sort((a, b) => a.timestamp - b.timestamp);
}

export const demoTime = (readings: Reading[]) => Math.max(DEMO_TIME, ...readings.map((reading) => reading.timestamp));
export const readingsForStation = (readings: Reading[], station: number) => readings.filter((reading) => reading.stationId === STATIONS[station].id).sort((a, b) => a.timestamp - b.timestamp);

export function advanceDemo(readings: Reading[], step: number): Reading[] {
  const station = STATIONS[step % STATIONS.length];
  const values = Object.fromEntries(PARAMETER_KEYS.map((key) => {
    const p = PARAMETERS[key];
    return [key, station.v[key] + Math.sin(step * .8 + station.id + key.length) * (p.y[1] - p.y[0]) * .025];
  })) as Record<Parameter, number>;
  // shortcut: retain 180 synthetic records, replace playback with Firebase when its contract is supplied.
  return [...readings, { id: `playback-${step}`, stationId: station.id, timestamp: demoTime(readings) + 20 * 60000, values }].slice(-180);
}

export function dateBounds(start: string, end: string): [number, number] | null {
  const parse = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
    const time = Date.parse(`${value}T00:00:00+08:00`);
    return Number.isFinite(time) && new Date(time + 8 * 3600000).toISOString().slice(0, 10) === value ? time : NaN;
  };
  const from = parse(start), through = parse(end);
  return Number.isFinite(from) && Number.isFinite(through) && from <= through ? [from, through + DAY] : null;
}

export const dateInput = (time: number) => new Date(time + 8 * 3600000).toISOString().slice(0, 10);
export const formatTime = (time: number) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Manila", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(time);
export function sampleAge(timestamp: number, now: number) {
  const minutes = Math.max(0, Math.floor((now - timestamp) / 60000));
  return minutes < 60 ? `${minutes} min ago` : minutes < 1440 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min ago` : `${Math.floor(minutes / 1440)} days ago`;
}

export const illustrativePrediction = (reading: Reading) => Math.max(0, reading.values.do - .9);
export function predictionChecks(readings: Reading[]) {
  return readings.slice(1).map((actual, index) => ({
    issuedAt: readings[index].timestamp,
    matchedAt: actual.timestamp,
    predicted: illustrativePrediction(readings[index]),
    actual: actual.values.do,
    error: actual.values.do - illustrativePrediction(readings[index]),
  }));
}

export function nearestPoint(times: number[], target: number): number {
  return times.reduce((nearest, time, index) => Math.abs(time - target) < Math.abs(times[nearest] - target) ? index : nearest, 0);
}
