# Schedule Tracker Hub

Schedule Tracker Hub is a browser-based planning dashboard for:

- schedules
- leave and holiday types
- meetings and notes
- projects
- finance records
- shared to-dos

The repo is prepared for this architecture:

- `Firebase Hosting` for the frontend
- `Cloud Run` for the Node API
- `PostgreSQL` for production data
- `db.json` as the current local fallback datastore

## Current status

Right now the app can run locally and is structured for later online deployment.

- Local app: works through `server.js`
- Frontend deploy folder: `public/`
- Production-ready Firebase config: [firebase.json](/d:/PranavData/scheduleTrackerProject/firebase.json)
- Production-ready container config: [Dockerfile](/d:/PranavData/scheduleTrackerProject/Dockerfile)
- Database schema: [schema.sql](/d:/PranavData/scheduleTrackerProject/database/schema.sql)
- Database seed: [seed.sql](/d:/PranavData/scheduleTrackerProject/database/seed.sql)

## Project structure

- Frontend source: `index.html`, `dashboard.html`, `styles.css`, `login.js`, `dashboard-dynamic.js`
- Frontend output for hosting: `public/`
- API server: [server.js](/d:/PranavData/scheduleTrackerProject/server.js)
- Data providers: [src/store](/d:/PranavData/scheduleTrackerProject/src/store)
- Public sync script: [scripts/sync-public.js](/d:/PranavData/scheduleTrackerProject/scripts/sync-public.js)
- Firebase config: [firebase.json](/d:/PranavData/scheduleTrackerProject/firebase.json)
- Environment template: [.env.example](/d:/PranavData/scheduleTrackerProject/.env.example)
- CI workflow: [.github/workflows/ci.yml](/d:/PranavData/scheduleTrackerProject/.github/workflows/ci.yml)

## Local run

Install packages:

```powershell
npm install
```

Start the app:

```powershell
npm start
```

Open:

```text
http://127.0.0.1:3000
```

If port `3000` is already busy, use:

```powershell
set PORT=3001
npm start
```

Then open:

```text
http://127.0.0.1:3001
```

What `npm start` does:

1. runs `node scripts/sync-public.js`
2. copies frontend files into `public/`
3. starts `server.js`

If `DATABASE_URL` is not set, the app uses `db.json`.

## Default login

- Username: `admin`
- Password: `admin`

These can later be changed with:

- `DEMO_ADMIN_USERNAME`
- `DEMO_ADMIN_PASSWORD`

## Node version note

This project currently declares Node `>=20`.

Your machine is on Node `25`, which can run the app locally, but Firebase CLI may show engine warnings. The safer versions for Firebase tooling are usually:

- Node `20`
- Node `22`

## Firebase Hosting

Firebase Hosting can host the frontend from `public/`.

Important:

- Firebase Hosting alone is enough to show the pages
- the full app also needs the backend API
- your `firebase.json` already rewrites `/api/**` to Cloud Run
- so the final hosted version expects both Firebase Hosting and Cloud Run

### Frontend deploy steps

1. Create a Firebase project in the Firebase Console
2. Generate the hosting folder with `npm run prepare:public`
3. Log in to Firebase
4. List your Firebase projects
5. Select your project with `use --add`
6. Deploy hosting

Commands:

```powershell
npm run prepare:public
npx firebase-tools login
npx firebase-tools projects:list
npx firebase-tools use --add
npx firebase-tools deploy --only hosting --project scheduletrackerproject
```

When `use --add` asks for an alias, you can choose any short name. In your current setup:

- Firebase project id: `scheduletrackerproject`
- Alias used locally: `pka`

That means these also work:

```powershell
npx firebase-tools deploy --only hosting --project scheduletrackerproject
```

or:

```powershell
npx firebase-tools deploy --only hosting --project pka
```

Do not run:

```powershell
npx firebase-tools deploy --only hosting --project YOUR_PROJECT_ID
```

That was only a placeholder example and will fail unless replaced with the real project id.

If global CLI works on your machine, these also work:

```powershell
firebase login
firebase deploy --only hosting
```

If Windows says `'firebase' is not recognized`, keep using `npx firebase-tools ...`.

To inspect your npm global install location:

```powershell
npm config get prefix
```

If needed, add that npm global folder to your Windows `PATH`.

Your current Firebase setup is:

- Firebase project id: `scheduletrackerproject`
- Local alias: `pka`

If you want to keep the selected project saved in this repo, create a local `.firebaserc` file after `use --add` with content like this:

```json
{
  "projects": {
    "default": "scheduletrackerproject",
    "pka": "scheduletrackerproject"
  }
}
```

## Cloud Run

Cloud Run will host the backend API.

The backend is already prepared for Cloud Run:

- binds to `0.0.0.0`
- reads `PORT` from the environment
- can use PostgreSQL through `DATABASE_URL`
- serves frontend files from `public/` when running as one app

Main environment variables are shown in [.env.example](/d:/PranavData/scheduleTrackerProject/.env.example):

- `PORT`
- `HOST`
- `DEMO_ADMIN_USERNAME`
- `DEMO_ADMIN_PASSWORD`
- `DATABASE_URL`
- `PGSSLMODE`
- `FIREBASE_PROJECT_ID`
- `GOOGLE_CLOUD_REGION`
- `CLOUD_RUN_SERVICE`

## Database

For the Google path, use `Cloud SQL for PostgreSQL`.

Basic flow:

1. Create a PostgreSQL instance in Google Cloud SQL
2. Create a database such as `schedule_tracker`
3. Run [schema.sql](/d:/PranavData/scheduleTrackerProject/database/schema.sql)
4. Optionally run [seed.sql](/d:/PranavData/scheduleTrackerProject/database/seed.sql)
5. Set `DATABASE_URL` on Cloud Run

Once `DATABASE_URL` is present, the backend automatically switches from `db.json` to PostgreSQL.

## Windows quick start

From `D:\PranavData\scheduleTrackerProject`:

Run locally:

```powershell
set PORT=3001
npm start
```

Deploy frontend:

```powershell
npm run prepare:public
npx firebase-tools login
npx firebase-tools projects:list
npx firebase-tools use --add
npx firebase-tools deploy --only hosting --project scheduletrackerproject
```

For this repo right now, the direct deploy command is:

```powershell
npx firebase-tools deploy --only hosting --project scheduletrackerproject
```

Using your alias also works:

```powershell
npx firebase-tools deploy --only hosting --project pka
```

## CI

The repo includes a basic GitHub Actions workflow in [.github/workflows/ci.yml](/d:/PranavData/scheduleTrackerProject/.github/workflows/ci.yml).

It currently:

- installs dependencies
- syncs the deployable frontend into `public/`
- syntax-checks the main server and browser scripts

This is the base for later CI/CD automation.
