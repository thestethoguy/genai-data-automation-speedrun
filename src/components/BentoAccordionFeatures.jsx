import { useState, useEffect, useCallback, useId } from 'react'

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE DATA — static config outside component scope (never recreated)
   ═══════════════════════════════════════════════════════════════════════════ */
const FEATURES = [
  {
    id: 'realtime-parsing',
    eyebrow: '01 · Ingestion',
    title: 'Real-Time Stream Parsing',
    summary: 'Sub-50ms end-to-end',
    description:
      'Synapse intercepts raw byte streams from Kafka, WebSockets, and S3 event firehoses. Our adaptive tokeniser chunks payloads on the fly — no schema pre-definition required. Throughput scales horizontally to 500K events/sec without a single config change.',
    accentVar: '--color-primary',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
           strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    ),
    stat: { value: '500K', label: 'events / sec' },
    /* Bento grid span: wide left card */
    gridClass: 'md:col-span-2 md:row-span-2',
  },
  {
    id: 'schema-detection',
    eyebrow: '02 · Intelligence',
    title: 'Autonomous Schema Detection',
    summary: 'Zero-config data contracts',
    description:
      'A fine-tuned transformer model inspects incoming records and infers field types, relationships, and nullability constraints. Generated schemas are versioned, diffed, and deployed to downstream consumers automatically — eliminating brittle ETL contracts.',
    accentVar: '--color-accent-cyan',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
           strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
    stat: { value: '99.8%', label: 'type accuracy' },
    gridClass: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 'multi-vector-sync',
    eyebrow: '03 · Routing',
    title: 'Multi-Vector Sync',
    summary: 'One source, many destinations',
    description:
      'Fan-out any enriched data event to Postgres, Pinecone, Elasticsearch, and webhooks simultaneously. Conflict resolution, deduplication, and ordering guarantees are handled by Synapse — your consumers receive clean, consistent records every time.',
    accentVar: '--color-accent-violet',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
           strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    stat: { value: '200+', label: 'connectors' },
    gridClass: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 'ai-audit-trails',
    eyebrow: '04 · Compliance',
    title: 'AI Audit Trails',
    summary: 'Full lineage, zero gaps',
    description:
      'Every transformation, enrichment, and routing decision is cryptographically signed and appended to an immutable audit ledger. SOC 2, GDPR, and HIPAA compliance reports generate in one click — always current, always provable.',
    accentVar: '--color-accent-emerald',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
           strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    stat: { value: '100%', label: 'lineage coverage' },
    /* Bento grid span: wide right bottom card */
    gridClass: 'md:col-span-2 md:row-span-1',
  },
]

/* ═══════════════════════════════════════════════════════════════════════════
   HOOK — useIsDesktop
   Watches window.innerWidth and returns a boolean. Uses a single
   ResizeObserver on <html> to avoid layout thrash from repeated
   getBoundingClientRect calls. Initialises synchronously to prevent
   a flash of wrong layout on first paint.
   ═══════════════════════════════════════════════════════════════════════════ */
