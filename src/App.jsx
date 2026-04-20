import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HealthDataProvider } from './context/HealthDataContext'
import Sidebar from './components/Sidebar'
import ToastContainer from './components/ToastContainer'
import Dashboard from './pages/Dashboard'
import Journal from './pages/Journal'
import Medications from './pages/Medications'
import Report from './pages/Report'
import Profile from './pages/Profile'

// Lazy load the heavy Insights page (Recharts bundle)
const Insights = lazy(() => import('./pages/Insights'))

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, flexDirection: 'column' }}>
      <div className="spinner" />
      <div style={{ color: 'var(--text3)', fontSize: '0.875rem' }}>Loading insights...</div>
    </div>
  )
}

export default function App() {
  return (
    <HealthDataProvider>
      <BrowserRouter>
        <div className="layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/medications" element={<Medications />} />
              <Route path="/insights" element={
                <Suspense fallback={<LoadingFallback />}>
                  <Insights />
                </Suspense>
              } />
              <Route path="/report" element={<Report />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
        </div>
        <ToastContainer />
      </BrowserRouter>
    </HealthDataProvider>
  )
}
