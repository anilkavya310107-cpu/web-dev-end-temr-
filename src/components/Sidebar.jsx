import { NavLink, useLocation } from 'react-router-dom'
import { useHealth } from '../context/HealthDataContext'
import { format } from 'date-fns'

const NAV = [
  { to: '/', label: 'Dashboard', icon: DashIcon },
  { to: '/journal', label: 'Journal', icon: JournalIcon },
  { to: '/medications', label: 'Medications', icon: MedIcon },
  { to: '/insights', label: 'Insights', icon: InsightIcon },
  { to: '/report', label: 'Doctor Report', icon: ReportIcon },
  { to: '/profile', label: 'Profile', icon: ProfileIcon },
]

function DashIcon() {
  return <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
}
function JournalIcon() {
  return <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
}
function MedIcon() {
  return <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>
}
function InsightIcon() {
  return <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
}
function ReportIcon() {
  return <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
}
function ProfileIcon() {
  return <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
}

export default function Sidebar() {
  const { profile, journals } = useHealth()
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayJournal = journals.find(j => j.date === today)

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 0',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 28px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34,
            background: 'linear-gradient(135deg, var(--accent), var(--teal))',
            borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16
          }}>🩺</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text)' }}>MediMind</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text3)', marginTop: -2 }}>Health Intelligence</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            padding: '10px 12px',
            borderRadius: 9,
            marginBottom: 2,
            fontSize: '0.875rem',
            fontWeight: 500,
            color: isActive ? 'var(--text)' : 'var(--text2)',
            background: isActive ? 'var(--bg3)' : 'transparent',
            border: isActive ? '1px solid var(--border2)' : '1px solid transparent',
            transition: 'all var(--transition)',
          })}>
            {({ isActive }) => (
              <>
                <span style={{ color: isActive ? 'var(--accent2)' : 'var(--text3)' }}><Icon /></span>
                {label}
                {to === '/journal' && !todayJournal && (
                  <span style={{
                    marginLeft: 'auto', width: 7, height: 7,
                    borderRadius: '50%', background: 'var(--amber)',
                  }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--coral))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 600, color: '#fff'
          }}>
            {profile.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{profile.name || 'User'}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>
              {format(new Date(), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
