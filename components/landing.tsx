"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Chart from "./chart";
import "../app/landing.css";

const ranges = [["Dissolved oxygen", "5.0–9.0 mg/L"], ["Temperature", "25–32 °C"], ["pH", "6.5–8.5"], ["Turbidity", "1–50 NTU"], ["TDS", "50–800 µS/cm"]];
function ParameterStrip() {
  return <div className="track">{[false, true].map((copy) => <div key={String(copy)} aria-hidden={copy || undefined}>{ranges.map(([name, range]) => <div className="tile" key={name}><small>{name} · normal range</small><b>{range}</b></div>)}</div>)}</div>;
}
const questions = [
  ["What does the site show?", "Station readings, trends, history and a demo DO estimate. Map positions are illustrative."],
  ["Are the readings live?", "Sample data for now. Firebase integration comes later."],
  ["What do the range labels mean?", "They compare readings with provisional reference ranges. They do not establish safety."],
  ["How does DO prediction work?", "The planned regression uses temperature, pH, turbidity and TDS. The model and prediction target await the manuscript; current outputs are examples."],
  ["Can I download the data?", "Excel export is currently a placeholder on the History page."],
  ["Is this an official monitoring service?", "No. It is a student thesis project, and the information is supplementary only."],
];
function Faq({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  return <div className={"q rv" + (open ? " open" : "")} style={{ "--d": index * .06 + "s" } as CSSProperties}><button id={"question-" + index} onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={"answer-" + index}>{question}<span aria-hidden="true">+</span></button><div className="a" id={"answer-" + index} role="region" aria-labelledby={"question-" + index}><div><p>{answer}</p></div></div></div>;
}
function Faqs() { return <>{questions.map(([question, answer], index) => <Faq key={question} question={question} answer={answer} index={index} />)}</>; }

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null), menuButton = useRef<HTMLButtonElement>(null), drawer = useRef<HTMLElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.setAttribute("data-revealed", "true"); observer.unobserve(entry.target); } }), { threshold: .15 });
    root.current?.querySelectorAll(".rv").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    drawer.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenuOpen(false); return; }
      if (event.key !== "Tab") return;
      const controls = drawer.current?.querySelectorAll<HTMLElement>("button, a[href]");
      if (!controls?.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    const media = matchMedia("(min-width: 861px)");
    const closeOnDesktop = () => { if (media.matches) setMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    media.addEventListener("change", closeOnDesktop);
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      media.removeEventListener("change", closeOnDesktop);
      menuButton.current?.focus({ preventScroll: true });
    };
  }, [menuOpen]);
  return <div ref={root} className={"landing-page" + (menuOpen ? " menu-open" : "")}>

<div className="wrap" inert={menuOpen}><header className="top"><a className="logo" href="#top" aria-label="Sampaloc Lake, back to top"><i></i><span className="lt">Sampaloc Lake</span></a>
<nav aria-label="Sections"><a href="#about">About</a><a href="#why">Why we built it</a><a href="#faq">FAQs</a><a href="#contact" className="dk">Contact</a></nav>
<Link className="btn tb" href="/dashboard">Open dashboard</Link><button className="mb" id="mb" ref={menuButton} onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen} aria-controls="sb"><span></span><span></span><span></span></button></header></div>
<div className="bd" id="bd" onClick={() => setMenuOpen(false)} aria-hidden="true"></div><aside className="sb" id="sb" ref={drawer} role="dialog" aria-modal={menuOpen || undefined} aria-label="Site menu" onClick={(event) => { if ((event.target as HTMLElement).closest("nav a")) setMenuOpen(false); }}><div className="sh"><span className="logo"><i></i>Sampaloc Lake</span><button className="cl" id="cl" onClick={() => setMenuOpen(false)} aria-label="Close menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div><nav aria-label="Menu"><a href="#about" style={{ "--i": "0" } as CSSProperties}>About</a><a href="#why" style={{ "--i": "1" } as CSSProperties}>Why we built it</a><a href="#faq" style={{ "--i": "2" } as CSSProperties}>FAQs</a><a href="#contact" style={{ "--i": "3" } as CSSProperties}>Contact</a></nav></aside><main id="top" inert={menuOpen}><div className="wrap">
<div className="hero"><div><span className="eyebrow">Sampaloc Lake · San Pablo City</span>
<h1>Observe the lake. <em>Understand the change.</em></h1>
<p className="lead">Water quality, station by station.</p>
<div className="cta"><Link className="btn" href="/dashboard">Open dashboard</Link><a className="btn alt" href="#about">How it works</a></div></div>
<div className="vis"><Chart kind="lake" label="Stylized illustration of Sampaloc Lake with three example station pins" /><span className="chip">Illustrative stations</span><div className="fl"><small>Sample dissolved oxygen</small><b>7.2</b> <span>mg/L</span><br /><span className="chip or">Normal</span></div></div></div>
<div className="rail" aria-label="The five parameters and their normal ranges"><ParameterStrip /></div>
<figure className="lake-photo rv"><div className="lake-photo-frame"><Image src="/images/sampaloc-lake.jpg" width={4416} height={1472} sizes="(max-width: 860px) 100vw, 1200px" alt="Panoramic view across Sampaloc Lake, with the waterfront and distant mountains" /><div className="photo-caption"><strong>Sampaloc Lake, San Pablo City.</strong></div></div><figcaption><a href="https://commons.wikimedia.org/wiki/File:Panorama_of_Sampalok_Lake,_San_Pablo_City,_Laguna.jpg" target="_blank" rel="noopener noreferrer">Photo: Ralff Nestor Nacor</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a> · Cropped to fit.</figcaption></figure>
<section id="about"><span className="eyebrow">About</span><h2>One lake. Five parameters.<br />A clearer view.</h2>
<div className="grid3">
<div className="card rv"><div className="num">1</div><h3>Monitor</h3><p>Readings, sampling times and range status.</p></div>
<div className="card rv" style={{ "--d": ".12s" } as CSSProperties}><div className="num">2</div><h3>Look back</h3><p>Filter station history by parameter and date.</p></div>
<div className="card rv" style={{ "--d": ".24s" } as CSSProperties}><div className="num">3</div><h3>Interpret</h3><p>Explore a demo DO estimate and its inputs.</p></div></div>
<div className="params" aria-label="Parameters measured"><span className="chip">Dissolved oxygen</span><span className="chip">Temperature</span><span className="chip">pH</span><span className="chip">Turbidity</span><span className="chip">TDS</span><span className="chip or">GPS location</span></div></section>
<section id="system"><span className="eyebrow">How it connects</span><h2>From sensor to screen.</h2><ol className="system-flow">
  <li className="rv"><span>01</span><h3>Floating sensor</h3><p>Collect timestamped readings.</p></li>
  <li className="rv" style={{ "--d": ".1s" } as CSSProperties}><span>02</span><h3>Firebase</h3><p>Store station records.</p></li>
  <li className="rv" style={{ "--d": ".2s" } as CSSProperties}><span>03</span><h3>Dashboard</h3><p>Explore measurements.</p></li>
  <li className="rv" style={{ "--d": ".3s" } as CSSProperties}><span>04</span><h3>DO estimate</h3><p>Apply the approved model.</p></li>
