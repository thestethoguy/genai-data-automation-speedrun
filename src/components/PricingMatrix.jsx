import { useRef, useState, useCallback } from 'react'

/* ═══════════════════════════════════════════════════════════════════════════
   PRICING CONFIGURATION OBJECT
   Defined OUTSIDE the component so it is never recreated on render.

   Structure:
     PRICE_MATRIX[tier][cycle][currency] → display value (string)

   Calculation rules:
     • Base rates are in USD: Starter = 0, Pro = 79
     • Annual multiplier: 0.80 (20% discount)
     • Regional tariff multipliers (approximate market conversions):
         USD  → ×1.00  (baseline)
         EUR  → ×0.92  (standard EUR/USD approximation)
         INR  → ×83.5  (standard INR/USD approximation)
     • Enterprise is always "Custom" — no numeric calculation required
   ═══════════════════════════════════════════════════════════════════════════ */
const BASE_RATES = { starter: 0, pro: 79 }
const CYCLE_MULTIPLIER = { monthly: 1.0, annual: 0.80 }
const CURRENCY_CONFIG = {
  USD: { symbol: '$', rate: 1,    locale: 'en-US', fractional: false },
  EUR: { symbol: '€', rate: 0.92, locale: 'de-DE', fractional: false },
  INR: { symbol: '₹', rate: 83.5, locale: 'en-IN', fractional: false },
}

/** Pure calculation — returns display string for a given tier/cycle/currency */
function calcPrice(baseUSD, cycle, currency) {
  if (baseUSD === 0) return '0'
  const { rate, fractional } = CURRENCY_CONFIG[currency]
  const raw = baseUSD * CYCLE_MULTIPLIER[cycle] * rate
  return fractional ? raw.toFixed(2) : Math.round(raw).toString()
}

/** Build the full matrix once at module load time — static reference object */
const PRICE_MATRIX = (() => {
  const matrix = {}
  for (const [tier, base] of Object.entries(BASE_RATES)) {
    matrix[tier] = {}
    for (const cycle of ['monthly', 'annual']) {
      matrix[tier][cycle] = {}
      for (const currency of Object.keys(CURRENCY_CONFIG)) {
        matrix[tier][cycle][currency] = calcPrice(base, cycle, currency)
      }
    }
  }
  return matrix
})()

/* ── Tier static config (non-pricing data, never changes) ─────────────── */
const TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Perfect for indie builders',
    tag: null,
    cta: 'Get started free',
    ctaHref: '#starter-signup',
    isPro: false,
    features: [
      '3 active pipelines',
      '500K rows / month',
      'Community support',
      'REST & Webhook triggers',
      'Basic observability',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For growing data teams',
    tag: 'Most popular',
    cta: 'Start free trial',
    ctaHref: '#pro-signup',
    isPro: true,
    features: [
      'Unlimited pipelines',
      '50M rows / month',
      'Priority support (4h SLA)',
      'Custom LLM connectors',
      'SSO & RBAC',
      'Advanced observability',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Mission-critical scale',
    tag: null,
    cta: 'Contact sales',
    ctaHref: '#enterprise-contact',
    isPro: false,
    isEnterprise: true,
    features: [
      'Dedicated infrastructure',
      'Unlimited everything',
      '99.99% SLA guarantee',
      'Audit logs & compliance',
      'Onboarding engineer',
      'Custom contract terms',
    ],
  },
]

/* ═══════════════════════════════════════════════════════════════════════════
   PricingMatrix Component
   ─────────────────────────────────────────────────────────────────────────
   STATE ISOLATION ARCHITECTURE:

   • `billingCycle` and `currency` useState — ONLY control button visual
     active states (active pill highlight). They do NOT drive price rendering.

   • All <span> price nodes are captured via useRef into `priceRefs`.
     Structure: priceRefs.current[tierId] = { price, symbol, cadence }

   • `flushPrices()` is the sole DOM mutator. It reads the current cycle &
     currency from plain mutable refs (`cycleRef`, `currencyRef`) — NOT from
     React state — and directly sets textContent on each price span.
     This means ZERO component re-renders happen on price changes.
   ═══════════════════════════════════════════════════════════════════════════ */
