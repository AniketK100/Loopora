# Animation System

## Technologies

### GSAP (GreenSock Animation Platform) v3.15.0
- **ScrollTrigger** — Scroll-driven timeline progression
- **MotionPathPlugin** — SVG path-following animations (CableSystem)
- **CSS Plugin** — DOM element transforms and transitions

### Lenis v1.3.25
- Inertial smooth scrolling with `easeOutExpo` curve
- Integrated with GSAP ScrollTrigger via `lenis.on("scroll", () => ScrollTrigger.update())`
- Respects `prefers-reduced-motion`

### Framer Motion v12.42.2
- Used for component mount/unmount animations in admin UI
- Not used on the landing page (GSAP handles all landing page animations)

## Animation Architecture

### Scroll Orchestrator (`useScrollOrchestrator.ts`)
- Single GSAP ScrollTrigger controller managing the entire page
- Provides normalized `progress` (0–1) and per-station progress
- Stations receive progress values; they don't own ScrollTrigger instances
- Integrates with Lenis for smooth scroll

### LandingHero Animations
1. **Hacker Terminal** — React state-driven typing/deleting effect with `setTimeout` loop
2. **Slot-Machine Scramble** — Interval-based character scrambling with slide transitions
3. **Paper Wind Cards** — GSAP timeline with ScrollTrigger scrub:
   - 3 note cards with individual 3D rotation/translation keyframes
   - Scale factor for responsive sizing (0.65 mobile, 0.85 tablet, 1.0 desktop)
   - Cards fade and scatter upward as scroll progresses

### CableSystem Animation
- GSAP MotionPathPlugin draws SVG path on scroll
- Stroke-dasharray/stroke-dashoffset technique
- Fades out after initial scroll region

### Station Reveals
- Per-station progress tracked via ScrollTrigger
- Sequential entry animations with staggered delays

### FinalScene Animations
- **Magnetic Hover** — GSAP `mousemove` listeners on `.study-prop` elements:
  - Subtle translate + scale(1.03) on hover
  - Elastic `ease.Out(1, 0.6)` return on leave
- **Sleeping Kitten** — CSS keyframe animations:
  - `kitten-breath`: scaleY oscillation (breathing effect)
  - `zzz-float-1/2/3`: 3 floating Z letters with staggered delays
- **Clock** — React state via `setInterval(60000)`

## Reduced Motion
- All animations check `prefers-reduced-motion`
- Lenis skips initialization when reduced motion is preferred
- Station progress directly sets visible state (no transitions)
