const TABS = [
  { id: 'fondations', label: '🏗️ Fondations' },
  { id: 'strategie', label: '📅 Stratégie' },
  { id: 'contenu', label: '✦ Contenu' },
  { id: 'publication', label: '↗ Publication' },
  { id: 'analyse', label: '📊 Analyse' },
]

export default function Tabs({ active, onChange }) {
  return (
    <nav className="tabs">
      {TABS.map(t => (
        <div
          key={t.id}
          className={`tab${active === t.id ? ' active' : ''}`}
          onClick={() => { onChange(t.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          {t.label}
        </div>
      ))}
    </nav>
  )
}
