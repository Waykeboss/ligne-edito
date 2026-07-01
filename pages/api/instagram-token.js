export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { code, redirect_uri } = req.body

  try {
    // 1. Exchange code for short-lived token
    const body = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_IG_APP_ID,
      client_secret: process.env.NEXT_PUBLIC_IG_APP_SECRET,
      grant_type: 'authorization_code',
      redirect_uri,
      code,
    })

    const resp = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    const data = await resp.json()
    if (!data.access_token) return res.status(400).json(data)

    // 2. Exchange for long-lived token (60 days)
    const longResp = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.NEXT_PUBLIC_IG_APP_SECRET}&access_token=${data.access_token}`
    )
    const longData = await longResp.json()

    res.status(200).json({
      access_token: longData.access_token || data.access_token,
      user_id: data.user_id,
      long_lived: !!longData.access_token,
      expires_in: longData.expires_in || 3600,
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
