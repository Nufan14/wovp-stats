#!/usr/bin/env python3
"""
WoVP Stats — Import CSV → JSON
================================
Lit source.csv et génère :
  - data/challenges.json
  - data/results.json
  - data/players.json  (mis à jour avec les nouveaux joueurs)

Usage :
    python import.py
"""

import csv
import json
import sys
from pathlib import Path
from collections import defaultdict
from datetime import datetime

# ---------- Config ----------
CSV_FILE = "source.csv"
DATA_DIR = Path("data")
CONTRIBUTORS_FILE = "contributors.txt"

CHALLENGES_OUT = DATA_DIR / "challenges.json"
RESULTS_OUT = DATA_DIR / "results.json"
PLAYERS_OUT = DATA_DIR / "players.json"

# Statuts de challenge à ignorer
IGNORED_STATUSES = {"Deleted"}

# Séparateur CSV
CSV_DELIMITER = ";"


# ---------- Helpers ----------
def load_json(path, default):
    if not path.exists():
        return default
    try:
        with open(path, "r", encoding="utf-8-sig") as f:
            return json.load(f)
    except Exception:
        return default


def save_json(path, data):
    with open(path, "w", encoding="utf-8-sig") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_contributors():
    """Retourne un set de noms (Prénom + Nom) marqués comme contributeurs."""
    if not Path(CONTRIBUTORS_FILE).exists():
        return set()
    with open(CONTRIBUTORS_FILE, "r", encoding="utf-8-sig") as f:
        return {line.strip() for line in f if line.strip()}


def full_name(first, last):
    """Concatène Prénom + Nom avec un espace, en nettoyant les vides."""
    first = (first or "").strip()
    last = (last or "").strip()
    if first and last:
        return f"{first} {last}"
    return first or last


def iso_date(dt_string):
    """Prend '2024-11-24T19:00:00' → '2024-11-24'."""
    if not dt_string:
        return ""
    return dt_string.split("T")[0]


def parse_iso_datetime(dt_string):
    """Parse un ISO datetime et retourne un objet datetime ou None."""
    if not dt_string:
        return None
    try:
        # Format : 2024-11-24T19:00:00
        return datetime.fromisoformat(dt_string)
    except Exception:
        return None


def ask_country(player_name):
    """Demande interactivement le pays d'un nouveau joueur."""
    print(f"\n🌍 Nouveau joueur : {player_name}")
    country = input("   Pays (FR/US/CA/... ou Entrée pour '??') ? ").strip().upper()
    if not country or len(country) != 2:
        country = "??"
    return country


# ---------- Étapes ----------
def read_csv():
    """Lit source.csv et retourne une liste de dicts bruts."""
    path = Path(CSV_FILE)
    if not path.exists():
        print(f"❌ Fichier introuvable : {CSV_FILE}")
        print(f"   Assure-toi qu'il est bien à côté de import.py.")
        sys.exit(1)

    with open(path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f, delimiter=CSV_DELIMITER)
        rows = list(reader)

    print(f"📄 {len(rows)} lignes lues dans {CSV_FILE}")
    return rows


