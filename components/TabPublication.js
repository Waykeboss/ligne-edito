import { useState, useEffect, useRef } from 'react'
import { useToast } from './Toast'
import { notionPatch } from '../lib/api'

export default function TabPublication({ publicationData }) {
  const toast = useToast()
  const [titre, setTitre] = useState('')
  const [pageId, setPageId] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [previewSrc, setPreviewSrc] = useState('')
  const [date, setDate] = useState('')
  const [plateforme, setPlateforme] = useState('Instagram')
  const [statut, setStatut] = useState('Média reçu')
  const [publishing, setPublishing] = useState('')
  const ytFileRef = useRef(null)

  useEffect(() => {
    if (publicationData) {
      setTitre(publicationData.titre || '')
      setPageId(publicationData.pageId || '')
      setMediaUrl(publicationData.mediaUrl || '')
      setDate(publicationData.date || '')
      setPlateforme(publicationData.plateforme || 'Instagram')
      if (publicationData.mediaUrl) setPreviewSrc(publicationData.mediaUrl)
    } else {
      const d = new Date(); d.setDate(d.getDate() + 3)
      setDate(d.toISOString().split('T')[0])
    }
  }, [publicationData])

  function handleFile(file) {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = e => setPreviewSrc(e.target.result)
      reader.readAsDataURL(file)
    }
    toast("Média chargé — ajoute l'URL hébergée pour Notion", 'info')
  }

  async function publishNotion() {
    const token = localStorage.getItem('notion_token')
    if (!token) { toast('Token Notion manquant', 'error'); return }
    if (!pageId.trim()) { toast("Colle l'ID de la page Notion", 'error'); return }

    setPublishing('notion')
    const id = pageId.trim().replace(/-/g, '')
    const props = {
      'Statut': { select: { name: statut } },
      'Plateforme': { select: { name: plateforme } },
    }
    if (date) props['Date de publication'] = { date: { start: date } }
    if (mediaUrl) props['Lien média'] = { url: mediaUrl }
    const body = { properties: props }
    if (mediaUrl) body.cover = { type: 'external', external: { url: mediaUrl } }

    try {
      await notionPatch('pages/' + id, body)
      toast('✓ Post mis à jour dans Notion', 'success')
    } catch (e) { toast('Erreur Notion : ' + e.message, 'error') }
    finally { setPublishing('') }
  }

  async function publishInstagram() {
    const metaToken = localStorage.getItem('meta_token')
    if (!metaToken) { toast('Token Meta manquant — configure dans ⚙️', 'error'); return }
    if (!mediaUrl.trim()) { toast('URL du média requise (Drive, Dropbox...)', 'error'); return }

    let caption = ''
    if (publicationData) {
      caption = (publicationData.accroche || '') + (publicationData.corps ? '\n\n' + publicationData.corps : '')
    }
    if (!caption) caption = 'Post publié via Système Editorial IA'
    const notionId = pageId.trim().replace(/-/g, '')

    setPublishing('instagram')
    try {
      let igId = null
      const igMeResp = await fetch(`https://graph.instagram.com/v19.0/me?fields=id,username&access_token=${metaToken}`)
      const igMeData = await igMeResp.json()

      if (!igMeData.error) {
        igId = igMeData.id
      } else {
        const fbMeResp = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=id,name,instagram_business_account&access_token=${metaToken}`)
        const fbMeData = await fbMeResp.json()
        const pageWithIg = fbMeData.data?.find(p => p.instagram_business_account)
        if (pageWithIg) igId = pageWithIg.instagram_business_account.id
        else throw new Error('Token invalide ou sans accès Instagram.')
      }

      const apiBase = 'https://graph.instagram.com/v19.0'
      const containerResp = await fetch('/api/proxy', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: `${apiBase}/${igId}/media`, method: 'POST', headers: { 'Content-Type': 'application/json' }, body: { image_url: mediaUrl, caption, access_token: metaToken } })
      })
      const containerData = await containerResp.json()
      if (containerData.error) throw new Error('Erreur média : ' + containerData.error.message)

      await new Promise(r => setTimeout(r, 2000))
      const publishResp = await fetch('/api/proxy', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: `${apiBase}/${igId}/media_publish`, method: 'POST', headers: { 'Content-Type': 'application/json' }, body: { creation_id: containerData.id, access_token: metaToken } })
      })
      const publishData = await publishResp.json()
      if (publishData.error) throw new Error('Erreur publication : ' + publishData.error.message)

      if (notionId) {
        await notionPatch('pages/' + notionId, { properties: { 'Statut': { select: { name: 'Publié' } } } })
      }
      toast('✅ Publié sur Instagram !', 'success')
    } catch (e) { toast('Erreur : ' + e.message, 'error') }
    finally { setPublishing('') }
  }

  async function publishLinkedIn() {
    const token = localStorage.getItem('linkedin_token')
    if (!token) { toast('LinkedIn non connecté — ouvre ⚙️ Config', 'error'); return }

    let caption = ''
    if (publicationData) {
      caption = (publicationData.accroche || '') + (publicationData.corps ? '\n\n' + publicationData.corps : '')
    }
    if (!caption) caption = 'Post publié via Système Editorial IA'
    const notionId = pageId.trim().replace(/-/g, '')

    setPublishing('linkedin')
    try {
      const meResp = await fetch('/api/proxy', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://api.linkedin.com/v2/userinfo', method: 'GET', headers: { Authorization: `Bearer ${token}` } })
      })
      const meData = await meResp.json()
      if (!meData.sub) throw new Error('Token LinkedIn invalide. Reconnecte-toi dans ⚙️ Config.')
      const urn = `urn:li:person:${meData.sub}`

      const shareBody = {
        author: urn, lifecycleState: 'PUBLISHED',
        specificContent: { 'com.linkedin.ugc.ShareContent': { shareCommentary: { text: caption }, shareMediaCategory: 'NONE' } },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
      }

      const postResp = await fetch('/api/proxy', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://api.linkedin.com/v2/ugcPosts', method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: shareBody })
      })
      const postData = await postResp.json()
      if (postData.status >= 400 || postData.message) throw new Error(postData.message || JSON.stringify(postData))

      if (notionId) {
        await notionPatch('pages/' + notionId, { properties: { 'Statut': { select: { name: 'Publié' } } } })
      }
      toast('✅ Publié sur LinkedIn !', 'success')
    } catch (e) { toast('Erreur LinkedIn : ' + e.message, 'error') }
    finally { setPublishing('') }
  }

  async function publishYouTube() {
    const token = localStorage.getItem('yt_token')
    if (!token) { toast('YouTube non connecté — ouvre ⚙️ Config', 'error'); return }
    ytFileRef.current?.click()
  }

  async function handleYTFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const token = localStorage.getItem('yt_token')
    const title = titre || 'Ma vidéo — The House Lab'
    const description = publicationData ? (publicationData.accroche || '') + (publicationData.corps ? '\n\n' + publicationData.corps : '') : ''
    const notionId = pageId.trim().replace(/-/g, '')

    setPublishing('youtube')
    try {
      const initResp = await fetch(
        'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Upload-Content-Type': file.type, 'X-Upload-Content-Length': file.size },
          body: JSON.stringify({ snippet: { title, description, tags: ['TheHouseLab', 'editorial', 'IA'], categoryId: '22' }, status: { privacyStatus: 'public' } })
        }
      )
      if (initResp.status === 401) { toast('Token YouTube expiré — reconnecte-toi dans ⚙️ Config', 'error'); setPublishing(''); return }
      const uploadUrl = initResp.headers.get('Location')
      if (!uploadUrl) throw new Error("Impossible d'obtenir l'URL d'upload YouTube")

      toast(`Upload en cours... (${Math.round(file.size / 1024 / 1024)} Mo)`, 'success')
      const uploadResp = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type, 'Content-Length': file.size }, body: file })
      const uploadData = await uploadResp.json()
      if (!uploadData.id) throw new Error('Erreur upload : ' + JSON.stringify(uploadData))

      if (notionId) {
        await notionPatch('pages/' + notionId, { properties: { 'Statut': { select: { name: 'Publié' } } } })
      }
      toast('✅ Publié sur YouTube ! ID : ' + uploadData.id, 'success')
    } catch (e) { toast('Erreur YouTube : ' + e.message, 'error') }
    finally { setPublishing(''); e.target.value = '' }
  }

  return (
    <div>
      <div className="info-box">
        <strong>Étape finale</strong> — Le contenu texte est dans Notion. Tu as créé le média dans FLORA. Il ne reste qu&apos;à assembler et programmer la publication.
      </div>

      <div className="pipeline">
        <div className="pipeline-step done"><span className="step-icon">✓</span>Fondations</div>
        <div className="pipeline-step done"><span className="step-icon">✓</span>Contenu texte</div>
        <div className="pipeline-step active"><span className="step-icon">🌸</span>Média FLORA</div>
        <div className="pipeline-step"><span className="step-icon">📅</span>Programmé</div>
        <div className="pipeline-step"><span className="step-icon">✅</span>Publié</div>
      </div>

      <div className="section-label">Le post</div>
      <div className="field-row">
        <div className="field"><label>Titre du post</label><input type="text" value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre..." /></div>
        <div className="field"><label>ID de la page Notion (optionnel)</label><input type="text" value={pageId} onChange={e => setPageId(e.target.value)} placeholder="Coller l'ID..." /></div>
      </div>

      <div className="section-label">Le média (créé dans FLORA)</div>
      {previewSrc && <img className="preview-img show" src={previewSrc} alt="" />}
      <div className="drop-zone"
        onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('dragover') }}
        onDragLeave={e => e.currentTarget.classList.remove('dragover')}
        onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('dragover'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
      >
        <input type="file" accept="image/*,video/*" onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]) }}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
        <div style={{ fontSize: '2rem' }}>🎬</div>
        <p>Glisse ton Reel / image / carrousel ici<br /><span style={{ fontSize: '.75rem', color: 'var(--border)' }}>ou clique pour choisir — MP4, PNG, JPG, WEBP</span></p>
      </div>
      <div className="field" style={{ marginTop: 10 }}>
        <label>Ou URL du média hébergé (Drive, Dropbox…)</label>
        <input type="url" value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="https://..." />
      </div>

      <div className="section-label">Programmation</div>
      <div className="field-row-3">
        <div className="field"><label>Date de publication</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
        <div className="field"><label>Plateforme</label>
          <select value={plateforme} onChange={e => setPlateforme(e.target.value)}>
            <option>Instagram</option><option>LinkedIn</option><option>TikTok</option><option>YouTube</option>
          </select>
        </div>
        <div className="field"><label>Nouveau statut</label>
          <select value={statut} onChange={e => setStatut(e.target.value)}>
            <option>Média reçu</option><option>Prêt à publier</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginTop: 8 }}>
        <button className="btn btn-outline btn-block" disabled={!!publishing} onClick={publishNotion}>
          {publishing === 'notion' ? <div className="spinner" /> : '↗ Notion'}
        </button>
        <button className="btn btn-primary btn-block" disabled={!!publishing} onClick={publishInstagram}
          style={{ background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', border: 'none' }}>
          {publishing === 'instagram' ? <div className="spinner" /> : '📸 Instagram'}
        </button>
        <button className="btn btn-primary btn-block" disabled={!!publishing} onClick={publishLinkedIn}
          style={{ background: '#0077b5', border: 'none' }}>
          {publishing === 'linkedin' ? <div className="spinner" /> : '💼 LinkedIn'}
        </button>
        <button className="btn btn-primary btn-block" disabled={!!publishing} onClick={publishYouTube}
          style={{ background: '#ff0000', border: 'none' }}>
          {publishing === 'youtube' ? <div className="spinner" /> : '▶️ YouTube'}
        </button>
      </div>
      <input type="file" ref={ytFileRef} accept="video/*" style={{ display: 'none' }} onChange={handleYTFile} />
    </div>
  )
}
