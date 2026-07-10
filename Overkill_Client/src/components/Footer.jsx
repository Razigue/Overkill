import logo from '../assets/images/Overkill_Logo.png'

function Footer() {
  const Login = () => {
    // TODO: Brancher ici l'appel API ou la redirection de connexion.
  }

  const Register = () => {
    // TODO: Brancher ici l'appel API ou la redirection d'inscription.
  }

  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-start">
          <div className="max-w-sm">
            <a href="/" className="inline-flex items-center gap-3" aria-label="Overkill accueil">
              <img src={logo} alt="Overkill" className="h-14 w-14 object-contain" />
              <span className="text-xl font-bold text-black">Overkill</span>
            </a>
            <p className="mt-4 text-sm leading-6 text-gray-600">
              Agrégateur d'offres d'emploi, de stage et d'alternance.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-black">
              Plateforme
            </h2>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="/communauté" className="text-sm font-medium text-gray-600 transition hover:text-black">
                  Communauté
                </a>
              </li>
              <li>
                <a href="/ressources" className="text-sm font-medium text-gray-600 transition hover:text-black">
                  Ressources
                </a>
              </li>
              <li>
                <a href="/contact" className="text-sm font-medium text-gray-600 transition hover:text-black">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <button
              type="button"
              onClick={Register}
              className="inline-flex justify-center rounded-md border-2 border-black bg-[#d2915c] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md"
            >
              S'inscrire
            </button>
            <button
              type="button"
              onClick={Login}
              className="inline-flex justify-center rounded-md border-2 border-black bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Se connecter
            </button>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-gray-200 pt-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 Overkill. Tous droits réservés.</p>
          <div className="flex gap-5">
            <a href="/privacy" className="transition hover:text-black">Confidentialité</a>
            <a href="/terms" className="transition hover:text-black">Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
