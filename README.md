# MOHAMED SADEK — عقل بيتحرك (A MIND IN MOTION)

Arabic-first cinematic experience: personal OS × interactive documentary × mind map. Zero dependencies (vanilla JS + CSS + SVG + lightweight canvas).

Digital self-portrait × personal intelligence system × personal operating map × living personal OS.

**Metaphor: a constellation inside an operating-system shell.** Chosen because it fuses the story (atlas/map of a mind) with the working system (OS shell: sidebar, command menu, dashboard) and the core visualization (knowledge graph = "how Mohamed thinks"). Archive/museum/lab appear only as light accents.

## Philosophy — the three content categories

Every item carries `kind`: **confirmed** (he said/built it) · **interpretation** (labeled pattern, editable, never diagnosis) · **aspiration** (direction, never shown as achieved). Global filter in the sidebar. No invented facts, no diagnoses, nothing private in the public bundle.

## Run

Needs a local server (fetch-based data layer):

```
node server.js        # → http://localhost:8080
```

No install, no build, no dependencies. Any static server works (`npx serve .`).

## Structure

```
index.html  css/styles.css  js/app.js  server.js
data/*.json          ← PUBLIC layer (committed; edit here)
data-private/        ← gitignored local overrides (see .example.json)
```

## Update content (data change only — no rebuild)

| What | Where |
|---|---|
| Personal info, facts | `data/profile.json` |
| Add/edit a project | `data/projects.json` (copy an entry; fields: name, lifecycle, classification, state, why/what/learned/reveals/…) |
| Skill states | click the skill in BUILDER, or `data/skills.json` |
| Rules | click CONFIRM in SYSTEM, or `data/operating-system.json` |
| Ideas | Idea Vault in WORK, or `data/ideas.json` |
| Reflections/snapshots | REFLECTION (browser-local) |
| Daily reviews (DAY) | browser-local only (`msa:v1` → `days`), export MD/JSON; never in `/data/` |
| Open questions | `data/open-questions.json` |
| Design tokens | `data/tokens.json` (mirrored in CSS `:root`) |

## In-browser editing & backup

Rules, skill states, vault, loops, decisions, snapshots, votes, rankings, tool verdicts → `localStorage` (`msa:v1`). **Export JSON regularly** (SYSTEM → Export) — losing months of reflections is the main risk. Import restores. Reset clears.

## Privacy architecture

- Public build ships **only PUBLIC items** (`server.js` blocks `/data-private/` over HTTP).
- PRIVATE/PERSONAL entries live in `localStorage`/gitignored files only.
- Private-mode lock = **convenience, not real security** (labeled in UI).
- No analytics, no APIs, no private data leaves the browser.

## Known limitations

- No real screenshots yet — honest placeholder frames everywhere imagery is missing.
- Statuses/dates for NEXORA, SHE, ROLLZ, DELTA LIGHT unconfirmed → see REFLECTION → Open questions.
- Name spelling default "Sadek" (flagged, editable).
- Light mode intentionally absent (dark is the identity).
- This is a self-observation tool, not a diagnostic or treatment tool.

## Working rules applied (Part C)

Seeded as data: lessons (C5), learning stack (C6/learning-priority), anti-goals (C8), mantras (footer/empty states), tool template (Why-this-tool log). Applied as behavior: honest pushback in report §7, no inflated claims, simpler path chosen (zero-dep static over framework).
