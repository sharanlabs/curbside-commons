"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * CommonsScene — the v8 hero story band (design adoption 2026-07-16; governing
 * reference `mockups/claude-design-hero-v8-2026-07-16.dc.html`, the owner's
 * chosen "Curbside Commons Hero v8" sample; ported by hand, no code vendored).
 *
 * The scene: THE MENU speaks a claim chip and THE KITCHEN answers with a record
 * chip; both converge on the proof lens at the center of the commons; the lens
 * focuses; a sealed proof capsule travels to THE AGENT and on to THE ORDER.
 * Every fourth cycle the claim does not agree with the record and is HELD —
 * shards eject and the red facet drops. A mono status line narrates each beat.
 * The story is an ILLUSTRATIVE scene — the copy around it says so; the scene
 * asserts nothing (no live data, no marketplace connection).
 *
 * Behavior contracts (carried from the prior hero's reviewed floors):
 *  1. Deterministic geometry — sin-clock motion, no randomness.
 *  2. WCAG 2.2.2 — a real Pause/Play control; pausing freezes the loop.
 *  3. Reduced motion — the scene opens SETTLED (order placed, proof attached);
 *     the two story CTAs still work by jumping straight to that cycle's settled
 *     state (no motion). CSS kills the entrance animations.
 *  4. Off-screen economy — the loop stops when the tab hides (visibilitychange)
 *     or the band leaves the viewport (IntersectionObserver at 0.12).
 *  5. No-JS — a static tableau: stations, lens, and the settled status line
 *     render; dead controls are hidden by the <noscript> style.
 *  6. StrictMode-safe — every listener, observer, and rAF handle is torn down.
 */

type CycleKind = "pass" | "hold";
type Zone = "menu" | "commons" | "agent" | null;

export type CommonsSceneProps = {
  children: ReactNode; // eyebrow + H1 + lede (server-rendered copy)
  ctaPrimary: string;
  ctaSecondary: string;
};

/* v8 clock (ms of scene time): assemble → chips IN → focus RD → to-agent TA →
   to-order TO; total cycle T. */
const T = 7200;
const CYCLE_START = 2000;
const IN = 1400;
const RD = 700;
const TA = 1200;
const TO = 1200;

const ACC = { deep: "#2438d6", mid: "#3d5ceb", light: "#93a8f7", rgb: "61,92,235" };
const HOLD_RED = "#b42318";
const GRAY = "#6a6e7a"; /* quiet-text gray — 5.09:1 on #fff (the sample's #8d919c failed AA) */

const SETTLED_STATUS = "SCENE SETTLED · ORDER PLACED WITH PROOF";
const HOLD_STATUS = "A CLAIM HELD · DOES NOT MATCH THE RECORD";

type Pt = { x: number; y: number };
type Geometry = {
  c: Pt;
  aFrom: Pt; aTo: Pt;
  bFrom: Pt; bTo: Pt;
  gFrom: Pt; gTo: Pt;
  oFrom: Pt; oTo: Pt;
  shA: Pt; shB: Pt;
};

const easeSmooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

export function CommonsScene({ children, ctaPrimary, ctaSecondary }: CommonsSceneProps) {
  const [status, setStatus] = useState("THE COMMONS ASSEMBLES");
  const [statusColor, setStatusColor] = useState(GRAY);
  const [playing, setPlaying] = useState(true);
  const [zone, setZone] = useState<Zone>(null);

  const bandRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const lensWrap = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const lensGlow = useRef<HTMLDivElement>(null);
  const chipA = useRef<HTMLDivElement>(null);
  const chipB = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const shardA = useRef<HTMLDivElement>(null);
  const shardB = useRef<HTMLDivElement>(null);
  const facetRef = useRef<HTMLDivElement>(null);
  const orderTickRef = useRef<SVGGElement>(null);
  const icMenu = useRef<HTMLDivElement>(null);
  const icKitchen = useRef<HTMLDivElement>(null);
  const icAgent = useRef<HTMLDivElement>(null);
  const icOrder = useRef<HTMLDivElement>(null);

  /* Mutable engine state — refs, not React state (the loop runs off-React). */
  const eng = useRef({
    age: 0,
    cStart: CYCLE_START,
    cycleIdx: 0,
    kind: "pass" as CycleKind,
    oneShot: false,
    play: true,
    reduced: false,
    inView: true,
    lastTs: 0,
    dtLast: 16,
    sheenAng: 0,
    raf: 0,
    par: { x: 0, y: 0, tx: 0, ty: 0 },
    PT: null as Geometry | null,
    zone: null as Zone,
    status: "THE COMMONS ASSEMBLES",
    statusColor: GRAY,
  });

  useEffect(() => {
    const e = eng.current;
    const band = bandRef.current;
    const stage = stageRef.current;
    if (!band || !stage) return;

    e.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    e.play = !e.reduced;
    setPlaying(e.play);

    const layout = () => {
      const r = band.getBoundingClientRect();
      const w = r.width, h = r.height;
      const pt = (px: number, py: number): Pt => ({ x: w * px, y: h * py });
      const C = pt(0.5, 0.44);
      const off = (p: Pt, q: Pt, d: number): Pt => {
        const dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy) || 1;
        return { x: p.x + (dx / L) * d, y: p.y + (dy / L) * d };
      };
      const menu = pt(0.13, 0.28), kitchen = pt(0.13, 0.7);
      const agent = pt(0.76, 0.36), order = pt(0.9, 0.64);
      e.PT = {
        c: C,
        aFrom: off(menu, C, 52), aTo: C,
        bFrom: off(kitchen, C, 52), bTo: C,
        gFrom: off(C, agent, 72), gTo: off(agent, C, 46),
        oFrom: off(agent, order, 42), oTo: off(order, agent, 46),
        shA: { x: C.x + 70, y: C.y - 60 }, shB: { x: C.x + 58, y: C.y + 66 },
      };
    };

    const lerp = (p: Pt, q: Pt, t: number, arc: number): Pt => ({
      x: p.x + (q.x - p.x) * t,
      y: p.y + (q.y - p.y) * t - Math.sin(Math.PI * t) * arc,
    });
    const put = (
      ref: React.RefObject<HTMLDivElement | null>,
      p: Pt, ox: number, oy: number, extra = "",
    ) => {
      const el = ref.current;
      if (el) el.style.transform = `translate3d(${(p.x - ox).toFixed(1)}px,${(p.y - oy).toFixed(1)}px,24px)${extra}`;
    };
    const hide = (ref: React.RefObject<HTMLDivElement | null>) => {
      if (ref.current) ref.current.style.opacity = "0";
    };
    const running = () => e.play || e.oneShot;

    const frame = () => {
      if (!e.PT) layout();
      if (!e.PT) return;
      stage.style.transform = `rotateY(${(e.par.x * 4).toFixed(2)}deg) rotateX(${(-e.par.y * 3).toFixed(2)}deg)`;

      const flo = (ref: React.RefObject<HTMLDivElement | null>, ph: number, zoneOn: boolean) => {
        const el = ref.current;
        if (!el) return;
        const dy = Math.sin(e.age * 0.0009 + ph) * 3.5;
        el.style.transform = `translateY(${dy.toFixed(2)}px) scale(${zoneOn ? 1.08 : 1})`;
        el.style.filter = zoneOn ? `drop-shadow(0 8px 18px rgba(${ACC.rgb},.28))` : "none";
      };
      const z = e.zone;
      flo(icMenu, 0, z === "menu");
      flo(icKitchen, 1.4, z === "menu");
      flo(icAgent, 2.6, z === "agent");
      flo(icOrder, 3.4, z === "agent");

      const elc = e.age - e.cStart;
      const hold = e.kind === "hold";
      const lw = lensWrap.current;
      if (lw) {
        const dy = Math.sin(e.age * 0.0007) * 4;
        const sc = z === "commons" ? 1.05 : 1;
        lw.style.transform = `translateY(${dy.toFixed(2)}px) rotateY(${(e.par.x * 10).toFixed(2)}deg) scale(${sc})`;
      }
      const sheen = sheenRef.current;
      if (sheen) {
        const fast = elc >= IN && elc < IN + RD;
        e.sheenAng += (fast ? 1.6 : 0.18) * e.dtLast * 0.06;
        sheen.style.transform = `translateY(${(e.sheenAng % 180).toFixed(1)}px)`;
      }

      let glowShadow = `0 0 0 0 rgba(${ACC.rgb},0)`;
      let facetOp = 0, facetY = 0, orderOn = false;

      if (elc >= 0 && elc < IN) {
        const q = easeSmooth(clamp01(elc / IN));
        const q2 = easeSmooth(clamp01((elc - 150) / (IN - 150)));
        const cA = chipA.current, cB = chipB.current;
        if (cA) { cA.style.opacity = Math.min(1, q * 4).toFixed(2); cA.style.filter = `blur(${((1 - q) * 2.4).toFixed(2)}px)`; }
        if (cB) { cB.style.opacity = Math.min(1, q2 * 4).toFixed(2); cB.style.filter = `blur(${((1 - q2) * 2.4).toFixed(2)}px)`; }
        put(chipA, lerp(e.PT.aFrom, e.PT.aTo, q, 18), 25, 16);
        put(chipB, lerp(e.PT.bFrom, e.PT.bTo, q2, -18), 25, 16);
        hide(capRef); hide(shardA); hide(shardB);
        glowShadow = `0 0 ${(18 * q).toFixed(0)}px rgba(${ACC.rgb},.14)`;
      } else if (elc >= IN && elc < IN + RD) {
        const q = (elc - IN) / RD;
        const fade = Math.max(0, 1 - q * 1.8);
        if (chipA.current) chipA.current.style.opacity = fade.toFixed(2);
        if (chipB.current) chipB.current.style.opacity = fade.toFixed(2);
        glowShadow = hold
          ? "0 0 0 1px rgba(180,35,24,.4), 0 0 44px rgba(180,35,24,.2)"
          : `0 0 0 1px rgba(${ACC.rgb},.35), 0 0 44px rgba(${ACC.rgb},.2)`;
        if (!hold && q > 0.45) {
          const s = easeSmooth(Math.min(1, (q - 0.45) / 0.55));
          if (capRef.current) capRef.current.style.opacity = s.toFixed(2);
          put(capRef, e.PT.c, 28, 16, ` scale(${(0.6 + 0.4 * s).toFixed(2)})`);
        }
      } else if (elc >= IN + RD) {
        hide(chipA); hide(chipB);
        if (hold) {
          const hq = easeSmooth(Math.min(1, (elc - IN - RD) / 800));
          if (shardA.current) shardA.current.style.opacity = Math.max(0, 1 - hq).toFixed(2);
          if (shardB.current) shardB.current.style.opacity = Math.max(0, 1 - hq).toFixed(2);
          put(shardA, lerp(e.PT.c, e.PT.shA, hq, 0), 10, 1, " rotate(-18deg)");
          put(shardB, lerp(e.PT.c, e.PT.shB, hq, 0), 7, 1, " rotate(14deg)");
          facetOp = 1;
          facetY = hq * 12;
          glowShadow = elc < IN + RD + 500
            ? "0 0 0 1px rgba(180,35,24,.3), 0 0 30px rgba(180,35,24,.15)"
            : `0 0 0 0 rgba(${ACC.rgb},0)`;
          hide(capRef);
        } else {
          if (capRef.current) capRef.current.style.opacity = "1";
          if (elc < IN + RD + TA) {
            const q = easeSmooth((elc - IN - RD) / TA);
            put(capRef, lerp(e.PT.gFrom, e.PT.gTo, q, 22), 28, 16);
          } else if (elc < IN + RD + TA + TO) {
            const q = easeSmooth((elc - IN - RD - TA) / TO);
            put(capRef, lerp(e.PT.oFrom, e.PT.oTo, q, 16), 28, 16);
          } else {
            hide(capRef);
            orderOn = true;
          }
        }
      } else {
        hide(chipA); hide(chipB); hide(capRef); hide(shardA); hide(shardB);
      }

      if (lensGlow.current) lensGlow.current.style.boxShadow = glowShadow;
      const facet = facetRef.current;
      if (facet) {
        facet.style.opacity = facetOp.toFixed(2);
        facet.style.transform = `translateX(-50%) translateY(${facetY.toFixed(1)}px) rotate(45deg)`;
      }
      const tick = orderTickRef.current;
      if (tick) {
        tick.style.opacity = orderOn || (e.reduced && !e.play && e.kind !== "hold") ? "1" : "0";
      }
    };

    const syncStatus = () => {
      const elc = e.age - e.cStart;
      const hold = e.kind === "hold";
      let t: string, c: string;
      if (e.age < 1800) { t = "THE COMMONS ASSEMBLES"; c = GRAY; }
      else if (elc < 0) { t = e.status; c = e.statusColor; }
      else if (elc < IN) { t = "THE MENU SPEAKS · THE KITCHEN ANSWERS"; c = GRAY; }
      else if (elc < IN + RD) { t = "BROUGHT INTO FOCUS"; c = ACC.deep; }
      else if (hold) { t = HOLD_STATUS; c = HOLD_RED; }
      else if (elc < IN + RD + TA) { t = "PROVEN · HANDED TO THE AGENT"; c = ACC.deep; }
      else if (elc < IN + RD + TA + TO) { t = "THE AGENT PLACES THE ORDER"; c = ACC.deep; }
      else { t = "ORDER PLACED · PROOF ATTACHED"; c = ACC.deep; }
      if (t !== e.status) {
        e.status = t; e.statusColor = c;
        setStatus(t); setStatusColor(c);
      }
    };

    const loop = (ts: number) => {
      const dt = Math.min(64, e.lastTs ? ts - e.lastTs : 16);
      e.lastTs = ts;
      e.dtLast = dt;
      e.age += dt;
      e.par.x += (e.par.tx - e.par.x) * 0.05;
      e.par.y += (e.par.ty - e.par.y) * 0.05;
      if (e.age - e.cStart >= T) {
        if (e.oneShot && !e.play) {
          // A CTA-triggered one-shot finished while continuous play is off:
          // motion genuinely stops, so the control reads "Play motion" again
          // (batch P2: the pause control must reflect ALL motion, not just
          // the continuous loop).
          e.oneShot = false;
          frame();
          syncStatus();
          setPlaying(false);
          return;
        }
        e.cStart = e.age;
        e.cycleIdx += 1;
        e.kind = e.cycleIdx % 4 === 3 ? "hold" : "pass";
      }
      frame();
      syncStatus();
      if (running() && e.inView) e.raf = requestAnimationFrame(loop);
    };

    /* Exposed to the control handlers via the engine ref. */
    const start = () => {
      cancelAnimationFrame(e.raf);
      e.lastTs = 0;
      e.raf = requestAnimationFrame(loop);
    };
    const api = {
      start, frame, syncStatus, layout, running,
      settle: (kind: CycleKind) => {
        e.kind = kind;
        e.cycleIdx = kind === "hold" ? 3 : 0;
        e.age = Math.max(e.age, 4000);
        e.cStart = e.age - (T - 1);
        e.status = kind === "hold" ? HOLD_STATUS : SETTLED_STATUS;
        e.statusColor = kind === "hold" ? HOLD_RED : GRAY;
        setStatus(e.status); setStatusColor(e.statusColor);
        frame();
      },
    };
    (e as unknown as { api: typeof api }).api = api;

    const onResize = () => { layout(); if (!running()) frame(); };
    addEventListener("resize", onResize);
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(e.raf);
      else if (running() && e.inView) start();
    };
    document.addEventListener("visibilitychange", onVis);
    const io = new IntersectionObserver(
      ([entry]) => {
        // The recorded 12% contract: pause once LESS than 12% of the band is
        // visible (batch P2: isIntersecting alone stays true down to 0%, so
        // the ratio is the honest signal).
        e.inView = entry.intersectionRatio >= 0.12;
        if (!e.inView) cancelAnimationFrame(e.raf);
        else if (running()) start();
      },
      { threshold: [0, 0.12] },
    );
    io.observe(band);

    const init = requestAnimationFrame(() => {
      layout();
      if (e.reduced) {
        api.settle("pass");
        setPlaying(false);
      } else {
        start();
      }
    });

    return () => {
      cancelAnimationFrame(init);
      cancelAnimationFrame(e.raf);
      removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
    };
  }, []);

  /* ----- control handlers (drive the engine through the ref) ----- */
  type Api = {
    start: () => void; frame: () => void; syncStatus: () => void;
    running: () => boolean; settle: (k: CycleKind) => void;
  };
  const apiOf = () => (eng.current as unknown as { api?: Api }).api;

  const runCycle = (kind: CycleKind) => {
    const e = eng.current;
    const api = apiOf();
    if (!api) return;
    e.kind = kind;
    e.cycleIdx = kind === "hold" ? 3 : 0;
    if (e.reduced && !e.play) {
      api.settle(kind);
      return;
    }
    cancelAnimationFrame(e.raf);
    e.cStart = e.age;
    e.lastTs = 0;
    if (!e.play) e.oneShot = true;
    // The control reflects ALL motion: a one-shot counts as playing, and the
    // pause control can stop it mid-run (WCAG 2.2.2 — batch P2 fix).
    setPlaying(true);
    api.start();
  };

  const togglePlay = () => {
    const e = eng.current;
    const api = apiOf();
    const active = e.play || e.oneShot;
    if (active) {
      e.play = false;
      e.oneShot = false;
      cancelAnimationFrame(e.raf);
      setPlaying(false);
    } else {
      e.play = true;
      setPlaying(true);
      if (api) api.start();
    }
  };

  const pickZone = (z: Exclude<Zone, null>) => {
    const e = eng.current;
    const next = e.zone === z ? null : z;
    e.zone = next;
    setZone(next);
    const api = apiOf();
    if (api && !api.running()) api.frame();
  };

  const onMove = (ev: React.MouseEvent<HTMLDivElement>) => {
    const e = eng.current;
    const band = bandRef.current;
    if (!band || e.reduced) return;
    const r = band.getBoundingClientRect();
    e.par.tx = ((ev.clientX - r.left) / r.width) * 2 - 1;
    e.par.ty = ((ev.clientY - r.top) / r.height) * 2 - 1;
  };
  const onLeave = () => {
    const e = eng.current;
    e.par.tx = 0;
    e.par.ty = 0;
  };

  const labelColor = (z: Exclude<Zone, null>, base: string) =>
    zone === z ? ACC.deep : base;

  return (
    <section className="cs-hero" aria-labelledby="hero-h1">
      <div className="cs-copy">{children}</div>

      {/* CTAs + zone pills — story controls (labels from the adjudicated copy). */}
      <div className="cs-ctas" style={{ margin: "30px auto 0" }}>
        <button type="button" className="lp-btn primary" onClick={() => runCycle("pass")}>
          {ctaPrimary}
        </button>
        <button type="button" className="lp-btn ghost" onClick={() => runCycle("hold")}>
          {ctaSecondary}
        </button>
      </div>
      <div className="cs-zones" role="group" aria-label="Highlight a part of the scene">
        <button type="button" className="cs-zone-btn" aria-pressed={zone === "menu"} onClick={() => pickZone("menu")}>
          The menu and kitchen
        </button>
        <button type="button" className="cs-zone-btn" aria-pressed={zone === "commons"} onClick={() => pickZone("commons")}>
          The commons
        </button>
        <button type="button" className="cs-zone-btn" aria-pressed={zone === "agent"} onClick={() => pickZone("agent")}>
          The agent and order
        </button>
      </div>

      <div ref={bandRef} className="cs-band" onMouseMove={onMove} onMouseLeave={onLeave}>
        {/* Screen-reader description of the illustrative scene — NOT role="img"
            on the band (that would strip the pause control from the a11y tree). */}
        <p className="cc-note-idx-sr">
          Illustrative order scene: the menu&rsquo;s claim and the kitchen&rsquo;s record meet in
          the commons; a proof travels to the agent and the order &mdash; or a disagreeing claim
          is held. The status line below narrates each beat.
        </p>
        {/* ambient wash + dotted survey grid */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 46% 50% at 50% 50%, rgba(${ACC.rgb},.055), transparent 70%)`, pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(18,20,28,.05) 1px, transparent 1px)", backgroundSize: "26px 26px", maskImage: "radial-gradient(ellipse 60% 55% at 50% 50%, #000 30%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse 60% 55% at 50% 50%, #000 30%, transparent 75%)", pointerEvents: "none" }} />

        <div ref={stageRef} style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}>
          {/* ----- center: the proof lens (v8 "Proof chip" centerpiece) ----- */}
          <div style={{ position: "absolute", left: "50%", top: "44%", width: 0, height: 0 }}>
            <div ref={lensWrap} style={{ position: "absolute", left: -80, top: -62, width: 160, height: 124, willChange: "transform" }}>
              <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 104, height: 104, borderRadius: 20, background: "linear-gradient(145deg,#ffffff,#f3f4f8)", border: "1px solid #e0e2e8", boxShadow: "inset 0 1px 0 rgba(255,255,255,.95), 0 22px 48px rgba(18,20,28,.12)", overflow: "hidden" }}>
                {[24, 50, 76].map((t) => (
                  <span key={`l${t}`} style={{ position: "absolute", left: -7, top: t, width: 7, height: 4, borderRadius: "2px 0 0 2px", background: "#d3d6dd" }} />
                ))}
                {[24, 50, 76].map((t) => (
                  <span key={`r${t}`} style={{ position: "absolute", right: -7, top: t, width: 7, height: 4, borderRadius: "0 2px 2px 0", background: "#d3d6dd" }} />
                ))}
                <span style={{ position: "absolute", left: "50%", top: 0, width: 1.5, height: 26, background: `linear-gradient(to bottom, ${ACC.light}, transparent)` }} />
                <span style={{ position: "absolute", left: "50%", bottom: 0, width: 1.5, height: 26, background: "linear-gradient(to top, #ffd582, transparent)" }} />
                <span style={{ position: "absolute", left: 0, top: "50%", width: 26, height: 1.5, background: `linear-gradient(to right, ${ACC.light}, transparent)` }} />
                <span style={{ position: "absolute", right: 0, top: "50%", width: 26, height: 1.5, background: "linear-gradient(to left, #ffd582, transparent)" }} />
                <div style={{ position: "absolute", inset: 26, borderRadius: 12, background: "#ffffff", border: `1px solid rgba(${ACC.rgb},.22)`, boxShadow: `0 4px 14px rgba(${ACC.rgb},.07)`, display: "grid", placeItems: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2.5 7.5l3 3 6-7" stroke={ACC.deep} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div ref={sheenRef} style={{ position: "absolute", left: 0, top: -26, width: "100%", height: 24, background: `linear-gradient(to bottom, transparent, rgba(${ACC.rgb},.16), transparent)`, willChange: "transform" }} />
              </div>
              <div ref={lensGlow} style={{ position: "absolute", inset: -8, borderRadius: 24, transition: "box-shadow .3s cubic-bezier(.22,.9,.24,1)" }} />
            </div>
            <div ref={facetRef} style={{ position: "absolute", left: "50%", top: 110, transform: "translateX(-50%) rotate(45deg)", opacity: 0, width: 13, height: 13, border: `1.6px solid ${HOLD_RED}`, willChange: "transform,opacity" }} />
            <p className="cs-station-label" style={{ position: "absolute", left: "50%", top: 88, transform: "translateX(-50%)", color: labelColor("commons", GRAY) }}>
              CURBSIDE COMMONS
            </p>
          </div>

          {/* ----- stations ----- */}
          <div style={{ position: "absolute", left: "13%", top: "28%", width: 0, height: 0 }}>
            <div style={{ position: "absolute", left: -32, top: -32, width: 64, textAlign: "center" }}>
              <div ref={icMenu} style={{ willChange: "transform", transition: "filter .3s cubic-bezier(.22,.9,.24,1)" }}>
                <svg width="50" height="50" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <rect x="11" y="6" width="26" height="36" rx="6" stroke="#4a4e5a" strokeWidth="1.7" />
                  <path d="M17 15h14" stroke={ACC.mid} strokeWidth="1.7" strokeLinecap="round" />
                  <path d="M17 22h14" stroke={GRAY} strokeWidth="1.7" strokeLinecap="round" />
                  <path d="M17 29h9" stroke={GRAY} strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </div>
              <p className="cs-station-label" style={{ color: labelColor("menu", "#6a6e7a") }}>THE MENU</p>
            </div>
          </div>
          <div style={{ position: "absolute", left: "13%", top: "70%", width: 0, height: 0 }}>
            <div style={{ position: "absolute", left: -32, top: -32, width: 64, textAlign: "center" }}>
              <div ref={icKitchen} style={{ willChange: "transform", transition: "filter .3s cubic-bezier(.22,.9,.24,1)" }}>
                <svg width="50" height="50" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <path d="M10 18l3-8h22l3 8" stroke="#4a4e5a" strokeWidth="1.7" strokeLinejoin="round" />
                  <path d="M10 18h28" stroke="#4a4e5a" strokeWidth="1.7" strokeLinecap="round" />
                  <path d="M17 10.5V18M24 10.5V18M31 10.5V18" stroke={ACC.mid} strokeWidth="1.3" strokeLinecap="round" opacity=".7" />
                  <path d="M13 18v20h22V18" stroke="#4a4e5a" strokeWidth="1.7" strokeLinejoin="round" />
                  <rect x="21" y="27" width="6" height="11" stroke={GRAY} strokeWidth="1.5" />
                </svg>
              </div>
              <p className="cs-station-label" style={{ color: labelColor("menu", "#6a6e7a") }}>THE KITCHEN</p>
            </div>
          </div>
          <div style={{ position: "absolute", left: "76%", top: "36%", width: 0, height: 0 }}>
            <div style={{ position: "absolute", left: -32, top: -32, width: 64, textAlign: "center" }}>
              <div ref={icAgent} style={{ willChange: "transform", transition: "filter .3s cubic-bezier(.22,.9,.24,1)" }}>
                <svg width="50" height="50" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <path d="M24 8l4.6 8.4L37 21l-8.4 4.6L24 34l-4.6-8.4L11 21l8.4-4.6z" stroke="#4a4e5a" strokeWidth="1.7" strokeLinejoin="round" />
                  <circle cx="24" cy="21" r="2" fill={ACC.deep} />
                  <path d="M37 33a15 15 0 01-26 0" stroke={GRAY} strokeWidth="1.3" strokeLinecap="round" strokeDasharray="1 5" />
                </svg>
              </div>
              <p className="cs-station-label" style={{ color: labelColor("agent", "#6a6e7a") }}>THE AGENT</p>
            </div>
          </div>
          <div style={{ position: "absolute", left: "90%", top: "64%", width: 0, height: 0 }}>
            <div style={{ position: "absolute", left: -32, top: -32, width: 64, textAlign: "center" }}>
              <div ref={icOrder} style={{ willChange: "transform", transition: "filter .3s cubic-bezier(.22,.9,.24,1)" }}>
                <svg width="50" height="50" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <path d="M13 17h22l-2 22H15z" stroke="#4a4e5a" strokeWidth="1.7" strokeLinejoin="round" />
                  <path d="M19 17a5 5 0 0110 0" stroke="#4a4e5a" strokeWidth="1.7" strokeLinecap="round" />
                  <g ref={orderTickRef} className="cs-order-tick" style={{ opacity: 0, transition: "opacity .4s cubic-bezier(.22,.9,.24,1)" }}>
                    <path d="M19.5 28.5l3.4 3.4L30 24.5" stroke={ACC.deep} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </svg>
              </div>
              <p className="cs-station-label" style={{ color: labelColor("agent", "#6a6e7a") }}>THE ORDER</p>
            </div>
          </div>

          {/* ----- travelers ----- */}
          <div ref={chipA} style={{ position: "absolute", left: 0, top: 0, opacity: 0, width: 50, height: 32, borderRadius: 9, background: "rgba(255,255,255,.65)", border: "1px dashed #c9ccd4", display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, padding: "0 9px", willChange: "transform,opacity,filter", pointerEvents: "none" }}>
            <span style={{ display: "block", height: 2, borderRadius: 2, background: ACC.light, width: "100%" }} />
            <span style={{ display: "block", height: 2, borderRadius: 2, background: "#d6d8de", width: "70%" }} />
          </div>
          <div ref={chipB} style={{ position: "absolute", left: 0, top: 0, opacity: 0, width: 50, height: 32, borderRadius: 9, background: "rgba(255,255,255,.65)", border: "1px dashed #c9ccd4", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, willChange: "transform,opacity,filter", pointerEvents: "none" }}>
            <span style={{ display: "block", width: 6, height: 6, borderRadius: 2, border: "1.4px solid #ffb020" }} />
            <span style={{ display: "block", width: 6, height: 6, borderRadius: 2, border: `1.4px solid ${ACC.light}` }} />
            <span style={{ display: "block", width: 6, height: 6, borderRadius: 2, border: "1.4px solid #d6d8de" }} />
          </div>
          <div ref={capRef} style={{ position: "absolute", left: 0, top: 0, opacity: 0, width: 56, height: 32, borderRadius: 999, background: "#ffffff", border: `1px solid rgba(${ACC.rgb},.45)`, boxShadow: `0 0 0 4px rgba(${ACC.rgb},.07), 0 8px 20px rgba(${ACC.rgb},.16)`, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, willChange: "transform,opacity", pointerEvents: "none" }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2.5 7.5l3 3 6-7" stroke={ACC.deep} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ display: "block", width: 14, height: 2, borderRadius: 2, background: ACC.light }} />
          </div>
          <div ref={shardA} style={{ position: "absolute", left: 0, top: 0, opacity: 0, width: 20, height: 3, borderRadius: 3, background: ACC.light, willChange: "transform,opacity", pointerEvents: "none" }} />
          <div ref={shardB} style={{ position: "absolute", left: 0, top: 0, opacity: 0, width: 14, height: 3, borderRadius: 3, background: "#c9ccd4", willChange: "transform,opacity", pointerEvents: "none" }} />
        </div>

        {/* status line + pause control */}
        <span className="cs-status cs-status-live">
          <span aria-hidden="true" className="cs-status-dot" style={{ background: statusColor }} />
          <span aria-live="polite" className="cs-status-text" style={{ color: statusColor }}>
            {status}
          </span>
        </span>
        {/* A label-swapping action button — no aria-pressed (batch P2: mixing a
            changing label with a toggle state reads as "Play motion, pressed"). */}
        <button type="button" className="cs-pause cs-controls" onClick={togglePlay}>
          <span aria-hidden="true" style={{ fontSize: 9 }}>{playing ? "❚❚" : "▶"}</span>
          <span>{playing ? "Pause motion" : "Play motion"}</span>
        </button>

        {/* No-JS: the loop cannot run — hide the dead controls, complete the
            tableau (order tick on) and state the settled scene statically. */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: ".cs-controls,.cs-zones,.cs-ctas,.cs-status-live{display:none!important}.cs-order-tick{opacity:1!important}",
            }}
          />
          <span className="cs-status">
            <span aria-hidden="true" className="cs-status-dot" style={{ background: GRAY }} />
            <span className="cs-status-text" style={{ color: GRAY }}>{SETTLED_STATUS}</span>
          </span>
        </noscript>
      </div>
    </section>
  );
}
