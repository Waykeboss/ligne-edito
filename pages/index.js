import Head from 'next/head'
import Script from 'next/script'

export default function Home() {
  return (
    <>
      <Head>
        <title>Système Editorial IA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* ══ MODAL SETTINGS ══ */}
      <div className="modal-overlay hidden" id="settingsModal">
        <div className="modal">
          <button className="modal-close" onClick="closeSettings()">✕</button>
          <h2>⚙️ Configuration</h2>
          <p className="sub">Clés stockées localement dans votre navigateur.</p>
          <div className="field"><label>Clé API Anthropic</label><input type="password" id="s-anthropic" placeholder="sk-ant-..." /></div>
          <div className="field"><label>Token Notion Integration</label><input type="password" id="s-notion-token" placeholder="secret_..." /></div>
          <div className="field"><label>ID base Fondations</label><input type="text" id="s-db-fondations" /></div>
          <div className="field"><label>ID base Calendrier</label><input type="text" id="s-db-calendrier" /></div>
          <div className="field"><label>Token Instagram (IGQ...)</label><input type="password" id="s-meta-token" placeholder="IGQVJx..." /></div>

          <div className="field" style={{borderTop:'1px solid rgba(255,255,255,.08)',paddingTop:'14px',marginTop:'4px'}}>
            <label>LinkedIn — <span id="li-status" style={{color:'var(--muted)',fontWeight:400}}>non connecté</span></label>
            <button className="btn btn-outline btn-block" onClick="connectLinkedIn()" id="btn-li-connect" style={{marginTop:'8px'}}>
              💼 Connecter LinkedIn
            </button>
            <input type="password" id="s-linkedin-token" placeholder="Colle ton token LinkedIn ici" style={{marginTop:'8px'}} />
          </div>

          <div className="field" style={{borderTop:'1px solid rgba(255,255,255,.08)',paddingTop:'14px',marginTop:'4px'}}>
            <label>YouTube — <span id="yt-status" style={{color:'var(--muted)',fontWeight:400}}>non connecté</span></label>
            <button className="btn btn-outline btn-block" onClick="connectYouTube()" id="btn-yt-connect" style={{marginTop:'8px'}}>
              ▶️ Connecter YouTube
            </button>
          </div>

          <div className="info-setup">
            <strong>Token Notion</strong> → <a href="https://www.notion.so/my-integrations" target="_blank" rel="noreferrer">notion.so/my-integrations</a> → Créer → copier <code>secret_...</code><br />
            Puis dans chaque base Notion → ··· → <strong>Connections</strong> → ajouter l&apos;intégration<br /><br />
            <strong>Token Instagram</strong> → Graph API Explorer → permissions <code>instagram_business_basic</code> + <code>instagram_business_content_publish</code><br /><br />
            <strong>LinkedIn</strong> → Cliquer &quot;Connecter LinkedIn&quot; → autoriser → token automatique<br /><br />
            <strong>YouTube</strong> → Cliquer &quot;Connecter YouTube&quot; → compte Google → autoriser
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick="closeSettings()">Annuler</button>
            <button className="btn btn-primary" onClick="saveSettings()">✓ Sauvegarder</button>
          </div>
        </div>
      </div>

      {/* ══ HEADER ══ */}
      <header className="header">
        <div className="logo"><div className="logo-icon">✦</div> Système Editorial IA</div>
        <div className="header-right">
          <button className="btn-sm" onClick="openSettings()">⚙️ Config</button>
        </div>
      </header>

      {/* ══ TABS ══ */}
      <nav className="tabs">
        <div className="tab active" onClick="switchTab('fondations')">🏗️ Fondations</div>
        <div className="tab" onClick="switchTab('strategie')">📅 Stratégie</div>
        <div className="tab" onClick="switchTab('contenu')">✦ Contenu</div>
        <div className="tab" onClick="switchTab('publication')">↗ Publication</div>
      </nav>

      {/* ══ TAB 1 — FONDATIONS ══ */}
      <div className="panel active" id="tab-fondations">

        <div className="info-box">
          <strong>Étape 0 — Fondations</strong><br />
          Remplis cette fiche une seule fois par offre. Tout le contenu généré ensuite en découle. Si tu es bloqué sur une question, clique sur <strong>✦ Suggérer avec l&apos;IA</strong>.
        </div>

        <div className="section-label">L&apos;offre</div>
        <div className="field-row">
          <div className="field"><label>Nom de l&apos;offre / produit</label><input type="text" id="f-nom" placeholder="Ex : Formation IA pour équipes comm'" /></div>
          <div className="field-row" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
            <div className="field"><label>Statut</label>
              <select id="f-statut">
                <option>En construction</option><option>Active</option><option>En pause</option><option>Archivée</option>
              </select>
            </div>
            <div className="field"><label>Plateforme cible</label>
              <select id="f-plateforme">
                <option>Instagram</option><option>LinkedIn</option><option>TikTok</option><option>YouTube</option><option>Multi-plateformes</option>
              </select>
            </div>
          </div>
        </div>

        <div className="section-label">Le problème d&apos;abord</div>
        <div className="field">
          <label>Quel problème précis ton offre résout-elle ?</label>
          <textarea id="f-probleme" rows="3" placeholder="Ex : Les équipes comm' passent 15h à créer du contenu chaque semaine, s'épuisent et produisent du contenu générique qui ne vend pas..."></textarea>
          <button className="ai-suggest" onClick="suggestField('f-probleme', 'probleme')">✦ Suggérer avec l&apos;IA</button>
        </div>

        <div className="section-label">L&apos;avatar</div>
        <div className="field">
          <label>Qui souffre de ce problème ? (décris précisément)</label>
          <textarea id="f-avatar" rows="3" placeholder="Ex : Directeur comm' d'une PME de 20-100 personnes, 35-50 ans, débordé, pas formé à l'IA, peur de paraître non-légitime si IA détectée..."></textarea>
          <button className="ai-suggest" onClick="suggestField('f-avatar', 'avatar')">✦ Suggérer avec l&apos;IA</button>
        </div>
        <div className="field">
          <label>Quel est l&apos;impact de ce problème dans sa vie (pro + perso) ?</label>
          <textarea id="f-impact" rows="3" placeholder="Ex : Stress constant, heures sup le soir, contenu qui n'engage pas, sentiment d'échec face aux concurrents, peur de perdre son poste..."></textarea>
          <button className="ai-suggest" onClick="suggestField('f-impact', 'impact')">✦ Suggérer avec l&apos;IA</button>
        </div>

        <div className="section-label">La différenciation</div>
        <div className="field">
          <label>Pourquoi les solutions traditionnelles ne fonctionnent pas ?</label>
          <textarea id="f-solutions" rows="3" placeholder="Ex : Les agences sont trop chères, les formations génériques ne sont pas adaptées au contexte de l'entreprise, les outils IA sans méthode créent du contenu sans âme..."></textarea>
          <button className="ai-suggest" onClick="suggestField('f-solutions', 'solutions')">✦ Suggérer avec l&apos;IA</button>
        </div>
        <div className="field">
          <label>Pourquoi ta solution est supérieure ?</label>
          <textarea id="f-superieure" rows="3" placeholder="Ex : Formation sur mesure dans leur entreprise, méthode IA + terrain, résultats en 6 semaines, économie de 10h/semaine par collaborateur..."></textarea>
          <button className="ai-suggest" onClick="suggestField('f-superieure', 'superieure')">✦ Suggérer avec l&apos;IA</button>
        </div>

        <div className="section-label">Les croyances à construire</div>
        <p style={{fontSize:'.83rem',color:'var(--muted)',marginBottom:'12px'}}>Qu&apos;est-ce que ton audience doit croire avant d&apos;acheter ? (méthode Antoine BM)</p>
        <div className="croyances-list" id="croyances-list">
          <div className="croyance-item"><div className="croyance-num">1</div><input type="text" placeholder="Ex : Mon tapis est un danger pour ma santé (gravité du problème)" /></div>
          <div className="croyance-item"><div className="croyance-num">2</div><input type="text" placeholder="Ex : Passer l'aspirateur ne suffit pas (solutions traditionnelles inefficaces)" /></div>
          <div className="croyance-item"><div className="croyance-num">3</div><input type="text" placeholder="Ex : Il existe une méthode professionnelle efficace (supériorité de la solution)" /></div>
        </div>
        <button className="add-croyance" onClick="addCroyance()">+ Ajouter une croyance</button>
        <button className="ai-suggest" style={{marginTop:'8px'}} onClick="suggestCroyances()">✦ Générer les croyances avec l&apos;IA</button>

        <hr className="divider" />

        <div style={{display:'flex',gap:'12px'}}>
          <button className="btn btn-primary" id="btn-save-fondations" onClick="saveFondations()">↗ Sauvegarder dans Notion</button>
          <button className="btn btn-outline" onClick="switchTab('contenu')">Créer du contenu →</button>
        </div>

      </div>

      {/* ══ TAB 2 — STRATÉGIE ══ */}
      <div className="panel" id="tab-strategie">

        <div className="info-box">
          <strong>Stratégie Reels Instagram</strong><br />
          Définis ton type d&apos;offre et ton rythme. Claude génère ton planning hebdomadaire avec le bon mix de Reels pour construire les croyances et vendre.
        </div>

        {/* Sélecteur offre */}
        <div className="offre-selector" style={{marginBottom:'24px'}}>
          <label>Sur quelle offre travailles-tu ?</label>
          <select id="s-offre-select" onChange="selectOffreStrategie(this.value)" style={{width:'100%',marginTop:'6px'}}>
            <option value="">— Sélectionne une offre —</option>
          </select>
        </div>

        <div className="section-label">Type d&apos;offre</div>
        <div className="offre-type-grid">
          <div className="offre-type-card selected" id="type-service" onClick="selectType('service')">
            <div className="type-icon">🤝</div>
            <h4>Service</h4>
            <p>Coaching, accompagnement, consulting, audit...</p>
          </div>
          <div className="offre-type-card" id="type-produit" onClick="selectType('produit')">
            <div className="type-icon">📦</div>
            <h4>Produit</h4>
            <p>Formation, template, outil, ressource...</p>
          </div>
        </div>

        <div className="field-row" style={{marginBottom:'20px'}}>
          <div className="field">
            <label>Prix de l&apos;offre (€)</label>
            <input type="number" id="s-prix" placeholder="Ex : 2000" />
          </div>
          <div className="field">
            <label>CTA principal</label>
            <select id="s-cta">
              <option value="DM">Envoie-moi un DM</option>
              <option value="lien bio">Lien en bio</option>
              <option value="commentaire">Commente pour recevoir</option>
              <option value="appel">Réserve un appel</option>
            </select>
          </div>
        </div>

        <div className="section-label">Rythme de publication</div>
        <div className="rythme-grid">
          <div className="rythme-card" id="rythme-3" onClick="selectRythme(3)">
            <div className="rythme-num">3</div>
            <p>Reels / semaine</p>
            <p style={{fontSize:'.7rem',marginTop:'4px',color:'var(--border)'}}>Démarrage</p>
          </div>
          <div className="rythme-card selected" id="rythme-5" onClick="selectRythme(5)">
            <div className="rythme-num">5</div>
            <p>Reels / semaine</p>
            <p style={{fontSize:'.7rem',marginTop:'4px',color:'var(--green)'}}>Recommandé</p>
          </div>
          <div className="rythme-card" id="rythme-7" onClick="selectRythme(7)">
            <div className="rythme-num">7</div>
            <p>Reels / semaine</p>
            <p style={{fontSize:'.7rem',marginTop:'4px',color:'var(--border)'}}>Intensif</p>
          </div>
        </div>

        <div className="section-label">Semaine de départ</div>
        <div className="field" style={{maxWidth:'220px'}}>
          <label>Date du lundi</label>
          <input type="date" id="s-semaine" />
        </div>

        <button className="btn btn-primary btn-block" id="btn-planning" onClick="genererPlanning()" style={{marginBottom:'28px'}}>
          📅 Générer le planning de la semaine
        </button>

        {/* RÉSULTATS PLANNING */}
        <div id="planning-results" style={{display:'none'}}>

          <div className="section-label">Tunnel de vente</div>
          <div className="tunnel-bar" id="tunnel-bar"></div>
          <div className="tunnel-legend">
            <div className="tunnel-legend-item"><div className="legend-dot" style={{background:'var(--red)'}}></div> Attirer</div>
            <div className="tunnel-legend-item"><div className="legend-dot" style={{background:'var(--orange)'}}></div> Éduquer</div>
            <div className="tunnel-legend-item"><div className="legend-dot" style={{background:'var(--blue)'}}></div> Prouver</div>
            <div className="tunnel-legend-item"><div className="legend-dot" style={{background:'var(--green)'}}></div> Convertir</div>
          </div>

          <div className="section-label">Planning de la semaine</div>
          <div className="planning-grid" id="planning-grid"></div>

          <button className="btn btn-green btn-block" id="btn-save-planning" onClick="savePlanning()">
            ↗ Envoyer tout dans Notion
          </button>
        </div>

      </div>

      {/* ══ TAB 3 — CONTENU ══ */}
      <div className="panel" id="tab-contenu">

        {/* CHARGER UNE FICHE EXISTANTE */}
        <div className="card" style={{marginBottom:'20px'}}>
          <div className="card-header">
            <h4>📋 Charger une fiche depuis Notion</h4>
            <button className="btn-sm" onClick="loadFichesNotion()">↺ Rafraîchir</button>
          </div>
          <div className="card-body" style={{padding:'12px'}}>
            <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
              <select id="c-fiche-select" onChange="chargerFiche(this.value)" style={{flex:1}}>
                <option value="">— Sélectionne un Reel à compléter —</option>
              </select>
            </div>
            <div id="fiche-resume" style={{display:'none',marginTop:'10px',background:'var(--surface2)',borderRadius:'8px',padding:'10px',fontSize:'.81rem',color:'var(--muted)',lineHeight:1.6}}></div>
          </div>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
          <div style={{flex:1,height:'1px',background:'var(--border)'}}></div>
          <span style={{fontSize:'.78rem',color:'var(--muted)'}}>ou remplis manuellement</span>
          <div style={{flex:1,height:'1px',background:'var(--border)'}}></div>
        </div>

        {/* Sélecteur offre */}
        <div className="offre-selector">
          <label>Sur quelle offre travailles-tu ?</label>
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            <select id="c-offre-select" onChange="selectOffre(this.value)" style={{flex:1}}>
              <option value="">⏳ Chargement des offres...</option>
            </select>
            <button className="btn-sm" onClick="loadOffres()">↺</button>
            <button className="btn-sm" onClick="switchTab('fondations')">+ Nouvelle</button>
          </div>
          <div id="offre-resume" style={{display:'none',marginTop:'12px',background:'var(--surface2)',borderRadius:'8px',padding:'12px',fontSize:'.82rem',color:'var(--muted)',lineHeight:1.6}}></div>
        </div>

        <div className="field-row-3">
          <div className="field">
            <label>Croyance à cibler</label>
            <select id="c-croyance">
              <option value="">✦ Suggérer par l&apos;IA</option>
              <option>Gravité du problème</option>
              <option>Inefficacité solutions existantes</option>
              <option>Supériorité de la méthode</option>
              <option>Légitimité du formateur</option>
              <option>Urgence d&apos;agir</option>
            </select>
          </div>
          <div className="field">
            <label>Format</label>
            <select id="c-format">
              <option>Reel</option><option>Carrousel</option><option>Story</option><option>Photo</option>
            </select>
          </div>
          <div className="field">
            <label>Plateforme</label>
            <select id="c-plateforme">
              <option>Instagram</option><option>LinkedIn</option><option>TikTok</option><option>YouTube</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label>Idée / angle du post (optionnel — laisse vide pour que Claude décide)</label>
          <textarea id="c-idee" rows="2" placeholder="Ex : Montrer que passer 3h sur un post LinkedIn sans méthode IA est contre-productif..."></textarea>
        </div>
        <div className="field">
          <label>Contexte additionnel</label>
          <textarea id="c-contexte" rows="2" placeholder="Ex : Ciblé DRH, ton expert mais accessible, inclure un exemple chiffré..."></textarea>
        </div>

        <button className="btn btn-primary btn-block" id="btn-generate" onClick="generateContenu()" style={{marginBottom:'24px'}}>
          ✦ Générer le contenu
        </button>

        {/* RÉSULTATS */}
        <div id="contenu-results" style={{display:'none'}}>

          {/* Accroche suggérée */}
          <div className="section-label">Choisissez votre accroche</div>
          <div className="hooks-grid" id="hooks-grid"></div>

          {/* Corps */}
          <div className="card">
            <div className="card-header"><h4>Corps du post</h4><button className="copy-btn" onClick="copyEl('r-corps')">Copier</button></div>
            <div className="card-body"><textarea id="r-corps" rows="8"></textarea></div>
          </div>

          {/* Script FLORA */}
          <div className="card">
            <div className="card-header">
              <h4>🌸 Script / Brief FLORA</h4>
              <div style={{display:'flex',gap:'8px'}}>
                <span className="badge badge-purple" id="r-format-badge"></span>
                <button className="copy-btn" onClick="copyEl('r-flora')">Copier</button>
              </div>
            </div>
            <div className="card-body"><textarea id="r-flora" rows="5"></textarea></div>
          </div>

          {/* Brief visuel */}
          <div className="card">
            <div className="card-header"><h4>Brief visuel (instructions générales)</h4><button className="copy-btn" onClick="copyEl('r-brief')">Copier</button></div>
            <div className="card-body"><textarea id="r-brief" rows="3"></textarea></div>
          </div>

          <hr className="divider" />

          {/* Titre + save */}
          <div className="field">
            <label>Titre de la fiche (pour Notion)</label>
            <input type="text" id="r-titre" placeholder="Titre du post..." />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Date de publication</label>
              <input type="date" id="r-date" />
            </div>
            <div className="field">
              <label>Statut</label>
              <select id="r-statut">
                <option>Idée</option><option>En rédaction</option><option>Brief FLORA envoyé</option>
              </select>
            </div>
          </div>

          <div style={{display:'flex',gap:'12px'}}>
            <button className="btn btn-green" id="btn-save-contenu" onClick="saveContenu()">↗ Enregistrer dans Notion</button>
            <button className="btn btn-outline" onClick="switchTab('publication')">Ajouter le média →</button>
          </div>
        </div>

      </div>

      {/* ══ TAB 4 — PUBLICATION ══ */}
      <div className="panel" id="tab-publication">

        <div className="info-box">
          <strong>Étape finale</strong> — Le contenu texte est dans Notion. Tu as créé le média dans FLORA. Il ne reste qu&apos;à assembler et programmer la publication.
        </div>

        {/* Pipeline statut */}
        <div className="pipeline">
          <div className="pipeline-step done"><span className="step-icon">✓</span>Fondations</div>
          <div className="pipeline-step done"><span className="step-icon">✓</span>Contenu texte</div>
          <div className="pipeline-step active"><span className="step-icon">🌸</span>Média FLORA</div>
          <div className="pipeline-step"><span className="step-icon">📅</span>Programmé</div>
          <div className="pipeline-step"><span className="step-icon">✅</span>Publié</div>
        </div>

        <div className="section-label">Le post</div>
        <div className="field-row">
          <div className="field"><label>Titre du post (pour retrouver dans Notion)</label><input type="text" id="p-titre" placeholder="Titre exact de la fiche Notion..." /></div>
          <div className="field"><label>ID de la page Notion (optionnel)</label><input type="text" id="p-page-id" placeholder="Coller l'ID depuis l'URL Notion..." /></div>
        </div>

        <div className="section-label">Le média (créé dans FLORA)</div>
        <img id="p-preview" className="preview-img" src="" alt="" />
        <div className="drop-zone" id="p-drop"
          onDragOver="dragOver(event)" onDragLeave="dragLeave(event)" onDrop="dropFile(event,'p-preview','p-media-url')">
          <input type="file" accept="image/*,video/*" onChange="fileSelect(event,'p-preview','p-media-url')" />
          <div style={{fontSize:'2rem'}}>🎬</div>
          <p>Glisse ton Reel / image / carrousel ici<br /><span style={{fontSize:'.75rem',color:'var(--border)'}}>ou clique pour choisir — MP4, PNG, JPG, WEBP</span></p>
        </div>
        <div className="field" style={{marginTop:'10px'}}>
          <label>Ou URL du média hébergé (Drive, Dropbox…)</label>
          <input type="url" id="p-media-url" placeholder="https://..." />
        </div>

        <div className="section-label">Programmation</div>
        <div className="field-row-3">
          <div className="field">
            <label>Date de publication</label>
            <input type="date" id="p-date" />
          </div>
          <div className="field">
            <label>Plateforme</label>
            <select id="p-plateforme">
              <option>Instagram</option><option>LinkedIn</option><option>TikTok</option><option>YouTube</option>
            </select>
          </div>
          <div className="field">
            <label>Nouveau statut</label>
            <select id="p-statut">
              <option>Média reçu</option><option>Prêt à publier</option>
            </select>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'8px',marginTop:'8px'}}>
          <button className="btn btn-outline btn-block" id="btn-publish" onClick="publishPost()">
            ↗ Notion
          </button>
          <button className="btn btn-primary btn-block" id="btn-instagram" onClick="publishToInstagram()" style={{background:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',border:'none'}}>
            📸 Instagram
          </button>
          <button className="btn btn-primary btn-block" id="btn-linkedin" onClick="publishToLinkedIn()" style={{background:'#0077b5',border:'none'}}>
            💼 LinkedIn
          </button>
          <button className="btn btn-primary btn-block" id="btn-youtube" onClick="publishToYouTube()" style={{background:'#ff0000',border:'none'}}>
            ▶️ YouTube
          </button>
        </div>
        {/* Input fichier vidéo YouTube (caché) */}
        <input type="file" id="yt-file-input" accept="video/*" style={{display:'none'}} />

      </div>

      {/* TOASTS */}
      <div className="toast-container" id="toasts"></div>

      <Script id="app-logic" strategy="afterInteractive">{`
/* ════════════════════════════════
   ÉTAT GLOBAL
════════════════════════════════ */
let selectedHook = null;
let generatedData = null;
let offresCache = [];
let selectedOffre = null;

const DB_FONDATIONS = '2a3805a1-0937-4d15-b6be-0cb4bac69fa9';
const DB_CALENDRIER = '774c6810-4ba9-4e95-85cb-a6b11df9d46a';

/* ════════════════════════════════
   INIT
════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const d = new Date(); d.setDate(d.getDate() + 3);
  const ds = d.toISOString().split('T')[0];
  document.getElementById('r-date').value = ds;
  document.getElementById('p-date').value = ds;
  // Prochain lundi
  const lundi = new Date();
  lundi.setDate(lundi.getDate() + ((1 + 7 - lundi.getDay()) % 7 || 7));
  document.getElementById('s-semaine').value = lundi.toISOString().split('T')[0];

  // Gérer les callbacks OAuth
  if (window.location.hash.includes('access_token=')) {
    setTimeout(() => handleYouTubeCallback(), 300);
  } else if (window.location.search.includes('code=')) {
    setTimeout(() => handleLinkedInCallback(), 300);
  }

  if (!localStorage.getItem('anthropic_key') || !localStorage.getItem('notion_token')) {
    setTimeout(() => openSettings(), 500);
  } else {
    loadOffres();
    loadFichesNotion();
  }
});

/* ════════════════════════════════
   CHARGER LES OFFRES DEPUIS NOTION
════════════════════════════════ */
async function loadOffres() {
  const token = localStorage.getItem('notion_token');
  const dbId = (localStorage.getItem('db_fondations') || DB_FONDATIONS).replace(/-/g,'');
  if (!token) return;

  const select = document.getElementById('c-offre-select');
  select.innerHTML = '<option value="">⏳ Chargement...</option>';

  try {
    const url = 'https://corsproxy.io/?' + encodeURIComponent(\`https://api.notion.com/v1/databases/\${dbId}/query\`);
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token, 'Notion-Version': '2022-06-28' },
      body: JSON.stringify({ sorts: [{ property: 'Nom de l\\'offre', direction: 'ascending' }] })
    });
    if (!resp.ok) throw new Error('Erreur Notion');
    const data = await resp.json();
    offresCache = data.results.map(p => ({
      id: p.id,
      nom: p.properties['Nom de l\\'offre']?.title?.[0]?.plain_text || 'Sans titre',
      probleme: p.properties['Problème principal']?.rich_text?.[0]?.plain_text || '',
      avatar: p.properties['Avatar client']?.rich_text?.[0]?.plain_text || '',
      impact: p.properties['Impact dans la vie de l\\'avatar']?.rich_text?.[0]?.plain_text || '',
      solutions: p.properties['Solutions traditionnelles inefficaces']?.rich_text?.[0]?.plain_text || '',
      superieure: p.properties['Pourquoi ta solution est supérieure']?.rich_text?.[0]?.plain_text || '',
      croyances: p.properties['Croyances à construire']?.rich_text?.[0]?.plain_text || '',
      statut: p.properties['Statut offre']?.select?.name || '',
    }));

    select.innerHTML = '<option value="">— Sélectionne une offre —</option>';
    offresCache.forEach(o => {
      const opt = document.createElement('option');
      opt.value = o.id;
      opt.textContent = \`\${o.statut === 'Active' ? '🟢' : '🟡'} \${o.nom}\`;
      select.appendChild(opt);
    });

    // Sync dropdown stratégie
    const selectStrat = document.getElementById('s-offre-select');
    if (selectStrat) {
      selectStrat.innerHTML = '<option value="">— Sélectionne une offre —</option>';
      offresCache.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.id;
        opt.textContent = \`\${o.statut === 'Active' ? '🟢' : '🟡'} \${o.nom}\`;
        selectStrat.appendChild(opt);
      });
    }

    // Option créer nouvelle
    const newOpt = document.createElement('option');
    newOpt.value = '__new__'; newOpt.textContent = '+ Créer une nouvelle offre';
    select.appendChild(newOpt);

    if (offresCache.length > 0) toast(\`\${offresCache.length} offre(s) chargée(s)\`, 'success');

  } catch(e) {
    select.innerHTML = '<option value="">⚠️ Impossible de charger les offres</option>';
    toast('Erreur chargement offres : ' + e.message, 'error');
  }
}

function selectOffre(id) {
  if (id === '__new__') { switchTab('fondations'); return; }
  if (!id) { selectedOffre = null; document.getElementById('offre-resume').style.display = 'none'; return; }

  selectedOffre = offresCache.find(o => o.id === id);
  if (!selectedOffre) return;

  // Afficher résumé
  const resume = document.getElementById('offre-resume');
  resume.style.display = 'block';
  resume.innerHTML = \`
    <strong style="color:var(--text)">\${selectedOffre.nom}</strong><br>
    <span style="color:var(--purple-light)">Problème :</span> \${selectedOffre.probleme.substring(0, 120)}...<br>
    <span style="color:var(--purple-light)">Avatar :</span> \${selectedOffre.avatar.substring(0, 100)}...
  \`;

  // Charger les croyances dans le select
  const croyanceSelect = document.getElementById('c-croyance');
  croyanceSelect.innerHTML = '<option value="">✦ Suggérer par l\\'IA</option>';
  const croyancesStandard = ['Gravité du problème','Inefficacité solutions existantes','Supériorité de la méthode','Légitimité du formateur','Urgence d\\'agir'];
  croyancesStandard.forEach(c => {
    const opt = document.createElement('option'); opt.value = c; opt.textContent = c;
    croyanceSelect.appendChild(opt);
  });

  toast(\`Offre "\${selectedOffre.nom}" sélectionnée\`, 'success');
}

/* ════════════════════════════════
   TABS
════════════════════════════════ */
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const tabs = ['fondations','strategie','contenu','publication'];
  document.querySelectorAll('.tab')[tabs.indexOf(tab)].classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Auto-remplir l'onglet Publication depuis la fiche sélectionnée
  if (tab === 'publication' && ficheSelectionnee) {
    document.getElementById('p-page-id').value   = ficheSelectionnee.id || '';
    document.getElementById('p-media-url').value = ficheSelectionnee.lienMedia || '';
    document.getElementById('p-date').value      = ficheSelectionnee.date || '';
    document.getElementById('p-plateforme').value= ficheSelectionnee.plateforme || 'Instagram';
    if (ficheSelectionnee.lienMedia) {
      document.getElementById('p-preview').src = ficheSelectionnee.lienMedia;
      document.getElementById('p-preview').style.display = 'block';
    }
  }
}

/* ════════════════════════════════
   SETTINGS
════════════════════════════════ */
/* ── YouTube OAuth ── */
const YT_CLIENT_ID     = process.env.NEXT_PUBLIC_YT_CLIENT_ID;
const YT_CLIENT_SECRET = process.env.NEXT_PUBLIC_YT_CLIENT_SECRET;
const YT_REDIRECT      = 'https://ligne-edito-next.vercel.app';
const YT_SCOPE         = 'https://www.googleapis.com/auth/youtube.upload';

function connectYouTube() {
  const url = \`https://accounts.google.com/o/oauth2/v2/auth?response_type=token&client_id=\${YT_CLIENT_ID}&redirect_uri=\${encodeURIComponent(YT_REDIRECT)}&scope=\${encodeURIComponent(YT_SCOPE)}\`;
  window.location.href = url;
}

function handleYouTubeCallback() {
  // Token dans le hash de l'URL (#access_token=...)
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const token = hash.get('access_token');
  if (!token) return;
  window.history.replaceState({}, '', window.location.pathname);
  localStorage.setItem('yt_token', token);
  toast('✅ YouTube connecté !', 'success');
  updateYouTubeStatus();
}

function updateYouTubeStatus() {
  const token = localStorage.getItem('yt_token');
  const el = document.getElementById('yt-status');
  if (!el) return;
  if (token) {
    el.textContent = '✅ connecté';
    el.style.color = '#22c55e';
    document.getElementById('btn-yt-connect').textContent = '🔄 Reconnecter YouTube';
  } else {
    el.textContent = 'non connecté';
    el.style.color = 'var(--muted)';
  }
}

async function publishToYouTube() {
  const token = localStorage.getItem('yt_token');
  if (!token) { toast('YouTube non connecté — ouvre ⚙️ Config', 'error'); return; }

  // Demander le fichier vidéo
  const fileInput = document.getElementById('yt-file-input');
  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    let title = '', description = '';
    if (ficheSelectionnee) {
      title       = ficheSelectionnee.titre || ficheSelectionnee.accroche || 'Ma vidéo';
      description = (ficheSelectionnee.accroche || '') + (ficheSelectionnee.corps ? '\\n\\n' + ficheSelectionnee.corps : '');
    }
    if (!title) title = 'Ma vidéo — The House Lab';

    const notionId = document.getElementById('p-page-id').value.trim().replace(/-/g,'');
    setLoading('btn-youtube', true, 'Upload YouTube...');

    try {
      // 1. Initialiser l'upload resumable
      const initResp = await fetch(
        \`https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status\`,
        {
          method: 'POST',
          headers: {
            Authorization: \`Bearer \${token}\`,
            'Content-Type': 'application/json',
            'X-Upload-Content-Type': file.type,
            'X-Upload-Content-Length': file.size
          },
          body: JSON.stringify({
            snippet: { title, description, tags: ['TheHouseLab', 'editorial', 'IA'], categoryId: '22' },
            status:  { privacyStatus: 'public' }
          })
        }
      );

      if (initResp.status === 401) {
        toast('Token YouTube expiré — reconnecte-toi dans ⚙️ Config', 'error');
        setLoading('btn-youtube', false, '▶️ YouTube');
        return;
      }

      const uploadUrl = initResp.headers.get('Location');
      if (!uploadUrl) throw new Error('Impossible d\\'obtenir l\\'URL d\\'upload YouTube');

      // 2. Uploader le fichier
      toast('Upload en cours... (' + Math.round(file.size/1024/1024) + ' Mo)', 'success');
      const uploadResp = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type, 'Content-Length': file.size },
        body: file
      });
      const uploadData = await uploadResp.json();
      if (!uploadData.id) throw new Error('Erreur upload : ' + JSON.stringify(uploadData));

      // 3. Mettre à jour Notion
      if (notionId) {
        await notionPatch('pages/' + notionId, {
          properties: { 'Statut': { select: { name: 'Publié' } } }
        });
      }

      toast('✅ Publié sur YouTube ! ID : ' + uploadData.id, 'success');

    } catch(e) {
      toast('Erreur YouTube : ' + e.message, 'error');
    } finally {
      setLoading('btn-youtube', false, '▶️ YouTube');
      fileInput.value = '';
    }
  };
  fileInput.click();
}

/* ── LinkedIn OAuth ── */
const LI_CLIENT_ID     = process.env.NEXT_PUBLIC_LI_CLIENT_ID;
const LI_CLIENT_SECRET = process.env.NEXT_PUBLIC_LI_CLIENT_SECRET;
const LI_REDIRECT      = 'https://ligne-edito-next.vercel.app';
const LI_SCOPE         = 'openid profile w_member_social';

function connectLinkedIn() {
  const state = Math.random().toString(36).slice(2);
  localStorage.setItem('li_state', state);
  const url = \`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=\${LI_CLIENT_ID}&redirect_uri=\${encodeURIComponent(LI_REDIRECT)}&scope=\${encodeURIComponent(LI_SCOPE)}&state=\${state}\`;
  window.location.href = url;
}

async function handleLinkedInCallback() {
  const params = new URLSearchParams(window.location.search);
  const code   = params.get('code');
  const state  = params.get('state');
  const error  = params.get('error');

  if (!code && !error) return;

  // Nettoyer l'URL immédiatement
  window.history.replaceState({}, '', window.location.pathname);

  if (error) {
    toast('LinkedIn a refusé l\\'autorisation : ' + (params.get('error_description') || error), 'error');
    return;
  }

  const savedState = localStorage.getItem('li_state');
  console.log('LinkedIn callback — code:', code?.slice(0,10), 'state match:', state === savedState);

  // Vérification state souple (log uniquement, ne bloque pas)
  if (state !== savedState) {
    console.warn('LinkedIn state mismatch — continuons quand même', { received: state, expected: savedState });
  }

  toast('Connexion LinkedIn en cours...', 'success');

  try {
    const proxy = 'https://corsproxy.io/?url=';
    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    const body = new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  LI_REDIRECT,
      client_id:     LI_CLIENT_ID,
      client_secret: LI_CLIENT_SECRET
    });

    const resp = await fetch(proxy + encodeURIComponent(tokenUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });

    const text = await resp.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { throw new Error('Réponse invalide : ' + text); }

    if (data.access_token) {
      localStorage.setItem('linkedin_token', data.access_token);
      localStorage.removeItem('li_state');
      toast('✅ LinkedIn connecté !', 'success');
      updateLinkedInStatus();
    } else {
      throw new Error(JSON.stringify(data));
    }
  } catch(e) {
    toast('Erreur connexion LinkedIn : ' + e.message, 'error');
    console.error('LinkedIn token exchange error:', e);
  }
}

function updateLinkedInStatus() {
  const token = localStorage.getItem('linkedin_token');
  const el = document.getElementById('li-status');
  if (!el) return;
  if (token) {
    el.textContent = '✅ connecté';
    el.style.color = '#22c55e';
    document.getElementById('s-linkedin-token').value = token;
    document.getElementById('btn-li-connect').textContent = '🔄 Reconnecter LinkedIn';
  } else {
    el.textContent = 'non connecté';
    el.style.color = 'var(--muted)';
  }
}

function openSettings() {
  document.getElementById('s-anthropic').value = localStorage.getItem('anthropic_key') || '';
  document.getElementById('s-notion-token').value = localStorage.getItem('notion_token') || '';
  document.getElementById('s-db-fondations').value = localStorage.getItem('db_fondations') || DB_FONDATIONS;
  document.getElementById('s-db-calendrier').value = localStorage.getItem('db_calendrier') || DB_CALENDRIER;
  document.getElementById('s-meta-token').value = localStorage.getItem('meta_token') || '';
  updateLinkedInStatus();
  updateYouTubeStatus();
  document.getElementById('settingsModal').classList.remove('hidden');
}
function closeSettings() { document.getElementById('settingsModal').classList.add('hidden'); }
function saveSettings() {
  localStorage.setItem('anthropic_key', document.getElementById('s-anthropic').value.trim());
  localStorage.setItem('notion_token', document.getElementById('s-notion-token').value.trim());
  localStorage.setItem('db_fondations', document.getElementById('s-db-fondations').value.trim());
  localStorage.setItem('db_calendrier', document.getElementById('s-db-calendrier').value.trim());
  localStorage.setItem('meta_token', document.getElementById('s-meta-token').value.trim());
  const liToken = document.getElementById('s-linkedin-token').value.trim();
  if (liToken) localStorage.setItem('linkedin_token', liToken);
  closeSettings(); toast('✓ Configuration sauvegardée', 'success');
}

/* ════════════════════════════════
   STRATÉGIE
════════════════════════════════ */
let selectedType = 'service';
let selectedRythme = 5;
let planningData = [];

function selectType(type) {
  selectedType = type;
  document.getElementById('type-service').classList.toggle('selected', type === 'service');
  document.getElementById('type-produit').classList.toggle('selected', type === 'produit');
  const cta = document.getElementById('s-cta');
  if (type === 'service') {
    cta.value = 'DM';
  } else {
    cta.value = 'lien bio';
  }
}

function selectRythme(n) {
  selectedRythme = n;
  [3,5,7].forEach(r => document.getElementById('rythme-' + r).classList.toggle('selected', r === n));
}

function selectOffreStrategie(id) {
  if (!id) return;
  const offre = offresCache.find(o => o.id === id);
  if (offre) selectedOffre = offre;
}

async function genererPlanning() {
  const apiKey = localStorage.getItem('anthropic_key');
  if (!apiKey) { toast('Clé API manquante', 'error'); return; }
  if (!selectedOffre) { toast('Sélectionne une offre', 'error'); return; }

  const prix = document.getElementById('s-prix').value;
  const cta  = document.getElementById('s-cta').value;

  setLoading('btn-planning', true, 'Génération du planning...');

  const jours = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
  const joursActifs = jours.slice(0, selectedRythme);

  const prompt = \`Tu es un stratège Instagram B2B expert en personal branding (inspiré de Lara Acosta et Matis Clouet).

OFFRE : "\${selectedOffre.nom}"
TYPE : \${selectedType} \${prix ? \`à \${prix}€\` : ''}
CTA PRINCIPAL : "\${cta}"
PROBLÈME : \${selectedOffre.probleme}
AVATAR : \${selectedOffre.avatar}
CROYANCES À CONSTRUIRE : \${selectedOffre.croyances}

Génère un planning de \${selectedRythme} Reels Instagram pour la semaine.
Règle : 80% valeur/éducation, 20% conversion. Jamais de vente directe sauf dernier post.
Chaque Reel doit cibler une croyance différente et avancer dans le tunnel.

Réponds en JSON UNIQUEMENT :
{
  "planning": [
    {
      "jour": "Lundi",
      "titre": "titre accrocheur du Reel (max 80 car.)",
      "objectif": "Attirer" | "Éduquer" | "Prouver" | "Convertir",
      "croyance": "croyance ciblée",
      "hook": "les 3 premières secondes du Reel (accroche orale percutante)",
      "angle": "angle marketing utilisé",
      "cta": "appel à l'action de ce Reel spécifique"
    }
  ]
}\`;

  try {
    const raw = await callClaude(prompt);
    const json = JSON.parse(raw.match(/\\{[\\s\\S]*\\}/)[0]);
    planningData = json.planning;
    afficherPlanning(planningData);
    toast('✓ Planning généré', 'success');
  } catch(e) {
    toast('Erreur : ' + e.message, 'error');
  } finally {
    setLoading('btn-planning', false, '📅 Générer le planning de la semaine');
  }
}

function afficherPlanning(planning) {
  document.getElementById('planning-results').style.display = 'block';

  // Tunnel bar
  const couleurs = { 'Attirer': 'var(--red)', 'Éduquer': 'var(--orange)', 'Prouver': 'var(--blue)', 'Convertir': 'var(--green)' };
  const bar = document.getElementById('tunnel-bar');
  bar.innerHTML = planning.map(p => \`<div class="tunnel-segment" style="background:\${couleurs[p.objectif] || 'var(--purple)'}"></div>\`).join('');

  // Planning cards
  const grid = document.getElementById('planning-grid');
  const semaine = document.getElementById('s-semaine').value;
  const dateBase = semaine ? new Date(semaine) : new Date();

  grid.innerHTML = planning.map((p, i) => {
    const d = new Date(dateBase);
    d.setDate(d.getDate() + i);
    const dayName = d.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase();
    const dayNum  = d.getDate();
    const couleur = couleurs[p.objectif] || 'var(--purple)';

    return \`
    <div class="planning-card">
      <div class="planning-day">
        <div class="day-name">\${p.jour?.substring(0,3).toUpperCase() || dayName}</div>
        <div class="day-num" style="color:\${couleur}">\${dayNum}</div>
      </div>
      <div class="planning-content">
        <h4>\${p.titre}</h4>
        <p>🎯 <strong>\${p.croyance}</strong></p>
        <p>🎬 Hook : <em>"\${p.hook}"</em></p>
        <p>📣 CTA : \${p.cta}</p>
      </div>
      <div class="planning-badge">
        <span class="badge" style="background:\${couleur}22;color:\${couleur}">\${p.objectif}</span>
      </div>
    </div>\`;
  }).join('');

  document.getElementById('planning-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function savePlanning() {
  const token = localStorage.getItem('notion_token');
  const dbId  = (localStorage.getItem('db_calendrier') || DB_CALENDRIER).replace(/-/g,'');
  if (!token) { toast('Token Notion manquant', 'error'); return; }
  if (!planningData.length) { toast('Génère d\\'abord le planning', 'error'); return; }

  setLoading('btn-save-planning', true, 'Envoi dans Notion...');

  const semaine = document.getElementById('s-semaine').value;
  const dateBase = semaine ? new Date(semaine) : new Date();
  const croyancesMap = {
    'Attirer': 'Gravité du problème',
    'Éduquer': 'Inefficacité solutions existantes',
    'Prouver': 'Supériorité de la méthode',
    'Convertir': 'Urgence d\\'agir'
  };

  try {
    let success = 0;
    for (let i = 0; i < planningData.length; i++) {
      const p = planningData[i];
      const d = new Date(dateBase);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const croyance = croyancesMap[p.objectif] || 'Gravité du problème';

      const body = {
        parent: { database_id: dbId },
        properties: {
          'Titre du post':  { title: [{ text: { content: p.titre } }] },
          'Format':         { select: { name: 'Reel' } },
          'Plateforme':     { select: { name: 'Instagram' } },
          'Statut':         { select: { name: 'Idée' } },
          'Croyance ciblée':{ select: { name: croyance } },
          'Accroche':       { rich_text: [{ text: { content: p.hook } }] },
          'Date de publication': { date: { start: dateStr } },
        }
      };
      await notionPost('pages', body);
      success++;
    }
    toast(\`✓ \${success} Reels ajoutés dans Notion\`, 'success');
  } catch(e) {
    toast('Erreur Notion : ' + e.message, 'error');
  } finally {
    setLoading('btn-save-planning', false, '↗ Envoyer tout dans Notion');
  }
}

/* ════════════════════════════════
   CROYANCES
════════════════════════════════ */
function addCroyance() {
  const list = document.getElementById('croyances-list');
  const n = list.children.length + 1;
  const div = document.createElement('div'); div.className = 'croyance-item';
  div.innerHTML = \`<div class="croyance-num">\${n}</div><input type="text" placeholder="Nouvelle croyance..." />\`;
  list.appendChild(div);
}

function getCroyances() {
  return Array.from(document.querySelectorAll('#croyances-list input')).map(i => i.value).filter(v => v.trim());
}

async function suggestCroyances() {
  const probleme = document.getElementById('f-probleme').value;
  const offre = document.getElementById('f-nom').value;
  if (!probleme) { toast('Décris d\\'abord le problème', 'error'); return; }
  const apiKey = localStorage.getItem('anthropic_key');
  if (!apiKey) { toast('Clé API manquante', 'error'); return; }

  toast('Génération des croyances...', 'info');
  const prompt = \`Pour une offre "\${offre}" qui résout ce problème : "\${probleme}",
génère 5 croyances que l'audience doit avoir avant d'acheter (méthode Antoine BM).
Réponds en JSON uniquement : {"croyances": ["croyance1", "croyance2", "croyance3", "croyance4", "croyance5"]}\`;

  try {
    const data = await callClaude(prompt);
    const json = JSON.parse(data.match(/\\{[\\s\\S]*\\}/)[0]);
    const list = document.getElementById('croyances-list');
    list.innerHTML = '';
    json.croyances.forEach((c, i) => {
      const div = document.createElement('div'); div.className = 'croyance-item';
      div.innerHTML = \`<div class="croyance-num">\${i+1}</div><input type="text" value="\${c.replace(/"/g,'&quot;')}" />\`;
      list.appendChild(div);
    });
    toast('✓ Croyances générées', 'success');
  } catch(e) { toast('Erreur : ' + e.message, 'error'); }
}

async function suggestField(fieldId, type) {
  const apiKey = localStorage.getItem('anthropic_key');
  if (!apiKey) { toast('Clé API manquante', 'error'); return; }

  const offre = document.getElementById('f-nom').value;
  const probleme = document.getElementById('f-probleme').value;

  const prompts = {
    probleme: \`Pour une offre "\${offre}", génère une description précise du problème qu'elle résout (2-3 phrases, concrètes et percutantes). Réponds en JSON : {"suggestion": "..."}\`,
    avatar: \`Pour une offre "\${offre}" qui résout "\${probleme}", décris l'avatar client idéal de façon très précise (âge, poste, situation, frustrations, peurs). JSON : {"suggestion": "..."}\`,
    impact: \`Pour un avatar qui souffre de "\${probleme}", décris l'impact concret dans sa vie professionnelle et personnelle (3-4 points). JSON : {"suggestion": "..."}\`,
    solutions: \`Pour une offre "\${offre}", explique pourquoi les solutions traditionnelles sont inefficaces pour résoudre "\${probleme}" (2-3 raisons concrètes). JSON : {"suggestion": "..."}\`,
    superieure: \`Pour une offre "\${offre}", explique en quoi elle est supérieure aux alternatives existantes pour résoudre "\${probleme}" (3-4 points forts). JSON : {"suggestion": "..."}\`
  };

  toast('Génération en cours...', 'info');
  try {
    const data = await callClaude(prompts[type]);
    const json = JSON.parse(data.match(/\\{[\\s\\S]*\\}/)[0]);
    document.getElementById(fieldId).value = json.suggestion;
    toast('✓ Suggestion générée', 'success');
  } catch(e) { toast('Erreur : ' + e.message, 'error'); }
}

/* ════════════════════════════════
   SAVE FONDATIONS → NOTION
════════════════════════════════ */
async function saveFondations() {
  const token = localStorage.getItem('notion_token');
  const dbId = (localStorage.getItem('db_fondations') || DB_FONDATIONS).replace(/-/g,'');
  if (!token) { toast('Token Notion manquant', 'error'); return; }

  const nom = document.getElementById('f-nom').value.trim();
  if (!nom) { toast('Ajoute le nom de l\\'offre', 'error'); return; }

  setLoading('btn-save-fondations', true, 'Sauvegarde...');

  const croyances = getCroyances().map((c,i) => \`\${i+1}. \${c}\`).join('\\n');

  const body = {
    parent: { database_id: dbId },
    properties: {
      'Nom de l\\'offre':                   { title: [{ text: { content: nom } }] },
      'Problème principal':                 { rich_text: [{ text: { content: document.getElementById('f-probleme').value } }] },
      'Avatar client':                      { rich_text: [{ text: { content: document.getElementById('f-avatar').value } }] },
      'Impact dans la vie de l\\'avatar':    { rich_text: [{ text: { content: document.getElementById('f-impact').value } }] },
      'Solutions traditionnelles inefficaces': { rich_text: [{ text: { content: document.getElementById('f-solutions').value } }] },
      'Pourquoi ta solution est supérieure':{ rich_text: [{ text: { content: document.getElementById('f-superieure').value } }] },
      'Croyances à construire':             { rich_text: [{ text: { content: croyances } }] },
      'Statut offre':                       { select: { name: document.getElementById('f-statut').value } },
      'Plateforme cible':                   { select: { name: document.getElementById('f-plateforme').value } },
    }
  };

  try {
    await notionPost('pages', body);
    toast('✓ Fondations sauvegardées dans Notion', 'success');
    document.getElementById('c-offre-nom').value = nom;
    setTimeout(() => switchTab('contenu'), 1200);
  } catch(e) { toast('Erreur Notion : ' + e.message, 'error'); }
  finally { setLoading('btn-save-fondations', false, '↗ Sauvegarder dans Notion'); }
}

/* ════════════════════════════════
   GÉNÉRATION CONTENU
════════════════════════════════ */
async function generateContenu() {
  const apiKey = localStorage.getItem('anthropic_key');
  if (!apiKey) { toast('Clé API Anthropic manquante', 'error'); return; }

  let offre      = selectedOffre ? selectedOffre.nom : '';
  const croyance = document.getElementById('c-croyance').value;
  const format   = document.getElementById('c-format').value;
  const platform = document.getElementById('c-plateforme').value;
  const idee     = document.getElementById('c-idee').value;
  const contexte = document.getElementById('c-contexte').value;

  if (!offre) { toast('Sélectionne une offre dans le menu déroulant', 'error'); return; }

  setLoading('btn-generate', true, 'Génération en cours...');

  const croyanceInstr = croyance
    ? \`La croyance à construire dans ce post est : "\${croyance}".\`
    : \`Choisis la croyance la plus pertinente à construire parmi : Gravité du problème / Inefficacité solutions existantes / Supériorité de la méthode / Légitimité du formateur / Urgence d'agir. Indique-la dans "croyance".\`;

  const fondationsContext = selectedOffre ? \`
FONDATIONS DE L'OFFRE :
- Problème : \${selectedOffre.probleme}
- Avatar : \${selectedOffre.avatar}
- Impact : \${selectedOffre.impact}
- Solutions inefficaces : \${selectedOffre.solutions}
- Pourquoi supérieure : \${selectedOffre.superieure}
- Croyances à construire : \${selectedOffre.croyances}
\` : '';

  const prompt = \`Tu es un expert en personal branding B2B et content marketing.

⚠️ PARAMÈTRES DU POST (priorité absolue) :
- Plateforme : \${platform} (adapte le ton, la longueur et les codes de CETTE plateforme uniquement)
- Format : \${format}
\${idee ? \`- Angle / idée : \${idee}\` : ''}
\${contexte ? \`- Contexte : \${contexte}\` : ''}

OFFRE TRAVAILLÉE : "\${offre}"
\${fondationsContext}
\${croyanceInstr}

Génère une réponse JSON UNIQUEMENT :
{
  "croyance": "croyance ciblée",
  "titre": "titre accrocheur du post (max 80 caractères)",
  "accroches": [
    "Accroche 1 — percutante, hook fort, 2-3 lignes, finit par un emoji + invitation à lire",
    "Accroche 2 — angle factuel/chiffré",
    "Accroche 3 — angle personnel/vulnérable"
  ],
  "corps": "Corps complet 300-400 mots. Structuré, émojis pertinents, CTA fort en fin. Basé sur la méthode Antoine BM : éduquer sur la croyance, ne pas vendre le produit directement.",
  "script_flora": "\${format === 'Reel' ? 'Script vidéo complet : hook 3 secondes percutant, développement (30-45 sec), CTA final. Indiquer les pauses, le ton, les gestes clés.' : 'Brief de création pour FLORA : éléments visuels, textes à intégrer, structure des slides (si carrousel), ambiance.'}",
  "brief_visuel": "Instructions générales de mise en scène et d'ambiance visuelle pour ce format \${format}."
}\`;

  try {
    const raw = await callClaude(prompt);
    const json = JSON.parse(raw.match(/\\{[\\s\\S]*\\}/)[0]);
    generatedData = json;
    displayResults(json, format);
    toast('✦ Contenu généré', 'success');
  } catch(e) { toast('Erreur : ' + e.message, 'error'); }
  finally { setLoading('btn-generate', false, '✦ Générer le contenu'); }
}

function displayResults(data, format) {
  selectedHook = null;
  document.getElementById('contenu-results').style.display = 'block';

  // Accroches
  const grid = document.getElementById('hooks-grid'); grid.innerHTML = '';
  (data.accroches || []).forEach((h, i) => {
    const c = document.createElement('div'); c.className = 'hook-card'; c.onclick = () => selectHook(i);
    c.innerHTML = \`<div class="hook-num">Option \${i+1}</div><p>\${h.replace(/\\n/g,'<br>')}</p><div class="hook-check">✓</div>\`;
    grid.appendChild(c);
  });

  document.getElementById('r-corps').value  = data.corps || '';
  document.getElementById('r-flora').value  = data.script_flora || '';
  document.getElementById('r-brief').value  = data.brief_visuel || '';
  document.getElementById('r-titre').value  = data.titre || '';
  document.getElementById('r-format-badge').textContent = format;

  document.getElementById('contenu-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function selectHook(i) {
  selectedHook = i;
  document.querySelectorAll('.hook-card').forEach((c, j) => c.classList.toggle('selected', i === j));
}

/* ════════════════════════════════
   CHARGER FICHES DEPUIS NOTION
════════════════════════════════ */
let fichesCache = [];
let ficheSelectionnee = null;

async function loadFichesNotion() {
  const token = localStorage.getItem('notion_token');
  const dbId  = (localStorage.getItem('db_calendrier') || DB_CALENDRIER).replace(/-/g,'');
  if (!token) return;

  const select = document.getElementById('c-fiche-select');
  select.innerHTML = '<option value="">⏳ Chargement...</option>';

  try {
    const url = 'https://corsproxy.io/?' + encodeURIComponent(\`https://api.notion.com/v1/databases/\${dbId}/query\`);
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token, 'Notion-Version': '2022-06-28' },
      body: JSON.stringify({
        filter: { property: 'Statut', select: { equals: 'Idée' } },
        sorts: [{ property: 'Date de publication', direction: 'ascending' }]
      })
    });
    if (!resp.ok) throw new Error('Erreur Notion');
    const data = await resp.json();

    fichesCache = data.results.map(p => ({
      id: p.id,
      titre:     p.properties['Titre du post']?.title?.[0]?.plain_text || 'Sans titre',
      format:    p.properties['Format']?.select?.name || 'Reel',
      plateforme:p.properties['Plateforme']?.select?.name || 'Instagram',
      croyance:  p.properties['Croyance ciblée']?.select?.name || '',
      accroche:  p.properties['Accroche']?.rich_text?.[0]?.plain_text || '',
      corps:     p.properties['Corps du post']?.rich_text?.[0]?.plain_text || '',
      lienMedia: p.properties['Lien média']?.url || '',
      date:      p.properties['Date de publication']?.date?.start || '',
    }));

    select.innerHTML = '<option value="">— Sélectionne un Reel à compléter —</option>';
    fichesCache.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = \`🎬 \${f.date ? f.date + ' — ' : ''}\${f.titre}\`;
      select.appendChild(opt);
    });

    if (!fichesCache.length) {
      select.innerHTML = '<option value="">Aucun Reel en statut "Idée"</option>';
    }
  } catch(e) {
    select.innerHTML = '<option value="">⚠️ Erreur de chargement</option>';
  }
}

function chargerFiche(id) {
  if (!id) {
    ficheSelectionnee = null;
    document.getElementById('fiche-resume').style.display = 'none';
    return;
  }
  ficheSelectionnee = fichesCache.find(f => f.id === id);
  if (!ficheSelectionnee) return;

  // Pré-remplir les champs
  const croyanceMap = {
    'Gravité du problème': 'Gravité du problème',
    'Inefficacité solutions existantes': 'Inefficacité solutions existantes',
    'Supériorité de la méthode': 'Supériorité de la méthode',
    'Légitimité du formateur': 'Légitimité du formateur',
    "Urgence d'agir": "Urgence d'agir"
  };

  document.getElementById('c-format').value    = ficheSelectionnee.format;
  document.getElementById('c-plateforme').value = ficheSelectionnee.plateforme;
  if (ficheSelectionnee.croyance) {
    document.getElementById('c-croyance').value = croyanceMap[ficheSelectionnee.croyance] || '';
  }
  if (ficheSelectionnee.accroche) {
    document.getElementById('c-idee').value = ficheSelectionnee.accroche;
  }
  if (ficheSelectionnee.date) {
    document.getElementById('r-date').value = ficheSelectionnee.date;
  }
  document.getElementById('r-titre').value = ficheSelectionnee.titre;

  // Afficher résumé
  const resume = document.getElementById('fiche-resume');
  resume.style.display = 'block';
  resume.innerHTML = \`
    <strong style="color:var(--text)">🎬 \${ficheSelectionnee.titre}</strong><br>
    📅 Date : \${ficheSelectionnee.date || 'non définie'} &nbsp;|&nbsp;
    🎯 Croyance : \${ficheSelectionnee.croyance || 'à définir'}<br>
    🎬 Hook : <em>\${ficheSelectionnee.accroche || 'à générer'}</em><br>
    <span style="color:var(--green);font-size:.75rem;">✓ Fiche chargée — clique sur Générer le contenu</span>
  \`;

  toast(\`Fiche "\${ficheSelectionnee.titre}" chargée\`, 'success');
}

/* ════════════════════════════════
   SAVE CONTENU → NOTION
════════════════════════════════ */
async function saveContenu() {
  const token = localStorage.getItem('notion_token');
  const dbId = (localStorage.getItem('db_calendrier') || DB_CALENDRIER).replace(/-/g,'');
  if (!token) { toast('Token Notion manquant', 'error'); return; }
  if (!generatedData) { toast('Génère d\\'abord le contenu', 'error'); return; }

  const titre = document.getElementById('r-titre').value.trim();
  if (!titre) { toast('Ajoute un titre', 'error'); return; }

  const accroche = selectedHook !== null
    ? (generatedData.accroches[selectedHook] || '')
    : (generatedData.accroches[0] || '');

  setLoading('btn-save-contenu', true, 'Enregistrement...');

  const body = {
    parent: { database_id: dbId },
    properties: {
      'Titre du post': { title: [{ text: { content: titre } }] },
      'Accroche':      { rich_text: [{ text: { content: accroche } }] },
      'Corps du post': { rich_text: [{ text: { content: document.getElementById('r-corps').value.substring(0, 2000) } }] },
      'Script FLORA':  { rich_text: [{ text: { content: document.getElementById('r-flora').value.substring(0, 2000) } }] },
      'Brief visuel':  { rich_text: [{ text: { content: document.getElementById('r-brief').value } }] },
      'Format':        { select: { name: document.getElementById('c-format').value } },
      'Plateforme':    { select: { name: document.getElementById('c-plateforme').value } },
      'Statut':        { select: { name: document.getElementById('r-statut').value } },
    }
  };

  const croyance = document.getElementById('c-croyance').value || generatedData.croyance;
  if (croyance) body.properties['Croyance ciblée'] = { select: { name: croyance } };

  const date = document.getElementById('r-date').value;
  if (date) body.properties['Date de publication'] = { date: { start: date } };

  try {
    let page;
    if (ficheSelectionnee) {
      // PATCH — mise à jour de la fiche existante
      page = await notionPatch('pages/' + ficheSelectionnee.id.replace(/-/g,''), { properties: body.properties });
      toast('✓ Fiche mise à jour dans Notion', 'success');
      document.getElementById('p-page-id').value = ficheSelectionnee.id;
    } else {
      // POST — nouvelle fiche
      page = await notionPost('pages', body);
      toast('✓ Contenu enregistré dans Notion', 'success');
      if (page.id) document.getElementById('p-page-id').value = page.id;
    }
    document.getElementById('p-titre').value = titre;
    ficheSelectionnee = null;
    setTimeout(() => switchTab('publication'), 1200);
  } catch(e) { toast('Erreur Notion : ' + e.message, 'error'); }
  finally { setLoading('btn-save-contenu', false, '↗ Enregistrer dans Notion'); }
}

/* ════════════════════════════════
   PUBLICATION
════════════════════════════════ */
async function publishPost() {
  const token   = localStorage.getItem('notion_token');
  const pageId  = document.getElementById('p-page-id').value.trim().replace(/-/g,'');
  const mediaUrl = document.getElementById('p-media-url').value.trim();
  const statut  = document.getElementById('p-statut').value;
  const date    = document.getElementById('p-date').value;
  const plateforme = document.getElementById('p-plateforme').value;

  if (!token) { toast('Token Notion manquant', 'error'); return; }
  if (!pageId) { toast('Colle l\\'ID de la page Notion', 'error'); return; }

  setLoading('btn-publish', true, 'Mise à jour...');

  const props = {
    'Statut':    { select: { name: statut } },
    'Plateforme':{ select: { name: plateforme } },
  };
  if (date) props['Date de publication'] = { date: { start: date } };
  if (mediaUrl) props['Lien média'] = { url: mediaUrl };

  const body = { properties: props };
  if (mediaUrl) body.cover = { type: 'external', external: { url: mediaUrl } };

  try {
    await notionPatch('pages/' + pageId, body);
    toast('✓ Post mis à jour dans Notion', 'success');
  } catch(e) { toast('Erreur Notion : ' + e.message, 'error'); }
  finally { setLoading('btn-publish', false, '↗ Mettre à jour dans Notion'); }
}

/* ════════════════════════════════
   INSTAGRAM DIRECT PUBLISH
════════════════════════════════ */
async function publishToInstagram() {
  const metaToken = localStorage.getItem('meta_token');
  const mediaUrl  = document.getElementById('p-media-url').value.trim();
  const notionId  = document.getElementById('p-page-id').value.trim().replace(/-/g,'');

  if (!metaToken) { toast('Token Meta manquant — configure dans ⚙️', 'error'); return; }
  if (!mediaUrl)  { toast('URL du média requise (Drive, Dropbox...)', 'error'); return; }

  // Construire la légende depuis la fiche sélectionnée ou les champs libres
  let caption = '';
  if (ficheSelectionnee) {
    caption = (ficheSelectionnee.accroche || '') + (ficheSelectionnee.corps ? '\\n\\n' + ficheSelectionnee.corps : '');
  }
  if (!caption) caption = 'Post publié via Système Editorial IA';

  setLoading('btn-instagram', true, 'Publication en cours...');

  try {
    let igId = null;

    // 1. Essayer Instagram Professional Login (token IGQ...)
    const igMeResp = await fetch(\`https://graph.instagram.com/v19.0/me?fields=id,username&access_token=\${metaToken}\`);
    const igMeData = await igMeResp.json();

    if (!igMeData.error) {
      // Token Instagram valide ✅
      igId = igMeData.id;
    } else {
      // Fallback : essayer via Facebook Graph API (token EAA... + Page liée à Instagram)
      const fbMeResp = await fetch(\`https://graph.facebook.com/v19.0/me/accounts?fields=id,name,instagram_business_account&access_token=\${metaToken}\`);
      const fbMeData = await fbMeResp.json();
      const pageWithIg = fbMeData.data?.find(p => p.instagram_business_account);
      if (pageWithIg) {
        igId = pageWithIg.instagram_business_account.id;
      } else {
        throw new Error(
          'Token invalide ou sans accès Instagram.\\n\\n' +
          '→ Dans ton app Meta → Instagram → "Générer un token" (commence par IGQ...)\\n' +
          '→ Ce n\\'est PAS le User Token Facebook (EAA...)'
        );
      }
    }
    if (!igId) throw new Error('Impossible de récupérer l\\'ID Instagram.');

    // API base + proxy CORS pour les requêtes POST depuis le navigateur
    const apiBase = 'https://graph.instagram.com/v19.0';
    const proxy   = 'https://corsproxy.io/?url=';

    // 2. Créer le conteneur média Instagram
    const containerResp = await fetch(proxy + encodeURIComponent(\`\${apiBase}/\${igId}/media\`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: mediaUrl, caption, access_token: metaToken })
    });
    const containerData = await containerResp.json();
    if (containerData.error) throw new Error('Erreur média : ' + containerData.error.message);

    // 3. Attendre 2s puis publier le conteneur
    await new Promise(r => setTimeout(r, 2000));
    const publishResp = await fetch(proxy + encodeURIComponent(\`\${apiBase}/\${igId}/media_publish\`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: containerData.id, access_token: metaToken })
    });
    const publishData = await publishResp.json();
    if (publishData.error) throw new Error('Erreur publication : ' + publishData.error.message);

    // 5. Mettre à jour Notion → "Publié"
    if (notionId) {
      await notionPatch('pages/' + notionId, {
        properties: { 'Statut': { select: { name: 'Publié' } } }
      });
    }

    toast('✅ Publié sur Instagram !', 'success');

  } catch(e) {
    toast('Erreur : ' + e.message, 'error');
  } finally {
    setLoading('btn-instagram', false, '📸 Publier sur Instagram');
  }
}

/* ════════════════════════════════
   LINKEDIN PUBLICATION
════════════════════════════════ */
async function publishToLinkedIn() {
  const token = localStorage.getItem('linkedin_token');
  if (!token) {
    toast('LinkedIn non connecté — ouvre ⚙️ Config et clique "Connecter LinkedIn"', 'error');
    return;
  }

  let caption = '';
  if (ficheSelectionnee) {
    caption = (ficheSelectionnee.accroche || '') + (ficheSelectionnee.corps ? '\\n\\n' + ficheSelectionnee.corps : '');
  }
  if (!caption) caption = 'Post publié via Système Editorial IA';

  const notionId = document.getElementById('p-page-id').value.trim().replace(/-/g,'');
  const mediaUrl = document.getElementById('p-media-url').value.trim();
  const proxy    = 'https://corsproxy.io/?url=';

  setLoading('btn-linkedin', true, 'Publication LinkedIn...');

  try {
    // 1. Récupérer l'ID du membre LinkedIn
    const meResp = await fetch(proxy + encodeURIComponent('https://api.linkedin.com/v2/userinfo'), {
      headers: { Authorization: \`Bearer \${token}\` }
    });
    const meData = await meResp.json();
    if (!meData.sub) throw new Error('Token LinkedIn invalide ou expiré. Reconnecte-toi dans ⚙️ Config.');
    const urn = \`urn:li:person:\${meData.sub}\`;

    let shareBody;

    if (mediaUrl) {
      // Avec image : 3 étapes
      // Étape A — Enregistrer l'upload
      const regResp = await fetch(proxy + encodeURIComponent('https://api.linkedin.com/v2/assets?action=registerUpload'), {
        method: 'POST',
        headers: { Authorization: \`Bearer \${token}\`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            owner: urn,
            serviceRelationships: [{ relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' }]
          }
        })
      });
      const regData = await regResp.json();
      const uploadUrl = regData.value?.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']?.uploadUrl;
      const asset     = regData.value?.asset;

      if (!uploadUrl || !asset) throw new Error('Erreur enregistrement image LinkedIn');

      // Étape B — Uploader l'image depuis l'URL publique
      const imgResp   = await fetch(mediaUrl);
      const imgBlob   = await imgResp.blob();
      await fetch(proxy + encodeURIComponent(uploadUrl), {
        method: 'PUT',
        headers: { Authorization: \`Bearer \${token}\`, 'Content-Type': imgBlob.type || 'image/jpeg' },
        body: imgBlob
      });

      shareBody = {
        author: urn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: caption },
            shareMediaCategory: 'IMAGE',
            media: [{ status: 'READY', description: { text: '' }, media: asset, title: { text: '' } }]
          }
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
      };
    } else {
      // Post texte seul
      shareBody = {
        author: urn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: caption },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
      };
    }

    // Publier
    const postResp = await fetch(proxy + encodeURIComponent('https://api.linkedin.com/v2/ugcPosts'), {
      method: 'POST',
      headers: { Authorization: \`Bearer \${token}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify(shareBody)
    });
    const postData = await postResp.json();
    if (postData.status >= 400 || postData.message) throw new Error(postData.message || JSON.stringify(postData));

    // Mettre à jour Notion
    if (notionId) {
      await notionPatch('pages/' + notionId, {
        properties: { 'Statut': { select: { name: 'Publié' } } }
      });
    }

    toast('✅ Publié sur LinkedIn !', 'success');

  } catch(e) {
    toast('Erreur LinkedIn : ' + e.message, 'error');
  } finally {
    setLoading('btn-linkedin', false, '💼 LinkedIn');
  }
}

/* ════════════════════════════════
   HELPERS
════════════════════════════════ */
async function callClaude(prompt) {
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
  if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error?.message || \`Erreur \${resp.status}\`); }
  const data = await resp.json();
  return data.content[0].text.trim();
}

async function notionPost(endpoint, body) {
  const token = localStorage.getItem('notion_token');
  const url = 'https://corsproxy.io/?' + encodeURIComponent(\`https://api.notion.com/v1/\${endpoint}\`);
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token, 'Notion-Version': '2022-06-28' },
    body: JSON.stringify(body)
  });
  if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.message || \`Erreur \${resp.status}\`); }
  return resp.json();
}

async function notionPatch(endpoint, body) {
  const token = localStorage.getItem('notion_token');
  const url = 'https://corsproxy.io/?' + encodeURIComponent(\`https://api.notion.com/v1/\${endpoint}\`);
  const resp = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token, 'Notion-Version': '2022-06-28' },
    body: JSON.stringify(body)
  });
  if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.message || \`Erreur \${resp.status}\`); }
  return resp.json();
}

function setLoading(id, loading, text) {
  const btn = document.getElementById(id); if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading ? \`<div class="spinner"></div> \${text}\` : text;
}

function copyEl(id) {
  navigator.clipboard.writeText(document.getElementById(id).value).then(() => toast('Copié !', 'success'));
}

function toast(msg, type = 'info') {
  const c = document.getElementById('toasts');
  const el = document.createElement('div'); el.className = \`toast \${type}\`;
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  el.innerHTML = \`<span>\${icon}</span><span>\${msg}</span>\`;
  c.appendChild(el);
  setTimeout(() => { el.style.animation = 'fadeOut .3s ease forwards'; setTimeout(() => el.remove(), 300); }, 3500);
}

function dragOver(e) { e.preventDefault(); e.currentTarget.classList.add('dragover'); }
function dragLeave(e) { e.currentTarget.classList.remove('dragover'); }
function dropFile(e, imgId, urlId) {
  e.preventDefault(); e.currentTarget.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) previewFile(file, imgId, urlId);
}
function fileSelect(e, imgId, urlId) {
  const file = e.target.files[0]; if (file) previewFile(file, imgId, urlId);
}
function previewFile(file, imgId, urlId) {
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = e => { const img = document.getElementById(imgId); img.src = e.target.result; img.classList.add('show'); };
    reader.readAsDataURL(file);
  }
  toast('Média chargé — ajoute l\\'URL hébergée pour Notion', 'info');
}
`}</Script>
    </>
  )
}
