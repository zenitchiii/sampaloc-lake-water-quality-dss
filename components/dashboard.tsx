"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, ViewTransition, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";
import { PARAMETERS as P, PARAMETER_KEYS, STATIONS as ST, DEMO_TIME, advanceDemo, createDemoReadings, dateBounds, dateInput, demoTime, formatTime, formatValue as f, illustrativePrediction, predictionChecks, rangeStatus, readingsForStation, sampleAge, stationStatus, unit as u, type Parameter, type Reading } from "../lib/mock-data";
import Chart from "./chart";
import Rail from "./rail";
import "../app/dashboard.css";

type Page = "home" | "history" | "prediction" | "regression";
type DashboardState = { station: number; selectStation: (value: number) => void; parameter: Parameter; selectParameter: (value: Parameter) => void; readings: Reading[]; now: number; soft: boolean; go: (page: Page) => void; notify: (message: string) => void };
const State = createContext<DashboardState | null>(null);
function useDashboard() { return useContext(State)!; }
const href = (page: Page) => page === "home" ? "/dashboard" : `/dashboard/${page}`;
const motionStyle = (index: number): CSSProperties => ({ "--i": index } as CSSProperties);

function Chip({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  return <span className={`chip${accent ? " or" : ""}`}>{children}</span>;
}
function Card({ children, index = 0 }: { children: ReactNode; index?: number }) {
  return <div className="card" style={motionStyle(index)}>{children}</div>;
}
function Row({ label, value, detail = "" }: { label: ReactNode; value: ReactNode; detail?: ReactNode }) {
  return <div className="row"><span>{label}</span><b>{value}</b><small>{detail}</small></div>;
}
function Tile({ label, value, index = 0, children, style, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: ReactNode; value: ReactNode; index?: number }) {
  return <button className="tile" style={{ ...motionStyle(index), ...style }} {...props}><small>{label}</small><b>{value}</b>{children}</button>;
}
function StationSelect() {
  const { station, selectStation } = useDashboard();
  return <><label htmlFor="station">Station</label><select id="station" value={station} onChange={(e) => selectStation(Number(e.target.value))}>
    {ST.map((s, index) => <option key={s.id} value={index}>Station 0{s.id}</option>)}
  </select></>;
}
function Clock() {
  const [value, setValue] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const date = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Manila", day: "2-digit", month: "short", year: "numeric" }).format(now);
      const time = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Manila", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(now);
      setValue(`${date} | ${time}`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);
  return <div className="clk"><i /><span>{value || "\u00a0"}</span></div>;
}

const navigation: { page: Page; label: string; icon: ReactNode }[] = [
  { page: "home", label: "Home", icon: <><path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" /></> },
  { page: "history", label: "History", icon: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></> },
  { page: "prediction", label: "DO prediction", icon: <><path d="M4 17l5-6 4 3 7-9" /><path d="M16 5h4v4" /></> },
  { page: "regression", label: "Regression", icon: <><circle cx="7" cy="16" r="1.5" /><circle cx="11" cy="12" r="1.5" /><circle cx="15" cy="13" r="1.5" /><circle cx="18" cy="7" r="1.5" /><path d="M4 19 20 5" /></> },
];

export default function Dashboard({ children }: { children: ReactNode }) {
  const router = useRouter(), pathname = usePathname();
  const [station, setStation] = useState(0), [updatedPath, setUpdatedPath] = useState<string | null>(null), [message, setMessage] = useState("");
  const soft = updatedPath === pathname;
  const [parameter, selectParameter] = useState<Parameter>("do");
  const [playing, setPlaying] = useState(false);
  const [demo, setDemo] = useState<{ readings: Reading[]; step: number; receivedAt: number | null }>(() => ({ readings: createDemoReadings(), step: 0, receivedAt: null }));
  function stepDemo() {
    setUpdatedPath(pathname);
    setDemo((current) => ({ readings: advanceDemo(current.readings, current.step), step: current.step + 1, receivedAt: Date.now() }));
  }
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(stepDemo, 4000);
    return () => clearInterval(timer);
  }, [playing, pathname]);
  const nav = useRef<HTMLElement>(null), toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const page = pathname.split("/")[2] || "home";
  useEffect(() => {
    const updateDot = () => {
      const active = nav.current?.querySelector<HTMLElement>('[aria-current="page"]');
      const dot = nav.current?.querySelector<HTMLElement>(".dot");
      if (active && dot) { dot.style.width = dot.style.height = active.offsetWidth + "px"; dot.style.transform = `translateX(${active.offsetLeft - 5}px)`; }
    };
    updateDot();
    const observer = new ResizeObserver(updateDot);
    if (nav.current) observer.observe(nav.current);
    return () => observer.disconnect();
  }, [page]);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);
  function go(target: Page) {
    if (target !== page) router.push(href(target));
  }
  function notify(text: string) {
    setMessage(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setMessage(""), 3600);
  }
  return <State.Provider value={{ station, parameter, selectParameter, readings: demo.readings, now: demoTime(demo.readings), soft, selectStation: (value) => { setUpdatedPath(pathname); setStation(value); }, go, notify }}>
    <div className="dashboard-page">
      <div className="panel"><header>
        <Link href="/" className="logo" aria-label="Sampaloc Lake — landing page"><i />Sampaloc Lake</Link>
        <nav aria-label="Pages" ref={nav}><span className="dot" aria-hidden="true" />
          {navigation.map((item) => <Link key={item.page} href={href(item.page)} className={page === item.page ? "on" : undefined} aria-current={page === item.page ? "page" : undefined} aria-label={item.label} title={item.label}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{item.icon}</svg>
          </Link>)}
        </nav><Clock />
      </header>
      <div className="demo-bar"><span className="demo-badge" title="Simulated readings · Firebase not connected · one station visit and 20 simulated minutes per step">Sample data</span>
        <div className="demo-actions"><button onClick={() => setPlaying(!playing)} aria-pressed={playing}>{playing ? "Pause" : "Play demo"}</button><button onClick={stepDemo} disabled={playing}>Next reading</button><button onClick={() => { setPlaying(false); setUpdatedPath(pathname); setDemo({ readings: createDemoReadings(), step: 0, receivedAt: null }); }}>Reset</button></div>
        <ReceiptAge receivedAt={demo.receivedAt} playing={playing} />
      </div>
      <ViewTransition key={pathname} name="dashboard-content" share="dashboard-crossfade" enter="dashboard-crossfade" default="none">
        <main className={soft ? "soft" : undefined}>{children}</main>
      </ViewTransition></div>
      <div id="ts" role="status" className={message ? "on" : undefined}>{message}</div>
    </div>
  </State.Provider>;
}

