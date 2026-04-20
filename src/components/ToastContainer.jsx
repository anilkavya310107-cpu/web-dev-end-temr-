import { useHealth } from '../context/HealthDataContext'

export default function ToastContainer() {
  const { toasts } = useHealth()

  if (!toasts.length) return null

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✗' : 'ℹ'}</span>
          {t.message}
        </div>
      ))}
    </div>
  )
}
