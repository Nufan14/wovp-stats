#!/bin/bash
# ============================================================
# WoVP Stats — Push rapide vers GitHub
# Usage : ./push.sh "Mon message de commit"
# ============================================================

cd "$(dirname "$0")"

# Vérifie qu'un message est passé en argument
if [ -z "$1" ]; then
  echo "❌ Erreur : il faut un message de commit"
  echo "   Usage : ./push.sh \"Mon message\""
  exit 1
fi

MESSAGE="$1"

echo "📦 Ajout des fichiers modifiés..."
git add .

echo "💾 Commit : $MESSAGE"
git commit -m "$MESSAGE"

if [ $? -ne 0 ]; then
  echo ""
  echo "⚠️  Aucun changement à commiter (ou erreur)."
  echo "   Vérifie avec 'git status'"
  exit 0
fi

echo "🚀 Push vers GitHub..."
git push

echo ""
echo "✅ Push terminé !"
echo "   Site en ligne dans ~2 minutes : https://nufan14.github.io/wovp-stats/"