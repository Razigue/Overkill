import { useState } from 'react'
import AuthOverlay from './AuthOverlay'
import Header from './Header'
import Toast from './Toast'

function PublicHeader() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [authMode, setAuthMode] = useState(null)
  const [notification, setNotification] = useState(null)

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    setNotification({ type: 'info', message: 'Vous êtes déconnecté.' })
  }

  return (
    <>
      <Header user={user} onLogin={() => setAuthMode('login')} onRegister={() => setAuthMode('register')} onLogout={handleLogout} />
      {authMode && <AuthOverlay mode={authMode} onClose={() => setAuthMode(null)} onAuthenticated={setUser} onSwitchMode={setAuthMode} onNotify={setNotification} />}
      <Toast notification={notification} onDismiss={() => setNotification(null)} />
    </>
  )
}

export default PublicHeader
