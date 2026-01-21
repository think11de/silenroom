#!/bin/bash
# Quick Deployment Script

echo "🚀 Think11 Deployment Helper"
echo "=============================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Git Repository initialisieren..."
    git init
    git add .
    git commit -m "Initial commit - Ready for deployment"
    echo "✅ Git Repository erstellt"
    echo ""
    echo "⚠️  Nächste Schritte:"
    echo "1. Erstelle ein GitHub Repository"
    echo "2. Verbinde es mit: git remote add origin <YOUR_REPO_URL>"
    echo "3. Push: git push -u origin main"
    echo ""
else
    echo "✅ Git Repository bereits initialisiert"
fi

echo ""
echo "📋 Deployment-Optionen:"
echo ""
echo "1️⃣  Firebase Hosting (Schnell & Einfach)"
echo "   npm run build && firebase deploy --only hosting"
echo ""
echo "2️⃣  Cloud Run (Container-basiert)"
echo "   gcloud builds submit --tag gcr.io/silent-room-238de/think11-app"
echo "   gcloud run deploy think11-app --image gcr.io/silent-room-238de/think11-app --platform managed --region europe-west1 --allow-unauthenticated"
echo ""
echo "3️⃣  GitHub Actions (Automatisch)"
echo "   → Siehe DEPLOYMENT.md für Setup"
echo ""
