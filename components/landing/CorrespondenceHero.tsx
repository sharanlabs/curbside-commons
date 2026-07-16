"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * CorrespondenceHero — the "Prismatic Passline" hero background (redesign C-REDO,
 * engine adopted 2026-07-15 from mockups/proof-theatre-storyboard-refined-2026-07-15.html).
 *
 * ONE full-bleed aria-hidden Canvas2D sits BEHIND the centered hero copy. It stages a
 * quiet, icon-driven proof of the idea as four connected, lightly-projected objects along
 * a single passline: a MERCHANT RECORD (source of truth) → a claim fold (a copy read by an
 * automated agent) → registered inspection blades (the check) → an evidence-bound FINDING.
 * Saturation lives only in the moving materials — iris is the through-line accent, azure the
 * merchant refraction, cyan the record, the saffron/gold read-head the evidence trace, and
 * ember the resolved seal. ≥90% of the field stays pale graphite on pure white.
 *
 * Motion is deterministic and seamless. A single 9.4s cycle drives every beat (the guide
 * reaches the record, the record answers, the centre registers, the lock snaps home on an
 * easeOutBack spring, and the finding's check draws itself). The outgoing and incoming
 * claim runs overlap so the loop never empties. Colours are read from the app CSS accent
 * tokens at init. Geometry is fixed (no per-frame Math.random topology). A restrained
 * pointer-parallax leans the depth planes a few px toward the cursor and decays to centre
 * after 1400ms idle.
 *
 * Render gate: enabled && onScreen && !hidden && !userPaused. The imperative engine lives in
 * a StrictMode-safe useEffect with idempotent teardown. Reduced motion / no-JS render a
 * single composed still frame (the resolved verdict); a WCAG-2.2 SC 2.2.2 Pause / Play
 * control (changing action label, ≥44px, keyboard-operable, focus-visible) freezes the exact frame and
 * is the explicit opt-in to play under reduced motion. The copy sits in a white radial-scrim
 * corridor so it always reads on pure white. Full devicePixelRatio (16MP backing ceiling);
 * the backing store is painted opaque #ffffff each frame.
 */

type EngineHandle = { toggle(): void; destroy(): void };
type SpacingCtx = CanvasRenderingContext2D & { letterSpacing?: string };

const REVEAL_SECONDS = 2.2; // one-time station build (scene starts revealed; kept for fidelity)
const CYCLE_SECONDS = 9.4; // the seamless verification loop
const RESOLVED_T = 0.9; // the composed static frame (reduced motion / paused-at-init)
const MAX_BACKING = 16_000_000; // 16MP backing-store ceiling (4K-crisp, bounded)
const IDLE_DECAY_MS = 1400; // pointer target decays to centre after this idle gap
const MONO = "'SFMono-Regular','SF Mono','Roboto Mono',ui-monospace,monospace";

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const clampR = (v: number) => (v < -1 ? -1 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (x: number) => {
  x = clamp01(x);
  return x * x * (3 - 2 * x);
};
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const bump = (t: number, a: number, b: number, r: number) =>
  Math.min(smooth((t - a) / r), smooth((b - t) / r));
const gauss = (d: number, s: number) => Math.exp(-(d * d) / (2 * s * s));

const easeOutCubic = (x: number) => {
  x = clamp01(x);
  return 1 - Math.pow(1 - x, 3);
};
const easeOutQuart = (x: number) => {
  x = clamp01(x);
  return 1 - Math.pow(1 - x, 4);
};
const easeOutQuint = (x: number) => {
  x = clamp01(x);
  return 1 - Math.pow(1 - x, 5);
};
const easeInOutCubic = (x: number) => {
  x = clamp01(x);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const easeInOutSine = (x: number) => {
  x = clamp01(x);
  return -(Math.cos(Math.PI * x) - 1) / 2;
};
/** the one gentle spring, reserved for the registration lock + the seal settle. */
const easeOutBack = (x: number, s?: number) => {
  x = clamp01(x);
  const k = s === undefined ? 1.16 : s;
  const c = k + 1;
  return 1 + c * Math.pow(x - 1, 3) + k * Math.pow(x - 1, 2);
};

/** "#rrggbb" | "#rgb" → "r,g,b" component string (for rgba() interpolation). */
function toRgb(hex: string): string {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return "0,0,0";
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

type Geo = {
  cx: number;
  u: number;
  railY: number;
  R: number;
  x: [number, number, number, number]; // source · claim · check · finding
};

function createEngine(
  host: HTMLElement,
  canvas: HTMLCanvasElement,
  onState: (paused: boolean, reduced: boolean) => void,
): EngineHandle {
  const ctx2d = canvas.getContext("2d");
  if (!ctx2d) {
    onState(false, false);
    return { toggle() {}, destroy() {} };
  }
  const ctx = ctx2d;

  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

  // colours read once from the app accent tokens (≥90% of the field stays graphite).
  const root = getComputedStyle(document.documentElement);
  const readVar = (name: string, fallback: string) => root.getPropertyValue(name).trim() || fallback;
  const rgb = {
    ink: toRgb(readVar("--ink", "#17151b")),
    faint: toRgb(readVar("--faint", "#6f6b76")),
    iris: toRgb(readVar("--iris", "#705de7")),
    azure: toRgb(readVar("--azure", "#2f86bd")),
    cyan: toRgb(readVar("--cyan", "#43a7ce")),
    gold: toRgb(readVar("--gold", "#eda52b")), // the saffron evidence trace
    ember: toRgb(readVar("--ember", "#c94d35")),
  };
  const ink = (a: number) => `rgba(${rgb.ink},${a})`;
  const faint = (a: number) => `rgba(${rgb.faint},${a})`;
  const iris = (a: number) => `rgba(${rgb.iris},${a})`;
  const azure = (a: number) => `rgba(${rgb.azure},${a})`;
  const cyan = (a: number) => `rgba(${rgb.cyan},${a})`;
  const gold = (a: number) => `rgba(${rgb.gold},${a})`;
  const ember = (a: number) => `rgba(${rgb.ember},${a})`;
  const setSpacing = (v: string) => {
    try {
      (ctx as SpacingCtx).letterSpacing = v;
    } catch {
      /* letterSpacing is optional; ignore where unsupported */
    }
  };

  const state = {
    enabled: false,
    running: false,
    onScreen: true,
    userPaused: mql.matches, // reduced motion → paused; play is an explicit opt-in
    raf: 0,
    reveal: 1, // scene starts revealed (matches the approved storyboard)
    cyc: 0.16,
    prev: 0,
    armed: false, // becomes true once the seal has drawn itself once
    W: 0,
    H: 0,
  };
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, amt: 0, tAmt: 0, last: 0 };
  let geo: Geo | null = null;

  /* -------- geometry -------- */

  function computeGeometry() {
    const { W, H } = state;
    const cx = W / 2;
    const u = Math.min(W * 0.245, 330);
    const railY = Math.round(H * 0.735);
    const R = Math.max(32, Math.min(56, W * 0.038));
    geo = {
      cx,
      u,
      railY,
      R,
      x: [cx - 1.5 * u, cx - 0.55 * u, cx + 0.55 * u, cx + 1.5 * u],
    };
  }

  function resize() {
    const rect = host.getBoundingClientRect();
    state.W = Math.max(1, rect.width);
    state.H = Math.max(1, rect.height);

    // full devicePixelRatio, bounded by a 16-megapixel backing-store ceiling. The
    // ceiling is absolute: the scale may drop below 1 when the CSS area alone
    // exceeds it, and the rounded integer dimensions are re-clamped by product.
    let dpr = window.devicePixelRatio || 1;
    if (state.W * state.H * dpr * dpr > MAX_BACKING) {
      dpr = Math.sqrt(MAX_BACKING / (state.W * state.H));
    }
    let bw = Math.max(1, Math.round(state.W * dpr));
    let bh = Math.max(1, Math.round(state.H * dpr));
    if (bw * bh > MAX_BACKING) {
      const shrink = Math.sqrt(MAX_BACKING / (bw * bh));
      bw = Math.max(1, Math.floor(bw * shrink));
      bh = Math.max(1, Math.floor(bh * shrink));
      dpr = bw / state.W;
    }
    canvas.width = bw;
    canvas.height = bh;
    canvas.style.width = `${state.W}px`;
    canvas.style.height = `${state.H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    computeGeometry();
    if (!state.running) renderStill();
  }

  /* -------- primitives -------- */

  function roundRect(x: number, y: number, w: number, h: number, r: number) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function polygon(
    points: Array<[number, number]>,
    fillStyle: string | CanvasGradient | null,
    strokeStyle: string | null,
    lineWidth?: number,
  ) {
    if (!points.length) return;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
    if (fillStyle) {
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }
    if (strokeStyle) {
      ctx.lineWidth = lineWidth || 1;
      ctx.strokeStyle = strokeStyle;
      ctx.stroke();
    }
  }

  function routePoint(p: number) {
    const g = geo!;
    const x0 = g.x[0],
      x1 = g.x[3],
      y = g.railY;
    const x = lerp(x0, x1, clamp01(p));
    const arch = Math.sin(Math.PI * clamp01(p));
    const drift = Math.sin(clamp01(p) * Math.PI * 2) * g.R * 0.08;
    return { x, y: y - arch * g.R * 0.42 + drift };
  }

  function passlinePath() {
    const g = geo!;
    const x0 = g.x[0],
      x1 = g.x[3],
      y = g.railY;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.bezierCurveTo(lerp(x0, x1, 0.28), y - g.R * 0.48, lerp(x0, x1, 0.7), y - g.R * 0.48, x1, y);
  }

  /* -------- the four stations + the passline -------- */

  function drawPassline(reveal: number, t: number, energy: number) {
    if (reveal <= 0.001) return;
    const g = geo!;
    const x0 = g.x[0],
      x1 = g.x[3];
    const grad = ctx.createLinearGradient(x0, 0, x1, 0);
    grad.addColorStop(0, cyan(0.04 + 0.08 * reveal));
    grad.addColorStop(0.28, iris(0.16 * reveal));
    grad.addColorStop(0.58, azure(0.18 * reveal));
    grad.addColorStop(0.82, gold(0.16 * reveal));
    grad.addColorStop(1, ember(0.08 + 0.08 * reveal));

    ctx.save();
    ctx.lineCap = "round";
    ctx.translate(0, g.R * 0.13);
    passlinePath();
    ctx.strokeStyle = ink(0.045 * reveal);
    ctx.lineWidth = g.R * 0.34;
    ctx.stroke();
    ctx.translate(0, -g.R * 0.13);
    passlinePath();
    ctx.strokeStyle = grad;
    ctx.lineWidth = g.R * 0.17;
    ctx.stroke();
    passlinePath();
    ctx.strokeStyle = "rgba(255,255,255,.72)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // three evidence stitches appear only once the record has answered
    const stitchA = easeOutCubic(seg(t, 0.64, 0.77));
    for (let i = 0; i < 3; i++) {
      const p = 0.48 + i * 0.105;
      const q = routePoint(p);
      const a = stitchA * (1 - i * 0.12);
      ctx.strokeStyle = i === 2 ? gold(0.52 * a) : azure(0.42 * a);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(q.x, q.y - 5 * a);
      ctx.lineTo(q.x, q.y + 5 * a);
      ctx.stroke();
    }

    // a narrow caustic travels inside the material, never across the copy
    const sweep = (t * 1.18 + 0.06) % 1;
    const sp = routePoint(sweep);
    const sg = ctx.createLinearGradient(sp.x - g.R, 0, sp.x + g.R, 0);
    sg.addColorStop(0, "rgba(255,255,255,0)");
    sg.addColorStop(0.5, `rgba(255,255,255,${0.45 + 0.18 * energy})`);
    sg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = sg;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sp.x - g.R, sp.y);
    ctx.lineTo(sp.x + g.R, sp.y);
    ctx.stroke();
    ctx.restore();
  }

  function drawRecordStrata(a: number, focus: number, t: number) {
    if (a <= 0.001) return;
    const g = geo!;
    const cx = g.x[0],
      cy = g.railY - g.R * 0.42,
      R = g.R;
    const w = R * 1.48,
      h = R * 1.86,
      d = R * 0.22;
    const turn = Math.sin(t * Math.PI * 2) * 0.035;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(cx, cy);
    ctx.rotate(turn);
    for (let i = 2; i >= 0; i--) {
      const ox = -i * d * 0.72,
        oy = i * d * 0.56;
      const x = -w / 2 + ox,
        y = -h / 2 + oy;
      const face = ctx.createLinearGradient(x, y, x + w, y + h);
      face.addColorStop(0, `rgba(255,255,255,${0.96 - i * 0.08})`);
      face.addColorStop(0.58, i === 0 ? cyan(0.11 + 0.08 * focus) : iris(0.045));
      face.addColorStop(1, `rgba(255,255,255,${0.8 - i * 0.06})`);
      polygon(
        [
          [x + w, y + d],
          [x + w + d, y],
          [x + w + d, y + h - d],
          [x + w, y + h],
        ],
        cyan(0.08 + 0.05 * focus),
        cyan(0.18),
        1,
      );
      roundRect(x, y + d, w, h - d, 9);
      ctx.fillStyle = face;
      ctx.fill();
      ctx.lineWidth = i === 0 ? 1.25 : 1;
      ctx.strokeStyle = i === 0 ? ink(0.26 + 0.18 * focus) : ink(0.1);
      ctx.stroke();
      if (i === 0) {
        ctx.strokeStyle = azure(0.22 + 0.18 * focus);
        ctx.lineWidth = 1;
        for (let row = 0; row < 3; row++) {
          const yy = y + d + h * (0.32 + row * 0.18);
          ctx.beginPath();
          ctx.moveTo(x + w * 0.2, yy);
          ctx.lineTo(x + w * (row === 1 ? 0.66 : 0.78), yy);
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    setSpacing(".105em");
    ctx.font = `650 11.5px ${MONO}`;
    ctx.fillStyle = faint(0.78 * a);
    ctx.fillText("MERCHANT RECORD", cx, cy + h * 0.68);
    setSpacing("0em");
  }

  function drawClaimFold(a: number, focus: number, read: number, t: number) {
    if (a <= 0.001) return;
    const g = geo!;
    const cx = g.x[1],
      cy = g.railY - g.R * 0.52,
      R = g.R;
    const w = R * 1.4,
      h = R * 1.52,
      d = R * 0.24;
    const lift = read * R * 0.08;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(cx, cy - lift);
    ctx.rotate(-0.06 + Math.sin(t * Math.PI * 2 + 0.8) * 0.025);
    polygon(
      [
        [-w / 2, -h / 2 + d],
        [w / 2 - d, -h / 2],
        [w / 2, -h / 2 + d],
        [-w / 2 + d, -h / 2 + d * 2],
      ],
      iris(0.1 + 0.1 * focus),
      iris(0.24),
      1,
    );
    polygon(
      [
        [w / 2 - d, -h / 2],
        [w / 2, -h / 2 + d],
        [w / 2, h / 2 - d],
        [w / 2 - d, h / 2],
      ],
      azure(0.12 + 0.07 * focus),
      azure(0.26),
      1,
    );
    const face = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    face.addColorStop(0, "rgba(255,255,255,.94)");
    face.addColorStop(0.46, iris(0.13 + 0.09 * focus));
    face.addColorStop(1, cyan(0.09 + 0.07 * focus));
    roundRect(-w / 2, -h / 2 + d, w - d, h - d, 11);
    ctx.fillStyle = face;
    ctx.fill();
    ctx.strokeStyle = ink(0.22 + 0.2 * focus);
    ctx.lineWidth = 1.25;
    ctx.stroke();
    ctx.strokeStyle = iris(0.34 * read);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-w * 0.25, 0);
    ctx.bezierCurveTo(-w * 0.08, -h * 0.17, w * 0.08, h * 0.17, w * 0.26, 0);
    ctx.stroke();
    ctx.restore();
  }

  function drawInspectionBlades(
    a: number,
    focus: number,
    scanP: number,
    scanActive: boolean,
    lockA: number,
    settle: number,
    match: number,
  ) {
    if (a <= 0.001) return;
    const g = geo!;
    const cx = g.x[2],
      cy = g.railY - g.R * 0.42,
      R = g.R;
    const h = R * 2.06,
      w = R * 0.3,
      d = R * 0.18;
    const close = lockA * R * 0.1 * (1 - 0.25 * settle);
    ctx.save();
    ctx.globalAlpha = a;
    for (const side of [-1, 1]) {
      const bx = cx + side * (R * 0.58 - close);
      const face = ctx.createLinearGradient(bx - w / 2, 0, bx + w / 2, 0);
      face.addColorStop(0, "rgba(255,255,255,.86)");
      face.addColorStop(0.5, side < 0 ? cyan(0.2 + 0.12 * focus) : iris(0.19 + 0.12 * focus));
      face.addColorStop(1, "rgba(255,255,255,.74)");
      polygon(
        [
          [bx - w / 2, cy - h / 2],
          [bx + w / 2, cy - h / 2 - d],
          [bx + w / 2 + side * d, cy - h / 2],
          [bx - w / 2 + side * d, cy - h / 2 + d],
        ],
        side < 0 ? cyan(0.12) : iris(0.12),
        side < 0 ? cyan(0.28) : iris(0.28),
        1,
      );
      roundRect(bx - w / 2, cy - h / 2, w, h, 6);
      ctx.fillStyle = face;
      ctx.fill();
      ctx.strokeStyle = side < 0 ? azure(0.34 + 0.18 * focus) : iris(0.36 + 0.18 * focus);
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }
    if (scanActive) {
      const sy = lerp(cy - h * 0.4, cy + h * 0.4, scanP);
      const gr = ctx.createLinearGradient(cx - R, 0, cx + R, 0);
      gr.addColorStop(0, azure(0));
      gr.addColorStop(0.5, gold(0.72));
      gr.addColorStop(1, iris(0));
      ctx.strokeStyle = gr;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - R * 0.82, sy);
      ctx.lineTo(cx + R * 0.82, sy);
      ctx.stroke();
    }
    if (match > 0.001) {
      const s = R * (0.17 + 0.08 * match);
      polygon(
        [
          [cx, cy - s],
          [cx + s, cy],
          [cx, cy + s],
          [cx - s, cy],
        ],
        gold(0.42 * match),
        gold(0.72 * match),
        1,
      );
    }
    ctx.restore();
  }

  function drawFindingFacet(a: number, focus: number, check: number, t: number) {
    if (a <= 0.001) return;
    const g = geo!;
    const cx = g.x[3],
      cy = g.railY - g.R * 0.42,
      R = g.R;
    const w = R * 1.62,
      h = R * 1.5,
      d = R * 0.23;
    const lift = easeOutCubic(seg(check, 0.2, 1)) * R * 0.08;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(cx, cy - lift);
    ctx.rotate(0.04 + Math.sin(t * Math.PI * 2 + 1.4) * 0.018);
    polygon(
      [
        [w / 2 - d, -h / 2],
        [w / 2, -h / 2 + d],
        [w / 2, h / 2 - d],
        [w / 2 - d, h / 2],
        [w / 2 - d, -h / 2],
      ],
      ember(0.1 + 0.08 * focus),
      ember(0.28),
      1,
    );
    polygon(
      [
        [-w / 2 + d, -h / 2],
        [w / 2 - d, -h / 2],
        [w / 2, -h / 2 + d],
        [-w / 2, -h / 2 + d],
      ],
      gold(0.12 + 0.08 * focus),
      gold(0.3),
      1,
    );
    const face = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    face.addColorStop(0, "rgba(255,255,255,.96)");
    face.addColorStop(0.52, gold(0.12 + 0.08 * focus));
    face.addColorStop(1, ember(0.12 + 0.08 * focus));
    polygon(
      [
        [-w / 2, -h / 2 + d],
        [w / 2 - d, -h / 2],
        [w / 2 - d, h / 2],
        [w * 0.15, h / 2],
        [-w * 0.02, h / 2 - d],
        [-w / 2, h / 2 - d],
      ],
      face,
      ink(0.24 + 0.22 * focus),
      1.25,
    );

    if (check > 0.001) {
      const p0 = { x: -w * 0.23, y: h * 0.01 },
        p1 = { x: -w * 0.07, y: h * 0.16 },
        p2 = { x: w * 0.25, y: -h * 0.19 };
      const L1 = Math.hypot(p1.x - p0.x, p1.y - p0.y),
        L2 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const draw = (L1 + L2) * check;
      ctx.strokeStyle = ember(0.92);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      if (draw <= L1) ctx.lineTo(lerp(p0.x, p1.x, draw / L1), lerp(p0.y, p1.y, draw / L1));
      else {
        ctx.lineTo(p1.x, p1.y);
        const q = (draw - L1) / L2;
        ctx.lineTo(lerp(p1.x, p2.x, q), lerp(p1.y, p2.y, q));
      }
      ctx.stroke();
    }
    ctx.restore();

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    setSpacing(".105em");
    ctx.font = `650 11.5px ${MONO}`;
    ctx.fillStyle = check > 0.55 ? ember(0.82 * a) : faint(0.72 * a);
    ctx.fillText(check > 0.55 ? "FINDING ATTACHED" : "FINDING", cx, cy + h * 0.65);
    setSpacing("0em");
  }

  function drawFacetClaim(x: number, y: number, appear: number, rotation: number, resolved: boolean) {
    if (appear <= 0.001) return;
    const g = geo!;
    const s = g.R * 0.29;
    ctx.save();
    ctx.globalAlpha = appear;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    polygon(
      [
        [0, -s],
        [s * 0.86, -s * 0.2],
        [0, 0],
      ],
      resolved ? gold(0.72) : cyan(0.72),
      null,
      0,
    );
    polygon(
      [
        [s * 0.86, -s * 0.2],
        [s * 0.68, s * 0.66],
        [0, 0],
      ],
      resolved ? ember(0.66) : azure(0.64),
      null,
      0,
    );
    polygon(
      [
        [s * 0.68, s * 0.66],
        [-s * 0.72, s * 0.58],
        [0, 0],
      ],
      resolved ? ember(0.44) : iris(0.58),
      null,
      0,
    );
    polygon(
      [
        [-s * 0.72, s * 0.58],
        [-s * 0.88, -s * 0.18],
        [0, -s],
        [0, 0],
      ],
      iris(0.66),
      null,
      0,
    );
    polygon(
      [
        [0, -s],
        [s * 0.86, -s * 0.2],
        [s * 0.68, s * 0.66],
        [-s * 0.72, s * 0.58],
        [-s * 0.88, -s * 0.18],
      ],
      null,
      ink(0.32),
      1,
    );
    ctx.restore();
  }

  /* -------- the scene (pure function of reveal + cycle time) -------- */

  function render(reveal: number, t: number) {
    if (!geo) computeGeometry();
    const g = geo!;
    const { W, H } = state;
    ctx.clearRect(0, 0, W, H);
    // keep the backing store itself opaque white (some GPU compositors expose a
    // cleared canvas as black during capture even when the CSS surface is white).
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const rSource = easeOutCubic(seg(reveal, 0.0, 0.34));
    const rAgent = easeOutCubic(seg(reveal, 0.24, 0.58));
    const rGate = easeOutCubic(seg(reveal, 0.46, 0.8));
    const rSeal = easeOutCubic(seg(reveal, 0.66, 1.0));
    const rFlow = easeInOutSine(seg(reveal, 0.1, 0.92));

    const scanRaw = seg(t, 0.6, 0.71);
    const scanP = easeInOutSine(scanRaw);
    const scanActive = scanRaw > 0.001 && scanRaw < 0.999;
    const match = bump(t, 0.635, 0.69, 0.02);
    const lockA = bump(t, 0.702, 0.815, 0.03);
    const lockSettle = easeOutBack(seg(t, 0.702, 0.79), 1.5);
    const read = bump(t, 0.32, 0.5, 0.05);
    const fieldRip = bump(t, 0.55, 0.73, 0.05);

    const X = g.x,
      railY = g.railY;
    let claimX = X[0],
      claimAppear = 0;
    if (t >= 0.16 && t < 0.2) {
      claimX = X[0];
      claimAppear = smooth(seg(t, 0.16, 0.2));
    } else if (t >= 0.2 && t < 0.3) {
      claimX = lerp(X[0], X[1], easeOutQuint(seg(t, 0.2, 0.3)));
      claimAppear = 1;
    } else if (t >= 0.3 && t < 0.5) {
      claimX = X[1] + Math.sin((t - 0.3) * 42) * 1.2 * read;
      claimAppear = 1;
    } else if (t >= 0.5 && t < 0.58) {
      claimX = lerp(X[1], X[2], easeOutQuint(seg(t, 0.5, 0.58)));
      claimAppear = 1;
    } else if (t >= 0.58 && t < 0.74) {
      claimX = X[2];
      claimAppear = 1;
    } else if (t >= 0.74 && t < 0.82) {
      claimX = lerp(X[2], X[3], easeOutQuint(seg(t, 0.74, 0.82)));
      claimAppear = 1;
    } else if (t >= 0.82 && t < 0.86) {
      claimX = X[3];
      claimAppear = 1 - smooth(seg(t, 0.82, 0.86));
    } else {
      claimAppear = 0;
    }

    let focusX: number;
    if (t < 0.16) focusX = X[3];
    else if (t < 0.3) focusX = lerp(X[0], X[1], easeInOutCubic(seg(t, 0.2, 0.3)));
    else if (t < 0.5) focusX = X[1];
    else if (t < 0.58) focusX = lerp(X[1], X[2], easeInOutCubic(seg(t, 0.5, 0.58)));
    else if (t < 0.74) focusX = X[2];
    else if (t < 0.86) focusX = lerp(X[2], X[3], easeInOutCubic(seg(t, 0.74, 0.86)));
    else focusX = X[3];
    const amt = pointer.amt;
    if (amt > 0.001) focusX = lerp(focusX, g.cx + pointer.x * g.u * 1.5, 0.16 * amt);
    const foc = (i: number) => gauss(X[i] - focusX, g.u * 0.62);

    // seamless-loop check, gated so it visibly draws itself the first time
    let check: number;
    if (t < 0.2) check = 1;
    else if (t < 0.24) check = 1 - easeInOutSine(seg(t, 0.2, 0.24));
    else if (t < 0.77) check = 0;
    else if (t < 0.85) check = easeOutQuart(seg(t, 0.77, 0.85));
    else check = 1;
    const effCheck = state.armed ? check : t < 0.77 ? 0 : easeOutQuart(seg(t, 0.77, 0.85));

    // depth planes — pointer response is damped and limited to a few px
    const pxv = pointer.x,
      pyv = pointer.y;
    const plane = (fx: number, fy: number, fn: () => void) => {
      ctx.save();
      ctx.translate(pxv * fx * amt, pyv * fy * amt);
      fn();
      ctx.restore();
    };

    plane(2.8, 1.8, () => drawPassline(rFlow, t, fieldRip));
    plane(6.2, 3.8, () => {
      drawRecordStrata(rSource, 0.36 + 0.64 * foc(0), t);
      drawClaimFold(rAgent, 0.32 + 0.68 * foc(1), read, t);
      drawInspectionBlades(rGate, 0.32 + 0.68 * foc(2), scanP, scanActive, lockA, lockSettle, match);
      drawFindingFacet(rSeal, 0.32 + 0.68 * foc(3), effCheck, t);

      const p = clamp01((claimX - X[0]) / Math.max(1, X[3] - X[0]));
      const q = routePoint(p);
      const tokenRotation = -0.18 + p * 0.42 + Math.sin(t * Math.PI * 2) * 0.08;
      drawFacetClaim(q.x, q.y, claimAppear, tokenRotation, p > 0.73);

      // overlap the outgoing and incoming runs so the loop never empties
      const incoming = smooth(seg(t, 0.88, 0.995));
      if (incoming > 0.001) {
        const ix = lerp(X[0] - g.R * 1.7, X[0], incoming);
        drawFacetClaim(ix, railY, incoming * 0.88, -0.32 + incoming * 0.2, false);
      }
      const queued = t < 0.2 ? 1 - smooth(seg(t, 0.16, 0.2)) : 0;
      if (queued > 0.001) drawFacetClaim(X[0], railY, queued * 0.88, -0.12, false);
    });
  }

  /** the composed static frame: the resolved verdict (reduced motion / paused-at-init). */
  function renderStill() {
    state.armed = true;
    render(1, RESOLVED_T);
  }

  /* -------- loop + gate -------- */

  function frame(time: number) {
    if (!state.running) return;
    if (!state.prev) state.prev = time;
    const dt = Math.min(48, time - state.prev) / 1000;
    state.prev = time;
    if (pointer.tAmt > 0 && time - pointer.last > IDLE_DECAY_MS) pointer.tAmt = 0;
    pointer.amt += (pointer.tAmt - pointer.amt) * 0.06;
    const gx = pointer.tAmt > 0 ? pointer.tx : 0;
    const gy = pointer.tAmt > 0 ? pointer.ty : 0;
    pointer.x += (gx - pointer.x) * 0.08;
    pointer.y += (gy - pointer.y) * 0.08;
    state.reveal = clamp01(state.reveal + dt / REVEAL_SECONDS);
    state.cyc = (state.cyc + dt / CYCLE_SECONDS) % 1;
    if (state.cyc >= 0.86) state.armed = true;
    render(state.reveal, state.cyc);
    state.raf = requestAnimationFrame(frame);
  }

  function start() {
    if (state.running) return;
    state.running = true;
    state.prev = 0;
    state.raf = requestAnimationFrame(frame);
  }

  function stop() {
    state.running = false;
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = 0;
    // no clearRect — the last frame stays frozen on pause / suspend.
  }

  function sync() {
    const should = state.enabled && state.onScreen && !document.hidden && !state.userPaused;
    if (should === state.running) return;
    if (should) start();
    else stop();
  }

  /* -------- listeners -------- */

  const io =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          ([entry]) => {
            // a tiny remnant of the hero can remain above an anchored chapter;
            // treat below-12% as out of view (suspends the loop; never touches the
            // user's pause choice).
            state.onScreen = !!entry && entry.isIntersecting && entry.intersectionRatio >= 0.12;
            sync();
          },
          { threshold: [0, 0.12] },
        )
      : null;
  io?.observe(host);

  const ro = "ResizeObserver" in window ? new ResizeObserver(() => resize()) : null;
  ro?.observe(host);

  const onVisibility = () => sync();
  const onResize = () => resize();
  const onPointerMove = (event: PointerEvent) => {
    const r = host.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    pointer.tx = clampR(((event.clientX - r.left) / r.width) * 2 - 1);
    pointer.ty = clampR(((event.clientY - r.top) / r.height) * 2 - 1);
    pointer.tAmt = 1;
    pointer.last = event.timeStamp || performance.now();
  };
  const onPointerLeave = () => {
    pointer.tAmt = 0;
  };
  const onMotionChange = () => {
    if (mql.matches) {
      state.userPaused = true;
      stop();
      renderStill();
      onState(true, true);
    } else {
      onState(state.userPaused, false);
      sync();
    }
  };

  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("resize", onResize, { passive: true });
  host.addEventListener("pointermove", onPointerMove, { passive: true });
  host.addEventListener("pointerleave", onPointerLeave, { passive: true });
  if (mql.addEventListener) mql.addEventListener("change", onMotionChange);
  else if (mql.addListener) mql.addListener(onMotionChange);

  /* -------- init -------- */

  state.enabled = true;
  resize();
  if (mql.matches) renderStill();
  else render(state.reveal, state.cyc);
  onState(state.userPaused, mql.matches);
  sync();

  return {
    toggle() {
      state.userPaused = !state.userPaused;
      if (state.userPaused) {
        stop();
        onState(true, mql.matches);
      } else {
        onState(false, mql.matches);
        sync();
      }
    },
    destroy() {
      stop();
      io?.disconnect();
      ro?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      if (mql.removeEventListener) mql.removeEventListener("change", onMotionChange);
      else if (mql.removeListener) mql.removeListener(onMotionChange);
    },
  };
}

function PauseGlyph() {
  return (
    <svg className="cc-pause-ic" viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">
      <rect x="6" y="5" width="3" height="10" rx="0.5" />
      <rect x="11" y="5" width="3" height="10" rx="0.5" />
    </svg>
  );
}

function PlayGlyph() {
  return (
    <svg className="cc-pause-ic" viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">
      <path d="M6 4.5l10 5.5-10 5.5z" />
    </svg>
  );
}

/** A no-JS still of the composed passline (four stations along one flow line). */
function StaticField() {
  const rail = 470;
  const stations: Array<[number, number, number]> = [
    // [cx, w, h] — record · claim · check · finding, along the rail
    [230, 96, 118],
    [500, 88, 96],
    [760, 40, 128],
    [1010, 104, 96],
  ];
  return (
    <svg
      className="cc-fallback"
      viewBox="0 0 1200 640"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <path
        d="M180 470 C 460 400, 740 400, 1020 470"
        fill="none"
        style={{
          stroke: "var(--iris)",
          strokeOpacity: 0.24,
          strokeWidth: 10,
          strokeLinecap: "round",
        }}
      />
      {stations.map(([cx, w, h], i) => (
        <rect
          key={i}
          x={cx - w / 2}
          y={rail - h}
          width={w}
          height={h}
          rx={9}
          style={{
            fill: "#ffffff",
            stroke: i === 0 ? "var(--cyan)" : i === 3 ? "var(--ember)" : "var(--iris)",
            strokeOpacity: 0.42,
            strokeWidth: 1.4,
          }}
        />
      ))}
      {/* the resolved finding's check mark */}
      <path
        d="M986 452 l14 16 l30 -40"
        fill="none"
        style={{ stroke: "var(--ember)", strokeOpacity: 0.9, strokeWidth: 3, strokeLinecap: "round" }}
      />
      {/* the copy aperture — a soft white plate keeping the centre clear */}
      <rect x="300" y="120" width="600" height="200" rx="26" style={{ fill: "var(--bg)" }} />
    </svg>
  );
}

export function CorrespondenceHero({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<EngineHandle | null>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  const onState = useCallback((p: boolean, r: boolean) => {
    setPaused(p);
    setReduced(r);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const engine = createEngine(host, canvas, onState);
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [onState]);

  const playing = !paused;
  // The control is an ACTION button whose name states what pressing it does next
  // ("Pause motion" while playing, "Play motion" while paused). Per the WAI-ARIA
  // button pattern, a changing action label must not also carry aria-pressed —
  // toggle-state semantics require a stable label — so no pressed state is exposed.
  const label = playing ? "Pause motion" : "Play motion";

  return (
    <section
      ref={hostRef}
      className="cc-hero"
      aria-labelledby="hero-h1"
      data-reduced={reduced || undefined}
    >
      <canvas ref={canvasRef} className="cc-canvas" aria-hidden="true" />
      <noscript>
        {/* Without scripting the canvas never animates, so the pause/play control is
            a dead button — hide it; the static field below carries the scene. */}
        <style dangerouslySetInnerHTML={{ __html: ".cc-pause{display:none}" }} />
        <div className="cc-noscript">
          <StaticField />
        </div>
      </noscript>
      <p className="cc-sr">
        Background illustration: a merchant&rsquo;s own record, a copy of that record read by an
        automated agent, a registration check, and an evidence-bound finding, connected along a
        single passline. In a repeating pass, the check registers the copy against the record, and a
        finding is drawn and kept attached.
      </p>
      <div className="cc-hero-copy">{children}</div>
      <button
        type="button"
        className="cc-pause"
        onClick={() => engineRef.current?.toggle()}
        aria-label={label}
      >
        {playing ? <PauseGlyph /> : <PlayGlyph />}
        <span>{label}</span>
      </button>
    </section>
  );
}
