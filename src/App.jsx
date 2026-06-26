import { useState, useEffect, useCallback } from 'react'
import PricingMatrix from './components/PricingMatrix.jsx'
import BentoAccordionFeatures from './components/BentoAccordionFeatures.jsx'
import InitialLoader from './components/InitialLoader.jsx'

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#docs', label: 'Docs' },
]

/* ── Scroll progress bar ── */
function ScrollProgress() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      setPct((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="scroll-progress"
      style={{ width: `${pct}%` }}
    />
  )
}

/* ── Header / Nav ── */
function SiteHeader({ isReady }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      role="banner"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-[360ms] ease-in-out
        ${isReady ? 'nav-ready' : ''}
        ${scrolled ? 'glass-card rounded-none border-x-0 border-t-0 py-3' : 'bg-transparent py-5'}`}
    >
      <div className="container-site flex items-center justify-between">
        {/* Logo */}
        <a href="/" aria-label="Synapse AI — Home"
           className="flex items-center gap-2.5 group nav-enter micro-lift">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-sm select-none micro-scale">S</span>
          <span className="font-secondary font-700 text-[var(--color-text)] tracking-tight text-lg">
            Synapse<span className="text-gradient"> AI</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} href={href} className="nav-link nav-enter micro-fade">{label}</a>
          ))}
        </nav>

        {/* CTA cluster */}
        <div className="hidden md:flex items-center gap-3 nav-enter">
          <a href="#login" className="btn-ghost text-sm py-2 px-5">Sign in</a>
          <a href="#signup" id="cta-nav-signup" className="btn-primary text-sm py-2 px-5">Start free →</a>
        </div>

        {/* Mobile hamburger */}
        <button
          id="mobile-menu-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(v => !v)}
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-md micro-scale hover:bg-[var(--color-surface)]"
        >
          {[0, 1, 2].map(i => (
            <span key={i}
              className="block w-5 h-0.5 bg-[var(--color-text-muted)] rounded-full transition-all duration-[360ms]"
              style={menuOpen ? {
                transform: i === 0 ? 'translateY(8px) rotate(45deg)' : i === 2 ? 'translateY(-8px) rotate(-45deg)' : 'scaleX(0)',
              } : {}}
            />
          ))}
        </button>
      </div>

      {/* Mobile drawer */}
      <div id="mobile-menu" aria-hidden={!menuOpen}
        className={`md:hidden overflow-hidden transition-all duration-[360ms] ease-in-out ${menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
        <nav aria-label="Mobile navigation" className="container-site flex flex-col gap-4 pt-4 pb-6">
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}
               className="micro-fade text-[var(--color-text-muted)] text-sm font-medium">
              {label}
            </a>
          ))}
          <a href="#signup" id="cta-mobile-signup" className="btn-primary text-sm mt-2">Start free →</a>
        </nav>
      </div>
    </header>
  )
}

