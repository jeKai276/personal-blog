import Link from 'next/link'

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group" aria-label="Home">
      <span
        className="relative grid place-items-center w-8 h-8 rounded-full overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 30% 30%, var(--accent) 0%, var(--accent-strong) 90%)',
          boxShadow: '0 0 0 1px var(--line) inset',
        }}
      >
        <span className="block w-2 h-2 rounded-full" style={{ background: 'var(--paper-2)', opacity: 0.9 }} />
      </span>
      <span className="font-serif text-[18px] tracking-tight leading-none" style={{ color: 'var(--ink)' }}>
        just<span style={{ fontFamily: 'Caveat, cursive', color: 'var(--accent-strong)' }}>.</span>kai
      </span>
    </Link>
  )
}

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--line)' }}>
      <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-12 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
            kept since 2026 · hanoi
          </span>
        </div>
        <div
          className="font-mono text-[11.5px] tracking-[0.18em] uppercase"
          style={{ color: 'var(--accent-strong)' }}
        >
          work fast &mdash; live slow
        </div>
        <div className="flex items-center gap-5 text-[13px]" style={{ color: 'var(--muted)' }}>
          <a href="#" className="hover:underline">RSS</a>
          <a href="mailto:yendp27@gmail.com" className="hover:underline">Email</a>
          <a href="https://github.com/yendp" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
        </div>
      </div>
    </footer>
  )
}
