import { useMemo } from 'react'
import { useHealth } from '../context/HealthDataContext'
import { format, subDays, isToday, parseISO } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--bg3)', border: '1px solid var(--border2)',
        borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem'
      }}>
        <div style={{ color: 'var(--text2)', marginBottom: 4 }}>{label}</div>
        {payload.map(p => (
          <div key={p.name} style={{ color: p.color, display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            <span>{p.name}</span><strong>{p.value}</strong>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { journals, medications, profile } = useHealth()
  const navigate = useNavigate()
  const today = format(new Date(), 'yyyy-MM-dd')

  const todayJournal = journals.find(j => j.date === today)

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
      const j = journals.find(e => e.date === date)
      return {
        day: format(subDays(new Date(), 6 - i), 'EEE'),
        Mood: j?.mood || null,
        Sleep: j?.sleep || null,
        Energy: j?.energy || null,
      }
    })
  }, [journals])

  const todayMeds = useMemo(() => medications, [medications])
  const takenToday = useMemo(() =>
    medications.filter(m => m.taken?.[today]).length,
    [medications, today]
  )

  const totalSymptoms = useMemo(() =>
    journals.slice(0, 7).reduce((acc, j) => acc + (j.symptoms?.length || 0), 0),
    [journals]
  )

  const avgMood = useMemo(() => {
    const valid = journals.slice(0, 7).filter(j => j.mood)
    if (!valid.length) return null
    return (valid.reduce((a, b) => a + b.mood, 0) / valid.length).toFixed(1)
  }, [journals])

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h1>Good {getTimeOfDay()}, {profile.name || 'there'} 👋</h1>
        <p>{format(new Date(), 'EEEE, MMMM d')} · Here's your health snapshot</p>
      </div>

      {/* Today alert */}
      {!todayJournal && (
        <div onClick={() => navigate('/journal')} style={{
          background: 'linear-gradient(135deg, rgba(124,106,255,0.12), rgba(45,212,167,0.08))',
          border: '1px solid rgba(124,106,255,0.3)',
          borderRadius: 'var(--radius)',
          padding: '16px 20px',
          marginBottom: 24,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all var(--transition)',
        }}>
          <div>
            <div style={{ fontWeight: 500, marginBottom: 2 }}>📝 Log today's symptoms</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>You haven't logged anything yet today</div>
          </div>
          <span style={{ fontSize: '1.2rem', color: 'var(--accent2)' }}>→</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Meds Today</div>
          <div className="stat-value" style={{ color: takenToday === todayMeds.length ? 'var(--teal)' : 'var(--text)' }}>
            {takenToday}/{todayMeds.length}
          </div>
          <div className="stat-sub">
            {takenToday === todayMeds.length ? '✓ All taken' : `${todayMeds.length - takenToday} remaining`}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Mood (7d)</div>
          <div className="stat-value">{avgMood ?? '—'}</div>
          <div className="stat-sub">out of 10</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Symptoms (7d)</div>
          <div className="stat-value" style={{ color: totalSymptoms > 10 ? 'var(--coral)' : 'var(--text)' }}>
            {totalSymptoms}
          </div>
          <div className="stat-sub">logged this week</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Journal Streak</div>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>
            {getJournalStreak(journals)}
          </div>
          <div className="stat-sub">days in a row</div>
        </div>
      </div>

      {/* Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 500, marginBottom: 2 }}>7-Day Overview</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>Mood · Sleep · Energy</div>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--accent2)' }}>● Mood</span>
            <span style={{ color: 'var(--teal)' }}>● Sleep</span>
            <span style={{ color: 'var(--amber)' }}>● Energy</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="day" tick={{ fill: 'var(--text3)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 10]} tick={{ fill: 'var(--text3)', fontSize: 12 }} axisLine={false} tickLine={false} width={24} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="Mood" stroke="var(--accent2)" strokeWidth={2} dot={{ fill: 'var(--accent2)', r: 3 }} connectNulls />
            <Line type="monotone" dataKey="Sleep" stroke="var(--teal)" strokeWidth={2} dot={{ fill: 'var(--teal)', r: 3 }} connectNulls />
            <Line type="monotone" dataKey="Energy" stroke="var(--amber)" strokeWidth={2} dot={{ fill: 'var(--amber)', r: 3 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Today meds */}
      <div className="grid-2">
        <div className="card">
          <div style={{ fontWeight: 500, marginBottom: 16 }}>Today's Medications</div>
          {todayMeds.length === 0 ? (
            <div className="empty-state">
              <p>No medications added</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todayMeds.map(med => {
                const isTaken = med.taken?.[today]
                const colorMap = { teal: 'var(--teal)', amber: 'var(--amber)', accent: 'var(--accent2)', coral: 'var(--coral)', green: 'var(--green)' }
                const c = colorMap[med.color] || 'var(--accent2)'
                return (
                  <div key={med.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px',
                    background: isTaken ? 'rgba(74,222,128,0.06)' : 'var(--bg3)',
                    borderRadius: 9,
                    border: `1px solid ${isTaken ? 'rgba(74,222,128,0.2)' : 'var(--border)'}`,
                    opacity: isTaken ? 0.75 : 1,
                    transition: 'all var(--transition)',
                  }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%', background: c, flexShrink: 0
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem', textDecoration: isTaken ? 'line-through' : 'none' }}>
                        {med.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{med.dosage} · {med.time}</div>
                    </div>
                    {isTaken && <span style={{ color: 'var(--green)', fontSize: '0.75rem' }}>✓ Taken</span>}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent journal */}
        <div className="card">
          <div style={{ fontWeight: 500, marginBottom: 16 }}>Recent Entries</div>
          {journals.length === 0 ? (
            <div className="empty-state"><p>No journal entries yet</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {journals.slice(0, 4).map(j => (
                <div key={j.id} style={{
                  padding: '10px 14px',
                  background: 'var(--bg3)',
                  borderRadius: 9,
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>
                      {format(parseISO(j.date), 'MMM d')}
                    </span>
                    <div style={{ display: 'flex', gap: 10, fontSize: '0.75rem', color: 'var(--text2)' }}>
                      <span>😊 {j.mood}/10</span>
                      <span>🌙 {j.sleep}h</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {j.symptoms?.length === 0 ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--teal)' }}>No symptoms</span>
                    ) : j.symptoms?.map(s => (
                      <span key={s.id} className="tag">{s.name} ({s.severity})</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function getJournalStreak(journals) {
  let streak = 0
  for (let i = 0; i < 30; i++) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
    if (journals.find(j => j.date === date)) streak++
    else break
  }
  return streak
}
