import logo from '../assets/images/Overkill_Logo.png'

function Header({ user, onLogin, onRegister, onLogout }) {
  return (
      <header className="w-full bg-white border-b border-gray-200">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center" aria-label="Overkill accueil">
            <img src={logo} alt="Overkill" className="h-14 w-14 object-contain" />
          </a>

          <nav className="hidden items-center gap-10 md:flex" aria-label="Navigation principale">
            <a href="/communauté" className="text-sm font-semibold text-gray-900 transition hover:text-[#d2915c]">
              Communauté
            </a>
            <a href="/ressources" className="text-sm font-semibold text-gray-900 transition hover:text-[#d2915c]">
              Ressources
            </a>
            <a href="/contact" className="text-sm font-semibold text-gray-900 transition hover:text-[#d2915c]">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
                <>
                  {/* Utilisateur connecté */}
                  <a
                      href="/profil"
                      className="text-sm font-semibold text-gray-900 transition hover:text-[#d2915c]"
                  >
                    Mon profil
                  </a>
                  <button
                      type="button"
                      onClick={onLogout}
                      className="rounded-md border-2 border-black bg-black px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    Déconnexion
                  </button>
                </>
            ) : (
                <>
                  {/* Utilisateur déconnecté */}
                  <button
                      type="button"
                      onClick={onLogin}
                      className="rounded-md border-2 border-black bg-white px-4 py-2 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    Se connecter
                  </button>
                  <button
                      type="button"
                      onClick={onRegister}
                      className="rounded-md border-2 border-black bg-[#d2915c] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md"
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