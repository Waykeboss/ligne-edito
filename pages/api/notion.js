export default async function handler(req, res) {
  const { endpoint, method, body, token } = req.body

  if (!endpoint || !token) {
    return res.status(400).json({ error: 'Missing endpoint or token' })
  }

  try {
    const resp = await fetch(`https://api.notion.com/v1/${endpoint}`, {
      method: method || 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await resp.json()
    res.status(resp.status).json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
