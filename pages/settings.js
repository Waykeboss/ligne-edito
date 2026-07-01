import Head from 'next/head'
import { useEffect } from 'react'

const settingsJS = `
const DB_FONDATIONS = '2a3805a1-0937-4d15-b6be-0cb4bac69fa9';
const DB_CALENDRIER = '774c6810-4ba9-4e95-85cb-a6b11df9d46a';

const YT_CLIENT_ID     = '${process.env.NEXT_PUBLIC_YT_CLIENT_ID}';
const YT_REDIRECT      = 'https://ligne-edito-next.vercel.app/settings';
const YT_SCOPE         = 'https://www.googleapis.com/auth/youtube.upload';

const LI_CLIENT_ID     = '${process.env.NEXT_PUBLIC_LI_CLIENT_ID}';
const LI_CLIENT_SECRET = '${process.env.NEXT_PUBLIC_LI_CLIENT_SECRET}';
const LI_REDIRECT      = 'https://ligne-edito-next.vercel.app/settings';
const LI_SCOPE         = 'openid profile w_member_social';

function initSettings() {
  document.getElementById('s-anthropic').value    = localStorage.getItem('anthropic_key') || '';
  document.getElementById('s-notion-token').value = localStorage.getItem('notion_token') || '';
  document.getElementById('s-db-fondations').value = localStorage.getItem('db_fondations') || DB_FONDATIONS;
  document.getElementById('s-db-calendrier').value = localStorage.getItem('db_calendrier') || DB_CALENDRIER;
  document.getElementById('s-meta-token').value   = localStorage.getItem('meta_token') || '';
  document.getElementById('s-linkedin-token').value = localStorage.getItem('linkedin_token') || '';
  updateLinkedInStatus();
  updateYouTubeStatus();

  // Handle OAuth callbacks
  if (window.location.hash.includes('access_token=')) {
    handleYouTubeCallback();
  } else if (window.location.search.includes('code=')) {
    handleLinkedInCallback();
  }
}

function saveSettings() {
  localStorage.setItem('anthropic_key', document.getElementById('s-anthropic').value.trim());
  localStorage.setItem('notion_token', document.getElementById('s-notion-token').value.trim());
  localStorage.setItem('db_fondations', document.getElementById('s-db-fondations').value.trim());
  localStorage.setItem('db_calendrier', document.getElementById('s-db-calendrier').value.trim());
  localStorage.setItem('meta_token', document.getElementById('s-meta-token').value.trim());
  const liToken = document.getElementById('s-linkedin-token').value.trim();
  if (liToken) localStorage.setItem('linkedin_token', liToken);
  toast('\\u2713 Configuration sauvegardée', 'success');
  setTimeout(() => { window.location.href = '/'; }, 800);
}

function connectYouTube() {
  var url = 'https://accounts.google.com/o/oauth2/v2/auth?response_type=token&client_id=' + YT_CLIENT_ID + '&redirect_uri=' + encodeURIComponent(YT_REDIRECT) + '&scope=' + encodeURIComponent(YT_SCOPE);
  window.location.href = url;
}

function handleYouTubeCallback() {
  var hash = new URLSearchParams(window.location.hash.slice(1));
  var token = hash.get('access_token');
  if (!token) return;
  window.history.replaceState({}, '', window.location.pathname);
  localStorage.setItem('yt_token', token);
  toast('\\u2705 YouTube connect\\u00e9 !', 'success');
  updateYouTubeStatus();
}

function updateYouTubeStatus() {
  var token = localStorage.getItem('yt_token');
  var el = document.getElementById('yt-status');
  if (!el) return;
  if (token) {
    el.textContent = '\\u2705 connect\\u00e9';
    el.style.color = '#22c55e';
    document.getElementById('btn-yt-connect').textContent = '\\uD83D\\uDD04 Reconnecter YouTube';
  } else {
    el.textContent = 'non connect\\u00e9';
    el.style.color = 'var(--muted)';
  }
}

function connectLinkedIn() {
  var state = Math.random().toString(36).slice(2);
  localStorage.setItem('li_state', state);
  var url = 'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=' + LI_CLIENT_ID + '&redirect_uri=' + encodeURIComponent(LI_REDIRECT) + '&scope=' + encodeURIComponent(LI_SCOPE) + '&state=' + state;
  window.location.href = url;
}

async function handleLinkedInCallback() {
  var params = new URLSearchParams(window.location.search);
  var code   = params.get('code');
  var error  = params.get('error');
  if (!code && !error) return;
  window.history.replaceState({}, '', window.location.pathname);
  if (error) {
    toast("LinkedIn a refus\\u00e9 l'autorisation : " + (params.get('error_description') || error), 'error');
    return;
  }
  toast('Connexion LinkedIn en cours...', 'success');
  try {
    var proxy = 'https://corsproxy.io/?url=';
    var tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    var body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: LI_REDIRECT,
      client_id: LI_CLIENT_ID,
      client_secret: LI_CLIENT_SECRET
    });
    var resp = await fetch(proxy + encodeURIComponent(tokenUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });
    var text = await resp.text();
    var data;
    try { data = JSON.parse(text); } catch(e) { throw new Error('R\\u00e9ponse invalide : ' + text); }
    if (data.access_token) {
      localStorage.setItem('linkedin_token', data.access_token);
      localStorage.removeItem('li_state');
      toast('\\u2705 LinkedIn connect\\u00e9 !', 'success');
      updateLinkedInStatus();
    } else {
      throw new Error(JSON.stringify(data));
    }
  } catch(e) {
    toast('Erreur connexion LinkedIn : ' + e.message, 'error');
  }
}

function updateLinkedInStatus() {
  var token = localStorage.getItem('linkedin_token');
  var el = document.getElementById('li-status');
  if (!el) return;
  if (token) {
    el.textContent = '\\u2705 connect\\u00e9';
    el.style.color = '#22c55e';
    document.getElementById('s-linkedin-token').value = token;
    document.getElementById('btn-li-connect').textContent = '\\uD83D\\uDD04 Reconnecter LinkedIn';
  } else {
    el.textContent = 'non connect\\u00e9';
    el.style.color = 'var(--muted)';
  }
}

function toast(msg, type) {
  var c = document.getElementById('toasts');
  if (!c) return;
  var t = document.createElement('div');
  t.className = 'toast toast-' + (type || 'success');
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(function() { t.style.opacity = '0'; setTimeout(function() { t.remove(); }, 300); }, 3500);
}

initSettings();
`

