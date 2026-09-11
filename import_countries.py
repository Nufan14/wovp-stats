#!/usr/bin/env python3
"""
WoVP Stats — Import des pays depuis un ancien CSV
==================================================
Croise data/players.json avec un ancien CSV (FirstName, LastName, CountryCode)
et remplit les pays manquants ("??").

Usage :
    python import_countries.py
"""

import csv
import json
import unicodedata
from pathlib import Path

# ============================================================
# CONFIG — À AJUSTER SI BESOIN
# ============================================================
OLD_CSV = "old_countries.csv"    # ← Nom exact de ton vieux CSV (dans le dossier du projet)
CSV_DELIMITER = ";"              # ← ";" si séparateur point-virgule, "," si virgule

PLAYERS_FILE = Path("data/players.json")


# ============================================================
# HELPERS
# ============================================================
def full_name(first, last):
    """Assemble Prénom + Nom."""
    first = (first or "").strip()
    last = (last or "").strip()
    if first and last:
        return f"{first} {last}"
    return first or last


def normalize_name(name):
    """Normalise un nom pour comparaison : minuscules, sans accents, sans espaces multiples."""
    if not name:
        return ""
    name = name.strip().lower()
    # Retire les accents
    name = "".join(
        c for c in unicodedata.normalize("NFD", name)
        if unicodedata.category(c) != "Mn"
    )
    # Réduit les espaces multiples
    name = " ".join(name.split())
    return name


# ============================================================
# LECTURE DU VIEUX CSV
# ============================================================
def load_old_csv():
    """Retourne un dict : {nom_normalisé: code_pays}."""
    path = Path(OLD_CSV)
    if not path.exists():
        print(f"❌ Fichier introuvable : {OLD_CSV}")
        print(f"   Vérifie qu'il est bien à la racine du projet.")
        return None

    with open(path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f, delimiter=CSV_DELIMITER)
        rows = list(reader)

    print(f"📄 {len(rows)} lignes lues dans {OLD_CSV}")

    if not rows:
        print("❌ CSV vide")
        return None

    # Vérification des colonnes attendues
    sample = rows[0]
    required = ["FirstName", "LastName", "CountryCode"]
    missing = [col for col in required if col not in sample]
    if missing:
        print(f"❌ Colonnes manquantes dans le CSV : {missing}")
        print(f"   Colonnes disponibles : {list(sample.keys())}")
        print(f"   Vérifie le nom des colonnes et le séparateur ({CSV_DELIMITER}).")
        return None

    countries = {}
    for row in rows:
        name = full_name(row.get("FirstName"), row.get("LastName"))
        cc = (row.get("CountryCode") or "").strip().upper()
        if not name or not cc or len(cc) != 2:
            continue
        countries[normalize_name(name)] = cc

    print(f"   → {len(countries)} joueurs uniques avec un pays")
    return countries


# ============================================================
# MAIN
# ============================================================
def main():
    print("═" * 60)
    print("  WoVP Stats — Import des pays depuis un ancien CSV")
    print("═" * 60)

    # 1. Charge l'ancien CSV
    old_countries = load_old_csv()
    if old_countries is None:
        return

    # 2. Charge players.json
    if not PLAYERS_FILE.exists():
        print(f"❌ {PLAYERS_FILE} introuvable")
        return

    with open(PLAYERS_FILE, "r", encoding="utf-8-sig") as f:
        players = json.load(f)

    print(f"\n👥 {len(players)} joueurs dans players.json")

    # 3. Compte les joueurs sans pays
    missing_before = [
        n for n, info in players.items()
        if not info.get("country") or info.get("country") == "??"
    ]
    print(f"   → {len(missing_before)} joueurs sans pays avant mise à jour")

    # 4. Applique les pays
    updated = 0
    already_ok = 0
    still_missing = []

    for name, info in players.items():
        current = info.get("country") or ""
        if current and current != "??":
            already_ok += 1
            continue

        key = normalize_name(name)
        if key in old_countries:
            players[name]["country"] = old_countries[key]
            updated += 1
        else:
            still_missing.append(name)

    # 5. Sauvegarde
    with open(PLAYERS_FILE, "w", encoding="utf-8") as f:
        json.dump(players, f, ensure_ascii=False, indent=2)

    # 6. Rapport final
    print(f"\n" + "═" * 60)
    print(f"  ✅ Mise à jour terminée")
    print(f"═" * 60)
    print(f"  Joueurs déjà OK        : {already_ok}")
    print(f"  Joueurs qualifiés      : {updated}")
    print(f"  Joueurs encore '??'    : {len(still_missing)}")
    print()

    if still_missing:
        print(f"  Joueurs encore manquants (les 30 premiers) :")
        for name in sorted(still_missing)[:30]:
            print(f"    - {name}")
        if len(still_missing) > 30:
            print(f"    ... et {len(still_missing) - 30} autres")
        print()

    print(f"  📄 Écrit dans {PLAYERS_FILE}")
    print(f"  Recharge le site dans ton navigateur pour voir les changements.")
    print()


if __name__ == "__main__":
    main()