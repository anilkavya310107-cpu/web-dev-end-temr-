import { useMemo } from 'react'
import { useHealth } from '../context/HealthDataContext'
import { useInsights } from '../hooks/useInsights'
import { format, subDays, parseISO } from 'date-fns'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis
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
          <div key={p.name} style={{ color: p.color || 'var(--text)', display: 'flex', gap: 10, justifyContent: 'space-between' }}>
            <span>{p.name}</span><strong>{p.value ?? '—'}</strong>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function Insights() {
  const { journals } = useHealth()
  const insights = useInsights(journals)

  const chartData30 = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd')
      const j = journals.find(e => e.date === date)
      return {
        day: format(subDays(new Date(), 29 - i), 'MMM d'),
        Mood: j?.mood ?? null,
        Sleep: j?.sleep ?? null,
        Energy: j?.energy ?? null,
        Symptoms: j?.symptoms?.length ?? null,
      }
    })
  }, [journals])

  const symptomData = useMemo(() => {
    const counts = {}
    journals.forEach(j => j.symptoms?.forEach(s => {
      counts[s.name] = (counts[s.name] || 0) + 1
    }))
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }))
  }, [journals])

  const avgSeverityData = useMemo(() => {
    const totals = {}
    const counts = {}
    journals.forEach(j => j.symptoms?.forEach(s => {
      totals[s.name] = (totals[s.name] || 0) + s.severity
      counts[s.name] = (counts[s.name] || 0) + 1
    }))
    return Object.keys(totals).map(name => ({
      name, avg: +(totals[name] / counts[name]).toFixed(1)
    })).sort((a, b) => b.avg - a.avg).slice(0, 6)
  }, [journals])

  const radarData = useMemo(() => {
    const valid = journals.slice(0, 14).filter(j => j.mood)
    if (!valid.length) return []
    const avg = (key) => +(valid.reduce((s, j) => s + (j[key] || 0), 0) / valid.length).toFixed(1)
    return [
      { metric: 'Mood', value: avg('mood') },
      { metric: 'Sleep', value: avg('sleep') },
      { metric: 'Energy', value: avg('energy') },
      { metric: 'Symptom Free', value: +(10 - (valid.reduce((s,j) => s + (j.symptoms?.length || 0), 0) / valid.length * 2)).toFixed(1) },
    ]
  }, [journals])

  const severityColors = ['var(--coral)', 'var(--amber)', 'var(--teal)', 'var(--accent2)', 'var(--green)', 'var(--text2)']

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h1>Health Insights</h1>
        <p>Patterns and correlations from your journal data</p>
      </div>

      {journals.length < 3 ? (
        <div className="empty-state">
          <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <p>Log at least 3 journal entries to see insights.</p>
        </div>
      ) : (
        <>
          {/* AI Insight cards */}
          {insights.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)', marginBottom: 14 }}>
                Smart Correlations
              </div>
              <div className="grid-2">
                {insights.map(ins => {
                  const colors = {
                    good: { bg: 'var(--teal-glow)', border: 'rgba(45,212,167,0.25)', text: 'var(--teal)' },
                    warning: { bg: 'var(--amber-glow)', border: 'rgba(245,158,11,0.25)', text: 'var(--amber)' },
                    danger: { bg: 'var(--coral-glow)', border: 'rgba(255,107,107,0.25)', text: 'var(--coral)' },
                    info: { bg: 'var(--accent-glow)', border: 'rgba(124,106,255,0.25)', text: 'var(--accent2)' },
                    neutral: { bg: 'var(--bg3)', border: 'var(--border)', text: 'var(--text2)' },
                  }
                  const s = colors[ins.severity] || colors.neutral
                  return (
                    <div key={ins.id} style={{
                      background: s.bg, border: `1px solid ${s.border}`,
                      borderRadius: 'var(--radius)', padding: '16px 18px'
                    }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1.4rem' }}>{ins.icon}</span>
                        <div>
                          <div style={{ fontWeight: 500, color: s.text, marginBottom: 4 }}>{ins.title}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text2)', lineHeight: 1.5 }}>{ins.text}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 30-day trend */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 500, marginBottom: 20 }}>30-Day Mood, Sleep & Energy</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData30}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false}
                  interval={4} />
                <YAxis domain={[0, 10]} tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} width={22} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Mood" stroke="var(--accent2)" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="Sleep" stroke="var(--teal)" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="Energy" stroke="var(--amber)" strokeWidth={2} dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid-2" style={{ marginBottom: 20 }}>
            {/* Symptom frequency */}
            <div className="card">
              <div style={{ fontWeight: 500, marginBottom: 20 }}>Symptom Frequency</div>
              {symptomData.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px 0' }}><p>No symptoms logged</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={symptomData} layout="vertical">
                    <XAxis type="number" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text2)', fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Health radar */}
            <div className="card">
              <div style={{ fontWeight: 500, marginBottom: 20 }}>14-Day Health Radar</div>
              {radarData.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px 0' }}><p>Not enough data</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text2)', fontSize: 11 }} />
                    <Radar dataKey="value" stroke="var(--accent2)" fill="var(--accent)" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Avg symptom severity */}
          {avgSeverityData.length > 0 && (
            <div className="card">
              <div style={{ fontWeight: 500, marginBottom: 16 }}>Average Severity per Symptom</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {avgSeverityData.map((s, i) => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 100, fontSize: '0.85rem', color: 'var(--text2)', flexShrink: 0 }}>{s.name}</div>
                    <div style={{ flex: 1, height: 8, background: 'var(--bg4)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        width: `${s.avg * 10}%`, height: '100%',
                        background: severityColors[i % severityColors.length],
                        borderRadius: 4, transition: 'width 0.6s ease'
                      }} />
                    </div>
                    <div style={{ width: 30, fontSize: '0.85rem', fontWeight: 500, textAlign: 'right', color: severityColors[i % severityColors.length] }}>
                      {s.avg}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function severityColors(i) {
  const c = ['var(--coral)', 'var(--amber)', 'var(--teal)', 'var(--accent2)', 'var(--green)', 'var(--text2)']
  return c[i % c.length]
}