/* ── Hero Section ── */
function HeroSection({ isReady }) {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${isReady ? 'hero-ready' : ''}`}
      style={{ background: 'var(--gradient-hero-mesh)' }}
    >
      {/* Decorative glow orbs */}
      <div className="glow-orb w-[600px] h-[600px] top-[-200px] left-1/2 -translate-x-1/2 animate-pulse-glow"
           style={{ background: 'var(--color-primary-glow)' }} aria-hidden="true" />
      <div className="glow-orb w-[400px] h-[400px] bottom-[-100px] right-[-100px] animate-float"
           style={{ background: 'var(--color-secondary-glow)', animationDelay: '2s' }} aria-hidden="true" />

      <div className="container-site relative z-10 flex flex-col items-center text-center gap-8 pt-28 pb-20">
        {/* Eyebrow badge — stagger slot 0 */}
        <div className="eyebrow hero-enter hero-delay-0">
          <span aria-hidden="true">◆</span>
          GenAI Data Automation · v2.0
        </div>

        {/* H1 — stagger slot 1 */}
        <h1 id="hero-heading"
            className="text-balance max-w-4xl hero-enter hero-delay-1">
          Your Data. Any Source.{' '}
          <span className="text-gradient">Intelligent</span>{' '}
          by Default.
        </h1>

        {/* Subtext — stagger slot 2 */}
        <p className="text-[var(--color-text-muted)] text-[var(--text-lg)] max-w-2xl text-balance hero-enter hero-delay-2">
          Synapse AI ingests, enriches, and automates any enterprise data pipeline with production-ready GenAI — no engineers required.
        </p>

        {/* CTA row — stagger slot 3 */}
        <div className="flex flex-col sm:flex-row items-center gap-4 hero-enter hero-delay-3">
          <a href="#signup" id="cta-hero-primary" className="btn-primary text-base px-8 py-3.5">
            Start automating free
          </a>
          <a href="#demo" id="cta-hero-demo" className="btn-ghost text-base px-8 py-3.5">
            ▶ Watch 2-min demo
          </a>
        </div>

        {/* Social proof — stagger slot 4 */}
        <p className="text-[var(--color-text-subtle)] text-xs hero-enter hero-delay-4">
          Trusted by <strong className="text-[var(--color-text-muted)]">1,200+</strong> data teams · No credit card required
        </p>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
           style={{ background: 'linear-gradient(to bottom, transparent, var(--color-background))' }}
           aria-hidden="true" />
    </section>
  )
}

/* ── FeaturesSection removed — replaced by <BentoAccordionFeatures /> from components/BentoAccordionFeatures.jsx ── */

/* ── How It Works ── */
function HowItWorksSection() {
  const steps = [
    { n: '01', title: 'Connect any source', desc: 'REST, webhooks, databases, S3, or Kafka — one-click connectors for 200+ integrations.' },
    { n: '02', title: 'Define your logic', desc: 'Use natural language or a visual graph to describe enrichment, transformation, and routing rules.' },
    { n: '03', title: 'Deploy & monitor', desc: 'Push to production in one click. Get real-time observability, alerts, and auto-healing built in.' },
  ]
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-heading" className="section-pad">
      <div className="container-site flex flex-col items-center gap-12">
        <div className="flex flex-col items-center text-center gap-4 max-w-xl">
          <div className="eyebrow">How It Works</div>
          <h2 id="how-it-works-heading">From zero to production<br /><span className="text-gradient">in three steps</span></h2>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full list-none">
          {steps.map(({ n, title, desc }) => (
            <li key={n} className="glass-card p-8 flex flex-col gap-4 relative overflow-hidden">
              <span className="text-[5rem] font-bold leading-none select-none absolute -top-2 -right-2 opacity-[0.04]" aria-hidden="true">{n}</span>
              <span className="font-mono text-xs text-[var(--color-primary)] tracking-widest">{n}</span>
              <h3 className="text-xl font-semibold text-[var(--color-text)]">{title}</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ── PricingSection removed — replaced by <PricingMatrix /> from components/PricingMatrix.jsx ── */

/* ── Footer ── */
function SiteFooter() {
  const year = new Date().getFullYear()
  const cols = [
    { heading: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
    { heading: 'Developers', links: ['Documentation', 'API Reference', 'Status', 'SDKs'] },
    { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
    { heading: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
  ]
  return (
    <footer role="contentinfo" className="border-t border-[var(--color-surface-border)]">
      <div className="container-site py-16 flex flex-col gap-12">
        {/* Top: brand + columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <a href="/" aria-label="Synapse AI — Home" className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-xs">S</span>
              <span className="font-secondary font-bold text-[var(--color-text)]">Synapse AI</span>
            </a>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed max-w-[180px]">
              Next-gen GenAI data automation for modern enterprises.
            </p>
          </div>

          {/* Link columns */}
          {cols.map(({ heading, links }) => (
            <nav key={heading} aria-label={`${heading} links`}>
              <h4 className="text-xs font-semibold text-[var(--color-text)] uppercase tracking-widest mb-4">{heading}</h4>
              <ul className="flex flex-col gap-2.5 list-none">
                {links.map(l => (
                  <li key={l}>
                    <a href={`#${l.toLowerCase().replace(/\s+/g, '-')}`}
                       className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-[160ms]">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[var(--color-surface-border)]">
          <p className="text-xs text-[var(--color-text-subtle)]">
            © {year} Synapse AI, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/thestethoguy"
              aria-label="Synapse AI on GitHub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-[160ms]"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/amanaaryan/"
              aria-label="Synapse AI on LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-[160ms]"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ── Root App ── */
export default function App() {
  const [isReady, setIsReady] = useState(false)
  const handleLoaderDone = useCallback(() => setIsReady(true), [])

  return (
    <>
      <InitialLoader onDone={handleLoaderDone} />
      <ScrollProgress />
      <SiteHeader isReady={isReady} />
      <main id="main-content" role="main">
        <HeroSection isReady={isReady} />
        <BentoAccordionFeatures />
        <HowItWorksSection />
        <PricingMatrix />
      </main>
      <SiteFooter />
    </>
  )
}