function ReceiptAge({ receivedAt, playing }: { receivedAt: number | null; playing: boolean }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (receivedAt === null) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [receivedAt]);
  return <span className="receipt-age" title="Playback adds a reading every 4 seconds">{receivedAt === null || now === null ? "Ready" : `Updated ${Math.max(0, Math.floor((now - receivedAt) / 1000))}s ago`}{playing ? "" : " · paused"}</span>;
}

export function HomeView() {
  const { station, selectStation, readings, now, go } = useDashboard();
  const observations = readingsForStation(readings, station), latest = observations.at(-1)!;
  const s = ST[station], v = latest.values, status = stationStatus(v);
  const pins = [[34, 43], [61, 58], [68, 36]];
  return <>
    <div className="page-intro"><h1>Overview</h1><span className="snapshot-time">Sampled {formatTime(latest.timestamp)} PHT · {sampleAge(latest.timestamp, now)}</span></div>
    <div className="g">
      <Card><span className="lbl">Station</span><div className="big">STATION 0{s.id}</div>
        <div className="dob"><span className="lbl">Dissolved oxygen</span><span className="num">{f("do", v.do)}<small>mg/L</small></span><small style={{ margin: 0 }}>Normal 5.0–9.0 mg/L</small></div>
        <div className="rows">{(["temp", "ph", "tur", "tds"] as Parameter[]).map((key) => <Row key={key} label={P[key].s} value={f(key, v[key]) + u(key)} detail={`${P[key].lo}–${P[key].hi}`} />)}</div>
        <Chip accent={status !== "Normal"}>{status}</Chip><br /><button className="btn" onClick={() => go("history")}>Open history</button>
      </Card>
      <div className="mapc" style={motionStyle(1)}>
        <svg viewBox="0 0 640 392" preserveAspectRatio="none" aria-hidden="true"><rect width="640" height="392" fill="#3d4a2e" /><rect y="290" width="640" height="102" fill="#4b5a35" /><path d="M70 200C55 100 180 50 300 66C430 50 590 100 575 215C560 330 410 370 300 345C170 365 90 300 70 200Z" fill="#1f5560" /><path d="M110 205C100 130 200 90 300 104C410 90 530 130 520 215C505 305 395 335 300 315C195 330 125 280 110 205Z" fill="#26707a" /></svg>
        <div className="map-heading"><strong>Sampling stations</strong><small>Illustrative positions · not GPS locations</small></div>
        {ST.map((item, index) => {
          const observation = readingsForStation(readings, index).at(-1)!;
          const overdue = now - observation.timestamp > 60 * 60000;
          return <button key={item.id} className={`pin${station === index ? " sel" : ""}${overdue ? " not-visited" : ""}`} style={{ left: `${pins[index][0]}%`, top: `${pins[index][1]}%` }} onClick={() => selectStation(index)} aria-pressed={station === index} aria-label={`Station ${item.id}, DO ${f("do", observation.values.do)} mg/L, ${sampleAge(observation.timestamp, now)}`}><i /><span>Station {item.id}</span></button>;
        })}
        <div className="map-details"><div><strong>Station 0{s.id} selected</strong></div><a href="https://www.google.com/maps/search/?api=1&query=Sampaloc+Lake+San+Pablo" target="_blank" rel="noopener noreferrer">Open lake map ↗</a></div>
        <div className="map-legend"><span><i />Selected</span><span><i className="dashed" />No visit in 60 min</span></div>
      </div>
      <div className="col">{ST.map((item, index) => ({ item, index })).filter(({ index }) => index !== station).map(({ item, index }, order) => {
        const observation = readingsForStation(readings, index).at(-1)!;
        return <button key={item.id} className="card stc" style={motionStyle(order + 2)} onClick={() => selectStation(index)}>
          <span className="lbl">Station 0{item.id}</span><span className="num">{f("do", observation.values.do)}<small>mg/L DO</small></span>
          <Chip accent={rangeStatus("do", observation.values.do) !== "Normal"}>{rangeStatus("do", observation.values.do)}</Chip><span className="chip">{sampleAge(observation.timestamp, now)}</span><small>{formatTime(observation.timestamp)} · sample time</small>
        </button>;
      })}</div>
    </div>
    <div className="section-heading"><h2>Recent visits</h2><span>Station 0{s.id} · DO</span></div>
    <Rail label="Recent dissolved oxygen samples">{observations.slice(-5, -1).reverse().map((observation, index) => <Tile key={observation.id} label={formatTime(observation.timestamp)} value={`${f("do", observation.values.do)} mg/L`} index={index} onClick={() => go("history")}><small>{rangeStatus("do", observation.values.do)}</small></Tile>)}</Rail>
  </>;
}

