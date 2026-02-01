# John Link 🔗

**Activity Tracker per Professionisti**

Un'app per tracciare le tue attività lavorative, gestire progetti e aziende, e monitorare il tempo dedicato.

## Features

- 📊 **Dashboard** con statistiche giornaliere, settimanali e mensili
- ⏱️ **Timer integrato** per tracciare il tempo in tempo reale
- 🏢 **Gestione Aziende** - organizza le attività per azienda
- 📁 **Gestione Progetti** - collega progetti alle aziende
- 🏷️ **Categorie** - Meeting, Sviluppo, Pianificazione, Admin, Comunicazione, Ricerca
- 📈 **Report** per azienda e categoria

## Quick Start

```bash
# Installa dipendenze
npm install

# Avvia il server
npm start

# Apri http://localhost:3000
```

## Tech Stack

- **Backend:** Node.js + Express
- **Database:** SQLite (better-sqlite3)
- **Frontend:** React + Tailwind CSS (via CDN)

## API Endpoints

### Companies
- `GET /api/companies` - Lista aziende
- `POST /api/companies` - Crea azienda
- `PUT /api/companies/:id` - Modifica azienda
- `DELETE /api/companies/:id` - Elimina azienda

### Projects
- `GET /api/projects` - Lista progetti
- `POST /api/projects` - Crea progetto
- `PUT /api/projects/:id` - Modifica progetto
- `DELETE /api/projects/:id` - Elimina progetto

### Activities
- `GET /api/activities` - Lista attività (filtri: date, company_id, project_id, limit)
- `POST /api/activities` - Crea attività
- `PUT /api/activities/:id` - Modifica attività
- `DELETE /api/activities/:id` - Elimina attività

### Stats
- `GET /api/stats` - Dashboard statistics

## Struttura

```
john-link/
├── server/
│   ├── index.js      # Express server + API routes
│   └── database.js   # SQLite setup + schema
├── public/
│   └── index.html    # React SPA
├── data/
│   └── johnlink.db   # SQLite database (auto-created)
└── package.json
```

## Prossimi Sviluppi

- [ ] Autenticazione utente
- [ ] Export dati (CSV, PDF)
- [ ] Mobile app
- [ ] Integrazione calendario
- [ ] Notifiche e reminder
- [ ] Team/dipendenti tracking

---

Built with ❤️ for productivity
