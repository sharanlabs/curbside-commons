# Research digest — industry-current motion, interaction & UI patterns (session 23)

**Provenance:** dispatched research-specialist (quarantined, Law 11), run 2026-07-17 during session 23. **All URLs accessed 2026-07-17.** Sources: MDN/caniuse, motion.dev+npm, GSAP/Webflow, shadcn changelog (primary), Tailwind releases, Vercel design guidelines (primary), Next.js/React docs, WWDC-2026 press (TechCrunch/MacRumors/Neowin), Android press, award-site teardowns (Utsubo, Svilenković, Metabole), Rive/Lottie vendor posts. Feeds `docs/design-spec-sample-2026-07-17.md` §7.

## 1 · Motion/animation state of the art

- **CSS scroll-driven animations: near-universal but NOT Firefox-stable** — Chrome/Edge 115+, Safari 26 (Sept 2025; threaded 26.4), Firefox 152 (June 2026) still flagged in stable (Interop 2026 priority). Ship as progressive enhancement only. (MDN scroll-driven animations; MDN Firefox 152 notes; caniuse animation-timeline) — verified ≥2.
- **View Transitions: same-document is Baseline (Oct 2025, Firefox 144); cross-document Chromium-only.** A 2026 article claiming "full MPA support everywhere" is contradicted by caniuse — trust caniuse. (MDN; caniuse view-transitions) — verified ≥2.
- **Libraries mid-2026:** Motion (ex-Framer Motion) v12.42.x, independent, `motion/react`; **GSAP 100% free incl. all former Club plugins since Apr 30 2025** (Webflow acquisition), SplitText rewritten. A "GSAP/ScrollTrigger 4.0" claim = single-source UNVERIFIED (gsap.com still documents the 3.13-era release). (npm framer-motion; motion.dev; webflow.com/blog/gsap-becomes-free; css-tricks) — verified ≥2 except the 4.0 claim.
- **Spring physics went native: CSS `linear()` sampled-spring curves** are the 2025-26 practitioner pattern for control feedback, zero JS. (joshwcomeau.com linear-timing-function; developer.chrome.com css-linear-easing; carmenansio.com spring-physics-css) — verified ≥2.
- Rive vs Lottie converged on state machines; Rive differentiates on data binding + scripting. Vendor-biased both directions. (rive.app blog; lottiefiles.com blog) — verified ≥2 but vendor.
- **Award-tier hero motion 2025-26: cinematic scroll sequences; the named production stack is Lenis + GSAP ScrollTrigger + Three.js**; 3D on SOTD is baseline, not differentiator. (awwwards SOTY listing; svilenkovic.com scrollytelling-trends-2026; metabole.studio) — practitioner-candidate.

## 2 · Micro-interactions (2025-26 conventions)

- **Vercel's live Web Interface Guidelines = the clearest shipped convention set**: animate only to clarify cause & effect or add deliberate delight; hover/active/focus get MORE contrast than rest; `:focus-visible` everywhere; animations cancelable, never autoplay; GPU-only properties; explicit `prefers-reduced-motion` variant. (vercel.com/design/guidelines — primary) — verified.
- **Skeleton/loading discipline**: 150–300ms show-delay + 300–500ms minimum visible; skeletons mirror final content (no layout shift); loading buttons keep their label; toasts via polite `aria-live`. (same primary) — verified.
- The **"six microstates" bar** (default/hover/focus/active/disabled/loading) is what teardowns credit Stripe/Linear/Vercel for; Linear's "Details Matter" film (Jan 2026) = the craft register (film itself not fetched — secondary only). (mantlr.com; pixeldarts.com) — practitioner-candidate.
- **Magnetic buttons/custom cursors: agency-portfolio territory, absent from Linear/Vercel/Stripe-class product sites**; 2026 commentary warns of overuse. (gsapvault; 100daysofcraft; webflow blog) — practitioner-candidate.

## 3 · Macro transitions

