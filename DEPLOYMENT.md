# Deployment Guide

Diese App kann auf zwei Wegen deployed werden:

## 1. Firebase Hosting (Empfohlen für statische Sites)

### Setup

1. **Firebase CLI installieren:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Login:**
   ```bash
   firebase login
   ```

3. **Firebase Projekt initialisieren (falls noch nicht geschehen):**
   ```bash
   firebase init hosting
   ```
   - Wähle: `silent-room-238de`
   - Public directory: `dist`
   - Single-page app: `Yes`
   - GitHub Actions: `Yes`

### Manuelles Deployment

```bash
npm run build
firebase deploy --only hosting
```

### Automatisches Deployment via GitHub Actions

1. **Firebase Service Account erstellen:**
   - Gehe zu [Firebase Console](https://console.firebase.google.com/)
   - Projekt Settings → Service Accounts
   - "Generate new private key" → JSON-Datei herunterladen

2. **GitHub Secret hinzufügen:**
   - GitHub Repo → Settings → Secrets → Actions
   - Neues Secret: `FIREBASE_SERVICE_ACCOUNT`
   - Wert: Inhalt der JSON-Datei einfügen

3. **Push zu main branch:**
   ```bash
   git push origin main
   ```
   → Deployment läuft automatisch!

---

## 2. Google Cloud Run (Für Container-Deployment)

### Setup

1. **Google Cloud CLI installieren:**
   ```bash
   # macOS
   brew install google-cloud-sdk
   
   # Oder: https://cloud.google.com/sdk/docs/install
   ```

2. **Authentifizierung:**
   ```bash
   gcloud auth login
   gcloud config set project silent-room-238de
   ```

3. **Docker aktivieren:**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   ```

### Manuelles Deployment

```bash
# Build und Deploy
gcloud builds submit --tag gcr.io/silent-room-238de/think11-app
gcloud run deploy think11-app \
  --image gcr.io/silent-room-238de/think11-app \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080
```

### Automatisches Deployment via GitHub Actions

1. **Service Account erstellen:**
   ```bash
   gcloud iam service-accounts create github-actions \
     --display-name "GitHub Actions Service Account"
   
   gcloud projects add-iam-policy-binding silent-room-238de \
     --member="serviceAccount:github-actions@silent-room-238de.iam.gserviceaccount.com" \
     --role="roles/run.admin"
   
   gcloud projects add-iam-policy-binding silent-room-238de \
     --member="serviceAccount:github-actions@silent-room-238de.iam.gserviceaccount.com" \
     --role="roles/iam.serviceAccountUser"
   
   gcloud projects add-iam-policy-binding silent-room-238de \
     --member="serviceAccount:github-actions@silent-room-238de.iam.gserviceaccount.com" \
     --role="roles/storage.admin"
   
   # Key erstellen
   gcloud iam service-accounts keys create key.json \
     --iam-account=github-actions@silent-room-238de.iam.gserviceaccount.com
   ```

2. **GitHub Secret hinzufügen:**
   - GitHub Repo → Settings → Secrets → Actions
   - Neues Secret: `GCP_SA_KEY`
   - Wert: Inhalt von `key.json` einfügen

3. **Push zu main branch:**
   ```bash
   git push origin main
   ```
   → Deployment läuft automatisch!

---

## GitHub Repository Setup

### Erste Schritte

1. **Git Repository initialisieren:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **GitHub Repository erstellen:**
   - Gehe zu GitHub.com
   - Erstelle neues Repository (z.B. `think11-app`)
   - **NICHT** README, .gitignore oder License hinzufügen

3. **Repository verbinden:**
   ```bash
   git remote add origin https://github.com/DEIN-USERNAME/think11-app.git
   git branch -M main
   git push -u origin main
   ```

---

## Welche Deployment-Methode?

- **Firebase Hosting**: Schneller, einfacher, kostenlos für kleine Sites
- **Cloud Run**: Mehr Kontrolle, Skalierung, Container-basiert

**Empfehlung:** Firebase Hosting für diese App (statische React-App)

---

## Troubleshooting

### Build-Fehler
```bash
npm ci  # Clean install
npm run build  # Prüfe Build-Output
```

### Firebase-Deployment-Fehler
```bash
firebase login --reauth
firebase use silent-room-238de
```

### Cloud Run-Fehler
```bash
gcloud auth application-default login
gcloud config set project silent-room-238de
```

### GitHub Actions-Fehler
- Prüfe Secrets in GitHub Settings
- Prüfe Logs in Actions Tab
- Stelle sicher, dass Service Account die richtigen Permissions hat