export function HistoryView() {
  const { station, parameter, selectParameter, readings, now, soft, notify } = useDashboard();
  const [range, setRange] = useState("30"), [start, setStart] = useState(dateInput(DEMO_TIME - 29 * 86400000)), [end, setEnd] = useState(dateInput(DEMO_TIME));
  const bounds = range === "custom" ? dateBounds(start, end) : dateBounds(dateInput(now - (Number(range) - 1) * 86400000), dateInput(now));
  const observations = readingsForStation(readings, station);
  const matches = bounds ? observations.filter((observation) => observation.timestamp >= bounds[0] && observation.timestamp < bounds[1]) : [];
  const values = matches.map((observation) => observation.values[parameter]);
  const latest = observations.at(-1)!;
  const rangeDescription = bounds ? `${dateInput(bounds[0])} to ${dateInput(bounds[1] - 1)}` : "Invalid date range";
  return <><div className="page-intro"><div><h1>History</h1><p>{matches.length} samples · {rangeDescription}</p></div><span className="snapshot-time">Times in PHT</span></div>
    <div className="g">
      <Card><span className="lbl">Filters</span><StationSelect />
        <label htmlFor="parameter">Parameter</label><select id="parameter" value={parameter} onChange={(e) => selectParameter(e.target.value as Parameter)}>{PARAMETER_KEYS.map((key) => <option key={key} value={key}>{P[key].n}</option>)}</select>
        <label htmlFor="date-range">Date range</label><select id="date-range" value={range} onChange={(e) => setRange(e.target.value)}>{[7, 14, 30].map((days) => <option key={days} value={days}>Last {days} days</option>)}<option value="custom">Custom dates</option></select>
        {range === "custom" && <div className="custom-dates"><label htmlFor="start-date">From</label><input id="start-date" type="date" value={start} max={end || undefined} onChange={(e) => setStart(e.target.value)} /><label htmlFor="end-date">Through (inclusive)</label><input id="end-date" type="date" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} />{!bounds && <p className="filter-error" role="alert">Enter valid dates with the end on or after the start.</p>}</div>}
        <button className="btn" style={{ width: "100%" }} disabled={!bounds || !matches.length} onClick={() => notify(`Excel export is mocked: ${matches.length} matching sample rows. Real workbook export follows the Firebase contract.`)}>Download Excel</button>
      </Card>
      <Card index={1}><span className="lbl">{P[parameter].n} · Station 0{ST[station].id}</span><Chart parameter={parameter} values={values} timestamps={matches.map((observation) => observation.timestamp)} revealKey={`${parameter}:${range}:${start}:${end}`} animate={!soft} label={`${P[parameter].n} history, sample data for Station ${ST[station].id}`} /></Card>
      <Card index={2}><span className="lbl">Session log</span><p className="muted-note">Latest {Math.min(matches.length, 6)} of {matches.length} matches</p><div>{matches.slice(-6).reverse().map((observation) => <Row key={observation.id} label={formatTime(observation.timestamp)} value={f(parameter, observation.values[parameter]) + u(parameter)} detail={rangeStatus(parameter, observation.values[parameter])} />)}{!matches.length && <p className="muted-note">No matching sample visits.</p>}</div></Card>
    </div><div className="sub">Latest parameters at this station · tap one to switch the chart</div>
    <div className="foot"><Rail label="Parameters in history">{PARAMETER_KEYS.map((key, index) => <Tile key={key} label={P[key].n} value={f(key, latest.values[key]) + u(key)} index={index} onClick={() => selectParameter(key)}><small>{rangeStatus(key, latest.values[key])}</small></Tile>)}</Rail></div>
  </>;
}

