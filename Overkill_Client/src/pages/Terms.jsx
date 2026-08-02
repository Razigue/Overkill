import Header from '../components/Header'
import Footer from '../components/Footer'
import Background from '../assets/images/Overkill_Background.png'
import useActiveSection from '../hooks/useActiveSection'

const listClass = 'mt-6 max-w-3xl list-disc space-y-3 pl-5 marker:text-[#d2915c]'

const sections = [
  {
    id: 'objet',
    number: '01',
    title: 'Objet et acceptation',
    content: (
      <>
        <p>Les présentes conditions générales d’utilisation (ci-après les « CGU ») définissent les modalités de mise à disposition des services du site OVERKILL (ci-après « la plateforme »).</p>
        <p>L’accès ou l’utilisation de la plateforme implique l’acceptation des présentes CGU.</p>
      </>
    ),
  },
  {
    id: 'services',
    number: '02',
    title: 'Accès au site et services fournis',
    content: (
      <>
        <p>OVERKILL est un agrégateur d’offres d’emploi, de stage et d’alternance dans le secteur informatique et technologique. La plateforme permet notamment de :</p>
        <ul className={listClass}>
          <li>rechercher, filtrer et consulter des offres centralisées depuis plusieurs sources ;</li>
          <li>créer un compte personnel sécurisé par un jeton d’authentification ;</li>
          <li>gérer un profil, renseigner des compétences et téléverser un CV ;</li>
          <li>enregistrer des offres en favoris ;</li>
          <li>accéder à des analyses et outils d’aide à la candidature, dont le test ATS.</li>
        </ul>
        <p>L’accès à la plateforme est gratuit. Les coûts liés au matériel, aux logiciels et à la connexion internet restent à la charge de l’utilisateur.</p>
      </>
    ),
  },
  {
    id: 'compte',
    number: '03',
    title: 'Inscription et compte utilisateur',
    content: (
      <>
        <p>Certaines fonctionnalités nécessitent la création d’un compte. Lors de son inscription, l’utilisateur s’engage à fournir des informations exactes, complètes et à jour.</p>
        <p>L’utilisateur est responsable de la confidentialité de ses identifiants et doit signaler rapidement toute utilisation non autorisée de son compte.</p>
        <p>En cas de violation des présentes CGU, d’utilisation frauduleuse ou d’atteinte au fonctionnement du service, OVERKILL peut suspendre ou supprimer le compte concerné.</p>
      </>
    ),
  },
  {
    id: 'donnees-offres',
    number: '04',
    title: 'Origine et agrégation des offres',
    content: (
      <>
        <p>Les annonces affichées proviennent de sources externes publiques ou d’API partenaires, notamment WeLoveDevs.</p>
        <ul className={listClass}>
          <li><strong className="text-black">Crédit et redirection :</strong> chaque offre renvoie vers sa source ou vers le site de l’annonceur.</li>
          <li><strong className="text-black">Exactitude :</strong> OVERKILL ne peut garantir la disponibilité permanente ni l’exactitude des contenus publiés par des tiers.</li>
          <li><strong className="text-black">Candidature :</strong> la candidature est finalisée sur le site tiers à l’origine de l’annonce.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'ats',
    number: '05',
    title: 'Utilisation du test ATS',
    content: (
      <>
        <p>Le test ATS permet d’obtenir une analyse indicative de la lisibilité d’un CV par les systèmes automatisés de suivi des candidatures.</p>
        <div className="my-7 rounded-2xl bg-black p-7 text-white sm:p-9">
          <p className="font-black">Un service accessible sans compte</p>
          <p className="mt-2 text-sm leading-6 text-gray-200">Le test peut être utilisé sans connexion. Les données personnelles et le document transmis ne sont pas conservés après l’analyse, ne sont pas associés à un profil utilisateur et ne sont pas rendus publics.</p>
        </div>
        <p>Le résultat est fourni à titre d’aide. Il ne garantit ni la compatibilité avec tous les logiciels ATS du marché, ni l’obtention d’un entretien ou d’un emploi.</p>
      </>
    ),
  },
  {
    id: 'propriete',
    number: '06',
    title: 'Propriété intellectuelle',
    content: (
      <>
        <p>L’architecture, le code source, la charte graphique, les logos et les contenus propres à OVERKILL sont protégés par les règles applicables au droit d’auteur et à la propriété intellectuelle.</p>
        <p>Les annonces restent la propriété de leurs émetteurs et plateformes d’origine. Toute reproduction ou extraction massive non autorisée du contenu de la plateforme à des fins commerciales est interdite.</p>
      </>
    ),
  },
  {
    id: 'responsabilite',
    number: '07',
    title: 'Responsabilité',
    content: (
      <>
        <p>OVERKILL s’efforce d’assurer la disponibilité et la qualité du service, sans pouvoir garantir un fonctionnement continu et exempt d’erreur.</p>
        <p>La responsabilité de la plateforme ne saurait notamment être engagée en cas :</p>
        <ul className={listClass}>
          <li>d’interruption temporaire pour maintenance ou mise à jour ;</li>
          <li>d’inexactitude ou d’obsolescence d’une offre provenant d’une source externe ;</li>
          <li>de dysfonctionnement du réseau ou des équipements de l’utilisateur ;</li>
          <li>de décision prise sur la seule base d’un résultat fourni par un outil d’analyse.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'modification',
    number: '08',
    title: 'Modification des CGU',
    content: (
      <>
        <p>OVERKILL peut modifier les présentes CGU afin de tenir compte de l’évolution de la plateforme, de ses services ou du cadre réglementaire.</p>
        <p>La version applicable est celle publiée sur cette page à la date de consultation. En cas de modification substantielle, les utilisateurs disposant d’un compte pourront être informés par un moyen approprié.</p>
      </>
    ),
  },
]

function Terms() {
  const [activeSection, setActiveSection] = useActiveSection(sections)
  const tocClass = (id) => `block border-l-2 py-2 pl-4 text-sm leading-5 transition-colors ${
    activeSection === id ? 'border-[#d2915c] bg-[#ebc09d]/40 font-bold text-black' : 'border-transparent font-medium text-gray-600 hover:border-[#d2915c] hover:bg-[#ebc09d]/25 hover:text-black'
  }`

  const tocLinks = sections.map((section) => (
    <a key={section.id} href={`#${section.id}`} aria-current={activeSection === section.id ? 'location' : undefined} onClick={() => setActiveSection(section.id)} className={tocClass(section.id)}>
      {section.number}. {section.title}
    </a>
  ))

  return (
    <div className="flex min-h-screen flex-col bg-[#fcfbfa] text-[#171717]">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${Background})` }}>
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <p className="text-sm font-bold uppercase tracking-wide text-[#d2915c]">Cadre d’utilisation</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[1.02] text-black sm:text-6xl lg:text-7xl">Conditions générales d’utilisation</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#4e3824]">Les présentes conditions encadrent l’accès à OVERKILL et l’utilisation de ses services par chaque utilisateur.</p>
            <p className="mt-6 text-sm font-bold text-[#4e3824]">En vigueur au 30 juillet 2026</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-16">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <details className="group border-y border-black/15 py-4 lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between font-black [&::-webkit-details-marker]:hidden">Sur cette page <span className="text-xl font-normal text-[#a65f2e]" aria-hidden="true"><span className="group-open:hidden">+</span><span className="hidden group-open:inline">−</span></span></summary>
                <nav className="mt-3 border-l border-black/20" aria-label="Sommaire mobile des conditions">{tocLinks}</nav>
              </details>
              <nav className="hidden lg:block" aria-label="Sommaire des conditions">
                <p className="text-sm font-black">Sur cette page</p>
                <div className="mt-4 border-l border-black/20">{tocLinks}</div>
              </nav>
            </aside>

            <article className="min-w-0">
              {sections.map((section) => (
                <section id={section.id} key={section.id} className="scroll-mt-8 border-b border-gray-400 py-10 first:pt-0 sm:py-12">
                  <div className="grid gap-5 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-8">
                    <p className="text-3xl font-black text-[#d2915c]">{section.number}</p>
                    <div>
                      <h2 className="text-3xl font-black leading-tight text-black sm:text-4xl">{section.title}</h2>
                      <div className="mt-4 max-w-3xl space-y-4 text-[0.98rem] leading-7 text-gray-700">{section.content}</div>
                    </div>
                  </div>
                </section>
              ))}
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default Terms