export default function PricingMatrix() {
  /* ── Visual-only state (button highlight) ── */
  const [billingCycle, setBillingCycle] = useState('monthly')   // 'monthly' | 'annual'
  const [currency,     setCurrency]     = useState('USD')       // 'USD' | 'EUR' | 'INR'

  /* ── Mutable refs that track current selections WITHOUT triggering renders ── */
  const cycleRef    = useRef('monthly')  // mirrors billingCycle for DOM reads
  const currencyRef = useRef('USD')      // mirrors currency for DOM reads

  /* ── DOM node refs: priceRefs.current[tierId].{ price, symbol, cadence } ── */
  const priceRefs = useRef({})

  /** Registers a price node ref by tier id and field key */
  const setRef = useCallback((tierId, field) => (node) => {
    if (!priceRefs.current[tierId]) priceRefs.current[tierId] = {}
    priceRefs.current[tierId][field] = node
  }, [])

  /**
   * flushPrices — Vanilla DOM mutation, no setState, no re-render.
   * Reads from cycleRef + currencyRef (always up-to-date after mutation).
   * Directly sets textContent on each registered span node.
   */
  const flushPrices = useCallback(() => {
    const cycle = cycleRef.current
    const curr  = currencyRef.current
    const { symbol } = CURRENCY_CONFIG[curr]

    for (const tier of TIERS) {
      const nodes = priceRefs.current[tier.id]
      if (!nodes) continue

      if (tier.isEnterprise) {
        /* Enterprise never shows a numeric price — keep as-is */
        if (nodes.symbol)  nodes.symbol.textContent  = ''
        if (nodes.price)   nodes.price.textContent   = 'Custom'
        if (nodes.cadence) nodes.cadence.textContent = ''
        continue
      }

      const displayValue = PRICE_MATRIX[tier.id][cycle][curr]

      /* Direct DOM mutation — bypasses React reconciler entirely */
      if (nodes.symbol)  nodes.symbol.textContent  = symbol
      if (nodes.price)   nodes.price.textContent   = displayValue
      if (nodes.cadence) nodes.cadence.textContent = displayValue === '0' ? '' : `/${cycle === 'annual' ? 'mo*' : 'mo'}`
    }
  }, [])

  /* ── Handlers — mutate refs first, then flush DOM, then update visual state ── */
  const handleCycleChange = useCallback((cycle) => {
    cycleRef.current = cycle           // 1. update mutable ref (no render)
    flushPrices()                      // 2. slam new values into DOM spans
    setBillingCycle(cycle)             // 3. update visual-only state (1 render, buttons only)
  }, [flushPrices])

  const handleCurrencyChange = useCallback((curr) => {
    currencyRef.current = curr         // 1. update mutable ref (no render)
    flushPrices()                      // 2. DOM mutation
    setCurrency(curr)                  // 3. visual state only
  }, [flushPrices])

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="section-pad relative overflow-hidden"
    >
      {/* Ambient background glow — CSS only, no JS */}
      <div
        className="glow-orb w-[700px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none"
        style={{ background: 'var(--color-primary-glow)' }}
        aria-hidden="true"
      />

      <div className="container-site relative z-10 flex flex-col items-center gap-12">

        {/* ── Section header ── */}
        <div className="flex flex-col items-center text-center gap-4 max-w-2xl">
          <div className="eyebrow">Pricing</div>
          <h2 id="pricing-heading">
            Transparent pricing.<br />
            <span className="text-gradient">Scale without surprises.</span>
          </h2>
          <p className="text-[var(--text-base)] text-[var(--color-text-muted)]">
            Start free. Upgrade when you need to. No hidden fees, ever.
          </p>
        </div>

        {/* ── Control bar: Billing toggle + Currency selector ── */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">

          {/* Billing cycle pill toggle */}
          <div
            role="group"
            aria-label="Billing cycle"
            className="flex items-center p-1 rounded-full border border-[var(--color-surface-border)] bg-[var(--color-surface)]"
          >
            {['monthly', 'annual'].map((cycle) => (
              <button
                key={cycle}
                id={`billing-toggle-${cycle}`}
                role="radio"
                aria-checked={billingCycle === cycle}
                onClick={() => handleCycleChange(cycle)}
                className="relative px-5 py-1.5 rounded-full text-sm font-medium capitalize
                           transition-all duration-[160ms] ease-out focus-visible:outline-none
                           focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                style={{
                  background: billingCycle === cycle
                    ? 'var(--gradient-brand)'
                    : 'transparent',
                  color: billingCycle === cycle
                    ? '#ffffff'
                    : 'var(--color-text-muted)',
                  transition: `background var(--duration-micro) var(--ease-micro),
                               color var(--duration-micro) var(--ease-micro)`,
                }}
              >
                {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                {cycle === 'annual' && (
                  <span
                    className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: billingCycle === 'annual'
                        ? 'rgba(255,255,255,0.2)'
                        : 'rgba(52, 211, 153, 0.15)',
                      color: billingCycle === 'annual'
                        ? '#fff'
                        : 'var(--color-accent-emerald)',
                    }}
                  >
                    −20%
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Currency selector */}
          <div
            role="group"
            aria-label="Currency"
            className="flex items-center p-1 rounded-full border border-[var(--color-surface-border)] bg-[var(--color-surface)]"
          >
            {Object.entries(CURRENCY_CONFIG).map(([code, { symbol }]) => (
              <button
                key={code}
                id={`currency-toggle-${code.toLowerCase()}`}
                role="radio"
                aria-checked={currency === code}
                onClick={() => handleCurrencyChange(code)}
                className="px-4 py-1.5 rounded-full text-sm font-medium focus-visible:outline-none
                           focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                style={{
                  background: currency === code
                    ? 'var(--color-surface-elevated)'
                    : 'transparent',
                  color: currency === code
                    ? 'var(--color-text)'
                    : 'var(--color-text-muted)',
                  border: currency === code
                    ? '1px solid var(--color-surface-border-hover)'
                    : '1px solid transparent',
                  transition: `background var(--duration-micro) var(--ease-micro),
                               color var(--duration-micro) var(--ease-micro),
                               border-color var(--duration-micro) var(--ease-micro)`,
                }}
              >
                {symbol} {code}
              </button>
            ))}
          </div>
        </div>

        {/* Annual note */}
        <p
          className="text-xs text-[var(--color-text-subtle)] -mt-6 transition-opacity duration-[160ms]"
          style={{ opacity: billingCycle === 'annual' ? 1 : 0 }}
          aria-live="polite"
        >
          * Billed annually · Prices shown per month
        </p>

        {/* ── Pricing cards grid ── */}
        <div
          role="list"
          aria-label="Pricing tiers"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl"
        >
          {TIERS.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              setRef={setRef}
              initialCurrency={CURRENCY_CONFIG['USD']}
              initialPrice={
                tier.isEnterprise
                  ? { symbol: '', value: 'Custom', cadence: '' }
                  : {
                      symbol: '$',
                      value: PRICE_MATRIX[tier.id]['monthly']['USD'],
                      cadence: PRICE_MATRIX[tier.id]['monthly']['USD'] === '0' ? '' : '/mo',
                    }
              }
            />
          ))}
        </div>

        {/* ── Full comparison matrix placeholder (Phase 3) ── */}
        <div
          className="glass-card w-full min-h-[100px] flex items-center justify-center border-dashed mt-4"
          aria-label="Full feature comparison matrix — Phase 3"
        >
          <p className="eyebrow">Full Comparison Matrix · Phase 3</p>
        </div>

      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   PricingCard — Pure presentational sub-component.
   Receives `setRef` to register its DOM nodes with the parent's ref map.
   Never receives price as a prop — only the initial static seed values.
   ═══════════════════════════════════════════════════════════════════════════ */
function PricingCard({ tier, setRef, initialPrice }) {
  const { id, name, tagline, tag, cta, ctaHref, isPro, isEnterprise, features } = tier

  return (
    <article
      role="listitem"
      aria-label={`${name} pricing plan`}
      className={`relative flex flex-col gap-6 p-8 rounded-[var(--radius-xl)] border
                  transition-all duration-[360ms] ease-in-out ${
        isPro
          ? 'bg-[var(--color-surface-elevated)] border-[var(--color-primary)] shadow-glow-primary md:scale-[1.04] md:-translate-y-1'
          : 'glass-card'
      }`}
    >
      {/* Popular badge */}
      {tag && (
        <span
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 eyebrow text-[10px] px-3 py-1
                     bg-[var(--color-primary)] text-white border-[var(--color-primary)] whitespace-nowrap"
          aria-label="Most popular plan"
        >
          {tag}
        </span>
      )}

      {/* Tier identity */}
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          {name}
        </h3>
        <p className="text-xs text-[var(--color-text-subtle)]">{tagline}</p>
      </div>

      {/* ── Price display — nodes registered via ref callbacks ── */}
      <div className="flex items-baseline gap-1 min-h-[3.5rem]" aria-live="polite" aria-atomic="true">
        {/* Symbol node — textContent mutated by flushPrices() */}
        <span
          ref={setRef(id, 'symbol')}
          className="text-2xl font-bold text-[var(--color-text-muted)] self-start mt-2"
          aria-hidden="true"
        >
          {initialPrice.symbol}
        </span>

        {/* Numeric price node — textContent mutated by flushPrices() */}
        <span
          ref={setRef(id, 'price')}
          className="text-5xl font-extrabold tracking-tight"
          style={{ fontFamily: 'var(--font-secondary)', color: 'var(--color-text)' }}
        >
          {initialPrice.value}
        </span>

        {/* Cadence node — textContent mutated by flushPrices() */}
        <span
          ref={setRef(id, 'cadence')}
          className="text-sm text-[var(--color-text-muted)] self-end mb-1"
        >
          {initialPrice.cadence}
        </span>
      </div>

      {/* Divider */}
      <hr className="border-[var(--color-surface-border)]" />

      {/* Feature list */}
      <ul className="flex flex-col gap-3 flex-1" aria-label={`${name} plan features`}>
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-[var(--color-text-muted)]">
            <span
              className="shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{
                background: isPro
                  ? 'rgba(99,102,241,0.2)'
                  : 'rgba(52,211,153,0.1)',
                color: isPro
                  ? 'var(--color-primary)'
                  : 'var(--color-accent-emerald)',
              }}
              aria-hidden="true"
            >
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href={ctaHref}
        id={`cta-pricing-${id}`}
        className={`text-center mt-2 ${
          isEnterprise
            ? 'btn-ghost'
            : isPro
            ? 'btn-primary'
            : 'btn-ghost'
        }`}
        aria-label={`${cta} for ${name} plan`}
      >
        {cta}
      </a>
    </article>
  )
}
