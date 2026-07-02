# Design System — House Lab

## Identite de marque

**Nom** : House Lab  
**Marque deposee** : HOUSE LAB™  
**Secteur** : Formation professionnelle en marketing digital & IA  
**Positionnement** : Outil pedagogique moderne, epure, professionnel

---

## Logo

### Monogramme HL
- Forme triangulaire stylisee integrant les lettres H et L
- Trait angulaire, dynamique, evoquant la progression et l'innovation
- Utilisation : favicon, icone d'app, avatar reseaux sociaux

### Logo complet
- Monogramme HL + typographie "HOUSE LAB™"
- Typographie : sans-serif bold/black (style Montserrat Black ou equivalent)
- Espacement genereux entre le monogramme et le texte

### Fichiers
```
/public/brand/hl-icon.png     → Monogramme seul (favicon, icone)
/public/brand/logo-light.png  → Logo complet sur fond blanc (texte noir)
/public/brand/logo-dark.png   → Logo complet sur fond noir (texte blanc)
```

### Regles d'utilisation
- Fond sombre (app) → utiliser `logo-dark.png` ou monogramme blanc
- Fond clair (docs, emails) → utiliser `logo-light.png` ou monogramme noir
- Ne jamais deformer, incliner ou modifier les proportions du logo
- Zone de protection : minimum 1x la hauteur du monogramme autour du logo

---

## Palette de couleurs

### Couleurs principales
| Nom | Hex | Usage |
|-----|-----|-------|
| Noir pur | `#000000` | Texte principal, logo fond clair |
| Blanc pur | `#FFFFFF` | Texte sur fond sombre, logo fond sombre |

### Couleurs de l'interface (mode sombre)
| Nom | Variable CSS | Hex | Usage |
|-----|-------------|-----|-------|
| Background | `--bg` | `#09090b` | Fond principal de l'app |
| Surface | `--surface` | `#18181b` | Cartes, sections |
| Surface 2 | `--surface2` | `#27272a` | Inputs, zones secondaires |
| Border | `--border` | `#3f3f46` | Bordures, separateurs |
| Text | `--text` | `#f4f4f5` | Texte principal |
| Muted | `--muted` | `#a1a1aa` | Texte secondaire, labels |

### Couleurs fonctionnelles
| Nom | Variable CSS | Hex | Usage |
|-----|-------------|-----|-------|
| Accent | `--accent` | `#FFFFFF` | Boutons principaux, elements actifs |
| Success | `--green` | `#10b981` | Confirmations, statut actif |
| Warning | `--orange` | `#f59e0b` | Alertes, attention |
| Error | `--red` | `#ef4444` | Erreurs, suppressions |
| Info | `--blue` | `#3b82f6` | Information, liens |

### Couleurs plateformes (usage contextuel uniquement)
| Plateforme | Hex | Usage |
|-----------|-----|-------|
| Instagram | `#833ab4 → #fd1d1d → #fcb045` | Gradient bouton Instagram uniquement |
| LinkedIn | `#0077b5` | Bouton LinkedIn uniquement |
| YouTube | `#ff0000` | Bouton YouTube uniquement |

> **Regle** : les couleurs violet/purple (`#7c3aed`) de la version actuelle doivent etre remplacees par du blanc/gris pour s'aligner avec l'identite House Lab. Le violet n'est pas dans la charte.

---

## Typographie

### Famille principale
- **Primaire** : `Inter` ou `Montserrat` (sans-serif geometrique)
- **Fallback** : `system-ui, -apple-system, sans-serif`

### Hierarchie
| Element | Taille | Poids | Couleur |
|---------|--------|-------|---------|
| H1 (titre page) | 1.5rem | 800 (ExtraBold) | `--text` |
| H2 (section) | 1.1rem | 700 (Bold) | `--text` |
| Section label | 0.75rem | 700 | `--muted`, uppercase, letter-spacing 1px |
| Body | 0.9rem | 400 | `--text` |
| Small / caption | 0.8rem | 400 | `--muted` |
| Button | 0.85rem | 600 | `#000` sur fond blanc, `#FFF` sur fond sombre |

