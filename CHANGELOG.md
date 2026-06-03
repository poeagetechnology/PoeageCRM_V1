# Changelog

All notable changes to PoeageCRM are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] — 2026-03-16

### Added
- **Authentication** — Email/password sign-in & sign-up with Firebase Auth
- **Dashboard** — KPI stats, revenue chart, task breakdown, recent projects & urgent tasks
- **Clients** — Full CRUD, search/filter, status badges, detail page
- **Contacts** — Per-client contact management with primary flag
- **Projects** — Full CRUD, kanban board, table view, progress & budget tracking
- **Tasks** — Global kanban + table view, priority/status filters, per-project tasks
- **Time Tracking** — Live timer, manual time entry, billable/non-billable tracking
- **Employees** — Card & table views, department filtering, salary management
- **Payroll** — Pay records, auto net-pay calculator, status workflow, summary stats
- **Reports** — Revenue vs target chart, project status pie, task velocity, team utilization
- **Profile & Settings** — Display name, role, department, password change, notification prefs
- **Toast Notifications** — Global success/error/warning/info toast system
- **Firebase Firestore** — Full CRUD via generic service factory with TypeScript types
- **Firestore Security Rules** — Auth-gated read/write rules
- **Seed Script** — Demo data seeder for all collections
- **Dark Theme** — Full dark design system with Tailwind custom tokens
- **Responsive sidebar navigation** — Collapsible with user profile widget

### Technical
- React 18 + TypeScript strict mode
- Tailwind CSS with custom design tokens
- Zustand for auth state (persisted)
- React Hook Form for all forms
- Recharts for all data visualizations
- TanStack Query configured
- React Router v6 with protected routes
- Vite build system with path aliases

---

## Roadmap

### [1.1.0] — Planned
- [ ] Invoice generation with PDF export
- [ ] Payslip PDF download per employee
- [ ] Gantt chart view for project timelines
- [ ] Bulk task import via CSV
- [ ] Email notification integration

### [1.2.0] — Planned
- [ ] Role-based access control (granular per-route)
- [ ] Client portal (read-only project view)
- [ ] Recurring billing automation
- [ ] Slack / Teams webhook integration
- [ ] Google Calendar sync

### [2.0.0] — Planned
- [ ] Mobile PWA with offline support
- [ ] AI-powered deadline risk alerts
- [ ] Multi-workspace support
- [ ] White-label branding options
