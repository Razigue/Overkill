import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Background from '../assets/images/Overkill_Background.png'

const resources = [
  {
    number: '01',
    title: 'Construire un CV qui vous ressemble',
    description: 'Les bases pour présenter votre parcours, vos compétences et vos expériences de façon claire.',
    topics: [
      ['Choisir une structure simple', 'Faites tenir les informations importantes sur une page claire : coordonnées, expériences, formation et compétences.'],
      ['Mettre en valeur vos expériences', 'Pour chaque expérience, indiquez ce que vous avez réalisé et les compétences que vous y avez développées.'],
      ['Adapter votre CV', 'Reprenez les mots-clés de l’offre et mettez en premier les éléments les plus pertinents pour le poste visé.'],
    ],
  },
  {
    number: '02',
    title: 'Trouver les offres qui vous correspondent',
    description: 'Apprenez à lire une offre, définir vos critères et concentrer vos candidatures au bon endroit.',
    topics: [
      ['Définir vos critères', 'Identifiez le métier, le type de contrat, la localisation et les conditions qui comptent réellement pour vous.'],
      ['Lire entre les lignes', 'Distinguez les missions indispensables des compétences appréciées, puis vérifiez que l’environnement vous convient.'],
      ['Candidater avec méthode', 'Gardez une trace des offres sélectionnées, des candidatures envoyées et des relances à prévoir.'],
    ],
  },
]

function Ressources() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#faf7f4] text-[#171717]">
      <Header user={user} onLogout={handleLogout} />

      <main className="flex-1">
        <section
          className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${Background})` }}
        >
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-wide text-[#d2915c]">Ressources</p>
              <h1 className="mt-4 text-5xl font-black leading-[1.03] text-black sm:text-6xl">
                Les bons repères pour avancer dans votre recherche.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f5f5f]">
                Retrouvez des conseils simples pour préparer votre candidature et identifier les opportunités qui correspondent vraiment à votre profil.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wide text-[#d2915c]">Par où commencer ?</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-black sm:text-5xl">
              Deux essentiels pour mieux candidater.
            </h2>
            <p className="mt-5 leading-7 text-gray-600">
              Explorez le sujet qui vous est le plus utile maintenant. Chaque espace pourra ensuite accueillir des guides, exemples et outils plus détaillés.
            </p>
          </div>

          <div className="mt-10 border-y border-black/10">
            {resources.map((resource) => (
              <details key={resource.number} className="group border-b border-black/10 last:border-b-0" open={resource.number === '01'}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left sm:py-7 [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <span className="text-sm font-bold text-[#d2915c]">{resource.number}</span>
                    <div>
                      <h3 className="text-xl font-black leading-tight text-black sm:text-2xl">{resource.title}</h3>
                      <p className="mt-2 hidden max-w-2xl text-sm leading-6 text-gray-600 sm:block">{resource.description}</p>
                    </div>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center text-2xl font-light text-[#d2915c]" aria-hidden="true">
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:block">−</span>
                  </span>
                </summary>

                <div className="pb-7 pl-10 sm:pl-[4.35rem]">
                  <p className="max-w-2xl text-sm leading-6 text-gray-600 sm:hidden">{resource.description}</p>
                  <div className="mt-5 grid max-w-4xl gap-4 sm:grid-cols-3">
                    {resource.topics.map(([topic, advice]) => (
                      <article key={topic} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                        <h4 className="text-sm font-bold text-black">{topic}</h4>
                        <p className="mt-2 text-sm leading-6 text-gray-600">{advice}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section id="prochainement" className="bg-white py-16 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-[#d2915c]">À venir</p>
              <h2 className="mt-3 text-4xl font-black leading-tight text-black">Des guides concrets, au bon moment.</h2>
              <p className="mt-5 max-w-2xl leading-7 text-gray-600">
                Cette page est pensée comme votre point de départ. Elle pourra progressivement mener vers des fiches complètes, des modèles de CV et des conseils adaptés à chaque étape de votre recherche.
              </p>
            </div>
            <div className="rounded-2xl bg-black p-7 text-white sm:p-8">
              <p className="text-sm font-bold text-[#ebc09d]">Le réflexe Overkill</p>
              <p className="mt-4 text-2xl font-black leading-tight">Préparez une candidature, puis suivez-la sans perdre le fil.</p>
              <a href="/" className="mt-6 inline-flex rounded-xl bg-[#d2915c] px-5 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-black">
                Rechercher une offre
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Ressources