- **React `<ViewTransition>` is Canary/Experimental mid-2026 — explicitly not production-recommended**; Next.js gates it behind `experimental.viewTransition`. Production transitions = Motion/GSAP or raw `document.startViewTransition`. (react.dev; nextjs.org docs) — verified ≥2.
- Cross-page (MPA) view transitions in production = Chromium-only progressive enhancement; graceful degradation accepted. (caniuse; MDN) — verified ≥2.
- 2026 scrollytelling conventions: Lenis smooth-scroll dominance, sticky chapter sections, CSS `view-timeline` where supported, GSAP ScrollTrigger as the cross-browser workhorse. (svilenkovic; awwwards scrolling category) — practitioner-candidate.
- **Reduced-motion discipline is a shipped norm** (Vercel guidelines codify it; matches WCAG 2.2 SC 2.2.2 + 2.3.3). — verified (primary).

## 4 · Component/visual trends — current vs dated

- **Bento grids: now the default, no longer a differentiator**; active counter-trend of raw/brutalist layouts and "monospace everything" in tech verticals. (studiomeyer.io 2026 reality-check + dev.to mirror — same author, weak independence) — verified 2 mirrors.
- **Apple retreated on Liquid Glass at WWDC 2026 (June 8)**: reduced default transparency for iOS/iPadOS/macOS 27 "to ensure exceptional readability" + a user transparency slider. Read: legibility won; heavy glass on the web = accessibility liability; 2026 guidance = nav/modals only, restrained. (techcrunch.com 2026-06-08; macrumors.com; neowin) — verified ≥2.
- **WebGPU mainstream in 2026**: three.js WebGPURenderer zero-config since r171 (Sept 2025); Safari 26 added WebGPU; R3F v9 first-class support; production pattern = WebGPU with WebGL fallback; same sources warn 3D "drains performance budgets." (r3f docs v9 migration; utsubo.com teardowns ×2) — verified ≥2.
- **2026 anti-list** (agency retrospectives, vendor-biased): blurred-everything glassmorphism · gratuitous kinetic typography · decorative 3D · bento-as-identity · flashy animation generally; stated direction = minimal, purposeful motion. — practitioner-candidate.
- Grain/noise + gradient meshes: no strong 2026 primary signal either way — UNVERIFIED/neutral.

## 5 · Design-system signals

- **shadcn/ui made Base UI the default (July 2026, primary changelog)**; Radix not deprecated; Base UI 1.6.0, 6M+ weekly downloads; CLI v4 (Mar 2026) added presets/agent-skills/templates; June 2026 added chat components + any-repo-as-registry. (ui.shadcn.com/docs/changelog) — verified primary.
- **Tailwind v4.3.1 (June 12 2026)**: v4.1 text-shadows/masks; v4.3 first-party scrollbar styling, logical properties. (tailwindcss.com blog; GitHub releases) — verified ≥2.
- **Material 3 Expressive**: shipped Android 16 QPR1 (Sept 2025); Google app rollout mostly complete Dec 2025; OEM adoption uneven. (blog.google; androidauthority; 9to5google) — verified ≥2.

## Fit verdict adopted into the spec (precision-instrument, bright, desktop, WCAG-strict)

ADOPT: native-first scroll narrative (IO+WAAPI; CSS scroll-timeline enhancement-only) · same-document View Transitions · `linear()` spring micro-feedback · Vercel microstate discipline wholesale · monospace/technical typography (the live counter-trend) · GSAP only if the sample proves need (free now; still requires the intake vet + owner sign-off as a new dependency). REJECT: React `<ViewTransition>` (experimental) · glassmorphism-heavy surfaces (nav-only restrained glass) · magnetic buttons/cursor hijacking · 3D/WebGL hero (unearned perf cost) · bento-as-identity.

**Gaps/honest limits:** X/Twitter practitioner layer unreachable this run; anti-list sources are agency blogs (self-promotional, one cross-posted author); "GSAP 4.0" single-source unverified; grain/mesh currency unverified; Linear film + Awwwards jury commentary not directly fetched (secondary-source claims only).
