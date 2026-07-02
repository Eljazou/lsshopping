import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id))
    if (timers.current[id]) {
      clearTimeout(timers.current[id])
      delete timers.current[id]
    }
  }, [])

  const toast = useCallback(
    (message, type = 'success') => {
      const id = ++idCounter
      setToasts((t) => [...t, { id, message, type }])
      timers.current[id] = setTimeout(() => dismiss(id), 2600)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white shadow-soft animate-fade-in-up ${
              t.type === 'error'
                ? 'bg-blush-600'
                : 'bg-gradient-to-r from-plum-500 to-blush-500'
            }`}
          >
            <span>{t.type === 'error' ? '⚠️' : '✓'}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
