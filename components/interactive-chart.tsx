"use client";

import { useEffect, useRef, useState } from "react";
import { PARAMETERS, formatTime, formatValue, nearestPoint, rangeStatus, unit, type Parameter } from "../lib/mock-data";

export default function InteractiveChart({ parameter = "do", values, timestamps, predictions = [], label, revealKey = parameter }: {
  parameter?: Parameter; values: number[]; timestamps: number[]; predictions?: number[]; label: string; revealKey?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [{ width, height }, setSize] = useState({ width: 640, height: 330 });
  const [active, setActive] = useState<number | null>(null);
  const hasValues = values.length > 0;
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const observer = new ResizeObserver(() => {
      if (svg.clientWidth && svg.clientHeight) setSize({ width: svg.clientWidth, height: svg.clientHeight });
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, [hasValues]);
  if (!hasValues) return <div className="empty-chart"><strong>No samples</strong><p>Change the date range.</p></div>;

  const p = PARAMETERS[parameter], all = [...values, ...predictions];
  const times = [...timestamps, ...predictions.map((_, index) => timestamps[timestamps.length - 1] + (index + 1) * 20 * 60000)];
  const low = Math.min(p.y[0], ...all), high = Math.max(p.y[1], ...all);
  const left = 40, right = width - 12, top = 16, bottom = height - 32;
  const start = times[0], end = times[times.length - 1];
  const x = (index: number) => left + (end === start ? .5 : (times[index] - start) / (end - start)) * (right - left);
  const y = (value: number) => bottom - (value - low) / (high - low || 1) * (bottom - top);
  const line = values.map((value, index) => `${index ? "L" : "M"}${x(index)},${y(value)}`).join(" ");
  const future = predictions.length ? [values[values.length - 1], ...predictions].map((value, index) => `${index ? "L" : "M"}${x(values.length - 1 + index)},${y(value)}`).join(" ") : "";
  const index = active === null ? null : Math.min(active, all.length - 1);
  const tickIndices = [...new Set([0, Math.floor((times.length - 1) / 2), times.length - 1])];

  return <div className="interactive-chart">
    <div className="chart-legend"><span><i className="legend-line" />Sample</span>{predictions.length > 0 && <span><i className="legend-line predicted" />Demo estimate</span>}<span><i className="legend-band" />Normal {p.lo}–{p.hi}{unit(parameter)}</span></div>
    <svg ref={ref} className="cv" viewBox={`0 0 ${width} ${height}`} role="img" tabIndex={0} aria-label={`${label}. Hover or tap for values. Use left and right arrows to inspect samples.`}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const fraction = Math.max(0, Math.min(1, (event.clientX - rect.left - left) / (right - left)));
        setActive(nearestPoint(times, start + fraction * (end - start)));
      }}
      onPointerLeave={() => setActive(null)} onBlur={() => setActive(null)}
      onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End", "Escape"].includes(event.key)) return;
        event.preventDefault();
        if (event.key === "Escape") setActive(null);
        else if (event.key === "Home") setActive(0);
        else if (event.key === "End") setActive(all.length - 1);
        else setActive(Math.max(0, Math.min(all.length - 1, (index ?? 0) + (event.key === "ArrowRight" ? 1 : -1))));
      }}>
      <g key={`plot-${revealKey}`} className="chart-plot">
      <rect x={left} y={y(p.hi)} width={Math.max(0, right - left)} height={y(p.lo) - y(p.hi)} fill="var(--ort)" />
      {Array.from({ length: 5 }, (_, tick) => low + (high - low) * tick / 4).map((value) => <g key={value}><line x1={left} x2={right} y1={y(value)} y2={y(value)} stroke="var(--ln)" /><text x="2" y={y(value) + 4} fill="var(--mu)" fontSize="11">{value.toFixed(p.d ? 1 : 0)}</text></g>)}
      {[p.lo, p.hi].map((value) => <line key={value} x1={left} x2={right} y1={y(value)} y2={y(value)} stroke="var(--mu)" strokeDasharray="5 4" />)}
      <path d={`${line} L${x(values.length - 1)},${bottom} L${x(0)},${bottom} Z`} fill="var(--or)" fillOpacity=".1" />
      <path d={line} fill="none" stroke="var(--or)" strokeWidth="3" strokeLinejoin="round" />
      {values.length === 1 && <circle cx={x(0)} cy={y(values[0])} r="4" fill="var(--or)" />}
      {future && <path d={future} fill="none" stroke="var(--tx)" strokeWidth="2.5" strokeDasharray="3 6" strokeLinecap="round" />}
      {tickIndices.map((tick) => <text key={tick} x={x(tick)} y={height - 8} textAnchor={tick === 0 ? "start" : tick === times.length - 1 ? "end" : "middle"} fill="var(--mu)" fontSize="11">{formatTime(times[tick])}</text>)}
      </g>
      {index !== null && <g><line x1={x(index)} x2={x(index)} y1={top} y2={bottom} stroke="var(--tx)" strokeDasharray="3 4" /><circle cx={x(index)} cy={y(all[index])} r="5" fill="var(--or)" stroke="var(--card)" strokeWidth="2" /></g>}
    </svg>
    {index !== null && <div className="chart-tooltip" role="status"><time dateTime={new Date(times[index]).toISOString()}>{formatTime(times[index])} · PHT</time><strong>{formatValue(parameter, all[index])}{unit(parameter)}</strong><span>{index < values.length ? "Sample" : "Demo estimate"} · {rangeStatus(parameter, all[index])}</span></div>}
    <details className="chart-data"><summary>Data ({all.length})</summary><div className="table-scroll"><table><caption className="sr-only">{label}</caption><thead><tr><th>Time (PHT)</th><th>Type</th><th>{p.n}{unit(parameter) && ` (${p.u})`}</th><th>Status</th></tr></thead><tbody>{all.map((value, i) => <tr key={i}><td>{formatTime(times[i])}</td><td>{i < values.length ? "Sample" : "Demo estimate"}</td><td>{formatValue(parameter, value)}</td><td>{rangeStatus(parameter, value)}</td></tr>)}</tbody></table></div></details>
  </div>;
}
