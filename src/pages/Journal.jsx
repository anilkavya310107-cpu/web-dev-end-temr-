import { useState, useRef, useCallback, useMemo } from 'react'
import { useHealth } from '../context/HealthDataContext'
import { format, parseISO } from 'date-fns'

export default function Journal() {
  const { journals, addJournal, deleteJournal } = useHealth()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('')
  const symptomInputRef = useRef(null)
  const today = format(new Date(), 'yyyy-MM-dd')

  const [form, setForm] = useState({
    date: today, mood: 7, sleep: 7, energy: 7, notes: '', symptoms: []
  })
  const [symptomInput, setSymptomInput] = useState('')
  const [symptomSeverity, setSymptomSeverity] = useState(5)

  const filteredJournals = useMemo(() => {
    if (!filter) return journals
    return journals.filter(j =>
      j.symptoms?.some(s => s.name.toLowerCase().includes(filter.toLowerCase())) ||
      j.notes?.toLowerCase().includes(filter.toLowerCase())
    )
  }, [journals, filter])

  const addSymptom = useCallback(() => {
    if (!symptomInput.trim()) return
    setForm(prev => ({
      ...prev,
      symptoms: [...prev.symptoms, {
        id: Date.now().toString(),
        name: symptomInput.trim(),
        severity: symptomSeverity
      }]
    }))
    setSymptomInput('')
    setSymptomSeverity(5)
    symptomInputRef.current?.focus()
  }, [symptomInput, symptomSeverity])

  const removeSymptom = (id) => {
    setForm(prev => ({ ...prev, symptoms: prev.symptoms.filter(s => s.id !== id) }))
  }

  const handleSubmit = useCallback(() => {
    addJournal(form)
    setForm({ date: today, mood: 7, sleep: 7, energy: 7, notes: '', symptoms: [] })
    setShowForm(false)
  }, [form, addJournal, today])

  const severityColor = (v) => {
    if (v <= 3) return 'var(--teal)'
    if (v <= 6) return 'var(--amber)'
    return 'var(--coral)'
  }

  return (
    <div className="page animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Symptom Journal</h1>
          <p>Track how you feel each day</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Close' : '+ New Entry'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card animate-in" style={{ marginBottom: 28 }}>
          <div style={{ fontWeight: 500, marginBottom: 20, fontSize: '1rem' }}>
            New Entry — {format(new Date(), 'MMMM d, yyyy')}
          </div>

          <div className="form-group">
            <label className="input-label">Date</label>
            <input type="date" className="input" value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              style={{ maxWidth: 200 }}
            />
          </div>

          <div className="grid-3" style={{ marginBottom: 18 }}>
            <SliderField label="Mood" emoji="😊" value={form.mood} max={10}
              onChange={v => setForm(p => ({ ...p, mood: v }))} />
            <SliderField label="Sleep (hrs)" emoji="🌙" value={form.sleep} max={12}
              onChange={v => setForm(p => ({ ...p, sleep: v }))} />
            <SliderField label="Energy" emoji="⚡" value={form.energy} max={10}
              onChange={v => setForm(p => ({ ...p, energy: v }))} />
          </div>

          {/* Symptoms */}
          <div className="form-group">
            <label className="input-label">Symptoms</label>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <input
                ref={symptomInputRef}
                className="input"
                placeholder="e.g. Headache, Nausea..."
                value={symptomInput}
                onChange={e => setSymptomInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSymptom()}
              />
              <div style={{ minWidth: 160 }}>
                <input
                  type="range" min={1} max={10} value={symptomSeverity}
                  className="severity-slider"
                  onChange={e => setSymptomSeverity(Number(e.target.value))}
                  style={{ marginTop: 8 }}
                />
                <div style={{ fontSize: '0.75rem', color: severityColor(symptomSeverity), textAlign: 'center' }}>
                  Severity: {symptomSeverity}/10
                </div>
              </div>
              <button className="btn btn-ghost" onClick={addSymptom} style={{ whiteSpace: 'nowrap' }}>
                + Add
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {form.symptoms.map(s => (
                <span key={s.id} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', borderRadius: 6,
                  background: 'var(--bg4)', border: '1px solid var(--border)',
                  fontSize: '0.8rem', color: severityColor(s.severity)
                }}>
                  {s.name}
                  <span style={{ color: 'var(--text3)' }}>({s.severity})</span>
                  <button onClick={() => removeSymptom(s.id)} style={{
                    color: 'var(--text3)', marginLeft: 2, lineHeight: 1, padding: 0, fontSize: '0.9rem'
                  }}>×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Notes</label>
            <textarea
              className="input"
              rows={3}
              placeholder="How are you feeling? Any observations..."
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={handleSubmit}>Save Entry</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ marginBottom: 20 }}>
        <input
          className="input"
          placeholder="🔍 Filter by symptom or note..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ maxWidth: 340 }}
        />
      </div>

      {/* Entries */}
      {filteredJournals.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p>No journal entries yet. Click "New Entry" to start.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredJournals.map(j => (
            <JournalCard key={j.id} journal={j} onDelete={deleteJournal} severityColor={severityColor} />
          ))}
        </div>
      )}
    </div>
  )
}

function SliderField({ label, emoji, value, max = 10, onChange }) {
  return (
    <div>
      <label className="input-label">{emoji} {label}</label>
      <input
        type="range" min={1} max={max} value={value}
        className="severity-slider"
        onChange={e => onChange(Number(e.target.value))}
      />
      <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text2)', marginTop: 4 }}>
        {value} / {max}
      </div>
    </div>
  )
}

function JournalCard({ journal: j, onDelete, severityColor }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={() => setExpanded(v => !v)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500 }}>{format(parseISO(j.date), 'EEE, MMM d')}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: 2 }}>
              {j.symptoms?.length || 0} symptoms logged
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: '0.8rem' }}>
          <span>😊 {j.mood}/10</span>
          <span>🌙 {j.sleep}h</span>
          <span>⚡ {j.energy}/10</span>
          <button
            className="btn btn-danger"
            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            onClick={e => { e.stopPropagation(); onDelete(j.id) }}
          >Delete</button>
          <span style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }} onClick={e => e.stopPropagation()}>
          {j.symptoms?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Symptoms</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {j.symptoms.map(s => (
                  <span key={s.id} style={{
                    padding: '4px 12px', borderRadius: 6, fontSize: '0.8rem',
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    color: severityColor(s.severity)
                  }}>
                    {s.name} — {s.severity}/10
                  </span>
                ))}
              </div>
            </div>
          )}
          {j.notes && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text2)', lineHeight: 1.6 }}>{j.notes}</p>
            </div>
          )}
          {!j.symptoms?.length && !j.notes && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>No symptoms or notes for this day.</p>
          )}
        </div>
      )}
    </div>
  )
}
