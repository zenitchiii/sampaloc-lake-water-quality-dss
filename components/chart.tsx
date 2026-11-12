"use client";

import { useEffect, useRef, useState } from "react";
import type { Parameter } from "../lib/mock-data";
import InteractiveChart from "./interactive-chart";

const EMPTY_VALUES: number[] = [];

type ChartProps = {
  kind?: "history" | "scatter" | "lake";
  parameter?: Parameter;
  values?: number[];
  predictions?: number[];
  timestamps?: number[];
  animate?: boolean;
  revealKey?: string;
  label: string;
};

export default function Chart(props: ChartProps) {
  if (props.kind === "lake") return <LakeIllustration label={props.label} />;
  if (props.kind === "scatter") return <ScatterChart {...props} />;
  return <InteractiveChart parameter={props.parameter} values={props.values ?? EMPTY_VALUES} timestamps={props.timestamps ?? EMPTY_VALUES} predictions={props.predictions} label={props.label} revealKey={props.revealKey} />;
}

function ScatterChart({ label, animate = true }: ChartProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [{ width, height }, setSize] = useState({ width: 640, height: 330 });
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const observer = new ResizeObserver(() => {
      if (svg.clientWidth && svg.clientHeight) setSize({ width: svg.clientWidth, height: svg.clientHeight });
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);
  const left = 36, top = 10, plotWidth = Math.max(0, width - left - 12), plotHeight = Math.max(0, height - top - 30);
  return <svg ref={ref} className="cv" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
    <g className="chart-plot" style={animate ? undefined : { animation: "none" }}>
      <rect x={left} y={top} width={plotWidth} height={plotHeight} fill="var(--in)" />
      <line x1={left} y1={top + plotHeight} x2={left + plotWidth} y2={top} stroke="var(--tx)" strokeDasharray="5 4" />
      {Array.from({ length: 26 }, (_, index) => {
        const t = (index + .5) / 26, x = t + Math.sin(index * 2.3) * .03, y = t + Math.sin(index * 1.7 + 1) * .09;
        return <circle key={index} cx={left + Math.max(.02, Math.min(.98, x)) * plotWidth} cy={top + plotHeight - Math.max(.02, Math.min(.98, y)) * plotHeight} r="5" fill="var(--or)" />;
      })}
      <text x={left + plotWidth / 2} y={height - 8} textAnchor="middle" fill="var(--mu)" fontSize="11">Actual DO (mg/L)</text>
    </g>
  </svg>;
}

function LakeIllustration({ label }: { label: string }) {
  return <svg viewBox="0 0 640 392" role="img" aria-label={label}>
    <rect width="640" height="392" fill="#3d4a2e" /><rect y="290" width="640" height="102" fill="#4b5a35" />
    <path d="M70 200C55 100 180 50 300 66C430 50 590 100 575 215C560 330 410 370 300 345C170 365 90 300 70 200Z" fill="#1f5560" />
    <path d="M110 200C95 140 180 90 300 106C430 90 550 140 535 215C520 290 410 330 300 305C170 325 130 260 110 200Z" fill="#26707a" />
    {[[205,160],[240,188],[380,215]].map(([x,y]) => <rect key={x} x={x} y={y} width="24" height="16" fill="#c9b79a" />)}
    {[[217,168],[392,223],[430,150]].map(([x,y], index) => <g key={x}><circle cx={x} cy={y} r="11" fill="#ff7a2f" stroke="#fff" strokeWidth="4" /><text x={x + 18} y={y + 5} fill="#fff" fontSize="14" fontWeight="600">Station {index + 1}</text></g>)}
  </svg>;
}
