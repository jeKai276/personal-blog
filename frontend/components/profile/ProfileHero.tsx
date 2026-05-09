export default function ProfileHero() {
  return (
    <div
      className="rounded-3xl px-8 py-12 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, var(--accent-soft) 0%, var(--paper-2) 70%)',
        border: '1px solid var(--line)',
      }}
    >
      {/* Glow orb */}
      <div
        aria-hidden
        className="absolute -right-12 -top-12 w-[240px] h-[240px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(closest-side, var(--accent), transparent 70%)',
          opacity: 0.45,
        }}
      />
      <div className="relative">
        <p className="font-mono text-[11px] tracking-[0.22em] uppercase mb-3" style={{ color: 'var(--muted)' }}>
          ☼ — Portfolio
        </p>
        <h1
          className="font-serif font-light tracking-tight leading-[1.05]"
          style={{ fontSize: 'clamp(32px, 5vw, 52px)', color: 'var(--ink)' }}
        >
          Hi, I&rsquo;m{' '}
          <span style={{ fontFamily: 'Caveat, cursive', color: 'var(--accent-strong)' }}>Yen</span>.
        </h1>
        <p className="mt-3 text-[16px]" style={{ color: 'var(--ink-2)' }}>
          Backend Developer &middot; Go &amp; PostgreSQL
        </p>
      </div>
    </div>
  )
}
