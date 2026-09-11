markdown
# WoVP Stats

Community statistics website for **World of Virtual Pinball** — the Weekly High Score Challenge.

> Player profiles, head-to-head comparisons, table history, country rankings, season standings and records.

---

## What it does

WoVP Stats is a **read-only** companion site to the main WoVP platform. It does **not** show live results or duplicate what the main site already provides. Instead it focuses on **history, trends, and comparisons**:

- **Player profiles** — career, seasons, specialties, nemesis, recent results
- **Head-to-Head** — compare two players on their common challenges
- **Tables** — full history, multi-occurrence evolution, all-time leaderboards
- **Seasons** — season by season breakdown
- **Countries** — statistics per country
- **Hall of Fame** — all-time records

---

## Architecture

The site is **completely static** — no backend, no database, no server-side code.
wovp-stats/
├── index.html ← page shell (empty structure, no data)
├── assets/
│ ├── app.js ← all rendering logic
│ └── style.css ← all styling
└── data/
├── players.json ← players → {country, contributor}
├── challenges.json ← challenges → {id, table, season, week, date, ...}
├── results.json ← every result: {challengeId, position, playerName, score}
└── standings.json ← season standings (divisions: ELITE/PRO/CHALLENGER/OPEN)

text

The HTML is a **shell**. It loads the CSS, then the JS. The JS fetches the 4 JSON files and renders everything in the browser.

**Updating data = replacing JSON files.** The code never changes.

---

## Run locally

### Option 1 — VS Code + Live Server (recommended)

1. Install [VS Code](https://code.visualstudio.com/)
2. Install the extension **Live Server** (Ritwick Dey)
3. Right-click `index.html` → **Open with Live Server**
4. Browser opens at `http://127.0.0.1:5500`

### Option 2 — Python

```bash
cd wovp-stats
python -m http.server 8000
Then open http://localhost:8000.

⚠️ You cannot just double-click index.html — modern browsers block fetch() from file:// for security reasons. You need a local server.

Deploy on GitHub Pages
Push the repo to GitHub

Go to Settings → Pages

Source: Deploy from a branch

Branch: main / Folder: / (root)

Save

The site will be live at https://<username>.github.io/wovp-stats/.

Updating data
Data is not hand-edited. It comes from the Data importer tool (not in this repo yet) which parses the raw challenge exports from WoVP and generates the 4 JSON files.

Workflow:

Import new challenges into the importer

Export the 4 JSON files

Drop them into data/

git commit && git push

Roadmap
See ROADMAP.md (coming soon) for the list of features to build.

Credits
World of Virtual Pinball — the platform: https://virtualpinballspreadsheet.github.io

Built for the WoVP community.