#!/usr/bin/env python3
"""
WoVP Stats — Import d'un challenge archivé
=============================================
Lit le texte du presse-papiers (copié depuis WoVP), parse le challenge,
et l'ajoute dans data/challenges.json, data/results.json et data/players.json.

Fonctionne pour :
  - Challenges de saison (avec "Season X, Week #Y")
  - Tournois (sans saison)

Usage :
    1. Copier le texte du challenge depuis WoVP (Ctrl+C)
    2. Double-cliquer sur import-challenge.bat (ou : python import-challenge.py)
    3. Répondre aux questions sur les nouveaux joueurs
    4. Vérifier le rapport
"""

import json
import re
import shutil
import sys
from pathlib import Path
from datetime import datetime

try:
    import pyperclip
except ImportError:
    print("❌ Le module 'pyperclip' n'est pas installé.")
    print("   Installe-le avec : pip install pyperclip")
    sys.exit(1)


# ============================================================
# CONFIG
# ============================================================
DATA_DIR = Path("data")
CHALLENGES_FILE = DATA_DIR / "challenges.json"
RESULTS_FILE = DATA_DIR / "results.json"
PLAYERS_FILE = DATA_DIR / "players.json"


# ============================================================
# HELPERS
# ============================================================
def load_json(path, default):
    if not path.exists():
        return default
    with open(path, "r", encoding="utf-8-sig") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def backup_file(path):
    if path.exists():
        backup = path.with_suffix(path.suffix + ".bak")
        shutil.copy2(path, backup)


def parse_date_french(date_str):
    """Parse 'August 30, 2026' → '2026-08-30'."""
    date_str = date_str.strip()
    for fmt in ("%B %d, %Y", "%b %d, %Y"):
        try:
            return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
        except ValueError:
            pass
    return None


def make_slug(table_name, season, week):
    """Génère un ID simple : 'ripley-s17w5' ou 'montecarlo-t' pour tournoi."""
    clean = re.sub(r"\([^)]*\)", "", table_name).strip()
    words = re.findall(r"[a-z0-9]+", clean.lower())
    slug = "-".join(words[:2]) if words else "table"
    if season is None:
        return f"{slug}-t"
    return f"{slug}-s{season}w{week}"


# ============================================================
# PARSER
# ============================================================
def parse_challenge_text(text):
    """
    Parse le texte d'un challenge WoVP.
    Retourne un dict avec :
      - table (str)
      - season (int ou None)
      - week (int ou None)
      - startDate (str ISO)
      - endDate (str ISO)
      - results: [{position, playerName, platform, score, contributor}]
    """
    lines = [l.strip() for l in text.replace("\r", "").split("\n")]
    lines = [l for l in lines if l]

    if not lines:
        raise ValueError("Texte vide")

    # 1. Première ligne = nom de la table
    table_name = lines[0]
    if not re.search(r"\([^)]*\d{4}\)", table_name):
        raise ValueError(
            f"Le nom de la table ne contient pas d'année entre parenthèses. "
            f"Reçu : '{table_name}'"
        )

    # 2. Chercher "Season X, Week #Y" (optionnel — absent pour les tournois)
    season, week = None, None
    season_re = re.compile(r"Season\s+(\d+).*?Week\s*#?\s*(\d+)", re.IGNORECASE)
    for line in lines[:5]:
        m = season_re.search(line)
        if m:
            season = int(m.group(1))
            week = int(m.group(2))
            break
    # Si pas trouvé → tournoi, on continue sans saison

    # 3. Chercher les 2 dates
    date_re = re.compile(
        r"(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}",
        re.IGNORECASE,
    )
    dates_found = []
    for line in lines[:10]:
        for m in date_re.finditer(line):
            dates_found.append(m.group(0))
    if len(dates_found) < 2:
        raise ValueError(f"Impossible de détecter 2 dates (trouvées : {len(dates_found)})")
    start_date = parse_date_french(dates_found[0])
    end_date = parse_date_french(dates_found[1])
    if not start_date or not end_date:
        raise ValueError("Format de date non reconnu")

    # 4. Parser les résultats
    results = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if re.match(r"^\d+$", line):
            position = int(line)
            i += 1
            if i >= len(lines):
                break
            player_name = lines[i]
            i += 1

            contributor = False
            platform = ""
            score = 0

            while i < len(lines) and not re.match(r"^\d+$", lines[i]):
                candidate = lines[i]
                if candidate.lower() == "contributor":
                    contributor = True
                    i += 1
                elif re.match(r"^(CAB|PC|VR)$", candidate, re.IGNORECASE):
                    platform = candidate.upper()
                    i += 1
                elif re.match(r"^[\d,]+$", candidate):
                    score = int(candidate.replace(",", ""))
                    i += 1
                    break
                else:
                    break

            results.append({
                "position": position,
                "playerName": player_name,
                "platform": platform,
                "score": score,
                "contributor": contributor,
            })
        else:
            i += 1

    if not results:
        raise ValueError("Aucun résultat détecté")

    return {
        "table": table_name,
        "season": season,
        "week": week,
        "startDate": start_date,
        "endDate": end_date,
        "results": results,
    }


