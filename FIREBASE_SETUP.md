# Firebase Setup Guide

## Problem: "Backend Not Found" bei Firebase App Hosting

Du siehst diese Meldung, weil Firebase **App Hosting** aktiviert ist, aber die App für **Firebase Hosting** (statisches Hosting) konfiguriert ist.

## Lösung: Wechsel zu Firebase Hosting

### Option 1: Firebase Hosting aktivieren (Empfohlen für diese App)

1. **Gehe zur Firebase Console:**
   - https://console.firebase.google.com/project/silent-room-238de/hosting

2. **Aktiviere Firebase Hosting:**
   - Klicke auf "Get started" bei "Hosting"
   - Wähle "Classic" (nicht App Hosting)
   - Folge den Anweisungen

3. **GitHub Actions Secret einrichten:**
   - Gehe zu: https://console.firebase.google.com/project/silent-room-238de/settings/serviceaccounts/adminsdk
   - Klicke auf "Generate new private key"
   - Lade die JSON-Datei herunter
   - Gehe zu GitHub: Repository → Settings → Secrets and variables → Actions
   - Erstelle neues Secret: `FIREBASE_SERVICE_ACCOUNT`
   - Füge den **kompletten Inhalt** der JSON-Datei ein

4. **Erstes Deployment manuell:**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

5. **Automatisches Deployment:**
   - Push zu `main` branch → GitHub Actions deployt automatisch!

---

### Option 2: Firebase App Hosting verwenden (Für Full-Stack Apps)

Falls du App Hosting verwenden möchtest, brauchst du eine andere Konfiguration:

1. **Erstelle `apphosting.yaml`:**
   ```yaml
   runConfig:
     runtime: nodejs20
     env:
       - variable: NODE_ENV
         value: production
   ```

2. **Firebase App Hosting erwartet:**
   - Ein Backend/API
   - Server-Side Rendering
   - Oder eine Server-Funktion

**Für diese React-App ist Option 1 (Firebase Hosting) die richtige Wahl!**

---

## Troubleshooting

### "Backend Not Found" bleibt bestehen

1. **Prüfe ob Hosting aktiviert ist:**
   ```bash
   firebase projects:list
   firebase use silent-room-238de
   firebase hosting:sites:list
   ```

2. **Initialisiere Hosting neu:**
   ```bash
   firebase init hosting
   # Wähle: dist, Single-page app: Yes
   ```

3. **Deploy manuell testen:**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

### GitHub Actions Fehler

- **Prüfe Secret:** `FIREBASE_SERVICE_ACCOUNT` muss den kompletten JSON-Inhalt enthalten
- **Prüfe Permissions:** Service Account braucht "Firebase Hosting Admin"
- **Prüfe Logs:** GitHub Actions → Deploy to Firebase Hosting → View logs

---

## Nächste Schritte

1. ✅ Firebase Hosting aktivieren (nicht App Hosting)
2. ✅ Service Account Secret zu GitHub hinzufügen
3. ✅ Erstes Deployment: `npm run build && firebase deploy --only hosting`
4. ✅ Automatisches Deployment läuft bei jedem Push zu `main`
