import { useState, useCallback } from 'react'
import { useHealth } from '../context/HealthDataContext'

export default function Profile() {
  const { profile, setProfile, clearAllData, journals, medications } = useHealth()
  const [conditionInput, setConditionInput] = useState('')
  const [allergyInput, setAllergyInput] = useState('')
  const [saved, setSaved] = useState(false)

  const update = (field, value) => setProfile(p => ({ ...p, [field]: value }))

  const addCondition = useCallback(() => {
    if (!conditionInput.trim()) return
    setProfile(p => ({ ...p, conditions: [...(p.conditions || []), conditionInput.trim()] }))
    setConditionInput('')
  }, [conditionInput, setProfile])

  const removeCondition = (i) => setProfile(p => ({ ...p, conditions: p.conditions.filter((_, idx) => idx !== i) }))

  const addAllergy = useCallback(() => {
    if (!allergyInput.trim()) return
    setProfile(p => ({ ...p, allergies: [...(p.allergies || []), allergyInput.trim()] }))
    setAllergyInput('')
  }, [allergyInput, setProfile])

  const removeAllergy = (i) => setProfile(p => ({ ...p, allergies: p.allergies.filter((_, idx) => idx !== i) }))

  const handleSave = useCallback(() => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [])

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h1>Profile & Settings</h1>
        <p>Manage your health profile</p>
      </div>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), var(--coral))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem', fontWeight: 600, color: '#fff',
          border: '3px solid var(--bg3)'
        }}>
          {profile.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>{profile.name || 'Your Name'}</div>
          <div style={{ color: 'var(--text3)', fontSize: '0.85rem', marginTop: 2 }}>
            {journals.length} journal entries · {medications.length} medications
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Basic info */}
        <div className="card">
          <div style={{ fontWeight: 500, marginBottom: 18 }}>Personal Info</div>

          <div className="form-group">
            <label className="input-label">Name</label>
            <input className="input" placeholder="Your name"
              value={profile.name || ''}
              onChange={e => update('name', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="input-label">Age</label>
            <input className="input" type="number" placeholder="Your age" min={1} max={120}
              value={profile.age || ''}
              onChange={e => update('age', e.target.value)}
              style={{ maxWidth: 120 }} />
          </div>

          <div className="form-group">
            <label className="input-label">Blood Type</label>
            <select className="input" value={profile.bloodType || ''}
              onChange={e => update('bloodType', e.target.value)}>
              <option value="">Select</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="input-label">Doctor Name</label>
            <input className="input" placeholder="Dr. Smith"
              value={profile.doctor || ''}
              onChange={e => update('doctor', e.target.value)} />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSave}
            style={{ marginTop: 4 }}
          >
            {saved ? '✓ Saved' : 'Save Profile'}
          </button>
        </div>

        {/* Medical */}
        <div className="card">
          <div style={{ fontWeight: 500, marginBottom: 18 }}>Medical History</div>

          <div className="form-group">
            <label className="input-label">Conditions / Diagnoses</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input className="input" placeholder="e.g. Hypertension"
                value={conditionInput}
                onChange={e => setConditionInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCondition()} />
              <button className="btn btn-ghost" onClick={addCondition} style={{ whiteSpace: 'nowrap' }}>+ Add</button>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(profile.conditions || []).filter(Boolean).map((c, i) => (
                <span key={i} className="badge badge-accent" style={{ cursor: 'pointer' }}
                  onClick={() => removeCondition(i)}>
                  {c} ×
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Allergies</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input className="input" placeholder="e.g. Penicillin"
                value={allergyInput}
                onChange={e => setAllergyInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addAllergy()} />
              <button className="btn btn-ghost" onClick={addAllergy} style={{ whiteSpace: 'nowrap' }}>+ Add</button>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(profile.allergies || []).filter(Boolean).map((a, i) => (
                <span key={i} className="badge badge-coral" style={{ cursor: 'pointer' }}
                  onClick={() => removeAllergy(i)}>
                  {a} ×
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 500, marginBottom: 16 }}>Your MediMind Stats</div>
        <div className="grid-4">
          {[
            { label: 'Journal Entries', value: journals.length, color: 'var(--accent2)' },
            { label: 'Medications', value: medications.length, color: 'var(--teal)' },
            { label: 'Symptoms Logged', value: journals.reduce((a, j) => a + (j.symptoms?.length || 0), 0), color: 'var(--amber)' },
            { label: 'Days Active', value: new Set(journals.map(j => j.date)).size, color: 'var(--green)' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '16px 10px', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ border: '1px solid rgba(255,107,107,0.2)' }}>
        <div style={{ fontWeight: 500, marginBottom: 8, color: 'var(--coral)' }}>⚠ Reset Data</div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text2)', marginBottom: 14, lineHeight: 1.6 }}>
          This will reset all journal entries and medications to the sample data. Your profile info will be kept.
        </p>
        <button className="btn btn-danger" onClick={() => {
          if (confirm('Reset all data to samples? This cannot be undone.')) clearAllData()
        }}>
          Reset to Sample Data
        </button>
      </div>
    </div>
  )
}
