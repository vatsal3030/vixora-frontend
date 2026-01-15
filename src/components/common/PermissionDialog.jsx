import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'

export default function PermissionDialog({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'confirm',
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) {
  if (!isOpen) return null

  const icons = {
    confirm: <AlertCircle className="w-12 h-12 text-blue-500" />,
    alert: <AlertCircle className="w-12 h-12 text-yellow-500" />,
    success: <CheckCircle className="w-12 h-12 text-green-500" />,
    error: <XCircle className="w-12 h-12 text-red-500" />
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div 
          className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center mb-4">
            {icons[type]}
          </div>

          <h3 className="text-xl font-semibold text-white text-center mb-2">
            {title}
          </h3>

          <p className="text-sm text-gray-400 text-center mb-6">
            {message}
          </p>

          <div className="flex gap-3">
            {type === 'confirm' && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={() => {
                onConfirm?.()
                onClose()
              }}
              className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition ${
                type === 'error' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
