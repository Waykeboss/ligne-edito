export default function Header() {
  return (
    <header className="header">
      <div className="logo">
        <a href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/brand/hl-icon.png" alt="House Lab" style={{ height: 32, width: 32, objectFit: 'contain' }} />
          Système Editorial IA
        </a>
      </div>
      <div className="header-right">
        <a href="/settings" className="btn-sm" style={{ textDecoration: 'none' }}>⚙️ Config</a>
      </div>
    </header>
  )
}
