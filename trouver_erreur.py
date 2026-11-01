import json
from pathlib import Path

p = Path("data/standings.json")
content = p.read_text(encoding="utf-8-sig")

# On essaie de parser en comptant les blocs pour trouver l'anomalie exacte
lines = content.splitlines()
print(f"Total de lignes dans le fichier : {len(lines)}")

# Test de chargement avec affichage détaillé
try:
    json.loads(content)
except json.JSONDecodeError as e:
    print(f"\n❌ Erreur détectée par Python :")
    print(f"Ligne {e.lineno}, Colonne {e.colno} -> {e.msg}")
    print("\nVoici les lignes autour de l'anomalie :")
    for i in range(max(0, e.lineno - 4), min(len(lines), e.lineno + 3)):
        marker = "===> " if i == e.lineno - 1 else "     "
        print(f"{i+1:4d} {marker}{lines[i]}")