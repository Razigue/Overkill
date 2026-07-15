import { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import Header from '../components/Header'
import Background from '../assets/images/Overkill_Background.png'
import eyeIcon from '../assets/icons/eye.svg'
import eyeOffIcon from '../assets/icons/eye-off.svg'

function Accueil() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isLoginClosing, setIsLoginClosing] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isRegisterClosing, setIsRegisterClosing] = useState(false)
  const [isLoginPasswordVisible, setIsLoginPasswordVisible] = useState(false)
  const [isRegisterPasswordVisible, setIsRegisterPasswordVisible] = useState(false)
  const [isRegisterPasswordConfirmationVisible, setIsRegisterPasswordConfirmationVisible] = useState(false)
  const [searchForm, setSearchForm] = useState({
    query: '',
    location: '',
    contractType: '',
  })

  const handleSearchChange = (event) => {
    const { name, value } = event.target

    setSearchForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    // TODO: Brancher ici l'appel API de recherche d'offres.
    console.log('Recherche offres', searchForm)
  }

  const handleLoginSubmit = (event) => {
    event.preventDefault()
    // TODO: Brancher ici l'appel API de connexion.
  }

  const handleRegisterSubmit = (event) => {
    event.preventDefault()
    // TODO: Brancher ici l'appel API d'inscription.
  }

  const openLogin = () => {
    setIsLoginClosing(false)
    setIsLoginOpen(true)
  }

  const closeLogin = () => {
    setIsLoginClosing(true)
    window.setTimeout(() => {
      setIsLoginOpen(false)
      setIsLoginClosing(false)
    }, 220)
  }

  const openRegister = () => {
    setIsRegisterClosing(false)
    setIsRegisterOpen(true)
  }

  const closeRegister = () => {
    setIsRegisterClosing(true)
    window.setTimeout(() => {
      setIsRegisterOpen(false)
      setIsRegisterClosing(false)
    }, 220)
  }

  useEffect(() => {
    if (!isLoginOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeLogin()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isLoginOpen])

  useEffect(() => {
    if (!isRegisterOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeRegister()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isRegisterOpen])

  return (
    <div className="min-h-screen bg-[#faf7f4] text-[#171717]">
      <Header onLogin={openLogin} onRegister={openRegister} />

      <main>
        <section
          className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${Background})` }}
        >
          <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
            <div className="max-w-3xl">
              <h1 className="max-w-4xl text-5xl font-black leading-[1.03] text-black sm:text-6xl lg:text-7xl">
                Centralise ta recherche et garde le contrôle.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5F5F5F]">
                Overkill réunit les offres qui comptent, t'aide à suivre tes candidatures et te donne un espace clair pour avancer sans te disperser.
              </p>
            </div>

            <div className="rounded-2xl bg-white/90 p-6 shadow-2xl shadow-black/10 ring-1 ring-black/5 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#d2915c]">Recherche rapide</p>
                  <h2 className="mt-1 text-2xl font-black text-black">Trouver une opportunité</h2>
                </div>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleSearchSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Recherche</span>
                  <input
                    type="text"
                    name="query"
                    value={searchForm.query}
                    onChange={handleSearchChange}
                    placeholder="Métier, entreprise, compétence"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-[#d2915c] focus:bg-white focus:ring-4 focus:ring-[#d2915c]/10"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Localisation</span>
                  <input
                    type="text"
                    name="location"
                    value={searchForm.location}
                    onChange={handleSearchChange}
                    placeholder="Ville ou télétravail"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-[#d2915c] focus:bg-white focus:ring-4 focus:ring-[#d2915c]/10"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Type de contrat</span>
                  <select
                    name="contractType"
                    value={searchForm.contractType}
                    onChange={handleSearchChange}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-[#d2915c] focus:bg-white focus:ring-4 focus:ring-[#d2915c]/10"
                  >
                    <option value="">Tous les contrats</option>
                    <option value="stage">Stage</option>
                    <option value="alternance">Alternance</option>
                    <option value="cdi">CDI</option>
                    <option value="cdd">CDD</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </label>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-[#d2915c]"
                >
                  Rechercher
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase text-[#d2915c]">Méthode simple</p>
            <h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">Une recherche mieux organisée.</h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
                <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <p className="text-sm font-bold text-[#d2915c]">01</p>
              <h3 className="mt-4 text-xl font-black">Centraliser</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Rassemble les offres importantes au même endroit et compare les opportunités plus facilement.
              </p>
            </article>

            <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <p className="text-sm font-bold text-[#d2915c]">02</p>
              <h3 className="mt-4 text-xl font-black">Suivre</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Garde une vision claire des candidatures envoyées, des réponses et des prochaines actions.
              </p>
            </article>

            <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <p className="text-sm font-bold text-[#d2915c]">03</p>
              <h3 className="mt-4 text-xl font-black">Progresser</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Utilise les ressources pour améliorer ton profil et préparer des candidatures plus solides.
              </p>
            </article>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase text-[#d2915c]">Pourquoi Overkill</p>
              <h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
                Moins d'onglets, plus de décisions utiles.
              </h2>
              <p className="mt-5 text-base leading-7 text-gray-600">
                L'objectif est simple : enlever le bruit autour de la recherche et te laisser te concentrer sur les offres qui méritent vraiment ton attention.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#ebc09d] p-6 ring-1 ring-black/5">
                <p className="text-3xl font-black">Rapide</p>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Une recherche regroupée, plus lisible et plus directe.
                </p>
              </div>
              <div className="rounded-2xl bg-[#ebc09d] p-6 ring-1 ring-black/5">
                <p className="text-3xl font-black">Clair</p>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Un suivi simple pour savoir exactement où tu en es.
                </p>
              </div>
              <div className="rounded-2xl bg-black p-6 text-white sm:col-span-2">
                <p className="text-3xl font-black">Efficace</p>
                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-300">
                  Des offres, des ressources et une organisation commune pour construire une vraie stratégie de candidature.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Espace de connexion */}
      {isLoginOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-all duration-200 ease-out ${
            isLoginClosing ? 'bg-black/0 backdrop-blur-none' : 'animate-login-backdrop-in bg-black/30'
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-title"
          onClick={closeLogin}
        >
          <form
            className={`w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all duration-200 ease-out sm:p-8 ${
              isLoginClosing ? 'translate-y-3 scale-95 opacity-0' : 'animate-login-in'
            }`}
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleLoginSubmit}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase text-[#d2915c]">Bienvenue</p>
                <h2 id="login-title" className="mt-1 text-2xl font-black text-black">
                  Se connecter
                </h2>
              </div>
              <button
                type="button"
                onClick={closeLogin}
                className="rounded-md px-2 text-3xl leading-none text-gray-500 transition hover:bg-gray-100 hover:text-black"
                aria-label="Fermer la fenêtre de connexion"
              >
                ×
              </button>
            </div>

            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-semibold text-gray-700">Adresse e-mail</span>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="ton@email.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-[#d2915c] focus:ring-4 focus:ring-[#d2915c]/10"
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold text-gray-700">Mot de passe</span>
              <div className="relative">
                <input
                  type={isLoginPasswordVisible ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm font-medium outline-none transition focus:border-[#d2915c] focus:ring-4 focus:ring-[#d2915c]/10"
                />
              </div>
            </label>

            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-[#d2915c]"
            >
              Connexion
            </button>
          </form>
        </div>
      )}

      {isRegisterOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-all duration-200 ease-out ${
            isRegisterClosing ? 'bg-black/0 backdrop-blur-none' : 'animate-login-backdrop-in bg-black/30'
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-title"
          onClick={closeRegister}
        >
          <form
            className={`w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all duration-200 ease-out sm:p-8 ${
              isRegisterClosing ? 'translate-y-3 scale-95 opacity-0' : 'animate-login-in'
            }`}
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleRegisterSubmit}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase text-[#d2915c]">Rejoins-nous</p>
                <h2 id="register-title" className="mt-1 text-2xl font-black text-black">Créer un compte</h2>
              </div>
              <button type="button" onClick={closeRegister} className="rounded-md px-2 text-3xl leading-none text-gray-500 transition hover:bg-gray-100 hover:text-black" aria-label="Fermer la fenêtre d'inscription">
                ×
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Prénom</span>
                <input type="text" name="firstName" required autoComplete="given-name" placeholder="Prénom" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-[#d2915c] focus:ring-4 focus:ring-[#d2915c]/10" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Nom</span>
                <input type="text" name="lastName" required autoComplete="family-name" placeholder="Nom" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-[#d2915c] focus:ring-4 focus:ring-[#d2915c]/10" />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold text-gray-700">Adresse e-mail</span>
              <input type="email" required autoComplete="email" placeholder="ton@email.com" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-[#d2915c] focus:ring-4 focus:ring-[#d2915c]/10" />
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold text-gray-700">Mot de passe</span>
              <div className="relative">
                <input type={isRegisterPasswordVisible ? 'text' : 'password'} name="password" required minLength="8" autoComplete="new-password" placeholder="8 caractères minimum" className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm font-medium outline-none transition focus:border-[#d2915c] focus:ring-4 focus:ring-[#d2915c]/10" />
                <button type="button" onClick={() => setIsRegisterPasswordVisible((visible) => !visible)} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-500 transition hover:text-black" aria-label={isRegisterPasswordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                  <img src={isRegisterPasswordVisible ? eyeIcon : eyeOffIcon} alt="" className="h-5 w-5" />
                </button>
              </div>
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold text-gray-700">Confirmer le mot de passe</span>
              <div className="relative">
                <input type={isRegisterPasswordConfirmationVisible ? 'text' : 'password'} name="passwordConfirmation" required minLength="8" autoComplete="new-password" placeholder="Répète ton mot de passe" className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm font-medium outline-none transition focus:border-[#d2915c] focus:ring-4 focus:ring-[#d2915c]/10" />
                <button type="button" onClick={() => setIsRegisterPasswordConfirmationVisible((visible) => !visible)} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-500 transition hover:text-black" aria-label={isRegisterPasswordConfirmationVisible ? 'Masquer la confirmation du mot de passe' : 'Afficher la confirmation du mot de passe'}>
                  <img src={isRegisterPasswordConfirmationVisible ? eyeIcon : eyeOffIcon} alt="" className="h-5 w-5" />
                </button>
              </div>
            </label>

            <button type="submit" className="mt-6 w-full rounded-xl bg-[#d2915c] px-4 py-3 text-sm font-bold text-white transition hover:bg-black">
              Créer mon compte
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default Accueil
