# Firebase App Hosting Setup

## ✅ Konfiguration abgeschlossen

Die App ist jetzt für Firebase App Hosting konfiguriert!

## 📋 Nächste Schritte

### 1. Firebase CLI Token für GitHub Actions

1. **Token generieren:**
   ```bash
   firebase login:ci
   ```
   Kopiere den ausgegebenen Token.

2. **GitHub Secrets hinzufügen:**
   - Gehe zu: GitHub Repository → Settings → Secrets and variables → Actions
   - Füge folgende Secrets hinzu:

   | Secret Name | Wert |
   |------------|------|
   | `FIREBASE_TOKEN` | Der Token von `firebase login:ci` |
   | `FIREBASE_PROJECT_ID` | `silent-room-238de` |
   | `FIREBASE_LOCATION` | `us-central1` (oder deine Region) |
   | `FIREBASE_BACKEND_ID` | Deine Backend-ID (siehe Firebase Console) |

### 2. Backend-ID finden

1. Gehe zu: https://console.firebase.google.com/project/silent-room-238de/apphosting
2. Klicke auf dein Backend
3. Die Backend-ID findest du in der URL oder im Backend-Dashboard
4. Füge sie als `FIREBASE_BACKEND_ID` Secret hinzu

### 3. Manuelles Deployment testen

```bash
# Build lokal testen
npm run build

# Deploy zu App Hosting
firebase apphosting:backends:deploy \
  --project=silent-room-238de \
  --location=us-central1 \
  --backend=DEINE_BACKEND_ID
```

### 4. Automatisches Deployment

Nach dem Setup der Secrets:
- Push zu `main` branch → GitHub Actions deployt automatisch!

## 🔧 Konfigurationsdateien

- `apphosting.yaml` - App Hosting Konfiguration
- `.github/workflows/deploy-firebase-apphosting.yml` - GitHub Actions Workflow
- `package.json` - Start-Script für Production

## 📝 Wichtige Hinweise

- **Runtime:** Node.js 20
- **Port:** 8080 (Firebase App Hosting Standard)
- **Build:** `npm ci && npm run build`
- **Start:** `npx serve -s dist -l 8080`

## 🐛 Troubleshooting

### "Backend Not Found"
- Prüfe ob Backend in Firebase Console existiert
- Prüfe ob `FIREBASE_BACKEND_ID` Secret korrekt ist

### Build-Fehler
```bash
npm ci  # Clean install
npm run build  # Prüfe Build-Output
```

### Deployment-Fehler
- Prüfe `FIREBASE_TOKEN` Secret
- Prüfe ob Backend-ID korrekt ist
- Prüfe GitHub Actions Logs

## 🚀 Alternative: Direktes Deployment

Falls GitHub Actions nicht funktioniert, deploye direkt:

```bash
firebase apphosting:backends:deploy \
  --project=silent-room-238de \
  --location=us-central1 \
  --backend=DEINE_BACKEND_ID
```
