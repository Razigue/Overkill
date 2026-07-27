import PublicHeader from '../components/PublicHeader'
import Footer from '../components/Footer'
import Background from '../assets/images/Overkill_Background.png'


const steps = [
  {
    id: 'projet',
    number: '01',
    title: 'Clarifier votre projet',
    intro: 'Une recherche efficace commence par un cap précis. Plus vous savez ce que vous cherchez, plus vous repérez rapidement les offres pertinentes.',
    points: [
      'Définissez le secteur, le métier, le type de contrat et la zone géographique visés.',
      'Notez vos critères non négociables : rémunération minimale, télétravail, horaires, taille d’entreprise ou temps de trajet.',
      'Faites le point sur vos compétences, vos expériences et la valeur que vous pouvez apporter.',
    ],
  },
  {
    id: 'outils',
    number: '02',
    title: 'Préparer vos outils',
    intro: 'Préparez une base solide que vous pourrez ensuite adapter, plutôt que de repartir de zéro à chaque candidature.',
    points: [
      'Gardez un CV à jour, lisible et orienté vers le poste recherché.',
      'Préparez une trame de lettre ou de message de motivation, à personnaliser pour chaque entreprise.',
      'Vérifiez que votre profil LinkedIn est complet et cohérent avec votre CV.',
      'Ajoutez un portfolio si votre métier s’y prête : design, développement, communication ou projets personnels.',
    ],
  },
  {
    id: 'cibler',
    number: '03',
    title: 'Cibler les bonnes entreprises',
    intro: 'Ne vous limitez pas aux annonces déjà publiées. Une entreprise qui vous intéresse peut recruter demain ou rester ouverte à une candidature spontanée pertinente.',
    points: [
      'Listez les entreprises, équipes ou secteurs qui vous attirent, même sans offre visible.',
      'Consultez leur actualité, leurs valeurs et leurs projets récents avant de les contacter.',
      'Regardez aussi les PME et structures locales : elles offrent souvent des opportunités moins visibles.',
    ],
  },
  {
    id: 'canaux',
    number: '04',
    title: 'Multiplier les canaux',
    intro: 'Chaque canal montre une partie différente du marché. Les combiner élargit vos possibilités sans vous disperser.',
    points: [
      'Utilisez les sites généralistes : LinkedIn, Indeed, Welcome to the Jungle et France Travail.',
      'Cherchez les plateformes liées à votre secteur ou à votre contrat : alternance, emploi étudiant, tech, création, etc.',
      'Suivez les entreprises et activez votre réseau sur les réseaux professionnels.',
      'Participez aux salons, forums école-entreprise et journées portes ouvertes lorsque cela est pertinent.',
      'Envoyez des candidatures spontanées ciblées : elles restent sous-utilisées et peuvent faire la différence.',
    ],
  },
  {
    id: 'choisir',
    number: '05',
    title: 'Évaluer une offre avant de postuler',
    intro: 'Une bonne offre ne se résume pas à son intitulé. Vérifiez qu’elle correspond à votre projet et que les conditions vous permettront de progresser.',
    points: [
      'Comparez les missions réelles avec ce que vous souhaitez apprendre et pratiquer au quotidien.',
      'Identifiez les compétences indispensables, celles qui peuvent s’acquérir et les priorités du recruteur.',
      'Regardez le contrat, la localisation, l’organisation, l’encadrement et les perspectives d’évolution.',
      'Soyez attentif aux annonces très vagues, aux attentes irréalistes ou aux informations essentielles absentes.',
    ],
  },
  {
    id: 'personnaliser',
    number: '06',
    title: 'Personnaliser chaque candidature',
    intro: 'Quelques ajustements ciblés ont plus d’impact qu’un grand nombre de candidatures identiques.',
    points: [
      'Adaptez le CV et le message d’accompagnement aux mots-clés et aux priorités de l’offre.',
      'Montrez pourquoi cette entreprise vous intéresse, avec un élément concret sur son activité ou ses projets.',
      'Mobilisez votre réseau : anciens camarades, alumni, professeurs et collègues peuvent partager un conseil ou vous mettre en relation.',
    ],
  },
  {
    id: 'suivre',
    number: '07',
    title: 'Suivre, préparer et ajuster',
    intro: 'La recherche devient plus sereine quand elle est organisée. Les retours, y compris les refus, vous aident à progresser.',
    points: [
      'Suivez vos candidatures : entreprise, contact, date, statut et relance prévue.',
      'Relancez poliment après une à deux semaines sans réponse, selon le délai indiqué dans l’annonce.',
      'Préparez une présentation de deux à trois minutes, les questions classiques et quelques questions à poser.',
      'Analysez ce qui fonctionne moins bien et ajustez votre CV, votre ciblage ou vos critères si nécessaire.',
    ],
  },
]

