import { useEffect } from 'react'

const toneClasses = {
  success: 'border-emerald-400 bg-emerald-100 text-emerald-950',
  error: 'border-red-400 bg-red-100 text-red-950',
  info: 'border-gray-400 bg-white text-gray-900',
}

function Toast({ notification, onDismiss }) {
  const duration = notification?.duration ?? 4000

  useEffect(() => {
    if (!notification) return undefined

    const timeoutId = window.setTimeout(onDismiss, duration)
    return () => window.clearTimeout(timeoutId)
  }, [duration, notification, onDismiss])

  if (!notification) return null

  return (
    <div className="pointer-events-none fixed right-4 top-24 z-[60] w-[min(24rem,calc(100vw-2rem))]" aria-live="polite" aria-atomic="true">
      <div key={`${notification.type}-${notification.message}`} className={`animate-toast-in pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-xl border px-4 py-3 shadow-lg ${toneClasses[notification.type] || toneClasses.info}`} role={notification.type === 'error' ? 'alert' : 'status'}>
        <p className="min-w-0 flex-1 break-words text-sm font-semibold leading-5">{notification.message}</p>
        <button type="button" onClick={onDismiss} className="-mr-1 -mt-1 rounded-md px-2 py-1 text-lg leading-none opacity-70 transition hover:bg-black/5 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current" aria-label="Fermer la notification">×</button>
        <span aria-hidden="true" className="animate-toast-timer absolute inset-x-0 bottom-0 h-1 origin-left bg-current opacity-30" style={{ '--toast-duration': `${duration}ms` }} />
      </div>
    </div>
  )
}

export default Toast
