import { useEffect, useRef, useState } from 'react'

/* ═══════════════════════════════════════════════════════════════════════════
   InitialLoader — Full-screen entry shield
   ─────────────────────────────────────────────────────────────────────────
   Lifecycle:
   1. Renders immediately, covering the full viewport (z-index 9999).
   2. On mount, waits for document.readyState === 'complete' OR a hard
      ceiling of MAX_WAIT_MS (whichever fires first) — guaranteeing the
      shield never blocks interaction beyond 500ms.
   3. Fires a WAAPI fade-out animation on the overlay element.
   4. On animation completion: calls props.onDone() → triggers hero
      stagger sequence in the parent, then self-destructs (unmounts).
   ═══════════════════════════════════════════════════════════════════════════ */
const MAX_WAIT_MS = 420   // hard ceiling — well within 500ms TTI target

export default function InitialLoader({ onDone }) {
  const overlayRef  = useRef(null)
  const [alive, setAlive] = useState(true)

  useEffect(() => {
    let released = false

    function release() {
      if (released) return
      released = true

      const el = overlayRef.current
      if (!el) { onDone(); setAlive(false); return }

      /* ── WAAPI fade-out on the shield overlay ── */
      const anim = el.animate(
        [
          { opacity: 1, transform: 'scale(1)' },
          { opacity: 0, transform: 'scale(1.015)' },
        ],
        {
          duration: 300,
          easing: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',  /* var(--ease-micro) equivalent */
          fill: 'forwards',
        }
      )

      anim.onfinish = () => {
        onDone()       // signal parent → trigger hero stagger
        setAlive(false) // unmount overlay from DOM
      }
    }

    /* Hard ceiling timer — fires at MAX_WAIT_MS regardless */
    const timer = setTimeout(release, MAX_WAIT_MS)

    /* Also listen for readyState — resolves early if page loads fast */
    if (document.readyState === 'complete') {
      clearTimeout(timer)
      /* Small rAF delay ensures first paint has occurred before we release */
      requestAnimationFrame(() => requestAnimationFrame(release))
    } else {
      const onLoad = () => { clearTimeout(timer); release() }
      window.addEventListener('load', onLoad, { once: true })
      return () => { clearTimeout(timer); window.removeEventListener('load', onLoad) }
    }

    return () => clearTimeout(timer)
  }, [onDone])

  if (!alive) return null

  return (
    <div
      ref={overlayRef}
      role="status"
      aria-label="Loading Synapse AI"
      aria-live="polite"
      style={{
        position:   'fixed',
        inset:      0,
        zIndex:     9999,
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection:  'column',
        gap:        '1.25rem',
        background: 'var(--color-background)',
        pointerEvents: 'none',
      }}
    >
      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <span style={{
          width:  '2.25rem', height: '2.25rem',
          borderRadius: '0.625rem',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '0.9375rem',
          fontFamily: 'var(--font-secondary)',
        }}>S</span>
        <span style={{
          fontFamily: 'var(--font-secondary)',
          fontWeight: 700,
          fontSize:   '1.25rem',
          color:      'var(--color-text)',
          letterSpacing: '-0.02em',
        }}>
          Synapse{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>AI</span>
        </span>
      </div>

      {/* Animated progress bar */}
      <div style={{
        width: '7rem', height: '2px',
        background: 'var(--color-surface-elevated)',
        borderRadius: '9999px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
          borderRadius: '9999px',
          animation: 'loaderBar 420ms cubic-bezier(0.4,0,0.2,1) forwards',
        }} />
      </div>

      {/* Keyframes injected once via <style> — avoids a separate CSS file for this one rule */}
      <style>{`
        @keyframes loaderBar {
          from { width: 0%;   opacity: 1; }
          to   { width: 100%; opacity: 1; }
        }
      `}</style>
    </div>
  )
}
