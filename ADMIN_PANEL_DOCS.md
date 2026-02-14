# 🔐 Pannello Admin - Documentazione

## 📋 Panoramica delle Modifiche

È stato implementato un **sistema completo di gestione utenti tramite pannello admin**, rimuovendo la possibilità di registrazione pubblica mantenendo intatte le funzionalità di login.

---

## ✅ Modifiche Implementate

### 1. **Modello Dati**
- ✨ Aggiunto campo `isAdmin?: boolean` all'interfaccia `User` in `src/types.ts`
- 🔧 Aggiornato l'utente esistente in `data/users.json` con flag `isAdmin: true`

### 2. **Funzioni Database**
Aggiunte nuove funzioni in `src/lib/db.ts`:
- `findUserById(id: string)` - Trova utente per ID
- `updateUser(id: string, updates: Partial<User>)` - Aggiorna utente
- `deleteUser(id: string)` - Elimina utente

### 3. **API Endpoints**
Creato nuovo endpoint `/api/admin/users` con tre metodi:
- **GET** - Lista tutti gli utenti (senza passwordHash)
- **POST** - Crea nuovo utente con hash password
- **DELETE** - Elimina utente (impedisce auto-eliminazione)

🔒 **Tutti i metodi sono protetti**: solo utenti con `isAdmin: true` possono accedervi.

### 4. **Pannello Admin**
Creata pagina `/admin/users` con:
- 📊 Tabella utenti con avatar, email, ruolo
- ➕ Modal per creare nuovi utenti
- 🗑️ Funzione eliminazione utenti (con conferma)
- 🎨 Design moderno con Bootstrap e animazioni
- 🔐 Protezione: redirect a `/login` se non admin

### 5. **Disabilitazione Registrazione Pubblica**
- 🚫 Pagina `/register` sostituita con messaggio informativo
- 🚫 API `/api/auth/register` disabilitata (ritorna 403)
- 🔗 Rimosso link "Registrati" dalla pagina di login
- 🔗 Rimosso bottone "Register" dalla navbar

### 6. **Navigazione**
- ⭐ Aggiunto link "Admin" nella navbar (visibile solo agli admin)
- 🎨 Stile distintivo per il link admin (oro in dark mode, rosso in light mode)

---

## 🚀 Come Usare il Pannello Admin

### Accesso al Pannello
1. Effettua il login con un account admin
2. Clicca su "Admin" nella navbar
3. Verrai reindirizzato a `/admin/users`

### Creare un Nuovo Utente
1. Clicca sul bottone "Nuovo Utente"
2. Compila il form:
   - Nome *
   - Cognome *
   - Email *
   - Password * (minimo 6 caratteri)
   - ☑️ Rendi amministratore (opzionale)
3. Clicca "Crea Utente"
4. L'utente verrà aggiunto al sistema con password hashata

### Eliminare un Utente
1. Nella tabella, clicca "Elimina" accanto all'utente
2. Conferma l'operazione
3. L'utente verrà rimosso dal sistema

⚠️ **Nota**: Non puoi eliminare il tuo stesso account.

---

## 🔒 Sicurezza

### Protezioni Implementate
- ✅ Tutti gli endpoint admin richiedono autenticazione
- ✅ Verifica del flag `isAdmin` su ogni richiesta
- ✅ Password hashate con bcrypt (10 rounds)
- ✅ Impossibile eliminare il proprio account admin
- ✅ Registrazione pubblica completamente disabilitata
- ✅ PasswordHash mai esposto nelle risposte API

### Primo Admin
L'utente esistente è stato automaticamente promosso ad admin:
```json
{
  "id": "b307c762-a07d-4d98-b0c9-39aa2c9887bc",
  "email": "vitolioce@gmail.com",
  "nome": "Vito",
  "cognome": "Lioce",
  "isAdmin": true
}
```

---

## 📁 File Modificati

### Nuovi File
- `src/pages/api/admin/users.ts` - API gestione utenti
- `src/pages/admin/users.astro` - Interfaccia pannello admin

### File Modificati
- `src/types.ts` - Aggiunto campo isAdmin
- `src/lib/db.ts` - Aggiunte funzioni CRUD utenti
- `src/pages/register.astro` - Sostituito con messaggio disabilitazione
- `src/pages/api/auth/register.ts` - Disabilitato endpoint
- `src/pages/login.astro` - Rimosso link registrazione
- `src/layouts/Layout.astro` - Aggiunto link admin, rimosso bottone register
- `data/users.json` - Aggiunto isAdmin all'utente esistente

---

## 🎨 Design Features

### Pannello Admin
- 🎯 Interfaccia pulita e professionale
- 🔵 Avatar circolari con iniziali
- 🏷️ Badge colorati per ruoli (Admin/Utente)
- ✨ Animazioni hover sulle righe
- 📱 Completamente responsive
- 🌓 Supporto dark/light mode
- ⚡ Alert dinamici per feedback operazioni

### Pagina Registrazione Disabilitata
- 🔒 Icona lucchetto animata
- ℹ️ Messaggi informativi chiari
- 🔗 Link rapidi a login e home
- 🎨 Design coerente con il resto dell'app

---

## 🔄 Workflow Gestione Utenti

```
┌─────────────────────────────────────────┐
│  Admin accede al pannello (/admin/users)│
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
    ┌───▼────┐         ┌────▼────┐
    │ Crea   │         │ Elimina │
    │ Utente │         │ Utente  │
    └───┬────┘         └────┬────┘
        │                   │
        ▼                   ▼
    ┌────────────────────────────┐
    │  Aggiornamento users.json  │
    └────────────────────────────┘
                  │
                  ▼
    ┌────────────────────────────┐
    │ Utente può effettuare login│
    └────────────────────────────┘
```

---

## 🧪 Testing

### Test Suggeriti
1. ✅ Accesso al pannello admin con account admin
2. ✅ Tentativo accesso con account non-admin (deve reindirizzare)
3. ✅ Creazione nuovo utente normale
4. ✅ Creazione nuovo utente admin
5. ✅ Eliminazione utente
6. ✅ Tentativo eliminazione del proprio account (deve fallire)
7. ✅ Tentativo registrazione pubblica (deve mostrare messaggio)
8. ✅ Login con nuovo utente creato

---

## 🎯 Vantaggi di Questa Soluzione

✅ **Sicurezza**: Controllo totale su chi può accedere al sistema
✅ **Semplicità**: Interfaccia intuitiva per gestire utenti
✅ **Flessibilità**: Possibilità di creare admin o utenti normali
✅ **Scalabilità**: Facilmente estendibile con nuove funzionalità
✅ **Professionalità**: Design moderno e user-friendly
✅ **Manutenibilità**: Codice pulito e ben organizzato

---

## 🔮 Possibili Estensioni Future

- 📧 Sistema di inviti via email
- 🔄 Modifica utenti esistenti
- 📊 Dashboard con statistiche
- 🔍 Ricerca e filtri utenti
- 📝 Log delle operazioni admin
- 👥 Gestione ruoli personalizzati
- 🔑 Reset password da admin

---

## 📞 Supporto

Per qualsiasi domanda o problema:
- Controlla i log del server
- Verifica i permessi dell'utente
- Assicurati che il file `users.json` sia scrivibile

---

**Implementato il**: 14 Febbraio 2026
**Versione**: 1.0.0
