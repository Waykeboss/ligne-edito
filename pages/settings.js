import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useToast } from '../components/Toast'

const DB_FONDATIONS = '2a3805a1-0937-4d15-b6be-0cb4bac69fa9'
const DB_CALENDRIER = '774c6810-4ba9-4e95-85cb-a6b11df9d46a'

const YT_CLIENT_ID = process.env.NEXT_PUBLIC_YT_CLIENT_ID
const YT_REDIRECT = 'https://ligne-edito-next.vercel.app/settings'
const YT_SCOPE = 'https://www.googleapis.com/auth/youtube.upload'

const LI_CLIENT_ID = process.env.NEXT_PUBLIC_LI_CLIENT_ID
const LI_REDIRECT = 'https://ligne-edito-next.vercel.app/settings'
const LI_SCOPE = 'openid profile w_member_social'

const IG_APP_ID = process.env.NEXT_PUBLIC_IG_APP_ID
const IG_REDIRECT = 'https://ligne-edito-next.vercel.app/settings'
const IG_SCOPE = 'instagram_business_basic,instagram_business_content_publish'

export default function Settings() {
  const toast = useToast()
  const [anthropicKey, setAnthropicKey] = useState('')
  const [notionToken, setNotionToken] = useState('')
  const [dbFondations, setDbFondations] = useState(DB_FONDATIONS)
  const [dbCalendrier, setDbCalendrier] = useState(DB_CALENDRIER)
  const [metaToken, setMetaToken] = useState('')
  const [linkedinToken, setLinkedinToken] = useState('')
  const [igStatus, setIgStatus] = useState(false)
  const [liStatus, setLiStatus] = useState(false)
  const [ytStatus, setYtStatus] = useState(false)

  useEffect(() => {
    setAnthropicKey(localStorage.getItem('anthropic_key') || '')
    setNotionToken(localStorage.getItem('notion_token') || '')
    setDbFondations(localStorage.getItem('db_fondations') || DB_FONDATIONS)
    setDbCalendrier(localStorage.getItem('db_calendrier') || DB_CALENDRIER)
    setMetaToken(localStorage.getItem('meta_token') || '')
    setLinkedinToken(localStorage.getItem('linkedin_token') || '')
    setIgStatus(!!localStorage.getItem('meta_token'))
    setLiStatus(!!localStorage.getItem('linkedin_token'))
    setYtStatus(!!localStorage.getItem('yt_token'))

    // Handle OAuth callbacks
    if (window.location.hash.includes('access_token=')) {
      handleYouTubeCallback()
    } else if (window.location.search.includes('code=')) {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const state = params.get('state')
      window.history.replaceState({}, '', window.location.pathname)
      const savedLiState = localStorage.getItem('li_state')
      const pendingIg = localStorage.getItem('ig_pending')
      if (pendingIg === 'true') {
        handleInstagramCallback(code)
      } else if (savedLiState && state === savedLiState) {
        handleLinkedInCallback(code)
      } else if (!savedLiState) {
        handleInstagramCallback(code)
      } else {
        handleLinkedInCallback(code)
      }
    }
  }, [])

  function handleYouTubeCallback() {
    const hash = new URLSearchParams(window.location.hash.slice(1))
    const token = hash.get('access_token')
    if (!token) return
    window.history.replaceState({}, '', window.location.pathname)
    localStorage.setItem('yt_token', token)
    setYtStatus(true)
    toast('✅ YouTube connecté !', 'success')
  }

  async function handleInstagramCallback(code) {
    if (!code) return
    localStorage.removeItem('ig_pending')
    toast('Connexion Instagram en cours...', 'success')
    try {
      const resp = await fetch('/api/instagram-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirect_uri: IG_REDIRECT })
      })
      const data = await resp.json()
      if (!data.access_token) throw new Error(JSON.stringify(data))
      localStorage.setItem('meta_token', data.access_token)
      localStorage.setItem('ig_user_id', data.user_id)
      setMetaToken(data.access_token)
      setIgStatus(true)
      toast('✅ Instagram connecté !' + (data.long_lived ? ' (token valide 60 jours)' : ''), 'success')
    } catch (e) {
      toast('Erreur connexion Instagram : ' + e.message, 'error')
    }
  }

  async function handleLinkedInCallback(code) {
    if (!code) return
    toast('Connexion LinkedIn en cours...', 'success')
    try {
      const resp = await fetch('/api/linkedin-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirect_uri: LI_REDIRECT })
      })
      const data = await resp.json()
      if (data.access_token) {
        localStorage.setItem('linkedin_token', data.access_token)
        localStorage.removeItem('li_state')
        setLinkedinToken(data.access_token)
        setLiStatus(true)
        toast('✅ LinkedIn connecté !', 'success')
      } else {
        throw new Error(JSON.stringify(data))
      }
    } catch (e) {
      toast('Erreur connexion LinkedIn : ' + e.message, 'error')
    }
  }

  function connectInstagram() {
    localStorage.setItem('ig_pending', 'true')
    window.location.href = `https://www.instagram.com/oauth/authorize?client_id=${IG_APP_ID}&redirect_uri=${encodeURIComponent(IG_REDIRECT)}&response_type=code&scope=${encodeURIComponent(IG_SCOPE)}`
  }

  function connectLinkedIn() {
    const state = Math.random().toString(36).slice(2)
    localStorage.setItem('li_state', state)
    localStorage.removeItem('ig_pending')
    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LI_CLIENT_ID}&redirect_uri=${encodeURIComponent(LI_REDIRECT)}&scope=${encodeURIComponent(LI_SCOPE)}&state=${state}`
  }

  function connectYouTube() {
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?response_type=token&client_id=${YT_CLIENT_ID}&redirect_uri=${encodeURIComponent(YT_REDIRECT)}&scope=${encodeURIComponent(YT_SCOPE)}`
  }

  function saveSettings() {
    localStorage.setItem('anthropic_key', anthropicKey.trim())
    localStorage.setItem('notion_token', notionToken.trim())
    localStorage.setItem('db_fondations', dbFondations.trim())
    localStorage.setItem('db_calendrier', dbCalendrier.trim())
    localStorage.setItem('meta_token', metaToken.trim())
    if (linkedinToken.trim()) localStorage.setItem('linkedin_token', linkedinToken.trim())
    toast('✓ Configuration sauvegardée', 'success')
    setTimeout(() => { window.location.href = '/' }, 800)
  }

  return (
    <>
      <Head>
        <title>Configuration — House Lab</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" type="image/png" />
      </Head>

      <header className="header">
        <div className="logo">
          <a href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/brand/hl-icon.png" alt="House Lab" style={{ height: 32, width: 32, objectFit: 'contain' }} />
            Système Editorial IA
          </a>
        </div>
        <div className="header-right">
          <a href="/" className="btn-sm" style={{ textDecoration: 'none' }}>← Retour</a>
        </div>
      </header>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '28px 20px' }}>
        <h1 style={{ fontSize: '1.4rem', marginBottom: 6 }}>⚙️ Configuration</h1>
        <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: 28 }}>Clés stockées localement dans votre navigateur. Rien n&apos;est envoyé à un serveur.</p>

        <div className="settings-section">
          <div className="section-label">API & Notion</div>
          <div className="field"><label>Clé API Anthropic</label>
            <input type="password" value={anthropicKey} onChange={e => setAnthropicKey(e.target.value)} placeholder="sk-ant-..." />
          </div>
          <div className="field"><label>Token Notion Integration</label>
            <input type="password" value={notionToken} onChange={e => setNotionToken(e.target.value)} placeholder="secret_..." />
          </div>
          <div className="field-row">
            <div className="field"><label>ID base Fondations</label>
              <input type="text" value={dbFondations} onChange={e => setDbFondations(e.target.value)} />
            </div>
            <div className="field"><label>ID base Calendrier</label>
              <input type="text" value={dbCalendrier} onChange={e => setDbCalendrier(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-label">
            Instagram — <span style={{ color: igStatus ? '#22c55e' : 'var(--muted)', fontWeight: 400 }}>
              {igStatus ? '✅ connecté' : 'non connecté'}
            </span>
          </div>
          <button className="btn btn-outline btn-block" onClick={connectInstagram}
            style={{ marginBottom: 10, background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', border: 'none', color: '#fff' }}>
            {igStatus ? '🔄 Reconnecter Instagram' : '📸 Connecter Instagram'}
          </button>
          <div className="field"><label>Ou colle ton token Instagram manuellement</label>
            <input type="password" value={metaToken} onChange={e => setMetaToken(e.target.value)} placeholder="IGQVJx..." />
          </div>
        </div>

        <div className="settings-section">
          <div className="section-label">
            LinkedIn — <span style={{ color: liStatus ? '#22c55e' : 'var(--muted)', fontWeight: 400 }}>
              {liStatus ? '✅ connecté' : 'non connecté'}
            </span>
          </div>
          <button className="btn btn-outline btn-block" onClick={connectLinkedIn} style={{ marginBottom: 10 }}>
            {liStatus ? '🔄 Reconnecter LinkedIn' : '💼 Connecter LinkedIn'}
          </button>
          <div className="field"><label>Ou colle ton token LinkedIn manuellement</label>
            <input type="password" value={linkedinToken} onChange={e => setLinkedinToken(e.target.value)} placeholder="AQU..." />
          </div>
        </div>

        <div className="settings-section">
          <div className="section-label">
            YouTube — <span style={{ color: ytStatus ? '#22c55e' : 'var(--muted)', fontWeight: 400 }}>
              {ytStatus ? '✅ connecté' : 'non connecté'}
            </span>
          </div>
          <button className="btn btn-outline btn-block" onClick={connectYouTube}>
            {ytStatus ? '🔄 Reconnecter YouTube' : '▶️ Connecter YouTube'}
          </button>
        </div>

        <div className="info-setup" style={{ marginTop: 24 }}>
          <strong>Instagram</strong> → Cliquer &quot;Connecter Instagram&quot; → autoriser avec ton compte professionnel<br /><br />
          <strong>LinkedIn</strong> → Cliquer &quot;Connecter LinkedIn&quot; → autoriser avec ton compte<br /><br />
          <strong>YouTube</strong> → Cliquer &quot;Connecter YouTube&quot; → compte Google → autoriser<br /><br />
          <hr style={{ borderColor: 'rgba(0,0,0,.1)', margin: '12px 0' }} />
          <strong>Token Notion</strong> → <a href="https://www.notion.so/my-integrations" target="_blank" rel="noreferrer">notion.so/my-integrations</a> → Créer → copier <code>secret_...</code><br />
          Puis dans chaque base Notion → ··· → <strong>Connections</strong> → ajouter l&apos;intégration
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <a href="/" className="btn btn-outline" style={{ textDecoration: 'none', textAlign: 'center' }}>Annuler</a>
          <button className="btn btn-primary" onClick={saveSettings} style={{ flex: 1 }}>✓ Sauvegarder</button>
        </div>
      </div>
    </>
  )
}
