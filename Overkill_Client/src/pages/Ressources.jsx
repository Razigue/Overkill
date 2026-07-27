import PublicHeader from '../components/PublicHeader'
import Footer from '../components/Footer'
import Background from '../assets/images/Overkill_Background.png'

const resources = [
  {
    number: '01',
    title: 'Construire un CV qui vous ressemble',
    description: 'Les bases pour présenter votre parcours, vos compétences et vos expériences de façon claire.',
    link: '/ressources/cv',
    linkLabel: 'Voir le guide CV',
    topics: [
      'Choisir une structure simple et facile à lire.',
      'Mettre en valeur vos expériences et compétences.',
      'Adapter votre CV à l’offre visée.',
    ],
  },
  {
    number: '02',
    title: 'Trouver les offres qui vous correspondent',
    description: 'Apprenez à lire une offre, définir vos critères et concentrer vos candidatures au bon endroit.',
    link: '/ressources/offres',
    linkLabel: 'Voir le guide des offres',
    topics: [
      'Définir les critères importants pour votre recherche.',
      'Comprendre les missions et compétences attendues.',
      'Organiser vos candidatures et vos relances.',
    ],
  },
]

function Ressources() {
  return (
    <div className="flex min-h-screen flex-col bg-[#faf7f4] text-[#171717]">
      <PublicHeader />

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
          </div>

          <div className="mt-10 border-y border-gray-400">
            {resources.map((resource) => (
              <details key={resource.number} className="group border-b border-gray-400 last:border-b-0">
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
                  <ul className="mt-5 max-w-3xl space-y-3 text-sm leading-6 text-gray-700">
                    {resource.topics.map((topic) => (
                      <li key={topic} className="flex items-start gap-3">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#d2915c]" aria-hidden="true" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex sm:justify-end">
                    <a href={resource.link || '#'} className="inline-flex rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-[#d2915c]">
                      {resource.linkLabel}
                    </a>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Ressources
