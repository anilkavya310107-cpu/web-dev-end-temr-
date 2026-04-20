# 🩺 MediMind — Personal Health Intelligence Dashboard

A full React project with **no backend** — all data stored in `localStorage`.

## Quick Start

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 + Vite | Framework & build |
| React Router v6 | 6 pages with navigation |
| Recharts | Charts on Dashboard & Insights |
| date-fns | Date formatting |
| lucide-react | Icons |
| localStorage | All data persistence (no backend) |

## React Concepts Used (Rubric Coverage)

| Concept | Where |
|---------|-------|
| `useState` | All forms, toggles, modal open/close |
| `useEffect` | localStorage sync, timers |
| `useContext` | `HealthDataContext` (global data), `ThemeContext` |
| `useMemo` | Chart data, filtered lists, report generation |
| `useCallback` | Form submit handlers, CRUD operations |
| `useRef` | Auto-focus symptom input, print ref |
| `useReducer` | Medication form (ADD/REMOVE/TOGGLE actions) |
| `React.lazy` | Insights page (lazy loaded) |
| `Suspense` | Loading fallback for Insights |
| Custom Hooks | `useLocalStorage`, `useInsights` |
| Controlled Components | All forms |
| Lifting State | JournalForm → Dashboard summary |
| React Router | 6 routes with nested layout |

## Pages

- `/` — Dashboard: stats, 7-day chart, today's meds
- `/journal` — Symptom Journal: log & browse entries
- `/medications` — Medication Tracker: streaks, adherence
- `/insights` — Health Insights: 30-day charts, AI correlations
- `/report` — Doctor Report: printable 30-day summary
- `/profile` — Profile & Settings

## Features

1. **Medication Tracker** — add meds, mark taken/missed, 28-day streak calendar
2. **Symptom Journal** — severity slider, mood/sleep/energy, filterable history
3. **Insights Dashboard** — Recharts trend lines, correlation detector, radar chart
4. **Doctor Report** — auto-generated printable PDF-ready 30-day summary
5. **Health Profile** — conditions, allergies, stats — all persisted to localStorage
