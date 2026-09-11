#!/usr/bin/env python3
"""Vérifie le contenu de data/standings.json"""

import json
from pathlib import Path

STANDINGS_FILE = Path("data/standings.json")

if not STANDINGS_FILE.exists():
    print(f"❌ {STANDINGS_FILE} introuvable")
    exit(1)

with open(STANDINGS_FILE, "r", encoding="utf-8-sig") as f:
    standings = json.load(f)

print(f"✅ {len(standings)} saisons trouvées :")
print()
for season_num in sorted(standings.keys(), key=lambda x: int(x)):
    s = standings[season_num]
    name = s.get("name", "?")
    divisions = s.get("divisions", [])
    total_players = sum(len(d.get("standings", [])) for d in divisions)
    print(f"  {name} → {len(divisions)} divisions, {total_players} entrées")

print()
print("Détail des divisions :")
for season_num in sorted(standings.keys(), key=lambda x: int(x)):
    s = standings[season_num]
    div_names = [d.get("name", "?") for d in s.get("divisions", [])]
    print(f"  {s.get('name')} : {', '.join(div_names)}")