# PoeageCRM

A full-scale, dark-themed CRM built with **React 18 + TypeScript + Tailwind CSS + Firebase**.

---

## Features

| Module | Features |
|--------|----------|
| **Auth** | Email/password sign-in & sign-up, Firebase Auth, protected routes |
| **Dashboard** | KPI stats, revenue chart, task breakdown pie, recent projects & tasks |
| **Clients** | Full CRUD, status/stage badges, search/filter, detail page with contacts & linked projects |
| **Contacts** | Per-client contacts with primary flag |
| **Projects** | Full CRUD, Kanban board, table view, progress tracking, budget |
| **Tasks** | Global Kanban + Table views, per-project tasks, priority & status filters |
| **Employees** | Card + Table views, department filter, role/salary management |
| **Payroll** | Pay records, auto net pay calculator, status tracking, summary stats |

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database** → Start in test mode (or locked mode, then add rules)
5. Enable **Storage** (optional for file uploads) in Firebase Console → Storage

6. Copy `.env.example` to `.env.local` and fill in your credentials.

- macOS/Linux:
  ```bash
  cp .env.example .env.local
  ```
- Windows PowerShell:
  ```powershell
  Copy-Item .env.example .env.local
  ```

7. Open `.env.local` and replace placeholder values from Firebase Console → Project Settings → General → Your apps.

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

8. Ensure `.env.local` is in `.gitignore` (it is by default). Do not commit secret keys.

9. Check Firebase config in `src/lib/firebase.ts`. It reads from `import.meta.env` and falls back to dummy placeholders if missing.

### 3. Deploy Firestore Rules

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules,firestore:indexes
```

### 3.1 Firebase CLI troubleshooting

- If you see:
  - `DeprecationWarning: The \'punycode\' module is deprecated.`
  - This is a Node/Firebase CLI warning, not a blocking issue. Continue with `firebase login`.

- If you see the Gemini opt-in prompt:
  - `The Firebase CLI’s MCP server feature can optionally make use of Gemini in Firebase...`
  - Answer `n` to skip (recommended for CI and local dev). Example:

  ```bash
  (y/n) n
  ```

- If `firebase login` throws `An unexpected error has occurred`:
  - Run `firebase logout` then `firebase login` again.
  - Ensure Node version is supported (>=14, <=22 for CLI).
  - Try `npm install -g firebase-tools@latest`.

### 4. Run development server

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) and create your first account.

---

## Project Structure

```
src/
├── components/
│   ├── ui/            # Reusable UI primitives (Button, Input, Modal, etc.)
│   ├── AppLayout.tsx  # Sidebar + main layout
│   └── Sidebar.tsx    # Navigation sidebar
├── features/
│   ├── auth/          # SignIn, SignUp pages
│   ├── dashboard/     # Dashboard with charts
│   ├── clients/       # Clients list + detail pages
│   ├── projects/      # Projects list + detail + kanban
│   ├── tasks/         # Global tasks kanban + table
│   ├── employees/     # Employee directory
│   └── payroll/       # Payroll management
├── hooks/
│   └── useAuthStore.ts  # Zustand auth state
├── lib/
│   ├── firebase.ts    # Firebase initialization
│   └── utils.ts       # Helpers, formatters, color maps
├── routes/
│   └── PrivateRoute.tsx
├── services/
│   ├── authService.ts       # Auth operations
│   └── firestoreService.ts  # Generic CRUD factory
├── styles/
│   └── globals.css
└── types/
    └── index.ts       # All TypeScript interfaces
```

---

## Tech Stack

- **React 18** + TypeScript
- **Tailwind CSS** — dark design system with custom tokens
- **Firebase** — Auth + Firestore (no backend required)
- **React Router v6** — file-based routing with protected routes
- **Zustand** — lightweight auth state management
- **React Hook Form** — form handling + validation
- **Recharts** — dashboard charts
- **TanStack Query** — server state management
- **Lucide React** — icon library
- **date-fns** — date formatting

---

## Deployment

### Vercel (recommended)
```bash
npm run build
# Connect GitHub repo to Vercel, set env vars in Vercel dashboard
```

### Firebase Hosting
```bash
npm run build
firebase init hosting
firebase deploy
```

---

## Roadmap (Next Phases)

- [ ] Time tracking (timers + time entries per task)
- [ ] Invoice generation (PDF export)
- [ ] Payslip PDF download
- [ ] Notifications system
- [ ] Role-based access control (granular)
- [ ] Gantt chart for projects
- [ ] Email integrations
- [ ] Mobile PWA

---

## License

MIT — free to use and extend for your business.
