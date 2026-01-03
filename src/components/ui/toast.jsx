import { createContext, useContext, useState, useCallback } from 'react'
import { Check, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { id, ...toast }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, toast.duration || 5000)
    
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((options) => {
    if (typeof options === 'string') {
      return addToast({ title: options, variant: 'default' })
    }
    return addToast(options)
  }, [addToast])

  toast.success = useCallback((title, description) => {
    return addToast({ title, description, variant: 'success' })
  }, [addToast])

  toast.error = useCallback((title, description) => {
    return addToast({ title, description, variant: 'error' })
  }, [addToast])

  toast.info = useCallback((title, description) => {
    return addToast({ title, description, variant: 'info' })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

const Toast = ({ toast, onRemove }) => {
  const variants = {
    default: {
      bg: 'bg-background border-border',
      icon: Info,
      iconColor: 'text-blue-600'
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
      icon: Check,
      iconColor: 'text-green-600'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
      icon: AlertCircle,
      iconColor: 'text-red-600'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
      icon: Info,
      iconColor: 'text-blue-600'
    }
  }

  const variant = variants[toast.variant] || variants.default
  const Icon = variant.icon

  return (
    <div className={`
      ${variant.bg} border rounded-lg shadow-lg p-4 min-w-80 max-w-md
      animate-in slide-in-from-right duration-300
    `}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${variant.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground">{toast.title}</h4>
          {toast.description && (
            <p className="text-sm text-muted-foreground mt-1">{toast.description}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}