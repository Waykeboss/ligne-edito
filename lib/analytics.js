import { getDbCalendrier, getDbFondations } from './api'

export async function loadAllPosts() {
  const token = localStorage.getItem('notion_token')
  const dbId = getDbCalendrier()
  if (!token) return []

  let allResults = []
  let hasMore = true
  let startCursor = undefined

  while (hasMore) {
    const body = {
      sorts: [{ property: 'Date de publication', direction: 'descending' }],
      page_size: 100,
    }
    if (startCursor) body.start_cursor = startCursor

    const resp = await fetch('/api/notion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: `databases/${dbId}/query`, method: 'POST', body, token })
    })
    if (!resp.ok) throw new Error('Erreur Notion')
    const data = await resp.json()
    allResults = allResults.concat(data.results)
    hasMore = data.has_more
    startCursor = data.next_cursor
  }

  return allResults.map(p => ({
    id: p.id,
    titre: p.properties['Titre du post']?.title?.[0]?.plain_text || 'Sans titre',
    format: p.properties['Format']?.select?.name || 'Reel',
    plateforme: p.properties['Plateforme']?.select?.name || 'Instagram',
    statut: p.properties['Statut']?.select?.name || 'Idée',
    croyance: p.properties['Croyance ciblée']?.select?.name || '',
    date: p.properties['Date de publication']?.date?.start || '',
    createdAt: p.created_time,
  }))
}

export async function loadInstagramStats() {
  const token = localStorage.getItem('meta_token')
  if (!token) return null

  try {
    // Get user info
    const meResp = await fetch(`https://graph.instagram.com/v19.0/me?fields=id,username,media_count,followers_count&access_token=${token}`)
    const me = await meResp.json()
    if (me.error) return null

    // Get recent media with insights
    const mediaResp = await fetch(`https://graph.instagram.com/v19.0/me/media?fields=id,caption,timestamp,like_count,comments_count,media_type&limit=25&access_token=${token}`)
    const media = await mediaResp.json()

    return {
      username: me.username,
      mediaCount: me.media_count || 0,
      followersCount: me.followers_count || 0,
      recentMedia: (media.data || []).map(m => ({
        id: m.id,
        caption: (m.caption || '').substring(0, 60),
        timestamp: m.timestamp,
        likes: m.like_count || 0,
        comments: m.comments_count || 0,
        type: m.media_type,
      }))
    }
  } catch (e) {
    console.error('Instagram stats error:', e)
    return null
  }
}

export function computeStats(posts) {
  const byStatut = {}
  const byPlateforme = {}
  const byCroyance = {}
  const byFormat = {}
  const byWeek = {}
  const byMonth = {}

  posts.forEach(p => {
    byStatut[p.statut] = (byStatut[p.statut] || 0) + 1
    byPlateforme[p.plateforme] = (byPlateforme[p.plateforme] || 0) + 1
    if (p.croyance) byCroyance[p.croyance] = (byCroyance[p.croyance] || 0) + 1
    byFormat[p.format] = (byFormat[p.format] || 0) + 1

    if (p.date) {
      const d = new Date(p.date)
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      byMonth[monthKey] = (byMonth[monthKey] || 0) + 1

      // ISO week
      const day = d.getDay() || 7
      const thursday = new Date(d)
      thursday.setDate(d.getDate() + 4 - day)
      const yearStart = new Date(thursday.getFullYear(), 0, 1)
      const weekNum = Math.ceil(((thursday - yearStart) / 86400000 + 1) / 7)
      const weekKey = `S${weekNum}`
      byWeek[weekKey] = (byWeek[weekKey] || 0) + 1
    }
  })

  const total = posts.length
  const publies = byStatut['Publié'] || 0
  const enCours = total - publies
  const tauxCompletion = total > 0 ? Math.round((publies / total) * 100) : 0

  return {
    total, publies, enCours, tauxCompletion,
    byStatut: Object.entries(byStatut).map(([name, value]) => ({ name, value })),
    byPlateforme: Object.entries(byPlateforme).map(([name, value]) => ({ name, value })),
    byCroyance: Object.entries(byCroyance).map(([name, value]) => ({ name, value })),
    byFormat: Object.entries(byFormat).map(([name, value]) => ({ name, value })),
    byWeek: Object.entries(byWeek).map(([name, value]) => ({ name, value })).sort((a, b) => a.name.localeCompare(b.name)),
    byMonth: Object.entries(byMonth).map(([name, value]) => ({ name, value })).sort((a, b) => a.name.localeCompare(b.name)),
  }
}
