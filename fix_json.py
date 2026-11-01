import json
from pathlib import Path

file_path = Path("data/standings.json")

if not file_path.exists():
    print(f"❌ Fichier introuvable : {file_path}")
    exit(1)

print("Lecture du fichier...")
with open(file_path, "r", encoding="utf-8-sig") as f:
    content = f.read()

try:
    data = json.loads(content)
    print("✅ Le fichier JSON est déjà parfaitement valide !")
    exit(0)
except json.JSONDecodeError as e:
    print(f"⚠️ Erreur détectée à la ligne {e.lineno}, colonne {e.colno} : {e.msg}\n")
    
    lines = content.splitlines()
    start = max(0, e.lineno - 6)
    end = min(len(lines), e.lineno + 5)
    print("--- Extrait autour de l'erreur ---")
    for i in range(start, end):
        prefix = "==> " if i == e.lineno - 1 else "    "
        print(f"{i+1:4d}{prefix}{lines[i]}")
    print("----------------------------------\n")