const BREAKPOINT = 768  // px — must mirror Tailwind's `md:` breakpoint

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= BREAKPOINT
  )

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${BREAKPOINT}px)`)
    const handler = (e) => setIsDesktop(e.matches)
    // Use addEventListener if available (modern), else addListener (legacy)
    mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler)
    return () => mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler)
  }, [])

  return isDesktop
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROOT COMPONENT — BentoAccordionFeatures
   ─────────────────────────────────────────────────────────────────────────
   Single shared `activeIndex` state drives BOTH layouts.
   On breakpoint transition the last active card index is preserved,
   so the accordion opens to the same feature the user was hovering on
   the desktop bento grid (and vice-versa).
   ═══════════════════════════════════════════════════════════════════════════ */
export default function BentoAccordionFeatures() {
  // 0 = first feature active by default
  const [activeIndex, setActiveIndex] = useState(0)
  const isDesktop = useIsDesktop()

  /* Stable setter used by both sub-components */
  const activate = useCallback((idx) => setActiveIndex(idx), [])

  /* Toggle for accordion (click same → close; click different → open) */
  const toggle = useCallback(
    (idx) => setActiveIndex((prev) => (prev === idx ? -1 : idx)),
    []
  )

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="section-pad relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        className="glow-orb w-[600px] h-[300px] -top-20 left-1/4 opacity-15 pointer-events-none"
        style={{ background: 'var(--color-secondary-glow)' }}
        aria-hidden="true"
      />

      <div className="container-site relative z-10 flex flex-col gap-14">
        {/* ── Section header ── */}
        <div className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto">
          <div className="eyebrow">Capabilities</div>
          <h2 id="features-heading">
            Built for every<br />
            <span className="text-gradient">data challenge</span>
          </h2>
          <p className="text-[var(--color-text-muted)] text-[var(--text-base)]">
            From raw ingestion to enriched output — Synapse AI handles the full
            lifecycle so your team ships faster.
          </p>
        </div>

        {/*
          ── Layout branch ──
          Both branches are rendered to the DOM but shown/hidden
          via Tailwind responsive visibility classes. This avoids
          a hydration-mismatch if SSR is ever added, and keeps
          CSS-only for the visibility switch (no JS class toggling).

          The shared `activeIndex` state means:
            Desktop hover sets activeIndex → accordion reads it if resized
            Accordion toggle sets activeIndex → bento reads it if resized
        */}

        {/* DESKTOP: Bento Grid — hidden below md breakpoint */}
        <div className="hidden md:block">
          <BentoGrid
            features={FEATURES}
            activeIndex={activeIndex}
            onActivate={activate}
          />
        </div>

        {/* MOBILE: Accordion — hidden at md and above */}
        <div className="block md:hidden">
          <Accordion
            features={FEATURES}
            activeIndex={activeIndex}
            onToggle={toggle}
          />
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   BENTO GRID (desktop)
   ─────────────────────────────────────────────────────────────────────────
   4-card asymmetric layout:
     Col 1-2 / Row 1-2  → Feature 0 (large, left)
     Col 3   / Row 1    → Feature 1 (small, top-right)
     Col 3   / Row 2    → Feature 2 (small, bottom-right)
     Col 1-2 / Row 3    → Feature 3 (wide, bottom)

   Grid is 3 columns × 3 rows on desktop.
   Each card uses CSS custom properties for its accent colour so no
   inline style duplication is needed inside the card itself.
   ═══════════════════════════════════════════════════════════════════════════ */
function BentoGrid({ features, activeIndex, onActivate }) {
  return (
    <div
      role="list"
      aria-label="Platform features"
      className="grid grid-cols-3 grid-rows-3 gap-4 h-[680px]"
    >
      {features.map((feature, idx) => (
        <BentoCard
          key={feature.id}
          feature={feature}
          isActive={activeIndex === idx}
          onActivate={() => onActivate(idx)}
        />
      ))}
    </div>
  )
}

function BentoCard({ feature, isActive, onActivate }) {
  const { eyebrow, title, summary, description, accentVar, icon, stat, gridClass } = feature

  return (
    <article
      role="listitem"
      aria-label={title}
      className={`
        relative overflow-hidden flex flex-col justify-between p-7 rounded-[var(--radius-xl)]
        border cursor-pointer select-none
        ${gridClass}
        transition-all duration-[360ms] ease-in-out
        ${isActive
          ? 'border-[var(--active-accent)] bg-[var(--color-surface-elevated)] shadow-[0_0_40px_-8px_var(--active-accent)]'
          : 'glass-card hover:border-[var(--color-surface-border-hover)]'
        }
      `}
      style={{ '--active-accent': `var(${accentVar})` }}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onActivate()}
    >
      {/* Decorative radial glow — visible only when active */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, var(${accentVar}) 0%, transparent 70%)`,
          opacity: isActive ? 0.18 : 0,
          transition: 'opacity var(--duration-layout) var(--ease-layout)',
        }}
        aria-hidden="true"
      />

      {/* Top row: eyebrow + icon */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <span
          className="font-mono text-[10px] tracking-widest uppercase"
          style={{ color: `var(${accentVar})` }}
        >
          {eyebrow}
        </span>
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `color-mix(in srgb, var(${accentVar}) 14%, transparent)`,
            color: `var(${accentVar})`,
            border: `1px solid color-mix(in srgb, var(${accentVar}) 28%, transparent)`,
            transition: 'background var(--duration-micro) var(--ease-micro)',
          }}
        >
          <span className="w-5 h-5">{icon}</span>
        </span>
      </div>

      {/* Middle: title + description (description fades in on active) */}
      <div className="flex flex-col gap-3 relative z-10 mt-auto">
        <h3
          className="text-xl font-semibold leading-tight"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-secondary)' }}
        >
          {title}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{
            color: 'var(--color-text-muted)',
            maxHeight: isActive ? '6rem' : '0',
            overflow: 'hidden',
            opacity: isActive ? 1 : 0,
            transition: 'max-height var(--duration-layout) var(--ease-layout), opacity var(--duration-layout) var(--ease-layout)',
          }}
        >
          {description}
        </p>
      </div>

      {/* Bottom: stat pill */}
      {stat && (
        <div
          className="flex items-baseline gap-1.5 mt-5 relative z-10 pt-5 border-t"
          style={{ borderColor: `color-mix(in srgb, var(${accentVar}) 20%, transparent)` }}
        >
          <span
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: `var(${accentVar})`, fontFamily: 'var(--font-secondary)' }}
          >
            {stat.value}
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">{stat.label}</span>
        </div>
      )}
    </article>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   ACCORDION (mobile)
   ─────────────────────────────────────────────────────────────────────────
   Uses CSS grid-template-rows: 0fr → 1fr transition.
   This is the modern, no-JS-height-calculation approach:
     • Outer div: overflow-hidden, grid, transition on grid-template-rows
     • Inner div: min-height: 0 (required for 0fr to work correctly)
   ARIA pattern: button[aria-expanded] → div[role="region"][aria-labelledby]
   ═══════════════════════════════════════════════════════════════════════════ */
