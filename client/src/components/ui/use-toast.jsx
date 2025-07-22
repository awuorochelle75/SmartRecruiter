import { createContext, useContext, useState } from "react"

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = ({ title, description, variant = "default", duration = 7000 }) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, title, description, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }

  const closeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed z-50 flex flex-col gap-2 right-4 bottom-4 w-96 max-w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`relative rounded-lg shadow-lg p-4 mb-2 border transition-colors
              ${t.variant === "destructive"
                ? "border-red-500 bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100"
                : "border-gray-200 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"}
            `}
          >
            <button
              className="absolute top-2 right-2 text-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
              onClick={() => closeToast(t.id)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="font-semibold mb-1">{t.title}</div>
            <div>{t.description}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
} 