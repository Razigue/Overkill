import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'
import Background from '../assets/images/Overkill_Background.png'

function Accueil() {
  const navigate = useNavigate()
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

  const clearSearchField = (name, inputId) => {
    setSearchForm((currentForm) => ({
      ...currentForm,
      [name]: '',
    }))
    window.requestAnimationFrame(() => document.getElementById(inputId)?.focus())
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()

    const searchParams = new URLSearchParams()
    const normalizedSearch = {
      q: searchForm.query.trim(),
      city: searchForm.location.trim(),
      contract: searchForm.contractType,
    }

    Object.entries(normalizedSearch).forEach(([name, value]) => {
      if (value) searchParams.set(name, value)
    })

    navigate(`/feed${searchParams.size > 0 ? `?${searchParams.toString()}` : ''}`)
  }

  return (
    <div className="min-h-screen bg-[#faf7f4] text-[#171717]">
      <Header />

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
                <div>
                  <label htmlFor="home-search-query" className="mb-2 block text-sm font-semibold text-gray-700">
                    Recherche
                  </label>
                  <div className="relative">
                    <input
                      id="home-search-query"
                      type="text"
                      name="query"
                      value={searchForm.query}
                      onChange={handleSearchChange}
                      placeholder="Métier, entreprise, compétence"
                      maxLength={120}
                      className="w-full rounded-xl border border-gray-200 py-3 pl-4 pr-12 text-sm font-medium outline-none transition focus:border-[#d2915c] focus:bg-white focus:ring-4 focus:ring-[#d2915c]/10"
                    />
                    {searchForm.query && (
                      <button
                        type="button"
                        onClick={() => clearSearchField('query', 'home-search-query')}
                        aria-label="Effacer la recherche"
                        className="absolute inset-y-0 right-1 my-auto flex h-9 w-9 items-center justify-center rounded-lg text-xl leading-none text-gray-500 transition hover:bg-[#f1ebe6] hover:text-black focus:outline-none focus-visible:ring-3 focus-visible:ring-[#d2915c]/25"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="home-search-location" className="mb-2 block text-sm font-semibold text-gray-700">
                    Localisation
                  </label>
                  <div className="relative">
                    <input
                      id="home-search-location"
                      type="text"
                      name="location"
                      value={searchForm.location}
                      onChange={handleSearchChange}
                      placeholder="Ville ou télétravail"
                      maxLength={100}
                      className="w-full rounded-xl border border-gray-200 py-3 pl-4 pr-12 text-sm font-medium outline-none transition focus:border-[#d2915c] focus:bg-white focus:ring-4 focus:ring-[#d2915c]/10"
                    />
                    {searchForm.location && (
                      <button
                        type="button"
                        onClick={() => clearSearchField('location', 'home-search-location')}
                        aria-label="Effacer la localisation"
                        className="absolute inset-y-0 right-1 my-auto flex h-9 w-9 items-center justify-center rounded-lg text-xl leading-none text-gray-500 transition hover:bg-[#f1ebe6] hover:text-black focus:outline-none focus-visible:ring-3 focus-visible:ring-[#d2915c]/25"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

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
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
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

    </div>
  )
}

export default Accueil
