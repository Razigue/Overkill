import logo from '../assets/images/Overkill_Logo.png'

function Header({ user, onLogin, onRegister, onLogout }) {
  const currentUser = user || JSON.parse(localStorage.getItem('user') || 'null');

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
            <div className="group relative">
              <a href="/ressources" className="flex items-center gap-2 text-sm font-semibold text-gray-900 transition hover:text-[#d2915c]">
                Ressources
                <span aria-hidden="true">⌄</span>
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