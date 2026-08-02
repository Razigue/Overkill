import PublicHeader from '../components/PublicHeader'
import Footer from '../components/Footer'
import Background from '../assets/images/Overkill_Background.png'

const steps = [
  {
    id: 'format',
    number: '01',
    title: 'Choisir un format lisible',
    intro: 'Le meilleur format est celui qui permet à un recruteur de comprendre votre parcours en quelques secondes.',
    points: [
      'Privilégiez un CV antéchronologique : vos expériences ou formations les plus récentes apparaissent en premier.',
      'En cas de reconversion ou de parcours atypique, faites davantage ressortir vos compétences tout en gardant les expériences visibles.',
      'Visez une page ; deux pages sont acceptables si votre expérience pertinente le justifie vraiment.',
    ],
  },
  {
    id: 'structure',
    number: '02',
    title: 'Structurer les informations',
    intro: 'Une structure constante aide le lecteur à trouver immédiatement ce qu’il cherche.',
    points: [
      'Placez en haut votre nom, vos coordonnées professionnelles et un lien LinkedIn ou portfolio lorsqu’il apporte une information utile.',
      'Ajoutez un titre ou une accroche courte qui précise le poste recherché ou votre profil.',
      'Organisez le reste avec des rubriques simples : expériences, formation, compétences, langues, certifications et projets pertinents.',
      'La photo reste facultative : choisissez-la seulement si elle est professionnelle et adaptée aux usages de votre secteur ou pays.',
    ],
  },
  {
    id: 'experiences',
    number: '03',
    title: 'Donner de l’impact à vos expériences',
    intro: 'Ne listez pas uniquement ce que vous deviez faire : montrez ce que vous avez concrètement réalisé.',
    points: [
      'Commencez chaque ligne par un verbe d’action précis : développé, organisé, analysé, amélioré ou coordonné.',
      'Donnez un résultat mesurable lorsque vous en avez un : volume traité, délai réduit, projet livré ou objectif atteint.',
      'Sélectionnez les missions et réalisations les plus utiles pour le poste ciblé.',
      'Valorisez aussi les projets d’école, associatifs ou personnels lorsqu’ils démontrent une compétence recherchée.',
    ],
  },
  {
    id: 'adapter',
    number: '04',
    title: 'Adapter le CV à l’offre',
    intro: 'Un CV n’est pas figé. Quelques ajustements ciblés le rendent plus clair pour la personne — et les outils — qui le liront.',
    points: [
      'Repérez dans l’annonce les missions, compétences et outils réellement attendus.',
      'Reprenez ces termes lorsqu’ils correspondent sincèrement à votre expérience ou à vos connaissances.',
      'Remontez les expériences, projets et compétences les plus pertinents pour ce poste.',
      'Évitez de surcharger le document de mots-clés : la cohérence du parcours compte autant que les termes employés.',
    ],
  },
  {
    id: 'forme',
    number: '05',
    title: 'Soigner la forme',
    intro: 'La mise en page doit soutenir la lecture, jamais détourner l’attention du contenu.',
    points: [
      'Utilisez une police simple, des tailles cohérentes, des espaces réguliers et des titres facilement identifiables.',
      'Limitez les couleurs et les effets graphiques : une ou deux teintes suffisent largement.',
      'Conservez assez d’espace blanc pour que le CV reste respirant, même sur une seule page.',
      'Faites relire l’orthographe, la grammaire et les dates par une autre personne avant chaque envoi.',
    ],
  },
  {
    id: 'erreurs',
    number: '06',
    title: 'Éviter les erreurs classiques',
    intro: 'Un bon CV est précis, honnête et centré sur ce qui aide le recruteur à prendre une décision.',
    points: [
      'Retirez les informations qui n’apportent rien au poste : état civil complet, détails trop personnels ou expériences très éloignées.',
      'Ne faites pas de promesses vagues comme « dynamique » ou « motivé » sans les illustrer par une expérience.',
      'N’exagérez ni vos responsabilités ni votre niveau de maîtrise : ces éléments sont faciles à vérifier en entretien.',
      'Évitez les photos non professionnelles, les adresses email fantaisistes et les mises en page trop chargées.',
    ],
  },
  {
    id: 'finaliser',
    number: '07',
    title: 'Finaliser avant l’envoi',
    intro: 'Les dernières vérifications évitent beaucoup d’erreurs simples et rendent votre candidature plus professionnelle.',
    points: [
      'Vérifiez une dernière fois que le titre, les compétences et les expériences correspondent à l’offre choisie.',
      'Exportez le CV en PDF pour conserver votre mise en page, sauf si l’employeur demande explicitement un autre format.',
      'Nommez le fichier clairement, par exemple : CV_Prénom_Nom.pdf.',
      'Ouvrez le PDF après export pour vérifier qu’il s’affiche correctement sur une page et que les liens fonctionnent.',
    ],
  },
]

function GuideCv() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fcfbfa] text-[#171717]">
      <PublicHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${Background})` }}>
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <a href="/ressources" className="text-sm font-bold text-black transition hover:text-[#d2915c]">← Retour aux ressources</a>
            <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-[#d2915c]">Guide pratique</p>
                <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[1.02] text-black sm:text-6xl lg:text-7xl">
                  Construire un CV clair, crédible et adapté.
                </h1>
                <p className="max-w-xl text-lg leading-8 text-[#4e3824]">
                  Les étapes essentielles pour présenter votre parcours et faire ressortir ce qui compte pour chaque candidature.
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
                <p className="mt-2">Un CV efficace est facile à parcourir et montre clairement ce que vous pouvez apporter.</p>
              </div>
            </aside>

            <div>
              <div className="border-b-2 border-black pb-8">
                <p className="max-w-3xl text-xl font-medium leading-8 text-gray-700">
                  Utilisez cette trame comme une base, puis adaptez-la à votre parcours et au poste que vous visez.
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

              <section className="mt-10 rounded-2xl bg-black p-7 text-white sm:p-9">
                <p className="text-sm font-bold uppercase tracking-wide text-[#ebc09d]">À retenir</p>
                <h2 className="mt-3 text-3xl font-black leading-tight">Un bon CV facilite la compréhension de votre valeur.</h2>
                <p className="mt-4 max-w-2xl leading-7 text-gray-300">Restez honnête, sélectionnez ce qui est pertinent et adaptez votre document à chaque opportunité.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="/ressources/analyse-ats" className="inline-flex rounded-xl bg-[#d2915c] px-5 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-black">Analyser mon CV</a>
                  <a href="/ressources/offres" className="inline-flex rounded-xl border border-white/40 px-5 py-3 text-sm font-bold text-white transition hover:border-white hover:bg-white hover:text-black">Choisir une offre</a>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default GuideCv
