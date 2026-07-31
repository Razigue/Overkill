import { useEffect, useRef, useState } from 'react'
import logo from '../assets/images/Overkill_Logo.png'
import chevronDown from '../assets/icons/chevron-down.svg'
import menuIcon from '../assets/icons/menu.svg'
import profileIcon from '../assets/icons/user.svg'
import AuthOverlay from './AuthOverlay'
import Toast from './Toast'

function Header({ user: providedUser, onLogout }) {
  const [user, setUser] = useState(() => (
    providedUser || JSON.parse(localStorage.getItem('user') || 'null')
  ))
  const [authMode, setAuthMode] = useState(null)
  const [notification, setNotification] = useState(null)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const accountMenuRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const currentUser = providedUser || user
  const firstName = currentUser?.firstName || currentUser?.firstname
  const accountLabel = firstName || 'Mon compte'

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) setIsAccountMenuOpen(false)
      if (!mobileMenuRef.current?.contains(event.target)) setIsMobileMenuOpen(false)
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false)
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleLogout = () => {
    setIsAccountMenuOpen(false)
    setIsMobileMenuOpen(false)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    setNotification({ type: 'info', message: 'Vous êtes déconnecté.' })
    onLogout?.()
  }

  return (
    <>
      <header className="w-full bg-white border-b border-gray-200">
        <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center" aria-label="Overkill accueil">
            <img src={logo} alt="Overkill" className="h-14 w-14 object-contain" />
          </a>

          <nav className="hidden items-center gap-10 md:flex" aria-label="Navigation principale">
            <a href="/" className="text-sm font-semibold text-gray-900 transition hover:text-[#d2915c]">
              Accueil
            </a>
            <a href="/feed" className="text-sm font-semibold text-gray-900 transition hover:text-[#d2915c]">
              Offres
            </a>
            <div className="group relative">
              <a href="/ressources" className="flex items-center gap-2 text-sm font-semibold text-gray-900 transition hover:text-[#d2915c]">
                Ressources
                <img src={chevronDown} alt="" className="h-4 w-4" />
              </a>
              <div className="invisible absolute left-0 top-full z-50 w-56 translate-y-1 pt-3 opacity-0 transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <div className="rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/10">
                  <a href="/ressources/cv" className="block rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-[#faf7f4] hover:text-[#d2915c]">
                    Guide CV
                  </a>
                  <a href="/ressources/offres" className="block rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-[#faf7f4] hover:text-[#d2915c]">
                    Guide des offres
                  </a>
                </div>
              </div>
            </div>
            <a href="/contact" className="text-sm font-semibold text-gray-900 transition hover:text-[#d2915c]">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {currentUser ? (
                <div ref={accountMenuRef} className="relative hidden md:block">
                  <button
                    type="button"
                    onClick={() => setIsAccountMenuOpen((isOpen) => !isOpen)}
                    className="flex cursor-pointer items-center gap-2 rounded-md border-2 border-black bg-white px-3 py-2 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#d2915c] focus:ring-offset-2"
                    aria-expanded={isAccountMenuOpen}
                    aria-controls="account-menu"
                  >
                    <img src={profileIcon} alt="" className="h-4 w-4" />
                    <span className="max-w-28 truncate">{accountLabel}</span>
                    <img src={chevronDown} alt="" className={`h-4 w-4 transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isAccountMenuOpen && (
                    <div id="account-menu" className="absolute right-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/10">
                      <div className="border-b border-gray-100 px-4 py-3">
                        <p className="truncate text-sm font-bold text-gray-900">{accountLabel}</p>
                        {currentUser.email && <p className="mt-1 truncate text-xs text-gray-500">{currentUser.email}</p>}
                      </div>
                      <div className="p-2">
                        <a href="/profil" onClick={() => setIsAccountMenuOpen(false)} className="block min-h-11 rounded-lg px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-[#faf7f4] hover:text-[#d2915c] focus:outline-none focus:ring-2 focus:ring-[#d2915c]">
                          Mon profil
                        </a>
                        <button type="button" onClick={handleLogout} className="min-h-11 w-full cursor-pointer rounded-lg px-3 py-3 text-left text-sm font-semibold text-red-700 transition hover:bg-red-50 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-300">
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
            ) : (
                <div className="hidden items-center gap-3 md:flex">
                  {/* Utilisateur déconnecté */}
                  <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="cursor-pointer rounded-md border-2 border-black bg-white px-4 py-2 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    Se connecter
                  </button>
                  <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="cursor-pointer rounded-md border-2 border-black bg-[#d2915c] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    S'inscrire
                  </button>
                </div>
            )}

            <div ref={mobileMenuRef} className="md:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border-2 border-black bg-white text-black transition hover:bg-[#faf7f4] focus:outline-none focus:ring-2 focus:ring-[#d2915c] focus:ring-offset-2"
                aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <img src={menuIcon} alt="" className="h-6 w-6" />
              </button>

              {isMobileMenuOpen && (
                <div id="mobile-menu" className="absolute left-4 right-4 top-full z-50 mt-3 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/10 sm:left-6 sm:right-6">
                  <nav className="p-2" aria-label="Navigation mobile">
                    <a href="/" onClick={() => setIsMobileMenuOpen(false)} className="block min-h-11 rounded-lg px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-[#faf7f4] hover:text-[#d2915c] focus:outline-none focus:ring-2 focus:ring-[#d2915c]">
                      Accueil
                    </a>
                    <a href="/feed" onClick={() => setIsMobileMenuOpen(false)} className="block min-h-11 rounded-lg px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-[#faf7f4] hover:text-[#d2915c] focus:outline-none focus:ring-2 focus:ring-[#d2915c]">
                      Offres
                    </a>
                    <a href="/ressources" onClick={() => setIsMobileMenuOpen(false)} className="block min-h-11 rounded-lg px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-[#faf7f4] hover:text-[#d2915c] focus:outline-none focus:ring-2 focus:ring-[#d2915c]">
                      Ressources
                    </a>
                    <a href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block min-h-11 rounded-lg px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-[#faf7f4] hover:text-[#d2915c] focus:outline-none focus:ring-2 focus:ring-[#d2915c]">
                      Contact
                    </a>
                  </nav>

                  <div className="border-t border-gray-100 p-2">
                    {currentUser ? (
                      <>
                        <div className="px-3 py-2">
                          <p className="truncate text-sm font-bold text-gray-900">{accountLabel}</p>
                          {currentUser.email && <p className="mt-1 truncate text-xs text-gray-500">{currentUser.email}</p>}
                        </div>
                        <a href="/profil" onClick={() => setIsMobileMenuOpen(false)} className="block min-h-11 rounded-lg px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-[#faf7f4] hover:text-[#d2915c] focus:outline-none focus:ring-2 focus:ring-[#d2915c]">
                          Mon profil
                        </a>
                        <button type="button" onClick={handleLogout} className="min-h-11 w-full cursor-pointer rounded-lg px-3 py-3 text-left text-sm font-semibold text-red-700 transition hover:bg-red-50 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-300">
                          Déconnexion
                        </button>
                      </>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsMobileMenuOpen(false)
                            setAuthMode('login')
                          }}
                          className="min-h-11 cursor-pointer rounded-md border-2 border-black bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-[#faf7f4] focus:outline-none focus:ring-2 focus:ring-[#d2915c]"
                        >
                          Se connecter
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsMobileMenuOpen(false)
                            setAuthMode('register')
                          }}
                          className="min-h-11 cursor-pointer rounded-md border-2 border-black bg-[#d2915c] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#bd7d4a] focus:outline-none focus:ring-2 focus:ring-[#d2915c] focus:ring-offset-2"
                        >
                          S'inscrire
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {authMode && (
        <AuthOverlay
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onAuthenticated={setUser}
          onSwitchMode={setAuthMode}
          onNotify={setNotification}
        />
      )}
      <Toast
        notification={notification}
        onDismiss={() => setNotification(null)}
      />
    </>
  )
}

export default Header
