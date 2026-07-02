import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((msg, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3800)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => {
          const icon = t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'
          return (
            <div key={t.id} className={`toast toast-${t.type}`}>
              <span>{icon}</span><span>{t.msg}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
