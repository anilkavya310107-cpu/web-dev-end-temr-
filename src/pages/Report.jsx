import { useMemo, useRef } from 'react'
import { useHealth } from '../context/HealthDataContext'
import { format, subDays, parseISO } from 'date-fns'

export default function Report() {
  const { journals, medications, profile } = useHealth()
  const printRef = useRef(null)

  const reportData = useMemo(() => {
    const last30 = journals.filter(j => {
      const d = parseISO(j.date)
      return d >= subDays(new Date(), 30)
    })

    // Symptom summary
    const symptomCounts = {}
    const symptomSeverities = {}
    last30.forEach(j => j.symptoms?.forEach(s => {
      symptomCounts[s.name] = (symptomCounts[s.name] || 0) + 1
      symptomSeverities[s.name] = [...(symptomSeverities[s.name] || []), s.severity]
    }))

    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name, count,
        avgSeverity: +(symptomSeverities[name].reduce((a, b) => a + b, 0) / symptomSeverities[name].length).toFixed(1),
        maxSeverity: Math.max(...symptomSeverities[name])
      }))

    // Med adherence
    const medAdherence = medications.map(med => {
      const days = last30.length || 1
      const taken = Object.values(med.taken || {}).filter(Boolean).length
      return { name: med.name, dosage: med.dosage, taken, total: days, pct: Math.round((taken / days) * 100) }
    })

    // Mood/sleep averages
    const withMood = last30.filter(j => j.mood)
    const avgMood = withMood.length ? +(withMood.reduce((a, b) => a + b.mood, 0) / withMood.length).toFixed(1) : null
    const withSleep = last30.filter(j => j.sleep)
    const avgSleep = withSleep.length ? +(withSleep.reduce((a, b) => a + b.sleep, 0) / withSleep.length).toFixed(1) : null
    const withEnergy = last30.filter(j => j.energy)
    const avgEnergy = withEnergy.length ? +(withEnergy.reduce((a, b) => a + b.energy, 0) / withEnergy.length).toFixed(1) : null

    // High severity days
    const highSeverityDays = last30.filter(j => j.symptoms?.some(s => s.severity >= 8))
    const notes = last30.filter(j => j.notes?.trim()).slice(0, 5)

    return { last30, topSymptoms, medAdherence, avgMood, avgSleep, avgEnergy, highSeverityDays, notes }
  }, [journals, medications])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="page animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Doctor Report</h1>
          <p>30-day health summary · Ready to print or share</p>
        </div>
        <button className="btn btn-primary" onClick={handlePrint}>
          🖨 Print / Save PDF
        </button>
      </div>

      <div ref={printRef}>
        {/* Header */}
        <div className="card" style={{
          marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(124,106,255,0.1), rgba(45,212,167,0.06))',
          border: '1px solid rgba(124,106,255,0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 6 }}>
                Patient Health Summary
              </div>
              <div style={{ color: 'var(--text2)', fontSize: '0.875rem' }}>
                Report period: {format(subDays(new Date(), 30), 'MMM d')} – {format(new Date(), 'MMM d, yyyy')}
              </div>
              {profile.name && (
                <div style={{ color: 'var(--text2)', fontSize: '0.875rem', marginTop: 4 }}>
                  Patient: <strong style={{ color: 'var(--text)' }}>{profile.name}</strong>
                  {profile.age && <span> · Age: {profile.age}</span>}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text3)' }}>
              Generated {format(new Date(), 'MMM d, yyyy')}<br />
              by MediMind
            </div>
          </div>

          {profile.conditions?.filter(Boolean).length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Known Conditions
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {profile.conditions.filter(Boolean).map((c, i) => (
                  <span key={i} className="badge badge-accent">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Key metrics */}
        <div className="grid-3" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-label">Avg Mood</div>
            <div className="stat-value" style={{ color: reportData.avgMood >= 7 ? 'var(--teal)' : reportData.avgMood >= 5 ? 'var(--amber)' : 'var(--coral)' }}>
              {reportData.avgMood ?? '—'}
            </div>
            <div className="stat-sub">out of 10</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Sleep</div>
            <div className="stat-value" style={{ color: reportData.avgSleep >= 7 ? 'var(--teal)' : 'var(--amber)' }}>
              {reportData.avgSleep ?? '—'}h
            </div>
            <div className="stat-sub">per night</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">High Severity Days</div>
            <div className="stat-value" style={{ color: reportData.highSeverityDays.length > 3 ? 'var(--coral)' : 'var(--text)' }}>
              {reportData.highSeverityDays.length}
            </div>
            <div className="stat-sub">severity ≥ 8/10</div>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: 20 }}>
          {/* Symptoms */}
          <div className="card">
            <div style={{ fontWeight: 500, marginBottom: 16 }}>Symptom Summary</div>
            {reportData.topSymptoms.length === 0 ? (
              <div style={{ color: 'var(--teal)', fontSize: '0.875rem', padding: '16px 0' }}>
                ✓ No symptoms logged in this period
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reportData.topSymptoms.map(s => (
                  <div key={s.name} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', background: 'var(--bg3)',
                    borderRadius: 8, border: '1px solid var(--border)'
                  }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>
                        Appeared {s.count} time{s.count > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', color: s.avgSeverity >= 7 ? 'var(--coral)' : s.avgSeverity >= 5 ? 'var(--amber)' : 'var(--teal)' }}>
                        Avg: {s.avgSeverity}/10
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>Max: {s.maxSeverity}/10</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medications */}
          <div className="card">
            <div style={{ fontWeight: 500, marginBottom: 16 }}>Medication Adherence</div>
            {reportData.medAdherence.length === 0 ? (
              <div style={{ color: 'var(--text3)', fontSize: '0.875rem' }}>No medications tracked</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reportData.medAdherence.map(m => (
                  <div key={m.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{m.name}</div>
                      <div style={{ fontSize: '0.8rem', color: m.pct >= 80 ? 'var(--teal)' : m.pct >= 50 ? 'var(--amber)' : 'var(--coral)' }}>
                        {m.pct}% ({m.taken}/{m.total} days)
                      </div>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        width: `${m.pct}%`, height: '100%', borderRadius: 3,
                        background: m.pct >= 80 ? 'var(--teal)' : m.pct >= 50 ? 'var(--amber)' : 'var(--coral)',
                        transition: 'width 0.6s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* High severity days */}
        {reportData.highSeverityDays.length > 0 && (
          <div className="card" style={{ marginBottom: 20, border: '1px solid rgba(255,107,107,0.25)' }}>
            <div style={{ fontWeight: 500, marginBottom: 14, color: 'var(--coral)' }}>⚠ High Severity Days</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {reportData.highSeverityDays.map(d => (
                <div key={d.id} style={{ fontSize: '0.875rem', color: 'var(--text2)', display: 'flex', gap: 16, padding: '8px 12px', background: 'var(--coral-glow)', borderRadius: 7 }}>
                  <span style={{ fontWeight: 500, color: 'var(--text)' }}>{format(parseISO(d.date), 'MMM d')}</span>
                  <span>{d.symptoms?.filter(s => s.severity >= 8).map(s => `${s.name} (${s.severity}/10)`).join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {reportData.notes.length > 0 && (
          <div className="card">
            <div style={{ fontWeight: 500, marginBottom: 14 }}>Selected Patient Notes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reportData.notes.map(n => (
                <div key={n.id} style={{ display: 'flex', gap: 14, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text3)', flexShrink: 0 }}>
                    {format(parseISO(n.date), 'MMM d')}
                  </span>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text2)', lineHeight: 1.5 }}>{n.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          .sidebar, button, nav { display: none !important; }
          body { background: white !important; color: black !important; }
          .card { background: white !important; border: 1px solid #ddd !important; }
          .main-content { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}
