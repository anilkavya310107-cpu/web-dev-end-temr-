import { createContext, useContext, useCallback, useEffect, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { format } from 'date-fns'

const HealthDataContext = createContext(null)

const SAMPLE_JOURNALS = [
  {
    id: '1', date: format(new Date(Date.now() - 6*86400000), 'yyyy-MM-dd'),
    symptoms: [{ id: 's1', name: 'Headache', severity: 7 }],
    mood: 5, sleep: 5.5, energy: 4, notes: 'Stressful day at work'
  },
  {
    id: '2', date: format(new Date(Date.now() - 5*86400000), 'yyyy-MM-dd'),
    symptoms: [{ id: 's2', name: 'Fatigue', severity: 6 }],
    mood: 6, sleep: 7, energy: 5, notes: ''
  },
  {
    id: '3', date: format(new Date(Date.now() - 4*86400000), 'yyyy-MM-dd'),
    symptoms: [], mood: 8, sleep: 8, energy: 8, notes: 'Feeling great!'
  },
  {
    id: '4', date: format(new Date(Date.now() - 3*86400000), 'yyyy-MM-dd'),
    symptoms: [{ id: 's3', name: 'Headache', severity: 8 }, { id: 's4', name: 'Nausea', severity: 5 }],
    mood: 4, sleep: 5, energy: 3, notes: 'Migraine hit in the afternoon'
  },
  {
    id: '5', date: format(new Date(Date.now() - 2*86400000), 'yyyy-MM-dd'),
    symptoms: [{ id: 's5', name: 'Back pain', severity: 5 }],
    mood: 6, sleep: 6.5, energy: 6, notes: ''
  },
  {
    id: '6', date: format(new Date(Date.now() - 86400000), 'yyyy-MM-dd'),
    symptoms: [], mood: 7, sleep: 7.5, energy: 7, notes: 'Good run in the morning'
  },
]

const SAMPLE_MEDS = [
  {
    id: 'm1', name: 'Vitamin D', dosage: '1000 IU', frequency: 'daily',
    time: '08:00', color: 'teal', taken: {}, startDate: format(new Date(), 'yyyy-MM-dd')
  },
  {
    id: 'm2', name: 'Omega-3', dosage: '1g', frequency: 'daily',
    time: '08:00', color: 'amber', taken: {}, startDate: format(new Date(), 'yyyy-MM-dd')
  },
  {
    id: 'm3', name: 'Magnesium', dosage: '400mg', frequency: 'daily',
    time: '21:00', color: 'accent', taken: {}, startDate: format(new Date(), 'yyyy-MM-dd')
  },
]

export function HealthDataProvider({ children }) {
  const [journals, setJournals] = useLocalStorage('mm_journals', SAMPLE_JOURNALS)
  const [medications, setMedications] = useLocalStorage('mm_medications', SAMPLE_MEDS)
  const [profile, setProfile] = useLocalStorage('mm_profile', {
    name: 'Alex', age: '', conditions: [], allergies: [], theme: 'dark'
  })
  const [toasts, setToasts] = useLocalStorage('mm_toasts_temp', [])
  const toastRef = useRef({})

  // Toast system using refs to avoid stale closures
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [setToasts])

  // Journal CRUD
  const addJournal = useCallback((entry) => {
    const newEntry = { ...entry, id: Date.now().toString() }
    setJournals(prev => {
      const filtered = prev.filter(j => j.date !== entry.date)
      return [newEntry, ...filtered].sort((a, b) => b.date.localeCompare(a.date))
    })
    addToast('Journal entry saved!', 'success')
  }, [setJournals, addToast])

  const deleteJournal = useCallback((id) => {
    setJournals(prev => prev.filter(j => j.id !== id))
    addToast('Entry deleted', 'info')
  }, [setJournals, addToast])

  // Medication CRUD
  const addMedication = useCallback((med) => {
    const newMed = { ...med, id: Date.now().toString(), taken: {} }
    setMedications(prev => [...prev, newMed])
    addToast(`${med.name} added!`, 'success')
  }, [setMedications, addToast])

  const deleteMedication = useCallback((id) => {
    setMedications(prev => prev.filter(m => m.id !== id))
    addToast('Medication removed', 'info')
  }, [setMedications, addToast])

  const toggleMedTaken = useCallback((medId, date) => {
    setMedications(prev => prev.map(m => {
      if (m.id !== medId) return m
      const taken = { ...m.taken }
      taken[date] = !taken[date]
      return { ...m, taken }
    }))
  }, [setMedications])

  const clearAllData = useCallback(() => {
    setJournals(SAMPLE_JOURNALS)
    setMedications(SAMPLE_MEDS)
    addToast('Data reset to samples', 'info')
  }, [setJournals, setMedications, addToast])

  return (
    <HealthDataContext.Provider value={{
      journals, medications, profile, setProfile,
      addJournal, deleteJournal,
      addMedication, deleteMedication, toggleMedTaken,
      clearAllData, toasts, addToast
    }}>
      {children}
    </HealthDataContext.Provider>
  )
}

export const useHealth = () => {
  const ctx = useContext(HealthDataContext)
  if (!ctx) throw new Error('useHealth must be used within HealthDataProvider')
  return ctx
}
