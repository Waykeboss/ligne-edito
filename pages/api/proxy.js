// Generic CORS proxy for Instagram Graph API and LinkedIn API calls
export default async function handler(req, res) {
  const { url, method, headers, body } = req.body

  if (!url) return res.status(400).json({ error: 'Missing url' })

  // Only allow whitelisted domains
  const allowed = ['graph.instagram.com', 'graph.facebook.com', 'api.linkedin.com']
  try {
    const hostname = new URL(url).hostname
    if (!allowed.some(d => hostname.endsWith(d))) {
      return res.status(403).json({ error: 'Domain not allowed: ' + hostname })
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL' })
  }

  try {
    const resp = await fetch(url, {
      method: method || 'GET',
      headers: headers || {},
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    })

    const data = await resp.json()
    res.status(resp.status).json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
