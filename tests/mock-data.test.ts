import test from "node:test";
import assert from "node:assert/strict";
import { PARAMETERS, PARAMETER_KEYS, STATIONS, DEMO_TIME, advanceDemo, createDemoReadings, dateBounds, demoTime, illustrativePrediction, nearestPoint, predictionChecks, rangeStatus, readingsForStation, series, stationStatus } from "../lib/mock-data.ts";

test("range status uses inclusive raw boundaries and rejects missing or nonfinite measurements", () => {
  for (const key of PARAMETER_KEYS) {
    const { lo, hi } = PARAMETERS[key];
    assert.equal(rangeStatus(key, lo - .001), "Below Normal");
    assert.equal(rangeStatus(key, lo), "Normal");
    assert.equal(rangeStatus(key, hi), "Normal");
    assert.equal(rangeStatus(key, hi + .001), "Above Normal");
    for (const invalid of [null, NaN, Infinity]) assert.equal(rangeStatus(key, invalid), "Unavailable");
  }
});

test("sample records preserve independent station measurement times and complete parameter snapshots", () => {
  const readings = createDemoReadings();
  assert.equal(readings.length, 90);
  for (let station = 0; station < STATIONS.length; station++) {
    const latest = readingsForStation(readings, station).at(-1)!;
    assert.equal(latest.timestamp, DEMO_TIME - STATIONS[station].minutesAgo * 60000);
    assert.deepEqual(latest.values, STATIONS[station].v);
  }
});

test("each playback step advances only one station, preserves old snapshots, and bounds memory", () => {
  const original = createDemoReadings(), snapshot = JSON.stringify(original);
  const next = advanceDemo(original, 0);
  assert.equal(JSON.stringify(original), snapshot);
  assert.equal(readingsForStation(next, 0).length, 31);
  assert.deepEqual(readingsForStation(next, 1), readingsForStation(original, 1));
  assert.equal(demoTime(next), DEMO_TIME + 20 * 60000);
  let readings = original;
  for (let step = 0; step < 250; step++) readings = advanceDemo(readings, step);
  assert.equal(readings.length, 180);
  assert.equal(new Set(readings.map((reading) => reading.id)).size, readings.length);
  assert.ok(readings.every((reading, index) => !index || reading.timestamp > readings[index - 1].timestamp));
  assert.ok(STATIONS.every((_, station) => readingsForStation(readings, station).length >= 59));
});

test("custom dates include the whole Philippine day and reject reversed or impossible dates", () => {
  const bounds = dateBounds("2026-11-12", "2026-11-12")!;
  assert.deepEqual(bounds, [Date.parse("2026-11-11T16:00:00Z"), Date.parse("2026-11-12T16:00:00Z")]);
  const samples = [bounds[0] - 1, bounds[0], bounds[1] - 1, bounds[1]];
  assert.deepEqual(samples.filter((time) => time >= bounds[0] && time < bounds[1]), [bounds[0], bounds[1] - 1]);
  for (const [start, end] of [["2026-02-30", "2026-03-01"], ["2026-11-13", "2026-11-12"], ["", "2026-11-12"], ["invalid", "invalid"]]) assert.equal(dateBounds(start, end), null);
});

test("demo errors match a later same-station sample with a prediction based only on the prior visit", () => {
  const observations = readingsForStation(advanceDemo(createDemoReadings(), 0), 0);
  const check = predictionChecks(observations).at(-1)!;
  const prior = observations.at(-2)!, actual = observations.at(-1)!;
  assert.equal(check.issuedAt, prior.timestamp);
  assert.equal(check.matchedAt, actual.timestamp);
  assert.ok(check.issuedAt < check.matchedAt);
  assert.equal(check.predicted, illustrativePrediction(prior));
  assert.equal(check.error, actual.values.do - check.predicted);
});

test("chart inspection finds the nearest timestamp with irregular visit intervals", () => {
  const times = [100, 110, 800];
  assert.equal(nearestPoint(times, 400), 1);
  assert.equal(nearestPoint(times, -1), 0);
  assert.equal(nearestPoint(times, 999), 2);
  assert.equal(nearestPoint(times, 105), 0);
});

test("station summary detects upper limits as well as lower and mixed excursions", () => {
  const normal = STATIONS[0].v;
  assert.equal(stationStatus(normal), "Normal");
  assert.equal(stationStatus(STATIONS[1].v), "Below Normal");
  assert.equal(stationStatus({ ...normal, do: 10 }), "Above Normal");
  assert.equal(stationStatus({ ...normal, do: 10, ph: 6 }), "Outside Normal");
});

test("every mock filter produces a stable series ending at the selected station's reading", () => {
  for (const key of PARAMETER_KEYS) for (let station = 0; station < STATIONS.length; station++) for (const count of [7, 14, 30]) {
    const values = series(key, station, count);
    assert.equal(values.length, count);
    assert.equal(values.at(-1), STATIONS[station].v[key]);
    assert.ok(values.every(Number.isFinite));
    assert.deepEqual(values, series(key, station, count));
  }
});
