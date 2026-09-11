#!/usr/bin/env python3
"""
WoVP Stats — Import des images de tables depuis vpsdb.json
============================================================
Télécharge vpsdb.json (VPX Spreadsheet) et match les tables
de notre base avec les noms VPX pour récupérer les images.

Usage :
    python import_images.py
"""

import json
import re
import unicodedata
import urllib.request
import urllib.parse
from pathlib import Path

# ---------- Config ----------
VPSDB_URL = "https://virtualpinballspreadsheet.github.io/vps-db/db/vpsdb.json"
VPSDB_CACHE = Path("data/_vpsdb.json")
CHALLENGES_FILE = Path("data/challenges.json")
IMAGES_OUT = Path("data/table-images.json")

# Suffixes/versions à retirer du nom pour faciliter le matching
VERSION_SUFFIXES = [
    r"\bpremium\b", r"\blimited edition\b", r"\ble\b", r"\bpro\b",
    r"\bluci\b", r"\bremake\b", r"\bspecial edition\b", r"\bse\b",
    r"\bdeluxe\b", r"\bcollector'?s edition\b", r"\bce\b",
    r"\bmod\b", r"\breskin\b", r"\bvpx\b", r"\bvp9\b", r"\bvpw\b",
    r"\bfizx\b", r"\bbw\b", r"\bblack and white\b", r"\bred\b",
]


# ---------- Helpers ----------
def normalize(s):
    """Normalise un nom pour comparaison."""
    if not s:
        return ""
    # Minuscules
    s = s.lower()
    # Enlève les accents
    s = "".join(
        c for c in unicodedata.normalize("NFD", s)
        if unicodedata.category(c) != "Mn"
    )
    # Enlève le contenu entre parenthèses
    s = re.sub(r"\([^)]*\)", " ", s)
    s = re.sub(r"\[[^\]]*\]", " ", s)
    # Enlève les suffixes de version
    for pat in VERSION_SUFFIXES:
        s = re.sub(pat, " ", s)
    # Remplace tout ce qui n'est pas alphanumérique par un espace
    s = re.sub(r"[^a-z0-9]+", " ", s)
    # Réduit les espaces multiples
    s = re.sub(r"\s+", " ", s).strip()
    return s


def extract_manufacturer_year(name):
    """Extrait (fabricant, annee) depuis un nom type 'AC/DC (Stern 2013)'."""
    m = re.search(r"\(([^)]+)\)", name)
    if not m:
        return None, None
    content = m.group(1)
    year_match = re.search(r"\b(19|20)\d{2}\b", content)
    year = int(year_match.group(0)) if year_match else None
    manufacturer = content
    if year_match:
        manufacturer = content[:year_match.start()].strip()
    return manufacturer.strip() or None, year


def download_vpsdb():
    """Télécharge vpsdb.json (ou utilise le cache)."""
    if VPSDB_CACHE.exists():
        print(f"📦 Utilisation du cache : {VPSDB_CACHE}")
        size_mb = VPSDB_CACHE.stat().st_size / (1024 * 1024)
        print(f"   ({size_mb:.1f} Mo)")
    else:
        print(f"⬇️  Téléchargement de vpsdb.json...")
        print(f"   {VPSDB_URL}")
        with urllib.request.urlopen(VPSDB_URL) as response:
            data = response.read()
        VPSDB_CACHE.parent.mkdir(exist_ok=True)
        with open(VPSDB_CACHE, "wb") as f:
            f.write(data)
        size_mb = len(data) / (1024 * 1024)
        print(f"   ✅ Téléchargé ({size_mb:.1f} Mo)")

    print(f"   Lecture du JSON...")
    with open(VPSDB_CACHE, "r", encoding="utf-8") as f:
        vpsdb = json.load(f)
    print(f"   ✅ {len(vpsdb)} tables dans vpsdb")
    return vpsdb


def build_vpsdb_index(vpsdb):
    """
    Construit un index {nom_normalise: [entry, entry, ...]}
    pour recherche rapide.
    """
    index = {}
    for entry in vpsdb:
        name = entry.get("name")
        if not name:
            continue
        key = normalize(name)
        if not key:
            continue
        index.setdefault(key, []).append(entry)
    return index


