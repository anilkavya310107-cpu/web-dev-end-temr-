import { useMemo } from 'react'

export function useInsights(journals) {
  return useMemo(() => {
    if (!journals || journals.length < 3) return []

    const insights = []

    // Sleep vs headache correlation
    const headacheEntries = journals.filter(j =>
      j.symptoms?.some(s => s.name.toLowerCase().includes('headache'))
    )
    const lowSleepEntries = journals.filter(j => j.sleep && j.sleep < 6)

    if (headacheEntries.length >= 2 && lowSleepEntries.length >= 2) {
      const overlap = headacheEntries.filter(h =>
        lowSleepEntries.some(l => l.date === h.date)
      )
      if (overlap.length >= 1) {
        insights.push({
          id: 'sleep-headache',
          type: 'correlation',
          icon: '😴',
          title: 'Sleep & Headaches',
          text: `Your headaches appeared on ${overlap.length} of ${lowSleepEntries.length} days with under 6hrs sleep.`,
          severity: 'warning',
          confidence: Math.round((overlap.length / lowSleepEntries.length) * 100)
        })
      }
    }

    // Average mood
    const moodEntries = journals.filter(j => j.mood)
    if (moodEntries.length > 0) {
      const avgMood = moodEntries.reduce((a, b) => a + b.mood, 0) / moodEntries.length
      insights.push({
        id: 'avg-mood',
        type: 'stat',
        icon: avgMood >= 7 ? '😊' : avgMood >= 5 ? '😐' : '😔',
        title: 'Average Mood',
        text: `Your average mood this period is ${avgMood.toFixed(1)}/10.`,
        severity: avgMood >= 7 ? 'good' : avgMood >= 5 ? 'neutral' : 'warning',
        confidence: 100
      })
    }

    // Most common symptom
    const symptomCounts = {}
    journals.forEach(j => {
      j.symptoms?.forEach(s => {
        symptomCounts[s.name] = (symptomCounts[s.name] || 0) + 1
      })
    })
    const topSymptom = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1])[0]
    if (topSymptom) {
      insights.push({
        id: 'top-symptom',
        type: 'pattern',
        icon: '📊',
        title: 'Most Frequent Symptom',
        text: `"${topSymptom[0]}" has appeared ${topSymptom[1]} time${topSymptom[1] > 1 ? 's' : ''} in your journal.`,
        severity: 'info',
        confidence: 100
      })
    }

    // Sleep average
    const sleepEntries = journals.filter(j => j.sleep)
    if (sleepEntries.length > 0) {
      const avgSleep = sleepEntries.reduce((a, b) => a + b.sleep, 0) / sleepEntries.length
      insights.push({
        id: 'avg-sleep',
        type: 'stat',
        icon: '🌙',
        title: 'Average Sleep',
        text: `You're averaging ${avgSleep.toFixed(1)} hours of sleep.`,
        severity: avgSleep >= 7 ? 'good' : avgSleep >= 6 ? 'neutral' : 'warning',
        confidence: 100
      })
    }

    // High severity days
    const highSeverityDays = journals.filter(j =>
      j.symptoms?.some(s => s.severity >= 8)
    )
    if (highSeverityDays.length > 0) {
      insights.push({
        id: 'high-severity',
        type: 'alert',
        icon: '⚠️',
        title: 'High Severity Days',
        text: `You logged ${highSeverityDays.length} day${highSeverityDays.length > 1 ? 's' : ''} with symptom severity ≥8. Consider discussing with your doctor.`,
        severity: 'danger',
        confidence: 100
      })
    }

    return insights
  }, [journals])
}
