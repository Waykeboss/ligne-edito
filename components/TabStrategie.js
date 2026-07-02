import { useState, useEffect } from 'react'
import { useToast } from './Toast'
import { callClaude, notionPost, getDbCalendrier } from '../lib/api'

export default function TabStrategie({ offres, selectedOffre, onSelectOffre }) {
  const toast = useToast()
  const [selectedType, setSelectedType] = useState('service')
  const [selectedRythme, setSelectedRythme] = useState(5)
  const [prix, setPrix] = useState('')
  const [cta, setCta] = useState('DM')
  const [semaine, setSemaine] = useState('')
  const [planningData, setPlanningData] = useState([])
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const lundi = new Date()
    lundi.setDate(lundi.getDate() + ((1 + 7 - lundi.getDay()) % 7 || 7))
    setSemaine(lundi.toISOString().split('T')[0])
  }, [])

  function selectType(type) {
    setSelectedType(type)
    setCta(type === 'service' ? 'DM' : 'lien bio')
  }

  async function genererPlanning() {
    const apiKey = localStorage.getItem('anthropic_key')
    if (!apiKey) { toast('Clé API manquante', 'error'); return }
    if (!selectedOffre) { toast('Sélectionne une offre', 'error'); return }

    setGenerating(true)

    const prompt = `Tu es un stratège Instagram B2B expert en personal branding (inspiré de Lara Acosta et Matis Clouet).

OFFRE : "${selectedOffre.nom}"
TYPE : ${selectedType} ${prix ? `à ${prix}€` : ''}
CTA PRINCIPAL : "${cta}"
PROBLÈME : ${selectedOffre.probleme}
AVATAR : ${selectedOffre.avatar}
CROYANCES À CONSTRUIRE : ${selectedOffre.croyances}

Génère un planning de ${selectedRythme} Reels Instagram pour la semaine.
Règle : 80% valeur/éducation, 20% conversion. Jamais de vente directe sauf dernier post.
Chaque Reel doit cibler une croyance différente et avancer dans le tunnel.

Réponds en JSON UNIQUEMENT :
{
  "planning": [
    {
      "jour": "Lundi",
      "titre": "titre accrocheur du Reel (max 80 car.)",
      "objectif": "Attirer" | "Éduquer" | "Prouver" | "Convertir",
      "croyance": "croyance ciblée",
      "hook": "les 3 premières secondes du Reel (accroche orale percutante)",
      "angle": "angle marketing utilisé",
      "cta": "appel à l'action de ce Reel spécifique"
    }
  ]
}`

    try {
      const raw = await callClaude(prompt)
      const json = JSON.parse(raw.match(/\{[\s\S]*\}/)[0])
      setPlanningData(json.planning)
      toast('✓ Planning généré', 'success')
    } catch (e) { toast('Erreur : ' + e.message, 'error') }
    finally { setGenerating(false) }
  }

  async function savePlanning() {
    const token = localStorage.getItem('notion_token')
    const dbId = getDbCalendrier()
    if (!token) { toast('Token Notion manquant', 'error'); return }
    if (!planningData.length) { toast("Génère d'abord le planning", 'error'); return }

    setSaving(true)
    const dateBase = semaine ? new Date(semaine) : new Date()
    const croyancesMap = {
      'Attirer': 'Gravité du problème', 'Éduquer': 'Inefficacité solutions existantes',
      'Prouver': 'Supériorité de la méthode', 'Convertir': "Urgence d'agir"
    }

    try {
      let success = 0
      for (let i = 0; i < planningData.length; i++) {
        const p = planningData[i]
        const d = new Date(dateBase); d.setDate(d.getDate() + i)
        const dateStr = d.toISOString().split('T')[0]
        await notionPost('pages', {
          parent: { database_id: dbId },
          properties: {
            'Titre du post': { title: [{ text: { content: p.titre } }] },
            'Format': { select: { name: 'Reel' } },
            'Plateforme': { select: { name: 'Instagram' } },
            'Statut': { select: { name: 'Idée' } },
            'Croyance ciblée': { select: { name: croyancesMap[p.objectif] || 'Gravité du problème' } },
            'Accroche': { rich_text: [{ text: { content: p.hook } }] },
            'Date de publication': { date: { start: dateStr } },
          }
        })
        success++
      }
      toast(`✓ ${success} Reels ajoutés dans Notion`, 'success')
    } catch (e) { toast('Erreur Notion : ' + e.message, 'error') }
    finally { setSaving(false) }
  }

  const couleurs = { 'Attirer': 'var(--red)', 'Éduquer': 'var(--orange)', 'Prouver': 'var(--blue)', 'Convertir': 'var(--green)' }
  const dateBase = semaine ? new Date(semaine) : new Date()

  return (
    <div>
      <div className="info-box">
        <strong>Stratégie Reels Instagram</strong><br />
        Définis ton type d&apos;offre et ton rythme. Claude génère ton planning hebdomadaire avec le bon mix de Reels pour construire les croyances et vendre.
      </div>

      <div className="offre-selector" style={{ marginBottom: 24 }}>
        <label>Sur quelle offre travailles-tu ?</label>
        <select value={selectedOffre?.id || ''} onChange={e => onSelectOffre(e.target.value)} style={{ width: '100%', marginTop: 6 }}>
          <option value="">— Sélectionne une offre —</option>
          {offres.map(o => <option key={o.id} value={o.id}>{o.statut === 'Active' ? '🟢' : '🟡'} {o.nom}</option>)}
        </select>
      </div>

      <div className="section-label">Type d&apos;offre</div>
      <div className="offre-type-grid">
        <div className={`offre-type-card${selectedType === 'service' ? ' selected' : ''}`} onClick={() => selectType('service')}>
          <div className="type-icon">🤝</div>
          <h4>Service</h4>
          <p>Coaching, accompagnement, consulting, audit...</p>
        </div>
        <div className={`offre-type-card${selectedType === 'produit' ? ' selected' : ''}`} onClick={() => selectType('produit')}>
          <div className="type-icon">📦</div>
          <h4>Produit</h4>
          <p>Formation, template, outil, ressource...</p>
        </div>
      </div>

      <div className="field-row" style={{ marginBottom: 20 }}>
        <div className="field"><label>Prix de l&apos;offre (€)</label><input type="number" value={prix} onChange={e => setPrix(e.target.value)} placeholder="Ex : 2000" /></div>
        <div className="field"><label>CTA principal</label>
          <select value={cta} onChange={e => setCta(e.target.value)}>
            <option value="DM">Envoie-moi un DM</option><option value="lien bio">Lien en bio</option>
            <option value="commentaire">Commente pour recevoir</option><option value="appel">Réserve un appel</option>
          </select>
        </div>
      </div>

      <div className="section-label">Rythme de publication</div>
      <div className="rythme-grid">
        {[3, 5, 7].map(n => (
          <div key={n} className={`rythme-card${selectedRythme === n ? ' selected' : ''}`} onClick={() => setSelectedRythme(n)}>
            <div className="rythme-num">{n}</div>
            <p>Reels / semaine</p>
            <p style={{ fontSize: '.7rem', marginTop: 4, color: n === 5 ? 'var(--green)' : 'var(--border)' }}>
              {n === 3 ? 'Démarrage' : n === 5 ? 'Recommandé' : 'Intensif'}
            </p>
          </div>
        ))}
      </div>

      <div className="section-label">Semaine de départ</div>
      <div className="field" style={{ maxWidth: 220 }}>
        <label>Date du lundi</label>
        <input type="date" value={semaine} onChange={e => setSemaine(e.target.value)} />
      </div>

      <button className="btn btn-primary btn-block" disabled={generating} onClick={genererPlanning} style={{ marginBottom: 28 }}>
        {generating ? <><div className="spinner" /> Génération du planning...</> : '📅 Générer le planning de la semaine'}
      </button>

      {planningData.length > 0 && (
        <div>
          <div className="section-label">Tunnel de vente</div>
          <div className="tunnel-bar">
            {planningData.map((p, i) => <div key={i} className="tunnel-segment" style={{ background: couleurs[p.objectif] || 'var(--muted)' }} />)}
          </div>
          <div className="tunnel-legend">
            {['Attirer', 'Éduquer', 'Prouver', 'Convertir'].map(o => (
              <div key={o} className="tunnel-legend-item"><div className="legend-dot" style={{ background: couleurs[o] }} /> {o}</div>
            ))}
          </div>

          <div className="section-label">Planning de la semaine</div>
          <div className="planning-grid">
            {planningData.map((p, i) => {
              const d = new Date(dateBase); d.setDate(d.getDate() + i)
              const couleur = couleurs[p.objectif] || 'var(--muted)'
              return (
                <div className="planning-card" key={i}>
                  <div className="planning-day">
                    <div className="day-name">{(p.jour || '').substring(0, 3).toUpperCase()}</div>
                    <div className="day-num" style={{ color: couleur }}>{d.getDate()}</div>
                  </div>
                  <div className="planning-content">
                    <h4>{p.titre}</h4>
                    <p>🎯 <strong>{p.croyance}</strong></p>
                    <p>🎬 Hook : <em>&quot;{p.hook}&quot;</em></p>
                    <p>📣 CTA : {p.cta}</p>
                  </div>
                  <div className="planning-badge">
                    <span className="badge" style={{ background: couleur + '22', color: couleur }}>{p.objectif}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <button className="btn btn-green btn-block" disabled={saving} onClick={savePlanning}>
            {saving ? <><div className="spinner" /> Envoi dans Notion...</> : '↗ Envoyer tout dans Notion'}
          </button>
        </div>
      )}
    </div>
  )
}
