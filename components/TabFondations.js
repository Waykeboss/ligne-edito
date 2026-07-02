import { useState, useRef } from 'react'
import { useToast } from './Toast'
import { callClaude, notionPost, getDbFondations } from '../lib/api'

export default function TabFondations({ onSwitchTab }) {
  const toast = useToast()
  const [nom, setNom] = useState('')
  const [statut, setStatut] = useState('En construction')
  const [plateforme, setPlateforme] = useState('Instagram')
  const [probleme, setProbleme] = useState('')
  const [avatar, setAvatar] = useState('')
  const [impact, setImpact] = useState('')
  const [solutions, setSolutions] = useState('')
  const [superieure, setSuperieure] = useState('')
  const [croyances, setCroyances] = useState(['', '', ''])
  const [saving, setSaving] = useState(false)

  const fieldSetters = { probleme: setProbleme, avatar: setAvatar, impact: setImpact, solutions: setSolutions, superieure: setSuperieure }

  async function suggestField(type) {
    const apiKey = localStorage.getItem('anthropic_key')
    if (!apiKey) { toast('Clé API manquante', 'error'); return }

    const prompts = {
      probleme: `Pour une offre "${nom}", génère une description précise du problème qu'elle résout (2-3 phrases, concrètes et percutantes). Réponds en JSON : {"suggestion": "..."}`,
      avatar: `Pour une offre "${nom}" qui résout "${probleme}", décris l'avatar client idéal de façon très précise (âge, poste, situation, frustrations, peurs). JSON : {"suggestion": "..."}`,
      impact: `Pour un avatar qui souffre de "${probleme}", décris l'impact concret dans sa vie professionnelle et personnelle (3-4 points). JSON : {"suggestion": "..."}`,
      solutions: `Pour une offre "${nom}", explique pourquoi les solutions traditionnelles sont inefficaces pour résoudre "${probleme}" (2-3 raisons concrètes). JSON : {"suggestion": "..."}`,
      superieure: `Pour une offre "${nom}", explique en quoi elle est supérieure aux alternatives existantes pour résoudre "${probleme}" (3-4 points forts). JSON : {"suggestion": "..."}`
    }

    toast('Génération en cours...', 'info')
    try {
      const data = await callClaude(prompts[type])
      const json = JSON.parse(data.match(/\{[\s\S]*\}/)[0])
      fieldSetters[type](json.suggestion)
      toast('✓ Suggestion générée', 'success')
    } catch (e) { toast('Erreur : ' + e.message, 'error') }
  }

  async function suggestCroyances() {
    if (!probleme) { toast("Décris d'abord le problème", 'error'); return }
    const apiKey = localStorage.getItem('anthropic_key')
    if (!apiKey) { toast('Clé API manquante', 'error'); return }

    toast('Génération des croyances...', 'info')
    const prompt = `Pour une offre "${nom}" qui résout ce problème : "${probleme}",
génère 5 croyances que l'audience doit avoir avant d'acheter (méthode Antoine BM).
Réponds en JSON uniquement : {"croyances": ["croyance1", "croyance2", "croyance3", "croyance4", "croyance5"]}`

    try {
      const data = await callClaude(prompt)
      const json = JSON.parse(data.match(/\{[\s\S]*\}/)[0])
      setCroyances(json.croyances)
      toast('✓ Croyances générées', 'success')
    } catch (e) { toast('Erreur : ' + e.message, 'error') }
  }

  async function saveFondations() {
    const token = localStorage.getItem('notion_token')
    if (!token) { toast('Token Notion manquant', 'error'); return }
    if (!nom.trim()) { toast("Ajoute le nom de l'offre", 'error'); return }

    setSaving(true)
    const croyancesText = croyances.filter(c => c.trim()).map((c, i) => `${i + 1}. ${c}`).join('\n')

    const body = {
      parent: { database_id: getDbFondations() },
      properties: {
        "Nom de l'offre": { title: [{ text: { content: nom } }] },
        'Problème principal': { rich_text: [{ text: { content: probleme } }] },
        'Avatar client': { rich_text: [{ text: { content: avatar } }] },
        "Impact dans la vie de l'avatar": { rich_text: [{ text: { content: impact } }] },
        'Solutions traditionnelles inefficaces': { rich_text: [{ text: { content: solutions } }] },
        'Pourquoi ta solution est supérieure': { rich_text: [{ text: { content: superieure } }] },
        'Croyances à construire': { rich_text: [{ text: { content: croyancesText } }] },
        'Statut offre': { select: { name: statut } },
        'Plateforme cible': { select: { name: plateforme } },
      }
    }

    try {
      await notionPost('pages', body)
      toast('✓ Fondations sauvegardées dans Notion', 'success')
      setTimeout(() => onSwitchTab('contenu'), 1200)
    } catch (e) { toast('Erreur Notion : ' + e.message, 'error') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div className="info-box">
        <strong>Étape 0 — Fondations</strong><br />
        Remplis cette fiche une seule fois par offre. Tout le contenu généré ensuite en découle. Si tu es bloqué sur une question, clique sur <strong>✦ Suggérer avec l&apos;IA</strong>.
      </div>

      <div className="section-label">L&apos;offre</div>
      <div className="field-row">
        <div className="field">
          <label>Nom de l&apos;offre / produit</label>
          <input type="text" value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex : Formation IA pour équipes comm'" />
        </div>
        <div className="field-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field">
            <label>Statut</label>
            <select value={statut} onChange={e => setStatut(e.target.value)}>
              <option>En construction</option><option>Active</option><option>En pause</option><option>Archivée</option>
            </select>
          </div>
          <div className="field">
            <label>Plateforme cible</label>
            <select value={plateforme} onChange={e => setPlateforme(e.target.value)}>
              <option>Instagram</option><option>LinkedIn</option><option>TikTok</option><option>YouTube</option><option>Multi-plateformes</option>
            </select>
          </div>
        </div>
      </div>

      <div className="section-label">Le problème d&apos;abord</div>
      <div className="field">
        <label>Quel problème précis ton offre résout-elle ?</label>
        <textarea rows={3} value={probleme} onChange={e => setProbleme(e.target.value)} placeholder="Ex : Les équipes comm' passent 15h à créer du contenu chaque semaine..." />
        <button className="ai-suggest" onClick={() => suggestField('probleme')}>✦ Suggérer avec l&apos;IA</button>
      </div>

      <div className="section-label">L&apos;avatar</div>
      <div className="field">
        <label>Qui souffre de ce problème ? (décris précisément)</label>
        <textarea rows={3} value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="Ex : Directeur comm' d'une PME..." />
        <button className="ai-suggest" onClick={() => suggestField('avatar')}>✦ Suggérer avec l&apos;IA</button>
      </div>
      <div className="field">
        <label>Quel est l&apos;impact de ce problème dans sa vie (pro + perso) ?</label>
        <textarea rows={3} value={impact} onChange={e => setImpact(e.target.value)} placeholder="Ex : Stress constant, heures sup..." />
        <button className="ai-suggest" onClick={() => suggestField('impact')}>✦ Suggérer avec l&apos;IA</button>
      </div>

      <div className="section-label">La différenciation</div>
      <div className="field">
        <label>Pourquoi les solutions traditionnelles ne fonctionnent pas ?</label>
        <textarea rows={3} value={solutions} onChange={e => setSolutions(e.target.value)} placeholder="Ex : Les agences sont trop chères..." />
        <button className="ai-suggest" onClick={() => suggestField('solutions')}>✦ Suggérer avec l&apos;IA</button>
      </div>
      <div className="field">
        <label>Pourquoi ta solution est supérieure ?</label>
        <textarea rows={3} value={superieure} onChange={e => setSuperieure(e.target.value)} placeholder="Ex : Formation sur mesure..." />
        <button className="ai-suggest" onClick={() => suggestField('superieure')}>✦ Suggérer avec l&apos;IA</button>
      </div>

      <div className="section-label">Les croyances à construire</div>
      <p style={{ fontSize: '.83rem', color: 'var(--muted)', marginBottom: 12 }}>
        Qu&apos;est-ce que ton audience doit croire avant d&apos;acheter ? (méthode Antoine BM)
      </p>
      <div className="croyances-list">
        {croyances.map((c, i) => (
          <div className="croyance-item" key={i}>
            <div className="croyance-num">{i + 1}</div>
            <input type="text" value={c} onChange={e => {
              const next = [...croyances]; next[i] = e.target.value; setCroyances(next)
            }} placeholder="Ex : Mon tapis est un danger pour ma santé..." />
          </div>
        ))}
      </div>
      <button className="add-croyance" onClick={() => setCroyances([...croyances, ''])}>+ Ajouter une croyance</button>
      <button className="ai-suggest" style={{ marginTop: 8 }} onClick={suggestCroyances}>✦ Générer les croyances avec l&apos;IA</button>

      <hr className="divider" />

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-primary" disabled={saving} onClick={saveFondations}>
          {saving ? <><div className="spinner" /> Sauvegarde...</> : '↗ Sauvegarder dans Notion'}
        </button>
        <button className="btn btn-outline" onClick={() => onSwitchTab('contenu')}>Créer du contenu →</button>
      </div>
    </div>
  )
}
