# Schedule Tracker Hub

Schedule Tracker Hub is a browser-based planning dashboard for:

- schedules
- leave and holiday types
- meetings and notes
- projects
- finance records
- shared to-dos

The app now uses a simple local setup:

- frontend served locally by `server.js`
- data stored in local [db.json](/d:/PranavData/scheduleTrackerProject/db.json)
- no Firebase database
- no cloud deployment required

## Quick Start

From `D:\PranavData\scheduleTrackerProject` run:

```powershell
cmd /c npm install
set PORT=3001
cmd /c npm start
```

Then open:

```text
http://127.0.0.1:3001
```

Default login:

- Username: `admin`
- Password: `admin`

If port `3000` is free on your machine, you can also use:

```powershell
cmd /c npm start
```

Then open:

```text
http://127.0.0.1:3000
```

## How it works

When you run `npm start`:

1. `scripts/sync-public.js` copies frontend files into `public/`
2. `server.js` starts the local web server
3. the app reads and writes data from [db.json](/d:/PranavData/scheduleTrackerProject/db.json)

The current storage flow is selected in [src/store/index.js](/d:/PranavData/scheduleTrackerProject/src/store/index.js), which now keeps the app on the local JSON store.

## Project structure

- Frontend source: `index.html`, `dashboard.html`, `styles.css`, `login.js`, `dashboard-dynamic.js`
- Frontend output for serving: `public/`
- API server: [server.js](/d:/PranavData/scheduleTrackerProject/server.js)
- Data store selector: [src/store/index.js](/d:/PranavData/scheduleTrackerProject/src/store/index.js)
- JSON store: [src/store/json-store.js](/d:/PranavData/scheduleTrackerProject/src/store/json-store.js)
- Local data file: [db.json](/d:/PranavData/scheduleTrackerProject/db.json)
- Public sync script: [scripts/sync-public.js](/d:/PranavData/scheduleTrackerProject/scripts/sync-public.js)
- Environment template: [.env.example](/d:/PranavData/scheduleTrackerProject/.env.example)

## Useful commands

Install dependencies:

```powershell
cmd /c npm install
```

Start locally on port `3000`:

```powershell
cmd /c npm start
```

Start locally on port `3001`:

```powershell
set PORT=3001
cmd /c npm start
```

Check script syntax:

```powershell
cmd /c npm run check
```

## Notes

- `db.json` is the current database for this project
- changes made in the app are saved locally to `db.json`
- this project is now documented as a local-only app unless you decide to add hosting later

## Node version

This project declares Node `>=20`.

Recommended versions:

- Node `20`
- Node `22`