</ol><p className="system-note">Planned flow · integrations pending.</p></section>
<section id="team" className="team-section"><div><h2>The team</h2><p className="lead">BS Computer Engineering<br />Laguna State Polytechnic University<br />Santa Cruz Main Campus</p><div className="researchers"><span className="lbl">Student researchers</span><ul><li className="rv">Jimenez, Kennizite D.</li><li className="rv" style={{ "--d": ".08s" } as CSSProperties}>Reyes, Nathaniel E.</li><li className="rv" style={{ "--d": ".16s" } as CSSProperties}>Santos, Kyron H.</li><li className="rv" style={{ "--d": ".24s" } as CSSProperties}>Silvestre, Jomari G.</li></ul></div></div><figure className="prototype-figure rv"><svg viewBox="0 0 420 250" role="img" aria-label="Concept illustration of a floating sensor platform, not a photograph of the actual prototype"><path d="M0 197Q35 187 70 197T140 197T210 197T280 197T350 197T420 197" stroke="var(--mu)" strokeWidth="2" fill="none" /><path d="M0 220Q35 210 70 220T140 220T210 220T280 220T350 220T420 220" stroke="var(--ln)" strokeWidth="2" fill="none" /><rect x="86" y="165" width="248" height="30" rx="15" fill="var(--or)" /><rect x="116" y="119" width="188" height="50" rx="12" fill="var(--card)" stroke="var(--mu)" strokeWidth="2" /><path d="M144 121V96H277V121M210 96V61M210 61Q235 63 242 81M210 48Q250 48 261 78" fill="none" stroke="var(--tx)" strokeWidth="3" strokeLinecap="round" /><rect x="170" y="135" width="80" height="14" rx="7" fill="var(--in)" /><path d="M145 195V232M275 195V232" stroke="var(--tx)" strokeWidth="3" /><circle cx="145" cy="232" r="5" fill="var(--or)" /><circle cx="275" cy="232" r="5" fill="var(--or)" /></svg><figcaption>Floating sensor concept</figcaption></figure></section>
<section id="why"><div className="why"><div><span className="eyebrow">Why we built it</span><h2>Make each visit count.</h2></div>
<div className="stack">
<div className="card rv"><h3>Changing conditions</h3><p>One reading captures one moment.</p></div>
<div className="card rv" style={{ "--d": ".12s" } as CSSProperties}><h3>A connected view</h3><p>Bring station visits and measurements together.</p></div>
<div className="card rv" style={{ "--d": ".24s" } as CSSProperties}><h3>DO modelling</h3><p>Explore relationships between water-quality parameters.</p></div></div></div></section>
<section id="faq"><span className="eyebrow">FAQs</span><h2>Questions we expect.</h2><Faqs /></section>
<section id="contact"><span className="eyebrow">Contact</span><div className="card rv"><h3>Laguna State Polytechnic University</h3><p>Santa Cruz Main Campus · BS Computer Engineering</p><p className="system-note">Project contact details pending.</p></div></section>
<div className="band rv"><h2>See how the lake is doing.</h2><Link className="btn" href="/dashboard">Open dashboard</Link></div>
</div></main>
<footer inert={menuOpen}><div className="wrap">LSPU Santa Cruz · Student thesis · Supplementary information only.</div></footer>

</div>;
}