def parse_challenges(rows):
    """
    Extrait les challenges uniques (avec ou sans saison).
    Retourne un dict : {challenge_id: challenge_obj}
    """
    challenges = {}
    ignored = 0

    for row in rows:
        status = (row.get("Challenge_Status") or "").strip()
        if status in IGNORED_STATUSES:
            ignored += 1
            continue

        challenge_uuid = (row.get("Challenge_Id") or "").strip()
        if not challenge_uuid:
            continue

        if challenge_uuid in challenges:
            continue

        table = (row.get("Challenge_Name") or "").strip()
        date_start = iso_date(row.get("Challenge_StartDate"))
        date_end = iso_date(row.get("Challenge_EndDate"))

        season_id = (row.get("Season_Id") or "").strip()
        season_num = (row.get("Season_UniqueIdentifier") or "").strip()
        season_start_dt = parse_iso_datetime(row.get("Season_StartDate"))

        challenge = {
            "id": challenge_uuid,
            "table": table,
            "date": date_end or date_start,
        }

        # Si c'est un challenge de saison, on ajoute season + week
        if season_id and season_num:
            try:
                challenge["season"] = int(season_num)
            except ValueError:
                pass

            # Calcul auto de la "week" à partir de la date de début du challenge
            # et de la date de début de la saison
            if season_start_dt:
                challenge_start_dt = parse_iso_datetime(row.get("Challenge_StartDate"))
                if challenge_start_dt:
                    delta_days = (challenge_start_dt - season_start_dt).days
                    week_num = max(1, (delta_days // 7) + 1)
                    challenge["week"] = week_num

        challenges[challenge_uuid] = challenge

    print(f"   → {len(challenges)} challenges uniques ({ignored} lignes ignorées pour statut 'Deleted')")
    return challenges


def parse_results(rows, valid_challenge_ids):
    """
    Extrait tous les résultats valides.
    Retourne une liste de dicts.
    """
    results = []
    skipped = 0

    for row in rows:
        status = (row.get("Challenge_Status") or "").strip()
        if status in IGNORED_STATUSES:
            skipped += 1
            continue

        challenge_uuid = (row.get("Challenge_Id") or "").strip()
        if not challenge_uuid or challenge_uuid not in valid_challenge_ids:
            skipped += 1
            continue

        position_raw = (row.get("Position") or "").strip()
        try:
            position = int(position_raw)
        except ValueError:
            skipped += 1
            continue

        score_raw = (row.get("Score") or "").strip()
        try:
            score = int(score_raw)
        except ValueError:
            score = 0

        name = full_name(row.get("FirstName"), row.get("LastName"))
        if not name:
            skipped += 1
            continue

        results.append({
            "challengeId": challenge_uuid,
            "position": position,
            "playerName": name,
            "score": score,
        })

    print(f"   → {len(results)} résultats valides ({skipped} lignes ignorées)")
    return results


def collect_players(results, contributors_set):
    """Retourne l'ensemble des noms de joueurs avec leur flag contributor."""
    players = {}
    for r in results:
        name = r["playerName"]
        if name not in players:
            players[name] = {
                "contributor": name in contributors_set,
            }
    return players


def merge_with_existing_players(new_players):
    """
    Fusionne avec players.json existant :
    - préserve les pays connus
    - marque les nouveaux joueurs (pays inconnu)
    - met à jour le flag contributor
    """
    existing = load_json(PLAYERS_OUT, {})
    merged = {}
    new_names = []

    for name, info in new_players.items():
        if name in existing:
            merged[name] = {
                "country": existing[name].get("country", "??"),
                "contributor": info["contributor"],
            }
        else:
            merged[name] = {
                "country": "",  # à demander
                "contributor": info["contributor"],
            }
            new_names.append(name)

    # Note : on garde les joueurs existants qui n'apparaissent plus dans le CSV
    for name, info in existing.items():
        if name not in merged:
            merged[name] = info

    return merged, new_names


def compute_result_counts(challenges, results):
    """Compte le nombre de résultats par challenge."""
    for r in results:
        cid = r["challengeId"]
        if cid in challenges:
            challenges[cid]["resultCount"] = challenges[cid].get("resultCount", 0) + 1

    total_with_results = sum(1 for c in challenges.values() if c.get("resultCount", 0) > 0)
    total_without_results = len(challenges) - total_with_results
    print(f"   → {total_with_results} challenges ont au moins 1 résultat")
    print(f"   → {total_without_results} challenges sans résultat")


def main():
    print("═" * 60)
    print("  WoVP Stats — Import CSV → JSON")
    print("═" * 60)

    # 1. Lecture
    rows = read_csv()

    # 2. Challenges
    print("\n📚 Parsing des challenges...")
    challenges = parse_challenges(rows)

    # 3. Résultats
    print("\n🏁 Parsing des résultats...")
    results = parse_results(rows, set(challenges.keys()))

    # 4. Calcul du resultCount par challenge
    print("\n🔢 Calcul du nombre de résultats par challenge...")
    compute_result_counts(challenges, results)

    # 5. Joueurs
    print("\n👥 Analyse des joueurs...")
    contributors_set = load_contributors()
    print(f"   → {len(contributors_set)} contributeurs chargés depuis {CONTRIBUTORS_FILE}")
    new_players = collect_players(results, contributors_set)
    merged_players, new_names = merge_with_existing_players(new_players)
    print(f"   → {len(new_players)} joueurs actifs dans le CSV")
    print(f"   → {len(new_names)} nouveaux joueurs (pays inconnu)")

    # 6. Qualification des nouveaux joueurs (optionnelle)
    if new_names:
        print("\n" + "═" * 60)
        print(f"  {len(new_names)} nouveaux joueurs détectés")
        print("═" * 60)
        print()
        print("  Veux-tu les qualifier maintenant ?")
        print("  (o = oui, on te demande le pays un par un)")
        print("  (n = non, on les met à '??' et on passe)")
        print()
        answer = input("  Réponse (o/n) ? ").strip().lower()

        if answer == "o":
            print()
            print(f"  Qualifions {len(new_names)} joueurs :")
            for name in sorted(new_names):
                country = ask_country(name)
                merged_players[name]["country"] = country
        else:
            print(f"\n  → {len(new_names)} joueurs marqués '??' (à qualifier plus tard)")
            for name in new_names:
                merged_players[name]["country"] = "??"

    # 7. Écriture
    print("\n💾 Écriture des fichiers...")
    DATA_DIR.mkdir(exist_ok=True)

    # Backup
    for out in [CHALLENGES_OUT, RESULTS_OUT, PLAYERS_OUT]:
        if out.exists():
            backup = out.with_suffix(out.suffix + ".bak")
            with open(out, "r", encoding="utf-8-sig") as src:
                with open(backup, "w", encoding="utf-8-sig") as dst:
                    dst.write(src.read())
    print("   → Fichiers existants sauvegardés en .bak")

    save_json(CHALLENGES_OUT, list(challenges.values()))
    save_json(RESULTS_OUT, results)
    save_json(PLAYERS_OUT, merged_players)

    print(f"   ✅ {len(challenges)} challenges → {CHALLENGES_OUT}")
    print(f"   ✅ {len(results)} résultats   → {RESULTS_OUT}")
    print(f"   ✅ {len(merged_players)} joueurs      → {PLAYERS_OUT}")

    # 8. Résumé final
    print("\n" + "═" * 60)
    print("  ✅ Import terminé")
    print("═" * 60)
    print(f"  Challenges   : {len(challenges)}")
    print(f"  Résultats    : {len(results)}")
    print(f"  Joueurs      : {len(merged_players)}")
    print(f"  Contributors : {sum(1 for p in merged_players.values() if p.get('contributor'))}")
    print()
    print("  Recharge le site dans ton navigateur pour voir les changements.")
    print()


if __name__ == "__main__":
    main()