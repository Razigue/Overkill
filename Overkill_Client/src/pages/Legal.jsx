import PublicHeader from '../components/PublicHeader'
import Footer from '../components/Footer'
import Background from '../assets/images/Overkill_Background.png'
import useActiveSection from '../hooks/useActiveSection'

const sections = [
  {
    id: 'edition', number: '01', title: 'Édition du site',
    content: (
      <>
        <p>OVERKILL est un projet académique développé dans le cadre du cursus Epitech.</p>
        <dl className="mt-6 divide-y divide-black/10 border-y border-black/10">
          <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6"><dt className="font-bold text-black">Nom du site</dt><dd>OVERKILL</dd></div>
          <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6"><dt className="font-bold text-black">Éditeur</dt><dd>L’équipe projet OVERKILL</dd></div>
          <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6"><dt className="font-bold text-black">Nature</dt><dd>Projet pédagogique non commercial</dd></div>
        </dl>
      </>
    ),
  },
  {
    id: 'hebergement', number: '02', title: 'Hébergement',
    content: (
      <>
        <p>Les coordonnées complètes de l’hébergeur doivent être ajoutées par l’équipe OVERKILL avant toute mise en ligne publique de la plateforme.</p>
        <p className="font-bold text-black">Hébergeur : information à compléter.</p>
      </>
    ),
  },
  {
    id: 'contact', number: '03', title: 'Contact',
    content: <p>Pour toute question relative au site, à son fonctionnement ou à vos données personnelles : <a className="font-bold text-black underline decoration-[#d2915c] decoration-2 underline-offset-4 hover:text-[#8b4c25]" href="mailto:contact@overkill.com">contact@overkill.com</a>.</p>,
  },
  {
    id: 'propriete', number: '04', title: 'Propriété intellectuelle',
    content: (
      <>
        <p>Les éléments propres à OVERKILL, notamment son identité visuelle, ses textes, son architecture et son code, sont protégés par les règles applicables à la propriété intellectuelle.</p>
        <p>Les annonces d’emploi et les marques de tiers appartiennent à leurs titulaires respectifs. Leur présence sur OVERKILL n’emporte aucun transfert de propriété.</p>
      </>
    ),
  },
  {
    id: 'donnees', number: '05', title: 'Données personnelles',
    content: (
      <>
        <p>Les modalités de collecte, d’utilisation et de protection des données sont détaillées dans la politique de confidentialité.</p>
        <ul className="mt-6 max-w-3xl list-disc space-y-3 pl-5 marker:text-[#d2915c]">
          <li>les données personnelles ne sont pas vendues à des tiers ;</li>
          <li>le test ATS accessible sans compte ne conserve pas les données envoyées après l’analyse ;</li>
          <li>les documents et résultats du test ATS ne sont pas rendus publics.</li>
        </ul>
        <a className="inline-flex font-bold text-black underline decoration-[#d2915c] decoration-2 underline-offset-4 hover:text-[#8b4c25]" href="/privacy">Consulter la politique de confidentialité</a>
      </>
    ),
  },
  {
    id: 'liens', number: '06', title: 'Liens vers des sites tiers',
    content: (
      <>
        <p>OVERKILL peut rediriger vers les sites à l’origine des offres d’emploi. Ces services sont indépendants et appliquent leurs propres conditions d’utilisation et politiques de confidentialité.</p>
        <p>L’équipe OVERKILL ne contrôle pas leur contenu, leur disponibilité ni leurs pratiques de traitement des données.</p>
      </>
    ),
  },
]

function Legal() {
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
      <PublicHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${Background})` }}>
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <p className="text-sm font-bold uppercase tracking-wide text-[#d2915c]">Informations légales</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[1.02] text-black sm:text-6xl lg:text-7xl">Mentions légales</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#4e3824]">Retrouvez ici les informations relatives à l’édition, à l’hébergement et à l’utilisation du site OVERKILL.</p>
            <p className="mt-6 text-sm font-bold text-[#4e3824]">En vigueur au 30 juillet 2026</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-16">
            <aside className="lg:sticky lg:top-8 lg:self-start">
              <details className="group border-y border-black/15 py-4 lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between font-black [&::-webkit-details-marker]:hidden">Sur cette page <span className="text-xl font-normal text-[#a65f2e]" aria-hidden="true"><span className="group-open:hidden">+</span><span className="hidden group-open:inline">−</span></span></summary>
                <nav className="mt-3 border-l border-black/20" aria-label="Sommaire mobile des mentions légales">{tocLinks}</nav>
              </details>
              <nav className="hidden lg:block" aria-label="Sommaire des mentions légales"><p className="text-sm font-black">Sur cette page</p><div className="mt-4 border-l border-black/20">{tocLinks}</div></nav>
            </aside>
            <article className="min-w-0">
              {sections.map((section) => (
                <section id={section.id} key={section.id} className="scroll-mt-8 border-b border-gray-400 py-10 first:pt-0 sm:py-12">
                  <div className="grid gap-5 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-8">
                    <p className="text-3xl font-black text-[#d2915c]">{section.number}</p>
                    <div><h2 className="text-3xl font-black leading-tight text-black sm:text-4xl">{section.title}</h2><div className="mt-4 max-w-3xl space-y-4 text-[0.98rem] leading-7 text-gray-700">{section.content}</div></div>
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

export default Legal