# ============================================================
# IMPORT
# ============================================================
def import_challenge(challenge_data):
    """Ajoute le challenge dans les 3 JSON."""
    challenges = load_json(CHALLENGES_FILE, [])
    results = load_json(RESULTS_FILE, [])
    players = load_json(PLAYERS_FILE, {})

    # Vérifie le doublon (table + date de fin)
    for c in challenges:
        if c.get("table") == challenge_data["table"] and c.get("date") == challenge_data["endDate"]:
            print(f"\n❌ Ce challenge existe déjà :")
            print(f"   Table  : {c['table']}")
            print(f"   Date   : {c['date']}")
            if c.get("season"):
                print(f"   Saison : {c.get('season')}, Semaine : {c.get('week')}")
            else:
                print(f"   Type   : Tournoi")
            print(f"\n   Annulation pour éviter un doublon.")
            return False

    # Génère l'ID
    challenge_id = make_slug(challenge_data["table"], challenge_data["season"], challenge_data["week"])
    existing_ids = {c.get("id") for c in challenges}
    base_id = challenge_id
    suffix = 1
    while challenge_id in existing_ids:
        challenge_id = f"{base_id}-{suffix}"
        suffix += 1

    # Crée le nouvel objet challenge
    new_challenge = {
        "id": challenge_id,
        "table": challenge_data["table"],
        "date": challenge_data["endDate"],
        "resultCount": len(challenge_data["results"]),
    }
    if challenge_data["season"] is not None:
        new_challenge["season"] = challenge_data["season"]
        new_challenge["week"] = challenge_data["week"]

    # Crée les nouveaux résultats
    new_results = []
    for r in challenge_data["results"]:
        new_results.append({
            "challengeId": challenge_id,
            "position": r["position"],
            "playerName": r["playerName"],
            "score": r["score"],
            "platform": r["platform"],
        })

    # Détecte les nouveaux joueurs
    known_players = set(players.keys())
    new_players_names = set()
    for r in challenge_data["results"]:
        if r["playerName"] not in known_players:
            new_players_names.add(r["playerName"])

    # Demande le pays pour chaque nouveau joueur
    if new_players_names:
        print(f"\n🌍 {len(new_players_names)} nouveau(x) joueur(s) détecté(s) :")
        for name in sorted(new_players_names):
            print()
            country = input(f"   {name} — Pays (FR/US/CA... ou Entrée pour '??') ? ").strip().upper()
            if not country or len(country) != 2:
                country = "??"
            players[name] = {"country": country, "contributor": False}

    # Backup avant écriture
    print("\n💾 Sauvegarde des fichiers existants...")
    backup_file(CHALLENGES_FILE)
    backup_file(RESULTS_FILE)
    backup_file(PLAYERS_FILE)

    # Écriture
    print("📝 Écriture des fichiers...")
    challenges.append(new_challenge)
    save_json(CHALLENGES_FILE, challenges)

    results.extend(new_results)
    save_json(RESULTS_FILE, results)

    save_json(PLAYERS_FILE, players)

    # Rapport final
    print(f"\n✅ Challenge ajouté avec succès !")
    print(f"   Table     : {challenge_data['table']}")
    if challenge_data["season"] is not None:
        print(f"   Saison    : {challenge_data['season']}, Semaine : {challenge_data['week']}")
    else:
        print(f"   Type      : Tournoi")
    print(f"   Date      : {challenge_data['endDate']}")
    print(f"   Résultats : {len(new_results)}")
    print(f"   ID        : {challenge_id}")
    print()
    print(f"➡️  Lance push.bat pour publier sur GitHub.")
    return True


# ============================================================
# MAIN
# ============================================================
def main():
    print("═" * 60)
    print("  WoVP Stats — Import Challenge")
    print("═" * 60)
    print()

    # Lit le presse-papiers
    try:
        text = pyperclip.paste()
    except Exception as e:
        print(f"❌ Impossible de lire le presse-papiers : {e}")
        return

    if not text or len(text.strip()) < 20:
        print("❌ Le presse-papiers est vide ou trop court.")
        print("   Copie d'abord le texte du challenge depuis WoVP.")
        return

    print(f"📋 Texte lu depuis le presse-papiers ({len(text)} caractères)")
    print()

    # Parse
    try:
        challenge_data = parse_challenge_text(text)
    except ValueError as e:
        print(f"❌ Erreur d'analyse : {e}")
        return

    print(f"✓ Table     : {challenge_data['table']}")
    if challenge_data["season"] is not None:
        print(f"✓ Saison    : {challenge_data['season']}, Semaine : {challenge_data['week']}")
    else:
        print(f"✓ Type      : Tournoi (pas de saison)")
    print(f"✓ Dates     : {challenge_data['startDate']} → {challenge_data['endDate']}")
    print(f"✓ Résultats : {len(challenge_data['results'])}")
    print()

    # Vérifie la séquence de positions
    positions = [r["position"] for r in challenge_data["results"]]
    expected = list(range(1, len(positions) + 1))
    if sorted(positions) != expected:
        print("⚠️  Attention : les positions ne couvrent pas exactement 1..N")
        print(f"   Positions trouvées (10 premières) : {sorted(set(positions))[:10]}")
        print()

    # Import
    success = import_challenge(challenge_data)

    if success:
        print()
        print("═" * 60)


if __name__ == "__main__":
    main()
    print()
    input("Appuie sur Entrée pour fermer...")