export default function Settings() {
  useEffect(() => {
    const s = document.createElement('script')
    s.textContent = settingsJS
    document.body.appendChild(s)
    return () => { if (s.parentNode) s.parentNode.removeChild(s) }
  }, [])

  const htmlBody = `
<header class="header">
  <div class="logo"><a href="/" style="text-decoration:none;color:inherit;display:flex;align-items:center;gap:12px"><div class="logo-icon">✦</div> Système Editorial IA</a></div>
  <div class="header-right">
    <a href="/" class="btn-sm" style="text-decoration:none">← Retour</a>
  </div>
</header>

<div style="max-width:600px;margin:0 auto;padding:28px 20px">
  <h1 style="font-size:1.4rem;margin-bottom:6px">⚙️ Configuration</h1>
  <p style="color:var(--muted);font-size:.85rem;margin-bottom:28px">Clés stockées localement dans votre navigateur. Rien n'est envoyé à un serveur.</p>

  <div class="settings-section">
    <div class="section-label">API & Notion</div>

    <div class="field">
      <label>Clé API Anthropic</label>
      <input type="password" id="s-anthropic" placeholder="sk-ant-..." />
    </div>
    <div class="field">
      <label>Token Notion Integration</label>
      <input type="password" id="s-notion-token" placeholder="secret_..." />
    </div>
    <div class="field-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div class="field">
        <label>ID base Fondations</label>
        <input type="text" id="s-db-fondations" />
      </div>
      <div class="field">
        <label>ID base Calendrier</label>
        <input type="text" id="s-db-calendrier" />
      </div>
    </div>
  </div>

  <div class="settings-section">
    <div class="section-label">Instagram</div>
    <div class="field">
      <label>Token Instagram (IGQ...)</label>
      <input type="password" id="s-meta-token" placeholder="IGQVJx..." />
    </div>
  </div>

  <div class="settings-section">
    <div class="section-label">LinkedIn — <span id="li-status" style="color:var(--muted);font-weight:400">non connecté</span></div>
    <button class="btn btn-outline btn-block" onclick="connectLinkedIn()" id="btn-li-connect" style="margin-bottom:10px">
      💼 Connecter LinkedIn (OAuth)
    </button>
    <div class="field">
      <label>Ou colle ton token LinkedIn manuellement</label>
      <input type="password" id="s-linkedin-token" placeholder="AQU..." />
    </div>
  </div>

  <div class="settings-section">
    <div class="section-label">YouTube — <span id="yt-status" style="color:var(--muted);font-weight:400">non connecté</span></div>
    <button class="btn btn-outline btn-block" onclick="connectYouTube()" id="btn-yt-connect">
      ▶️ Connecter YouTube (OAuth)
    </button>
  </div>

  <div class="info-setup" style="margin-top:24px">
    <strong>Token Notion</strong> → <a href="https://www.notion.so/my-integrations" target="_blank" rel="noreferrer">notion.so/my-integrations</a> → Créer → copier <code>secret_...</code><br />
    Puis dans chaque base Notion → ··· → <strong>Connections</strong> → ajouter l'intégration<br /><br />
    <strong>Token Instagram</strong> → Graph API Explorer → permissions <code>instagram_business_basic</code> + <code>instagram_business_content_publish</code><br /><br />
    <strong>LinkedIn</strong> → Cliquer "Connecter LinkedIn" ou coller un token manuellement<br /><br />
    <strong>YouTube</strong> → Cliquer "Connecter YouTube" → compte Google → autoriser
  </div>

  <div style="display:flex;gap:12px;margin-top:28px">
    <a href="/" class="btn btn-outline" style="text-decoration:none;text-align:center">Annuler</a>
    <button class="btn btn-primary" onclick="saveSettings()" style="flex:1">✓ Sauvegarder</button>
  </div>
</div>

<div class="toast-container" id="toasts"></div>
`

  return (
    <>
      <Head>
        <title>Configuration — Système Editorial IA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div dangerouslySetInnerHTML={{ __html: htmlBody }} />
    </>
  )
}
