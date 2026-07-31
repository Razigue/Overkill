import { useEffect, useRef, useState } from 'react'
import logo from '../assets/images/Overkill_Logo.png'
import chevronDown from '../assets/icons/chevron-down.svg'
import profileIcon from '../assets/icons/user.svg'

function Header({ user, onLogin, onRegister, onLogout }) {
  const currentUser = user || JSON.parse(localStorage.getItem('user') || 'null')
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef(null)
  const firstName = currentUser?.firstName || currentUser?.firstname
  const accountLabel = firstName || 'Mon compte'
  const getUserRoles = () => {
    if (currentUser?.roles) return currentUser.roles

    try {
      const token = localStorage.getItem('token')
      if (!token) return []
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.roles || []
    } catch {
      return []
    }
  }

  const userRoles = getUserRoles()
  const isAdmin = userRoles.includes('ROLE_ADMIN')
  useEffect(() => {
    if (!currentUser) return undefined

    const handlePointerDown = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) setIsAccountMenuOpen(false)
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsAccountMenuOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentUser])

  const handleLogout = () => {
    setIsAccountMenuOpen(false)
    onLogout()
  }

  return (
      <header className="w-full bg-white border-b border-gray-200">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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
                <div ref={accountMenuRef} className="relative">
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

                          {/* 2. LIEN ADMIN (Affiché uniquement si isAdmin est vrai) */}
                          {isAdmin && (
                              <a
                                  href="/admin"
                                  onClick={() => setIsAccountMenuOpen(false)}
                                  className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                              >
                                Panel Admin
                              </a>
                          )}

                          <a href="/profil" onClick={() => setIsAccountMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-[#faf7f4] hover:text-[#d2915c]">
                            Mon profil
                          </a>

                          <button type="button" onClick={handleLogout} className="w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-700 transition hover:bg-red-50 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-300">
                            Déconnexion
                          </button>
                        </div>
                      </div>
                  )}
                </div>
            ) : (
                <>
                  {/* Utilisateur déconnecté */}
                  <button
                      type="button"
                      onClick={onLogin}
                      className="cursor-pointer rounded-md border-2 border-black bg-white px-4 py-2 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    Se connecter
                  </button>
                  <button
                      type="button"
                      onClick={onRegister}
                      className="cursor-pointer rounded-md border-2 border-black bg-[#d2915c] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    S'inscrire
                  </button>
                </>
            )}
          </div>
        </div>
      </header>
  )
}

export default Header
