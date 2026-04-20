import { useState, useReducer, useCallback } from 'react'
import { useHealth } from '../context/HealthDataContext'
import { format } from 'date-fns'
import StreakCalendar from '../components/StreakCalendar'

const COLORS = ['teal', 'accent', 'amber', 'coral', 'green']
const COLOR_LABELS = { teal: '#2dd4a7', accent: '#7c6aff', amber: '#f59e0b', coral: '#ff6b6b', green: '#4ade80' }

// Local form reducer
function formReducer(state, action) {
  switch (action.type) {
    case 'SET': return { ...state, [action.field]: action.value }
    case 'RESET': return { name: '', dosage: '', frequency: 'daily', time: '08:00', color: 'teal', notes: '' }
    default: return state
  }
}

export default function Medications() {
  const { medications, addMedication, deleteMedication, toggleMedTaken } = useHealth()
  const [showForm, setShowForm] = useState(false)
  const [form, dispatch] = useReducer(formReducer, {
    name: '', dosage: '', frequency: 'daily', time: '08:00', color: 'teal', notes: ''
  })
  const today = format(new Date(), 'yyyy-MM-dd')

  const handleSubmit = useCallback(() => {
    if (!form.name.trim()) return
    addMedication({ ...form, startDate: today })
    dispatch({ type: 'RESET' })
    setShowForm(false)
  }, [form, addMedication, today])

  const totalTakenToday = medications.filter(m => m.taken?.[today]).length

  return (
    <div className="page animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Medications</h1>
          <p>{totalTakenToday} of {medications.length} taken today</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Close' : '+ Add Medication'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card animate-in" style={{ marginBottom: 28 }}>
          <div style={{ fontWeight: 500, marginBottom: 20 }}>Add New Medication</div>

          <div className="grid-2" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label className="input-label">Medication Name *</label>
              <input className="input" placeholder="e.g. Vitamin D"
                value={form.name} onChange={e => dispatch({ type: 'SET', field: 'name', value: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="input-label">Dosage</label>
              <input className="input" placeholder="e.g. 1000 IU"
                value={form.dosage} onChange={e => dispatch({ type: 'SET', field: 'dosage', value: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="input-label">Frequency</label>
              <select className="input" value={form.frequency}
                onChange={e => dispatch({ type: 'SET', field: 'frequency', value: e.target.value })}>
                <option value="daily">Daily</option>
                <option value="twice_daily">Twice daily</option>
                <option value="weekly">Weekly</option>
                <option value="as_needed">As needed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="input-label">Reminder Time</label>
              <input type="time" className="input" value={form.time}
                onChange={e => dispatch({ type: 'SET', field: 'time', value: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Color</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => dispatch({ type: 'SET', field: 'color', value: c })}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: COLOR_LABELS[c],
                    border: form.color === c ? '2px solid var(--text)' : '2px solid transparent',
                    outline: form.color === c ? '2px solid var(--bg3)' : 'none',
                    cursor: 'pointer', transition: 'all 0.15s'
                  }} />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Notes</label>
            <input className="input" placeholder="e.g. Take with food"
              value={form.notes} onChange={e => dispatch({ type: 'SET', field: 'notes', value: e.target.value })} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={handleSubmit}>Add Medication</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Medication cards */}
      {medications.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
          </svg>
          <p>No medications added yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {medications.map(med => (
            <MedCard key={med.id} med={med} today={today}
              onToggle={toggleMedTaken} onDelete={deleteMedication} />
          ))}
        </div>
      )}
    </div>
  )
}

function MedCard({ med, today, onToggle, onDelete }) {
  const isTaken = med.taken?.[today]
  const colorHex = { teal: 'var(--teal)', accent: 'var(--accent2)', amber: 'var(--amber)', coral: 'var(--coral)', green: 'var(--green)' }
  const c = colorHex[med.color] || 'var(--accent2)'

  return (
    <div className="card" style={{
      borderLeft: `3px solid ${c}`,
      opacity: isTaken ? 0.85 : 1,
      transition: 'all var(--transition)'
    }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Dot */}
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: `${c}22`, border: `1px solid ${c}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: '1.2rem', marginTop: 2
        }}>💊</div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 3 }}>{med.name}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: `${c}18`, color: c, border: `1px solid ${c}30` }}>
                  {med.dosage}
                </span>
                <span className="badge badge-accent">{med.frequency.replace('_', ' ')}</span>
                <span className="badge" style={{ background: 'var(--bg4)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                  🕐 {med.time}
                </span>
              </div>
              {med.notes && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: 6 }}>{med.notes}</div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => onToggle(med.id, today)}
                className="btn"
                style={{
                  background: isTaken ? 'var(--green-glow)' : 'var(--bg3)',
                  border: `1px solid ${isTaken ? 'rgba(74,222,128,0.3)' : 'var(--border2)'}`,
                  color: isTaken ? 'var(--green)' : 'var(--text2)',
                  padding: '7px 14px', fontSize: '0.8rem'
                }}
              >
                {isTaken ? '✓ Taken' : 'Mark Taken'}
              </button>
              <button
                className="btn btn-danger"
                style={{ padding: '7px 12px', fontSize: '0.8rem' }}
                onClick={() => onDelete(med.id)}
              >Delete</button>
            </div>
          </div>

          {/* Streak */}
          <div style={{
            background: 'var(--bg3)', borderRadius: 8, padding: '12px 14px',
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              28-Day Adherence
            </div>
            <StreakCalendar taken={med.taken} color={med.color} />
          </div>
        </div>
      </div>
    </div>
  )
}