function Accordion({ features, activeIndex, onToggle }) {
  const uid = useId()   // stable prefix for aria-id pairs

  return (
    <div
      role="list"
      aria-label="Platform features"
      className="flex flex-col gap-3"
    >
      {features.map((feature, idx) => {
        const isOpen    = activeIndex === idx
        const btnId     = `${uid}-btn-${idx}`
        const panelId   = `${uid}-panel-${idx}`
        const { eyebrow, title, description, accentVar, icon, stat } = feature

        return (
          <article
            key={feature.id}
            role="listitem"
            className={`
              rounded-[var(--radius-lg)] border overflow-hidden
              transition-all duration-[360ms] ease-in-out
              ${isOpen
                ? 'border-[var(--active-accent)] bg-[var(--color-surface-elevated)]'
                : 'glass-card'
              }
            `}
            style={{ '--active-accent': `var(${accentVar})` }}
          >
            {/* ── Accordion trigger ── */}
            <button
              id={btnId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => onToggle(idx)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-inset"
            >
              {/* Icon */}
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: `color-mix(in srgb, var(${accentVar}) 14%, transparent)`,
                  color: `var(${accentVar})`,
                  border: `1px solid color-mix(in srgb, var(${accentVar}) 28%, transparent)`,
                }}
                aria-hidden="true"
              >
                <span className="w-5 h-5">{icon}</span>
              </span>

              {/* Title group */}
              <span className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span
                  className="font-mono text-[9px] tracking-widest uppercase"
                  style={{ color: `var(${accentVar})` }}
                >
                  {eyebrow}
                </span>
                <span
                  className="text-base font-semibold truncate"
                  style={{ color: 'var(--color-text)', fontFamily: 'var(--font-secondary)' }}
                >
                  {title}
                </span>
              </span>

              {/* Chevron — rotates via CSS transform on isOpen */}
              <svg
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                className="w-4 h-4 shrink-0 text-[var(--color-text-muted)]"
                style={{
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform var(--duration-layout) var(--ease-layout)',
                  color: isOpen ? `var(${accentVar})` : 'var(--color-text-muted)',
                }}
                aria-hidden="true"
              >
                <path d="m19 9-7 7-7-7" />
              </svg>
            </button>

            {/*
              ── Accordion panel ──
              grid-template-rows transition: 0fr → 1fr
              The inner wrapper MUST have min-height: 0 for the 0fr
              clamp to clip the content correctly.
            */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              aria-hidden={!isOpen}
              style={{
                display: 'grid',
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                transition: 'grid-template-rows var(--duration-layout) var(--ease-layout)',
              }}
            >
              <div style={{ minHeight: 0, overflow: 'hidden' }}>
                <div className="px-5 pb-5 pt-1 flex flex-col gap-4">
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {description}
                  </p>

                  {stat && (
                    <div
                      className="flex items-baseline gap-2 pt-3 border-t"
                      style={{ borderColor: `color-mix(in srgb, var(${accentVar}) 20%, transparent)` }}
                    >
                      <span
                        className="text-2xl font-extrabold"
                        style={{ color: `var(${accentVar})`, fontFamily: 'var(--font-secondary)' }}
                      >
                        {stat.value}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)]">{stat.label}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
