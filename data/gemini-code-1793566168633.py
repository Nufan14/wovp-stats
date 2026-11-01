import json

# Remplacez 'votre_fichier.json' par le nom du fichier JSON lu par votre script check_standings.py
filename = "standings.json" 

try:
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print("Le fichier JSON est parfaitement valide !")
except json.JSONDecodeError as e:
    print(f"Erreur détectée à la ligne {e.lineno}, colonne {e.colno} : {e.msg}\n")
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Affichage des lignes autour de l'erreur pour situer le problème
    start = max(0, e.lineno - 6)
    end = min(len(lines), e.lineno + 5)
    print("--- Extrait du fichier autour de l'erreur ---")
    for i in range(start, end):
        marker = "==> " if i == e.lineno - 1 else "    "
        print(f"{i+1:4d}{marker}{lines[i]}", end='')