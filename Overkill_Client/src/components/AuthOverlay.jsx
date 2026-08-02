import { useCallback, useEffect, useState } from 'react'
import eyeIcon from '../assets/icons/eye.svg'
import eyeOffIcon from '../assets/icons/eye-off.svg'

function AuthOverlay({ mode, onClose, onAuthenticated, onSwitchMode, onNotify }) {
  const [isClosing, setIsClosing] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [isLoginPasswordVisible, setIsLoginPasswordVisible] = useState(false)
  const [isRegisterPasswordVisible, setIsRegisterPasswordVisible] = useState(false)
  const [isRegisterPasswordConfirmationVisible, setIsRegisterPasswordConfirmationVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const close = useCallback(() => {
    setIsClosing(true)
    window.setTimeout(onClose, 220)
  }, [onClose])

  useEffect(() => {
    if (!mode) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') close()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [close, mode])

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        onNotify({ type: 'error', message: 'Adresse e-mail ou mot de passe incorrect. Vérifiez vos informations puis réessayez.' })
        return
      }

      if (!data.token) {
        onNotify({ type: 'error', message: 'La connexion n’a pas pu être finalisée. Réessayez.' })
        return
      }

      localStorage.setItem('token', data.token)
      const profileResponse = await fetch('http://localhost:8000/api/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${data.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!profileResponse.ok) {
        localStorage.removeItem('token')
        onNotify({ type: 'error', message: 'Impossible de charger votre profil. Réessayez.' })
        return
      }

      const userData = await profileResponse.json()
      localStorage.setItem('user', JSON.stringify(userData))
      onAuthenticated(userData)
      onNotify({ type: 'success', message: `Bon retour ${userData.firstname ? `${userData.firstname}` : ''} !` })
      close()
    } catch {
      onNotify({ type: 'error', message: 'Impossible de contacter le serveur. Vérifiez votre connexion puis réessayez.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()

    if (isSubmitting) return

    if (password !== passwordConfirmation) {
      onNotify({ type: 'error', message: 'Les mots de passe ne correspondent pas.' })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        onNotify({ type: 'error', message: data.error || 'Une erreur est survenue.' })
        return
      }

      setLoginEmail(email)
      setFirstName('')
      setLastName('')
      setEmail('')
      setPassword('')
      setPasswordConfirmation('')
      onSwitchMode('login')
      onNotify({ type: 'success', message: 'Inscription validée. Connectez-vous pour continuer.' })
    } catch {
      onNotify({ type: 'error', message: 'Impossible de contacter le serveur. Vérifiez votre connexion puis réessayez.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mode) return null

  const isLogin = mode === 'login'
  const titleId = isLogin ? 'login-title' : 'register-title'

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-all duration-200 ease-out ${
        isClosing ? 'bg-black/0 backdrop-blur-none' : 'animate-login-backdrop-in bg-black/30'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={close}
    >
      <form
        className={`w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all duration-200 ease-out sm:p-8 ${
          isClosing ? 'translate-y-3 scale-95 opacity-0' : 'animate-login-in'
        }`}
        onClick={(event) => event.stopPropagation()}
        onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase text-[#d2915c]">{isLogin ? 'Bienvenue' : 'Rejoins-nous'}</p>
            <h2 id={titleId} className="mt-1 text-2xl font-black text-black">{isLogin ? 'Se connecter' : 'Créer un compte'}</h2>
          </div>
          <button type="button" onClick={close} className="rounded-md px-2 text-3xl leading-none text-gray-500 transition hover:bg-gray-100 hover:text-black" aria-label="Fermer la fenêtre d'authentification">×</button>
        </div>

        {isLogin ? (
          <>
            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-semibold text-gray-700">Adresse e-mail</span>
              <input type="email" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} required autoComplete="email" placeholder="ton@email.com" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-[#d2915c] focus:ring-4 focus:ring-[#d2915c]/10" />
            </label>
            <PasswordField label="Mot de passe" value={loginPassword} onChange={setLoginPassword} visible={isLoginPasswordVisible} onToggle={() => setIsLoginPasswordVisible((visible) => !visible)} autoComplete="current-password" placeholder="••••••••" />
            <button type="submit" disabled={isSubmitting} className="mt-6 w-full rounded-xl bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-[#d2915c] disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Connexion…' : 'Connexion'}</button>
          </>
        ) : (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block"><span className="mb-2 block text-sm font-semibold text-gray-700">Prénom</span><input type="text" value={firstName} onChange={(event) => setFirstName(event.target.value)} required autoComplete="given-name" placeholder="Prénom" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-[#d2915c] focus:ring-4 focus:ring-[#d2915c]/10" /></label>
              <label className="block"><span className="mb-2 block text-sm font-semibold text-gray-700">Nom</span><input type="text" value={lastName} onChange={(event) => setLastName(event.target.value)} required autoComplete="family-name" placeholder="Nom" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-[#d2915c] focus:ring-4 focus:ring-[#d2915c]/10" /></label>
            </div>
            <label className="mt-4 block"><span className="mb-2 block text-sm font-semibold text-gray-700">Adresse e-mail</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="ton@email.com" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-[#d2915c] focus:ring-4 focus:ring-[#d2915c]/10" /></label>
            <PasswordField label="Mot de passe" value={password} onChange={setPassword} visible={isRegisterPasswordVisible} onToggle={() => setIsRegisterPasswordVisible((visible) => !visible)} autoComplete="new-password" placeholder="8 caractères minimum" minLength="8" />
            <PasswordField label="Confirmer le mot de passe" value={passwordConfirmation} onChange={setPasswordConfirmation} visible={isRegisterPasswordConfirmationVisible} onToggle={() => setIsRegisterPasswordConfirmationVisible((visible) => !visible)} autoComplete="new-password" placeholder="Répète ton mot de passe" minLength="8" />
            <button type="submit" disabled={isSubmitting} className="mt-6 w-full rounded-xl bg-[#d2915c] px-4 py-3 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Création…' : 'Créer mon compte'}</button>
          </>
        )}
      </form>
    </div>
  )
}

function PasswordField({ label, value, onChange, visible, onToggle, autoComplete, placeholder, minLength }) {
  return (
    <label className="mt-4 block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">{label}</span>
      <div className="relative">
        <input type={visible ? 'text' : 'password'} value={value} onChange={(event) => onChange(event.target.value)} required minLength={minLength} autoComplete={autoComplete} placeholder={placeholder} className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm font-medium outline-none transition focus:border-[#d2915c] focus:ring-4 focus:ring-[#d2915c]/10" />
        <button type="button" onClick={onToggle} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-500 transition hover:text-black" aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
          <img src={visible ? eyeIcon : eyeOffIcon} alt="" className="h-5 w-5" />
        </button>
      </div>
    </label>
  )
}

export default AuthOverlay
