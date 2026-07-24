import { useState } from 'react'
import AuthOverlay from './AuthOverlay'
import Header from './Header'

function PublicHeader() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [authMode, setAuthMode] = useState(null)

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <>
      <Header user={user} onLogin={() => setAuthMode('login')} onRegister={() => setAuthMode('register')} onLogout={handleLogout} />
      <AuthOverlay mode={authMode} onClose={() => setAuthMode(null)} onAuthenticated={setUser} />
    </>
  )
}

export default PublicHeader
