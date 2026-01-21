<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Think11 Work Café

Ein virtueller Co-Working Space mit Echtzeit-Video/Audio-Kommunikation.

## 🚀 Quick Start

### Lokal ausführen

```bash
npm install
npm run dev
```

Die App läuft dann auf `http://localhost:3000`

## 📦 Deployment

### Option 1: Firebase Hosting (Empfohlen)

```bash
npm run build
firebase deploy --only hosting
```

### Option 2: Google Cloud Run

```bash
gcloud builds submit --tag gcr.io/silent-room-238de/think11-app
gcloud run deploy think11-app \
  --image gcr.io/silent-room-238de/think11-app \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated
```

### Automatisches Deployment via GitHub Actions

Siehe [DEPLOYMENT.md](DEPLOYMENT.md) für detaillierte Anleitung.

**Erste Schritte:**
1. Git Repository initialisieren: `git init && git add . && git commit -m "Initial commit"`
2. GitHub Repository erstellen und verbinden
3. Secrets in GitHub Settings konfigurieren (siehe DEPLOYMENT.md)
4. Push zu `main` branch → Deployment läuft automatisch!

## 📚 Weitere Informationen

- [Deployment Guide](DEPLOYMENT.md) - Detaillierte Deployment-Anleitung
- [Firebase Console](https://console.firebase.google.com/project/silent-room-238de)
- [Cloud Run Console](https://console.cloud.google.com/run?project=silent-room-238de)
