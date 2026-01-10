# SPÄTER TODO - Aufgeschobene Aufgaben

**Erstellt:** 2026-01-10

Diese Liste enthält Aufgaben die bewusst aufgeschoben wurden, um sie nicht zu vergessen.

---

## 🔌 Remote-Zugriff auf PC

**Priorität:** Mittel  
**Grund für Aufschub:** Erst muss die Vercel-Umgebung stabil laufen

### Aufgaben:

1. **Cloudflare Tunnel einrichten**
   - Kostenloses Konto bei Cloudflare
   - `cloudflared` auf PC installieren
   - Tunnel zu lokalem MCP-Server

2. **MCP-Server auf PC**
   - Lokaler Server der auf Anfragen von Vercel wartet
   - Zugriff auf Dateisystem, Git, etc.
   - Authentifizierung/Sicherheit

3. **Alternative: Tailscale/ngrok**
   - Falls Cloudflare nicht funktioniert
   - ngrok für schnelle Tests

---

## 🎨 Design-Templates einarbeiten

**Priorität:** Mittel  
**Grund für Aufschub:** Einfachster Weg zuerst - Design kommt später

### Templates vorhanden:

1. **Landing Page Template**
   - Pfad: `templates/landing-page/`
   - Repo: `https://github.com/NeXifiyAI/nexifyai-landing-page-template.git`
   - Features: Hero, Pricing, FAQ, Testimonials, etc.

2. **Backend Elemente Template**
   - Pfad: `templates/backend-elemente/`
   - Repo: `https://github.com/NeXifiyAI/nexifyai-backend-template-elemente.git`
   - Features: UI Components (Button, Card, Input, Dialog, etc.)

### TODO:

- [ ] Landing Page Components übernehmen
- [ ] UI Components in `/components/ui/` integrieren
- [ ] Farben/Theme anpassen (Keppel/Baltic-Sea Palette)
- [ ] Icons vereinheitlichen (Lucide React)

---

## 🧠 RAG System

**Priorität:** Hoch (nach Remote-Zugriff)

### Aufgaben:

- [ ] Qdrant Collection erstellen (`brain_memory`)
- [ ] Embedding-Pipeline für Dokumente
- [ ] Retrieval in Chat-API integrieren
- [ ] Knowledge Base aufbauen

---

## 🔐 Auth System

**Priorität:** Niedrig (aktuell nicht benötigt)

### Aufgaben:

- [ ] NextAuth konfigurieren
- [ ] Login/Logout Flow
- [ ] User-spezifische Chats

---

## 📝 Notizen

- Templates sind bereits geklont unter `templates/`
- Alle Credentials in `nexify-ai-assietenten-api-keys.txt`
- Vercel Projekt: `pascals-projects-2864de33/dashboard`
