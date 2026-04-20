import { useMemo } from 'react'
import { format, subDays } from 'date-fns'

export default function StreakCalendar({ taken = {}, color = 'accent' }) {
  const days = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => {
      const date = format(subDays(new Date(), 27 - i), 'yyyy-MM-dd')
      return { date, taken: !!taken[date] }
    })
  }, [taken])

  const colorMap = {
    teal: 'var(--teal)',
    amber: 'var(--amber)',
    accent: 'var(--accent)',
    coral: 'var(--coral)',
    green: 'var(--green)',
  }
  const c = colorMap[color] || 'var(--accent)'

  const streak = useMemo(() => {
    let count = 0
    const today = format(new Date(), 'yyyy-MM-dd')
    for (let i = 27; i >= 0; i--) {
      const date = format(subDays(new Date(), i === 0 ? 0 : i), 'yyyy-MM-dd')
      if (days[27 - i]?.taken) count++
      else if (date !== today) break
    }
    // sequential from today backward
    let seq = 0
    for (let i = 27; i >= 0; i--) {
      if (days[i]?.taken) seq++
      else break
    }
    return seq
  }, [days])

  return (
    <div>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 8 }}>
        {days.map(d => (
          <div
            key={d.date}
            title={d.date}
            style={{
              width: 10, height: 10,
              borderRadius: 2,
              background: d.taken ? c : 'var(--bg4)',
              opacity: d.taken ? 1 : 0.5,
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>
        {streak > 0 ? (
          <span style={{ color: c }}>🔥 {streak} day streak</span>
        ) : (
          <span>No streak yet — take your dose!</span>
        )}
      </div>
    </div>
  )
}