export function PredictionView() {
  const { station, readings, now, soft, go } = useDashboard();
  const marker = useRef<HTMLSpanElement>(null), observations = readingsForStation(readings, station), latest = observations.at(-1)!;
  const predicted = illustrativePrediction(latest), checks = predictionChecks(observations).slice(-3), values = observations.slice(-30).map((observation) => observation.values.do);
  useEffect(() => {
    const timer = setTimeout(() => { if (marker.current) marker.current.style.left = `${Math.max(0, Math.min(100, predicted * 10))}%`; }, soft ? 0 : 550);
    return () => clearTimeout(timer);
  }, [predicted, soft]);
  return <><div className="page-intro"><div><h1>DO prediction</h1><p>Demo estimate · untrained</p></div><span className="snapshot-time">Station 0{ST[station].id}</span></div>
    <div className="g">
      <Card><span className="lbl">Illustrative predicted DO</span><StationSelect />
        <span className="num" style={{ fontSize: 64, marginTop: 14 }}>{predicted.toFixed(1)}<small>mg/L</small></span>
        <div className="bar"><i /><i /><i /><span className="mk" ref={marker} style={{ left: 0 }} /></div>
        <Chip accent={rangeStatus("do", predicted) !== "Normal"}>{rangeStatus("do", predicted)}</Chip>
        <details className="model-details"><summary>Demo method</summary><p>Latest sample DO − 0.9 mg/L. Not a fitted regression or validated forecast.</p></details>
      </Card>
      <Card index={1}><span className="lbl">DO · sample & demo estimate</span><Chart values={values} timestamps={observations.slice(-30).map((observation) => observation.timestamp)} predictions={[predicted]} animate={!soft} label="Sample dissolved oxygen and illustrative prediction" /></Card>
      <div className="col"><Card index={2}><span className="lbl">Inputs recorded</span><p className="muted-note">{formatTime(latest.timestamp)} PHT · {sampleAge(latest.timestamp, now)}</p>{(["temp", "ph", "tur", "tds"] as Parameter[]).map((key) => <Row key={key} label={P[key].n} value={f(key, latest.values[key]) + u(key)} />)}<small className="muted-note">Shown for context; the demo offset does not use these predictors.</small></Card>
        <Card index={3}><span className="lbl">Model evaluation</span><strong className="evaluation-pending">Pending</strong><p className="muted-note">R² & RMSE await validation.</p></Card>
      </div>
    </div>
    <div className="prediction-context"><div style={motionStyle(0)}><span className="lbl">Input time</span><strong>{formatTime(latest.timestamp)} PHT</strong></div><div style={motionStyle(1)}><span className="lbl">Demo target</span><strong>Next station visit</strong><small>Plotted at +20 min; revisit time unknown.</small></div><div style={motionStyle(2)}><span className="lbl">Scientific target</span><strong>Awaiting manuscript</strong><small>Estimation or forecasting: undecided.</small></div></div>
    <div className="section-heading"><h2>Prediction checks</h2><span>Demo · error = actual − predicted</span></div>
    <div className="foot"><Rail label="Matched sample prediction checks">
      {checks.map((check, index) => <Tile key={check.matchedAt} label={`Actual visit · ${formatTime(check.matchedAt)}`} value={`${check.error >= 0 ? "+" : ""}${check.error.toFixed(2)} mg/L`} index={index} onClick={() => go("history")}><small>Predicted {check.predicted.toFixed(2)} · Actual {check.actual.toFixed(2)}</small><small>Issued from {formatTime(check.issuedAt)}</small></Tile>)}
      <Tile label="Next actual reading" value="Pending" index={3} onClick={() => go("regression")}><small>Illustrative predicted DO {predicted.toFixed(1)} mg/L</small><small>Play the demo to create a later sample.</small></Tile>
    </Rail></div>
  </>;
}

