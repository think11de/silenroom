#!/bin/bash
# Script zum Hochladen auf GitHub

echo "🚀 Think11 App → GitHub Upload"
echo "=============================="
echo ""

# Prüfe ob bereits authentifiziert
if ! gh auth status &>/dev/null; then
    echo "❌ Du bist noch nicht bei GitHub authentifiziert!"
    echo ""
    echo "📋 Bitte führe zuerst aus:"
    echo "   gh auth login"
    echo ""
    echo "Wähle:"
    echo "  1. GitHub.com"
    echo "  2. HTTPS"
    echo "  3. Login with a web browser"
    echo ""
    echo "Dann führe dieses Script erneut aus."
    exit 1
fi

echo "✅ GitHub Authentifizierung OK"
echo ""

# Prüfe ob Remote bereits existiert
if git remote get-url origin &>/dev/null; then
    echo "⚠️  Remote 'origin' existiert bereits"
    read -p "Möchtest du es überschreiben? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote remove origin
    else
        echo "❌ Abgebrochen"
        exit 1
    fi
fi

# Erstelle Repository auf GitHub
echo "📦 Erstelle GitHub Repository 'silent_room'..."
gh repo create silent_room --private --source=. --remote=origin --push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Erfolgreich hochgeladen!"
    echo ""
    echo "🔗 Repository URL:"
    gh repo view --web
    echo ""
    echo "📋 Nächste Schritte:"
    echo "   - Repository ist jetzt auf GitHub verfügbar"
    echo "   - GitHub Actions werden automatisch bei Push zu 'main' ausgeführt"
    echo "   - Siehe DEPLOYMENT.md für Deployment-Anleitung"
else
    echo ""
    echo "❌ Fehler beim Hochladen"
    echo ""
    echo "Versuche manuell:"
    echo "  git remote add origin https://github.com/$(gh api user --jq .login)/silent_room.git"
    echo "  git push -u origin main"
fi