### Logo typographie
- "HOUSE LAB" : Sans-serif Black/ExtraBold, uppercase, tracking large
- "™" : Meme police, taille reduite (superscript)

---

## Composants UI

### Boutons
```css
/* Bouton principal — noir & blanc */
.btn-primary {
  background: #FFFFFF;
  color: #000000;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  padding: 10px 20px;
  transition: opacity 0.2s;
}
.btn-primary:hover {
  opacity: 0.9;
}

/* Bouton secondaire — outline */
.btn-outline {
  background: transparent;
  color: #FFFFFF;
  border: 1px solid #3f3f46;
  border-radius: 8px;
}
.btn-outline:hover {
  border-color: #FFFFFF;
}
```

### Cartes / Sections
- Background : `--surface` (#18181b)
- Border : 1px solid `--border` (#3f3f46)
- Border-radius : 12px
- Padding : 20px

### Inputs
- Background : `--surface2` (#27272a)
- Border : 1px solid `--border`
- Border-radius : 8px
- Focus : border-color `#FFFFFF`
- Texte : `--text`
- Placeholder : `--muted`

### Tabs (navigation)
- Inactif : `--muted`, pas de bordure
- Actif : `#FFFFFF`, bordure basse 2px `#FFFFFF`
- Hover : `--text`

### Toasts / Notifications
- Success : bordure gauche `--green`
- Error : bordure gauche `--red`
- Info : bordure gauche `--blue`
- Background : `--surface`

---

## Iconographie

### Style
- Pas d'emojis dans l'interface de production (reserves a la phase prototype)
- Utiliser des icones SVG lineaires (style Lucide, Phosphor ou similaire)
- Epaisseur de trait : 1.5px
- Couleur : `--muted` par defaut, `--text` au hover/actif

### Icones cles
| Fonction | Icone suggeree |
|----------|---------------|
| Settings | Gear / Cog |
| Retour | Arrow Left |
| Sauvegarder | Check |
| Generer IA | Sparkles / Wand |
| Copier | Copy / Clipboard |
| Rafraichir | Refresh CW |
| Publication | Send / Arrow Up Right |

---

## Layout

### Structure generale
```
┌─────────────────────────────────┐
│  Header : Logo HL + Nav        │  hauteur: 60px, bg: --bg
├─────────────────────────────────┤
│  Tabs : Fondations | Strategie │  bg: --surface, border-bottom
│         Contenu | Publication   │
├─────────────────────────────────┤
│                                 │
│  Contenu principal              │  max-width: 800px, center
│  padding: 28px                  │
│                                 │
├─────────────────────────────────┤
│  Toasts (bottom-right)          │
└─────────────────────────────────┘
```

### Responsive
- Desktop : max-width 800px, centre
- Tablette : padding reduit a 16px
- Mobile : tabs en scroll horizontal, inputs full-width

---

## Principes de design

1. **Minimalisme** — Noir, blanc, gris. Pas de couleur decorative. La couleur est reservee aux actions et aux statuts.
2. **Clarte** — Chaque element a un but. Pas de decoration superflue.
3. **Hierarchie** — Le contraste blanc/noir guide l'oeil vers les actions importantes.
4. **Coherence** — Memes espacements, memes radius, memes poids typographiques partout.
5. **Professionnalisme** — L'interface doit inspirer confiance, pas ressembler a un jouet.

---

## Migration depuis le prototype actuel

### Changements a appliquer
- [ ] Remplacer le violet (`#7c3aed`, `#a855f7`) par du blanc (`#FFFFFF`) pour les accents
- [ ] Remplacer l'icone `✦` du header par le monogramme HL (image)
- [ ] Remplacer les emojis de tabs par des icones SVG ou du texte simple
- [ ] Appliquer la typographie Inter/Montserrat
- [ ] Bouton principal : fond blanc, texte noir (au lieu de violet)
- [ ] Tab active : bordure blanche (au lieu de violette)
- [ ] Focus inputs : bordure blanche
- [ ] Ajouter le favicon HL
