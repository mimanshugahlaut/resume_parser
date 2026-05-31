/**
 * Toast.jsx — Slide-in toast notification system
 * Types: 'success' | 'error' | 'info'
 * Usage: import { useToast, ToastContainer } from './Toast'
 */

import { createContext, useCallback, useContext, useRef, useState } from 'react'

/* ---- Context ---- */
const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)

  const addToast = useCallback(({ type = 'info', title, message, duration = 3000 }) => {
    const id = ++counter.current
    setToasts((prev) => [...prev, { id, type, title, message, duration, dismissing: false }])

    // Auto-remove
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, dismissing: true } : t))
      )
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 300)
    }, duration)

    return id
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dismissing: true } : t))
    )
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 300)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.addToast
}

/* ---- Icons ---- */
const ICONS = {
  success: '✅',
  error:   '❌',
  info:    '💡',
}

/* ---- Single Toast Item ---- */
function ToastItem({ toast, onDismiss }) {
  const { id, type, title, message, duration, dismissing } = toast
  return (
    <div
      className={`toast toast--${type}${dismissing ? ' dismissing' : ''}`}
      style={{ '--toast-duration': `${duration}ms` }}
      role="alert"
    >
      <span className="toast__icon">{ICONS[type]}</span>
      <div className="toast__body">
        {title   && <div className="toast__title">{title}</div>}
        {message && <div className="toast__message">{message}</div>}
      </div>
      <button className="toast__close" onClick={() => onDismiss(id)} aria-label="Dismiss">✕</button>
      <div className="toast__progress" />
    </div>
  )
}
