# ⚡ Schnelle Migration zu Firebase Hosting

## In 3 Schritten zu schnelleren Deployments!

### 1️⃣ Firebase Hosting aktivieren
👉 https://console.firebase.google.com/project/silent-room-238de/hosting
- Klicke "Get started"
- Wähle "Classic" (nicht App Hosting!)
- Public directory: `dist`
- Single-page app: `Yes`

### 2️⃣ Service Account Secret hinzufügen
👉 https://console.firebase.google.com/project/silent-room-238de/settings/serviceaccounts/adminsdk
- "Generate new private key" → JSON herunterladen
- GitHub: https://github.com/think11de/silenroom/settings/secrets/actions
- Neues Secret: `FIREBASE_SERVICE_ACCOUNT`
- Wert: Kompletten JSON-Inhalt einfügen

### 3️⃣ Testen
```bash
npm run build
firebase deploy --only hosting
```

**Fertig!** Ab jetzt: Jeder Push → Deployment in 1-3 Minuten! 🚀

---

**Vorteile:**
- ⚡ 5x schneller (1-3 Min statt 10-15 Min)
- 💰 Kostenlos
- 🎯 Perfekt für statische Apps

Siehe `MIGRATION_TO_HOSTING.md` für Details.