export function RegressionView() {
  const { soft, go } = useDashboard();
  const [filled, setFilled] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setFilled(true), 600); return () => clearTimeout(timer); }, []);
  const coefficients = [["Temperature", 70, "−0.32"], ["pH", 55, "+0.21"], ["Turbidity", 40, "−0.15"], ["TDS", 25, "−0.04"]] as const;
  return <><div className="page-intro"><div><h1>Regression</h1><p>Illustrative plots & coefficients</p></div></div><div className="g">
    <Card><span className="lbl">Proposed model</span><p style={{ fontSize: 15, lineHeight: 1.5, margin: "10px 0 14px" }}>DO = b0 + b1·Temp + b2·pH + b3·Turbidity + b4·TDS</p><strong className="evaluation-pending">Fit pending</strong><details className="model-details"><summary>Model details</summary><p>Fitted coefficients, validation metrics and model version await the manuscript and training artifact. Association does not establish causation.</p></details></Card>
    <Card index={1}><span className="lbl">Actual vs predicted DO · illustrative scatter</span><Chart kind="scatter" animate={!soft} label="Illustrative scatter plot, not results from a fitted model" /></Card>
    <Card index={2}><span className="lbl">Sample coefficients · layout only</span>{coefficients.map(([name, width, value]) => <div className="cf" key={name}><div><span>{name}</span><b>{value}</b></div><i><b style={{ width: filled ? `${width}%` : 0 }} /></i></div>)}<p className="muted-note">Different units make raw coefficient magnitudes unsuitable as a direct ranking of importance.</p></Card>
  </div><div className="sub">Illustrative correlations with DO · sample numbers, not study results</div><div className="foot"><Rail label="Illustrative correlation values">
    {[["Temperature", "−0.71"], ["pH", "+0.58"], ["Turbidity", "−0.44"], ["TDS", "−0.20"]].map(([label, value], index) => <Tile key={label} label={label} value={value} index={index} onClick={() => go("prediction")}><small>Layout sample · with DO</small></Tile>)}
  </Rail></div></>;
}
