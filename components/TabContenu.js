import { useState, useEffect } from 'react'
import { useToast } from './Toast'
import { callClaude, notionPost, notionPatch, getDbCalendrier, loadFichesFromNotion } from '../lib/api'

export default function TabContenu({ offres, selectedOffre, onSelectOffre, onSwitchTab, ficheSelectionnee, setFicheSelectionnee, setPublicationData }) {
  const toast = useToast()
  const [fiches, setFiches] = useState([])
  const [croyance, setCroyance] = useState('')
  const [format, setFormat] = useState('Reel')
  const [plateforme, setPlateforme] = useState('Instagram')
  const [idee, setIdee] = useState('')
  const [contexte, setContexte] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)

  // Results
  const [generatedData, setGeneratedData] = useState(null)
  const [selectedHook, setSelectedHook] = useState(null)
  const [corps, setCorps] = useState('')
  const [flora, setFlora] = useState('')
  const [brief, setBrief] = useState('')
  const [titre, setTitre] = useState('')
  const [date, setDate] = useState('')
  const [statut, setStatut] = useState('Idée')

  useEffect(() => {
    const d = new Date(); d.setDate(d.getDate() + 3)
    setDate(d.toISOString().split('T')[0])
    refreshFiches()
  }, [])

  async function refreshFiches() {
    try {
      const f = await loadFichesFromNotion()
      setFiches(f)
    } catch (e) { /* silent */ }
  }

  function chargerFiche(id) {
    if (!id) { setFicheSelectionnee(null); return }
    const fiche = fiches.find(f => f.id === id)
    if (!fiche) return
    setFicheSelectionnee(fiche)
    setFormat(fiche.format)
    setPlateforme(fiche.plateforme)
    if (fiche.croyance) setCroyance(fiche.croyance)
    if (fiche.accroche) setIdee(fiche.accroche)
    if (fiche.date) setDate(fiche.date)
    setTitre(fiche.titre)
    toast(`Fiche "${fiche.titre}" chargée`, 'success')
  }

  async function generateContenu() {
    const apiKey = localStorage.getItem('anthropic_key')
    if (!apiKey) { toast('Clé API Anthropic manquante', 'error'); return }
    if (!selectedOffre) { toast('Sélectionne une offre dans le menu déroulant', 'error'); return }

    setGenerating(true)

    const croyanceInstr = croyance
      ? `La croyance à construire dans ce post est : "${croyance}".`
      : "Choisis la croyance la plus pertinente à construire parmi : Gravité du problème / Inefficacité solutions existantes / Supériorité de la méthode / Légitimité du formateur / Urgence d'agir. Indique-la dans 'croyance'."

    const fondationsContext = `
FONDATIONS DE L'OFFRE :
- Problème : ${selectedOffre.probleme}
- Avatar : ${selectedOffre.avatar}
- Impact : ${selectedOffre.impact}
- Solutions inefficaces : ${selectedOffre.solutions}
- Pourquoi supérieure : ${selectedOffre.superieure}
- Croyances à construire : ${selectedOffre.croyances}
`

    const prompt = `Tu es un expert en personal branding B2B et content marketing.

⚠️ PARAMÈTRES DU POST (priorité absolue) :
- Plateforme : ${plateforme} (adapte le ton, la longueur et les codes de CETTE plateforme uniquement)
- Format : ${format}
${idee ? `- Angle / idée : ${idee}` : ''}
${contexte ? `- Contexte : ${contexte}` : ''}

OFFRE TRAVAILLÉE : "${selectedOffre.nom}"
${fondationsContext}
${croyanceInstr}

Génère une réponse JSON UNIQUEMENT :
{
  "croyance": "croyance ciblée",
  "titre": "titre accrocheur du post (max 80 caractères)",
  "accroches": [
    "Accroche 1 — percutante, hook fort, 2-3 lignes, finit par un emoji + invitation à lire",
    "Accroche 2 — angle factuel/chiffré",
    "Accroche 3 — angle personnel/vulnérable"
  ],
  "corps": "Corps complet 300-400 mots. Structuré, émojis pertinents, CTA fort en fin. Basé sur la méthode Antoine BM : éduquer sur la croyance, ne pas vendre le produit directement.",
  "script_flora": "${format === 'Reel' ? 'Script vidéo complet : hook 3 secondes percutant, développement (30-45 sec), CTA final. Indiquer les pauses, le ton, les gestes clés.' : 'Brief de création pour FLORA : éléments visuels, textes à intégrer, structure des slides (si carrousel), ambiance.'}",
  "brief_visuel": "Instructions générales de mise en scène et d'ambiance visuelle pour ce format ${format}."
}`

    try {
      const raw = await callClaude(prompt)
      const json = JSON.parse(raw.match(/\{[\s\S]*\}/)[0])
      setGeneratedData(json)
      setSelectedHook(null)
      setCorps(json.corps || '')
      setFlora(json.script_flora || '')
      setBrief(json.brief_visuel || '')
      setTitre(json.titre || '')
      toast('✦ Contenu généré', 'success')
    } catch (e) { toast('Erreur : ' + e.message, 'error') }
    finally { setGenerating(false) }
  }

  async function saveContenu() {
    const token = localStorage.getItem('notion_token')
    const dbId = getDbCalendrier()
    if (!token) { toast('Token Notion manquant', 'error'); return }
    if (!generatedData) { toast("Génère d'abord le contenu", 'error'); return }
    if (!titre.trim()) { toast('Ajoute un titre', 'error'); return }

    const accroche = selectedHook !== null
      ? (generatedData.accroches[selectedHook] || '')
      : (generatedData.accroches[0] || '')

    setSaving(true)

    const props = {
      'Titre du post': { title: [{ text: { content: titre } }] },
      'Accroche': { rich_text: [{ text: { content: accroche } }] },
      'Corps du post': { rich_text: [{ text: { content: corps.substring(0, 2000) } }] },
      'Script FLORA': { rich_text: [{ text: { content: flora.substring(0, 2000) } }] },
      'Brief visuel': { rich_text: [{ text: { content: brief } }] },
      'Format': { select: { name: format } },
      'Plateforme': { select: { name: plateforme } },
      'Statut': { select: { name: statut } },
    }

    const croyanceVal = croyance || generatedData.croyance
    if (croyanceVal) props['Croyance ciblée'] = { select: { name: croyanceVal } }
    if (date) props['Date de publication'] = { date: { start: date } }

    try {
      let page
      if (ficheSelectionnee) {
        page = await notionPatch('pages/' + ficheSelectionnee.id.replace(/-/g, ''), { properties: props })
        toast('✓ Fiche mise à jour dans Notion', 'success')
      } else {
        page = await notionPost('pages', { parent: { database_id: dbId }, properties: props })
        toast('✓ Contenu enregistré dans Notion', 'success')
      }
      setPublicationData({
        pageId: ficheSelectionnee?.id || page?.id || '',
        titre,
        accroche,
        corps,
        mediaUrl: ficheSelectionnee?.lienMedia || '',
        date,
        plateforme,
      })
      setFicheSelectionnee(null)
      setTimeout(() => onSwitchTab('publication'), 1200)
    } catch (e) { toast('Erreur Notion : ' + e.message, 'error') }
    finally { setSaving(false) }
  }

  function copyText(text) {
    navigator.clipboard.writeText(text).then(() => toast('Copié !', 'success'))
  }

  return (
    <div>
      {/* Charger fiche existante */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h4>📋 Charger une fiche depuis Notion</h4>
          <button className="btn-sm" onClick={refreshFiches}>↺ Rafraîchir</button>
        </div>
        <div className="card-body" style={{ padding: 12 }}>
          <select onChange={e => chargerFiche(e.target.value)} style={{ flex: 1 }}>
            <option value="">— Sélectionne un Reel à compléter —</option>
            {fiches.map(f => <option key={f.id} value={f.id}>🎬 {f.date ? f.date + ' — ' : ''}{f.titre}</option>)}
          </select>
          {ficheSelectionnee && (
            <div style={{ marginTop: 10, background: 'var(--surface2)', borderRadius: 8, padding: 10, fontSize: '.81rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text)' }}>🎬 {ficheSelectionnee.titre}</strong><br />
              📅 Date : {ficheSelectionnee.date || 'non définie'} | 🎯 Croyance : {ficheSelectionnee.croyance || 'à définir'}<br />
              🎬 Hook : <em>{ficheSelectionnee.accroche || 'à générer'}</em><br />
              <span style={{ color: 'var(--green)', fontSize: '.75rem' }}>✓ Fiche chargée — clique sur Générer le contenu</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>ou remplis manuellement</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {/* Sélecteur offre */}
      <div className="offre-selector">
        <label>Sur quelle offre travailles-tu ?</label>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={selectedOffre?.id || ''} onChange={e => onSelectOffre(e.target.value)} style={{ flex: 1 }}>
            <option value="">— Sélectionne une offre —</option>
            {offres.map(o => <option key={o.id} value={o.id}>{o.statut === 'Active' ? '🟢' : '🟡'} {o.nom}</option>)}
          </select>
          <button className="btn-sm" onClick={() => onSwitchTab('fondations')}>+ Nouvelle</button>
        </div>
        {selectedOffre && (
          <div style={{ marginTop: 12, background: 'var(--surface2)', borderRadius: 8, padding: 12, fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text)' }}>{selectedOffre.nom}</strong><br />
            <span style={{ color: 'var(--blue)' }}>Problème :</span> {selectedOffre.probleme.substring(0, 120)}...<br />
            <span style={{ color: 'var(--blue)' }}>Avatar :</span> {selectedOffre.avatar.substring(0, 100)}...
          </div>
        )}
      </div>

      <div className="field-row-3">
        <div className="field"><label>Croyance à cibler</label>
          <select value={croyance} onChange={e => setCroyance(e.target.value)}>
            <option value="">✦ Suggérer par l&apos;IA</option>
            <option>Gravité du problème</option><option>Inefficacité solutions existantes</option>
            <option>Supériorité de la méthode</option><option>Légitimité du formateur</option><option>Urgence d&apos;agir</option>
          </select>
        </div>
        <div className="field"><label>Format</label>
          <select value={format} onChange={e => setFormat(e.target.value)}>
            <option>Reel</option><option>Carrousel</option><option>Story</option><option>Photo</option>
          </select>
        </div>
        <div className="field"><label>Plateforme</label>
          <select value={plateforme} onChange={e => setPlateforme(e.target.value)}>
            <option>Instagram</option><option>LinkedIn</option><option>TikTok</option><option>YouTube</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label>Idée / angle du post (optionnel)</label>
        <textarea rows={2} value={idee} onChange={e => setIdee(e.target.value)} placeholder="Ex : Montrer que passer 3h sur un post LinkedIn sans méthode IA est contre-productif..." />
      </div>
      <div className="field">
        <label>Contexte additionnel</label>
        <textarea rows={2} value={contexte} onChange={e => setContexte(e.target.value)} placeholder="Ex : Ciblé DRH, ton expert mais accessible..." />
      </div>

      <button className="btn btn-primary btn-block" disabled={generating} onClick={generateContenu} style={{ marginBottom: 24 }}>
        {generating ? <><div className="spinner" /> Génération en cours...</> : '✦ Générer le contenu'}
      </button>

      {/* Résultats */}
      {generatedData && (
        <div>
          <div className="section-label">Choisissez votre accroche</div>
          <div className="hooks-grid">
            {(generatedData.accroches || []).map((h, i) => (
              <div key={i} className={`hook-card${selectedHook === i ? ' selected' : ''}`} onClick={() => setSelectedHook(i)}>
                <div className="hook-num">Option {i + 1}</div>
                <p>{h}</p>
                <div className="hook-check">✓</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header"><h4>Corps du post</h4><button className="copy-btn" onClick={() => copyText(corps)}>Copier</button></div>
            <div className="card-body"><textarea rows={8} value={corps} onChange={e => setCorps(e.target.value)} /></div>
          </div>

          <div className="card">
            <div className="card-header">
              <h4>🌸 Script / Brief FLORA</h4>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge badge-purple">{format}</span>
                <button className="copy-btn" onClick={() => copyText(flora)}>Copier</button>
              </div>
            </div>
            <div className="card-body"><textarea rows={5} value={flora} onChange={e => setFlora(e.target.value)} /></div>
          </div>

          <div className="card">
            <div className="card-header"><h4>Brief visuel</h4><button className="copy-btn" onClick={() => copyText(brief)}>Copier</button></div>
            <div className="card-body"><textarea rows={3} value={brief} onChange={e => setBrief(e.target.value)} /></div>
          </div>

          <hr className="divider" />

          <div className="field"><label>Titre de la fiche (pour Notion)</label>
            <input type="text" value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre du post..." />
          </div>
          <div className="field-row">
            <div className="field"><label>Date de publication</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
            <div className="field"><label>Statut</label>
              <select value={statut} onChange={e => setStatut(e.target.value)}>
                <option>Idée</option><option>En rédaction</option><option>Brief FLORA envoyé</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-green" disabled={saving} onClick={saveContenu}>
              {saving ? <><div className="spinner" /> Enregistrement...</> : '↗ Enregistrer dans Notion'}
            </button>
            <button className="btn btn-outline" onClick={() => onSwitchTab('publication')}>Ajouter le média →</button>
          </div>
        </div>
      )}
    </div>
  )
}
