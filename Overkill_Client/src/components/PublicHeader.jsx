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

  // Gère la connexion et redirige l'admin
  const handleAuthenticated = (userData) => {
    setUser(userData)

    // Vérifie si l'utilisateur connecté possède le rôle admin
    const isAdmin = userData?.roles?.includes('ROLE_ADMIN') || userData?.role === 'ROLE_ADMIN'

    if (isAdmin) {
      // Redirection automatique vers le Panel Admin
      window.location.href = '/admin'
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    setNotification({ type: 'info', message: 'Vous êtes déconnecté.' })
    window.location.href = '/' // Redirige proprement à la déconnexion
  }

  return (
      <>
        <Header
            user={user}
            onLogin={() => setAuthMode('login')}
            onRegister={() => setAuthMode('register')}
            onLogout={handleLogout}
        />

        {authMode && (
            <AuthOverlay
                mode={authMode}
                onClose={() => setAuthMode(null)}
                onAuthenticated={handleAuthenticated} // 👈 On remplace setUser par notre fonction ici
                onSwitchMode={setAuthMode}
                onNotify={setNotification}
            />
        )}

        <Toast notification={notification} onDismiss={() => setNotification(null)} />
      </>
  )
}

export default PublicHeader