import json, sys

path = "standings.json"  # <-- ton fichier

with open(path, encoding="utf-8") as f:
    s = f.read()

# comptage naïf (suffit pour du JSON sans accolades dans les chaînes)
depth_o = depth_a = 0
line = 1
min_o = min_a = 0
min_line_o = min_line_a = 1

for c in s:
    if c == '\n': line += 1
    elif c == '{': depth_o += 1
    elif c == '}':
        depth_o -= 1
        if depth_o < min_o: min_o, min_line_o = depth_o, line
    elif c == '[': depth_a += 1
    elif c == ']':
        depth_a -= 1
        if depth_a < min_a: min_a, min_line_a = depth_a, line

print(f"Objets : solde final = {depth_o}, minimum atteint = {min_o} (ligne {min_line_o})")
print(f"Tableaux : solde final = {depth_a}, minimum atteint = {min_a} (ligne {min_line_a})")