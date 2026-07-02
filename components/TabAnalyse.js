import { useState, useEffect } from 'react'
import { useToast } from './Toast'
import { loadAllPosts, loadInstagramStats, computeStats } from '../lib/analytics'
import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with recharts
const Charts = dynamic(() => import('./AnalyseCharts'), { ssr: false })

export default function TabAnalyse() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState(null)
  const [igStats, setIgStats] = useState(null)
  const [recentPosts, setRecentPosts] = useState([])

  useEffect(() => {
    refresh()
  }, [])

  async function refresh() {
    setLoading(true)
    try {
      const data = await loadAllPosts()
      setPosts(data)
      setStats(computeStats(data))

      // 5 derniers posts
      const sorted = [...data].filter(p => p.date).sort((a, b) => b.date.localeCompare(a.date))
      setRecentPosts(sorted.slice(0, 8))

      // Instagram stats
      const ig = await loadInstagramStats()
      setIgStats(ig)

      toast(`${data.length} fiches analysées`, 'success')
    } catch (e) {
      toast('Erreur chargement : ' + e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 16px', borderWidth: 3 }} />
        <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>Chargement des données...</p>
      </div>
    )
  }

  if (!stats || stats.total === 0) {
    return (
      <div>
        <div className="info-box">
          <strong>Analyse</strong> — Aucune donnée trouvée dans ton calendrier Notion.
          Commence par générer du contenu dans les onglets précédents.
        </div>
        <button className="btn btn-outline" onClick={refresh}>↺ Rafraîchir</button>
      </div>
    )
  }

  const statutColors = {
    'Idée': 'var(--orange)',
    'En rédaction': 'var(--blue)',
    'Brief FLORA envoyé': '#8b5cf6',
    'Média reçu': '#06b6d4',
    'Prêt à publier': '#f59e0b',
    'Publié': 'var(--green)',
    'Programmé': '#6366f1',
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>📊 Tableau de bord</h2>
          <p style={{ color: 'var(--muted)', fontSize: '.83rem' }}>Vue d&apos;ensemble de ton système éditorial</p>
        </div>
        <button className="btn-sm" onClick={refresh}>↺ Actualiser</button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        <KpiCard label="Total fiches" value={stats.total} color="var(--text)" />
        <KpiCard label="Publiés" value={stats.publies} color="var(--green)" />
        <KpiCard label="En cours" value={stats.enCours} color="var(--orange)" />
        <KpiCard label="Taux complétion" value={`${stats.tauxCompletion}%`} color="var(--blue)" />
      </div>

      {/* Instagram KPIs */}
      {igStats && (
        <>
          <div className="section-label">Instagram — @{igStats.username}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
            <KpiCard label="Followers" value={igStats.followersCount.toLocaleString()} color="#E1306C" />
            <KpiCard label="Publications" value={igStats.mediaCount} color="#833ab4" />
            <KpiCard
              label="Engagement moyen"
              value={igStats.recentMedia.length > 0
                ? Math.round(igStats.recentMedia.reduce((s, m) => s + m.likes + m.comments, 0) / igStats.recentMedia.length)
                : 0}
              color="#fcb045"
            />
          </div>
        </>
      )}

      {/* Charts */}
      <Charts stats={stats} igStats={igStats} />

      {/* Recent posts timeline */}
      <div className="section-label" style={{ marginTop: 28 }}>Dernières fiches</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {recentPosts.map(p => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
            background: '#fff', border: '1px solid var(--border)', borderRadius: 8
          }}>
            <div style={{ fontSize: '.75rem', color: 'var(--muted)', minWidth: 80 }}>{p.date}</div>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: statutColors[p.statut] || 'var(--muted)'
            }} />
            <div style={{ flex: 1, fontSize: '.85rem', fontWeight: 500 }}>{p.titre}</div>
            <span className="badge" style={{
              background: (statutColors[p.statut] || 'var(--muted)') + '18',
              color: statutColors[p.statut] || 'var(--muted)',
              fontSize: '.7rem'
            }}>{p.statut}</span>
            <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{p.plateforme}</span>
          </div>
        ))}
      </div>

      {/* Instagram recent media */}
      {igStats?.recentMedia?.length > 0 && (
        <>
          <div className="section-label" style={{ marginTop: 28 }}>Dernières publications Instagram</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {igStats.recentMedia.slice(0, 6).map(m => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                background: '#fff', border: '1px solid var(--border)', borderRadius: 8
              }}>
                <div style={{ fontSize: '.75rem', color: 'var(--muted)', minWidth: 80 }}>
                  {new Date(m.timestamp).toLocaleDateString('fr-FR')}
                </div>
                <div style={{ flex: 1, fontSize: '.83rem' }}>{m.caption || '(sans légende)'}</div>
                <span style={{ fontSize: '.8rem', color: '#E1306C' }}>❤️ {m.likes}</span>
                <span style={{ fontSize: '.8rem', color: 'var(--blue)' }}>💬 {m.comments}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function KpiCard({ label, value, color }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)', borderRadius: 10,
      padding: '16px 14px', textAlign: 'center'
    }}>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 600 }}>{label}</div>
    </div>
  )
}
