const DB_FONDATIONS = '2a3805a1-0937-4d15-b6be-0cb4bac69fa9';
const DB_CALENDRIER = '774c6810-4ba9-4e95-85cb-a6b11df9d46a';

export function getDbFondations() {
  return (typeof window !== 'undefined' && localStorage.getItem('db_fondations') || DB_FONDATIONS).replace(/-/g, '');
}

export function getDbCalendrier() {
  return (typeof window !== 'undefined' && localStorage.getItem('db_calendrier') || DB_CALENDRIER).replace(/-/g, '');
}

export async function notionPost(endpoint, body) {
  const token = localStorage.getItem('notion_token');
  const resp = await fetch('/api/notion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint, method: 'POST', body, token })
  });
  if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.message || `Erreur ${resp.status}`); }
  return resp.json();
}

export async function notionPatch(endpoint, body) {
  const token = localStorage.getItem('notion_token');
  const resp = await fetch('/api/notion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint, method: 'PATCH', body, token })
  });
  if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.message || `Erreur ${resp.status}`); }
  return resp.json();
}

export async function callClaude(prompt) {
  const apiKey = localStorage.getItem('anthropic_key');
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] })
  });
  if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error?.message || `Erreur ${resp.status}`); }
  const data = await resp.json();
  return data.content[0].text.trim();
}

export async function loadOffresFromNotion() {
  const token = localStorage.getItem('notion_token');
  const dbId = getDbFondations();
  if (!token) return [];

  const resp = await fetch('/api/notion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: `databases/${dbId}/query`, method: 'POST', body: { sorts: [{ property: "Nom de l'offre", direction: 'ascending' }] }, token })
  });
  if (!resp.ok) throw new Error('Erreur Notion');
  const data = await resp.json();
  return data.results.map(p => ({
    id: p.id,
    nom: p.properties["Nom de l'offre"]?.title?.[0]?.plain_text || 'Sans titre',
    probleme: p.properties['Problème principal']?.rich_text?.[0]?.plain_text || '',
    avatar: p.properties['Avatar client']?.rich_text?.[0]?.plain_text || '',
    impact: p.properties["Impact dans la vie de l'avatar"]?.rich_text?.[0]?.plain_text || '',
    solutions: p.properties['Solutions traditionnelles inefficaces']?.rich_text?.[0]?.plain_text || '',
    superieure: p.properties['Pourquoi ta solution est supérieure']?.rich_text?.[0]?.plain_text || '',
    croyances: p.properties['Croyances à construire']?.rich_text?.[0]?.plain_text || '',
    statut: p.properties['Statut offre']?.select?.name || '',
  }));
}

export async function loadFichesFromNotion() {
  const token = localStorage.getItem('notion_token');
  const dbId = getDbCalendrier();
  if (!token) return [];

  const resp = await fetch('/api/notion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: `databases/${dbId}/query`,
      method: 'POST',
      body: {
        filter: { property: 'Statut', select: { equals: 'Idée' } },
        sorts: [{ property: 'Date de publication', direction: 'ascending' }]
      },
      token
    })
  });
  if (!resp.ok) throw new Error('Erreur Notion');
  const data = await resp.json();
  return data.results.map(p => ({
    id: p.id,
    titre: p.properties['Titre du post']?.title?.[0]?.plain_text || 'Sans titre',
    format: p.properties['Format']?.select?.name || 'Reel',
    plateforme: p.properties['Plateforme']?.select?.name || 'Instagram',
    croyance: p.properties['Croyance ciblée']?.select?.name || '',
    accroche: p.properties['Accroche']?.rich_text?.[0]?.plain_text || '',
    corps: p.properties['Corps du post']?.rich_text?.[0]?.plain_text || '',
    lienMedia: p.properties['Lien média']?.url || '',
    date: p.properties['Date de publication']?.date?.start || '',
  }));
}
