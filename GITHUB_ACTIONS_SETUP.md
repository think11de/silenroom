# GitHub Actions für Firebase Hosting - Setup

## ✅ Automatisches Deployment einrichten

Der GitHub Actions Workflow ist bereits vorhanden! Du musst nur noch das Secret hinzufügen.

### Schritt 1: Service Account erstellen

1. **Gehe zu Firebase Console:**
   - https://console.firebase.google.com/project/silent-room-238de/settings/serviceaccounts/adminsdk

2. **Service Account erstellen:**
   - Klicke auf **"Generate new private key"**
   - Lade die JSON-Datei herunter
   - **WICHTIG:** Speichere diese Datei sicher!

### Schritt 2: GitHub Secret hinzufügen

1. **Gehe zu GitHub:**
   - https://github.com/think11de/silenroom/settings/secrets/actions

2. **Neues Secret erstellen:**
   - Klicke auf **"New repository secret"**
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Secret: Öffne die JSON-Datei und kopiere den **kompletten Inhalt**
   - Klicke **"Add secret"**

### Schritt 3: Firebase Hosting aktivieren

1. **Gehe zu Firebase Console:**
   - https://console.firebase.google.com/project/silent-room-238de/hosting

2. **Hosting aktivieren:**
   - Klicke auf **"Get started"**
   - Wähle **"Classic"** (nicht App Hosting!)
   - Public directory: `dist`
   - Single-page app: `Yes`

### Schritt 4: Testen

```bash
# Push zu main branch
git push origin main
```

→ GitHub Actions deployt automatisch in 1-3 Minuten! 🚀

---

## Was passiert automatisch?

1. **Push zu `main`** → GitHub Actions startet
2. **Build:** `npm ci && npm run build`
3. **Deploy:** Upload zu Firebase Hosting
4. **Fertig:** App ist live in 1-3 Minuten!

---

## Workflow prüfen

Der Workflow ist hier:
- `.github/workflows/deploy-firebase.yml`

Er läuft automatisch bei jedem Push zu `main`!

---

## Troubleshooting

### Workflow läuft nicht?
- Prüfe: GitHub → Actions Tab
- Prüfe: Secret `FIREBASE_SERVICE_ACCOUNT` existiert

### Deployment fehlgeschlagen?
- Prüfe: Firebase Hosting ist aktiviert
- Prüfe: Service Account hat "Firebase Hosting Admin" Rolle
- Prüfe: GitHub Actions Logs

### Build-Fehler?
- Prüfe: `npm run build` funktioniert lokal
- Prüfe: `dist/` Ordner wird erstellt

---

**Fertig!** Nach dem Secret-Setup läuft alles automatisch! 🎉