def find_image(entry):
    """Récupère la meilleure image d'une entrée vpsdb."""
    # Priorité 1 : imgUrl directement sur l'entrée
    if entry.get("imgUrl"):
        return entry["imgUrl"]
    # Priorité 2 : première imgUrl des tableFiles
    for tf in entry.get("tableFiles", []):
        if tf.get("imgUrl"):
            return tf["imgUrl"]
    # Priorité 3 : première imgUrl des b2sFiles
    for b2s in entry.get("b2sFiles", []):
        if b2s.get("imgUrl"):
            return b2s["imgUrl"]
    return None


def match_table(table_name, manufacturer, year, index):
    """
    Cherche la meilleure correspondance dans vpsdb.
    Retourne (entry, score) ou (None, 0).
    """
    key = normalize(table_name)
    if not key:
        return None, 0

    candidates = []

    # 1. Match exact sur nom normalisé
    if key in index:
        candidates = index[key]
    else:
        # 2. Match partiel : on cherche les clés qui contiennent ou sont contenues
        for vps_key, entries in index.items():
            if key == vps_key:
                candidates.extend(entries)
            elif key in vps_key or vps_key in key:
                candidates.extend(entries)

    if not candidates:
        return None, 0

    # Scoring
    scored = []
    for entry in candidates:
        score = 0
        vps_name = normalize(entry.get("name", ""))
        vps_mfg = (entry.get("manufacturer") or "").lower()
        vps_year = entry.get("year")

        # Nom identique
        if vps_name == key:
            score += 100
        elif key in vps_name or vps_name in key:
            score += 50

        # Fabricant
        if manufacturer and vps_mfg:
            mfg_lower = manufacturer.lower()
            # Match approximatif (le fabricant peut s'écrire "Williams" ou "Williams Electronics")
            if mfg_lower in vps_mfg or vps_mfg in mfg_lower:
                score += 30

        # Année
        if year and vps_year:
            if abs(vps_year - year) <= 1:
                score += 20
            elif abs(vps_year - year) <= 2:
                score += 10

        # Bonus si imgUrl présent
        if find_image(entry):
            score += 5

        scored.append((entry, score))

    scored.sort(key=lambda x: -x[1])
    return scored[0]


def main():
    print("═" * 60)
    print("  WoVP Stats — Import des images de tables")
    print("═" * 60)

    # 1. Charge les challenges
    with open(CHALLENGES_FILE, "r", encoding="utf-8") as f:
        challenges = json.load(f)

    tables = sorted(set(c["table"] for c in challenges if c.get("table")))
    print(f"\n📋 {len(tables)} tables distinctes à matcher")

    # 2. Télécharge vpsdb
    vpsdb = download_vpsdb()

    # 3. Construit l'index
    print(f"\n🔨 Construction de l'index...")
    index = build_vpsdb_index(vpsdb)
    print(f"   {len(index)} noms normalisés uniques")

    # 4. Match
    print(f"\n🔍 Matching...")
    results = {}
    matched = 0
    not_found = []
    no_image = []

    for table in tables:
        manufacturer, year = extract_manufacturer_year(table)
        entry, score = match_table(table, manufacturer, year, index)

        if not entry:
            not_found.append(table)
            continue

        img = find_image(entry)
        if not img:
            no_image.append((table, entry.get("name")))
            continue

        results[table] = {
            "imgUrl": img,
            "vpsName": entry.get("name"),
            "vpsId": entry.get("id"),
            "score": score,
        }
        matched += 1

    # 5. Écrit
    IMAGES_OUT.parent.mkdir(exist_ok=True)
    with open(IMAGES_OUT, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    # 6. Rapport
    print(f"\n" + "═" * 60)
    print(f"  ✅ Matching terminé")
    print(f"═" * 60)
    print(f"  Tables totales         : {len(tables)}")
    print(f"  ✅ Matchées avec image : {matched}")
    print(f"  ⚠️  Matchées sans image: {len(no_image)}")
    print(f"  ❌ Non trouvées        : {len(not_found)}")
    print(f"\n  📄 Écrit dans {IMAGES_OUT}")
    print(f"\n  Recharge le site pour voir les images.")

    # 7. Détail (premiers cas)
    if no_image:
        print(f"\n  ⚠️  Matchées sans image (10 premiers) :")
        for table, vps_name in no_image[:10]:
            print(f"     {table}")
            print(f"       → vpsdb: {vps_name}")

    if not_found:
        print(f"\n  ❌ Non trouvées (20 premières) :")
        for table in not_found[:20]:
            print(f"     {table}")
        if len(not_found) > 20:
            print(f"     ... et {len(not_found) - 20} autres")

    print()


if __name__ == "__main__":
    main()