function GuideOffres() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fcfbfa] text-[#171717]">
      <PublicHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${Background})` }}
                  >
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <a href="/ressources" className="text-sm font-bold text-black transition hover:text-[#d2915c]">← Retour aux ressources</a>
            <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-[#d2915c]">Guide pratique</p>
                <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[1.02] text-black sm:text-6xl lg:text-7xl">
                  Trouver l’offre qui vous correspond vraiment.
                </h1>
                <p className="max-w-xl text-lg leading-8 text-[#4e3824]">
                Une méthode concrète pour choisir, cibler et suivre vos candidatures en emploi, stage ou alternance.
              </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-16">
            <aside className="lg:sticky lg:top-8 lg:self-start">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d2915c]">Dans ce guide</p>
              <nav className="mt-5 border-l border-black/15" aria-label="Sommaire du guide">
                {steps.map((step) => (
                  <a key={step.id} href={`#${step.id}`} className="block border-l-2 border-transparent py-2 pl-4 text-sm font-medium text-gray-600 transition hover:border-[#d2915c] hover:text-black">
                    {step.number}. {step.title}
                  </a>
                ))}
              </nav>
              <div className="mt-8 border-t border-black/10 pt-6 text-sm leading-6 text-gray-600">
                <p className="font-bold text-black">Le principe</p>
                <p className="mt-2">Mieux vaut des candidatures cohérentes et suivies que des envois en masse.</p>
              </div>
            </aside>

            <div>
              <div className="border-b-2 border-black pb-8">
                <p className="max-w-3xl text-xl font-medium leading-8 text-gray-700">
                  Utilisez ces étapes dans l’ordre ou commencez directement par celle qui bloque votre recherche aujourd’hui.
                </p>
              </div>

              <div>
                {steps.map((step) => (
                  <section id={step.id} key={step.id} className="scroll-mt-8 border-b border-gray-400 py-10 sm:py-12">
                    <div className="grid gap-5 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-8">
                      <p className="text-3xl font-black text-[#d2915c]">{step.number}</p>
                      <div>
                        <h2 className="text-3xl font-black leading-tight text-black sm:text-4xl">{step.title}</h2>
                        <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">{step.intro}</p>
                        <ul className="mt-6 max-w-3xl space-y-3">
                          {step.points.map((point) => (
                            <li key={point} className="flex gap-3 text-sm leading-6 text-gray-700">
                              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#d2915c]" aria-hidden="true" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </section>
                ))}
              </div>

              <section className="mt-10 bg-black p-7 rounded-2xl text-white sm:p-9">
                <p className="text-sm font-bold uppercase tracking-wide text-[#ebc09d]">À retenir</p>
                <h2 className="mt-3 text-3xl font-black leading-tight">Une offre est intéressante si elle vous fait avancer vers votre projet.</h2>
                <p className="mt-4 max-w-2xl leading-7 text-gray-300">Fiez-vous autant aux missions et à l’environnement qu’au titre du poste. Prenez le temps de comparer avant de candidater.</p>
                <a href="/" className="mt-6 inline-flex rounded-xl bg-[#d2915c] px-5 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-black">Rechercher une offre</a>
              </section>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default GuideOffres
