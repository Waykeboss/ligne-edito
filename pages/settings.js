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

const IG_APP_ID        = '${process.env.NEXT_PUBLIC_IG_APP_ID}';
const IG_APP_SECRET    = '${process.env.NEXT_PUBLIC_IG_APP_SECRET}';
const IG_REDIRECT      = 'https://ligne-edito-next.vercel.app/settings';
const IG_SCOPE         = 'instagram_business_basic,instagram_business_content_publish';

function initSettings() {
  document.getElementById('s-anthropic').value     = localStorage.getItem('anthropic_key') || '';
  document.getElementById('s-notion-token').value  = localStorage.getItem('notion_token') || '';
  document.getElementById('s-db-fondations').value = localStorage.getItem('db_fondations') || DB_FONDATIONS;
  document.getElementById('s-db-calendrier').value = localStorage.getItem('db_calendrier') || DB_CALENDRIER;
  document.getElementById('s-meta-token').value    = localStorage.getItem('meta_token') || '';
  document.getElementById('s-linkedin-token').value = localStorage.getItem('linkedin_token') || '';
  updateInstagramStatus();
  updateLinkedInStatus();
  updateYouTubeStatus();

  // Handle OAuth callbacks
  if (window.location.hash.includes('access_token=')) {
    handleYouTubeCallback();
  } else if (window.location.search.includes('code=')) {
    // Determine if it's LinkedIn or Instagram callback
    var params = new URLSearchParams(window.location.search);
    var state = params.get('state');
    var savedLiState = localStorage.getItem('li_state');
    var pendingIg = localStorage.getItem('ig_pending');
    if (pendingIg === 'true') {
      handleInstagramCallback();
    } else if (savedLiState && state === savedLiState) {
      handleLinkedInCallback();
    } else {
      // Try Instagram first, then LinkedIn
      if (pendingIg || !savedLiState) {
        handleInstagramCallback();
      } else {
        handleLinkedInCallback();
      }
    }
  }
}

/* ── Instagram OAuth ── */
function connectInstagram() {
  localStorage.setItem('ig_pending', 'true');
  var url = 'https://www.instagram.com/oauth/authorize?client_id=' + IG_APP_ID + '&redirect_uri=' + encodeURIComponent(IG_REDIRECT) + '&response_type=code&scope=' + encodeURIComponent(IG_SCOPE);
  window.location.href = url;
}

async function handleInstagramCallback() {
  var params = new URLSearchParams(window.location.search);
  var code = params.get('code');
  if (!code) return;
  window.history.replaceState({}, '', window.location.pathname);
  localStorage.removeItem('ig_pending');
  toast('Connexion Instagram en cours...', 'success');

  try {
    var resp = await fetch('/api/instagram-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code, redirect_uri: IG_REDIRECT })
    });
    var data = await resp.json();
    if (!data.access_token) throw new Error(JSON.stringify(data));

    localStorage.setItem('meta_token', data.access_token);
    localStorage.setItem('ig_user_id', data.user_id);
    document.getElementById('s-meta-token').value = data.access_token;
    toast('\\u2705 Instagram connect\\u00e9 !' + (data.long_lived ? ' (token valide 60 jours)' : ''), 'success');
    updateInstagramStatus();

  } catch(e) {
    toast('Erreur connexion Instagram : ' + e.message, 'error');
    console.error('Instagram token exchange error:', e);
  }
}

function updateInstagramStatus() {
  var token = localStorage.getItem('meta_token');
  var el = document.getElementById('ig-status');
  if (!el) return;
  if (token) {
    el.textContent = '\\u2705 connect\\u00e9';
    el.style.color = '#22c55e';
    document.getElementById('btn-ig-connect').textContent = '\\uD83D\\uDD04 Reconnecter Instagram';
  } else {
    el.textContent = 'non connect\\u00e9';
    el.style.color = 'var(--muted)';
  }
}

/* ── YouTube OAuth ── */
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

/* ── LinkedIn OAuth ── */
function connectLinkedIn() {
  var state = Math.random().toString(36).slice(2);
  localStorage.setItem('li_state', state);
  localStorage.removeItem('ig_pending');
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
    var resp = await fetch('/api/linkedin-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code, redirect_uri: LI_REDIRECT })
    });
    var data = await resp.json();
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

/* ── Save & Toast ── */
function saveSettings() {
  localStorage.setItem('anthropic_key', document.getElementById('s-anthropic').value.trim());
  localStorage.setItem('notion_token', document.getElementById('s-notion-token').value.trim());
  localStorage.setItem('db_fondations', document.getElementById('s-db-fondations').value.trim());
  localStorage.setItem('db_calendrier', document.getElementById('s-db-calendrier').value.trim());
  localStorage.setItem('meta_token', document.getElementById('s-meta-token').value.trim());
  var liToken = document.getElementById('s-linkedin-token').value.trim();
  if (liToken) localStorage.setItem('linkedin_token', liToken);
  toast('\\u2713 Configuration sauvegard\\u00e9e', 'success');
  setTimeout(function() { window.location.href = '/'; }, 800);
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
    <div class="section-label">Instagram — <span id="ig-status" style="color:var(--muted);font-weight:400">non connecté</span></div>
    <button class="btn btn-outline btn-block" onclick="connectInstagram()" id="btn-ig-connect" style="margin-bottom:10px;background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);border:none;color:#fff">
      📸 Connecter Instagram
    </button>
    <div class="field">
      <label>Ou colle ton token Instagram manuellement</label>
      <input type="password" id="s-meta-token" placeholder="IGQVJx..." />
    </div>
  </div>

  <div class="settings-section">
    <div class="section-label">LinkedIn — <span id="li-status" style="color:var(--muted);font-weight:400">non connecté</span></div>
    <button class="btn btn-outline btn-block" onclick="connectLinkedIn()" id="btn-li-connect" style="margin-bottom:10px">
      💼 Connecter LinkedIn
    </button>
    <div class="field">
      <label>Ou colle ton token LinkedIn manuellement</label>
      <input type="password" id="s-linkedin-token" placeholder="AQU..." />
    </div>
  </div>

  <div class="settings-section">
    <div class="section-label">YouTube — <span id="yt-status" style="color:var(--muted);font-weight:400">non connecté</span></div>
    <button class="btn btn-outline btn-block" onclick="connectYouTube()" id="btn-yt-connect">
      ▶️ Connecter YouTube
    </button>
  </div>

  <div class="info-setup" style="margin-top:24px">
    <strong>Instagram</strong> → Cliquer "Connecter Instagram" → autoriser avec ton compte professionnel<br /><br />
    <strong>LinkedIn</strong> → Cliquer "Connecter LinkedIn" → autoriser avec ton compte<br /><br />
    <strong>YouTube</strong> → Cliquer "Connecter YouTube" → compte Google → autoriser<br /><br />
    <hr style="border-color:rgba(255,255,255,.1);margin:12px 0" />
    <strong>Token Notion</strong> → <a href="https://www.notion.so/my-integrations" target="_blank" rel="noreferrer">notion.so/my-integrations</a> → Créer → copier <code>secret_...</code><br />
    Puis dans chaque base Notion → ··· → <strong>Connections</strong> → ajouter l'intégration
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
