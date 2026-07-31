import PublicHeader from '../components/PublicHeader'
import Footer from '../components/Footer'
import Background from '../assets/images/Overkill_Background.png'
import useActiveSection from '../hooks/useActiveSection'

const listClass = 'mt-6 max-w-3xl list-disc space-y-3 pl-5 marker:text-[#d2915c]'

const sections = [
  {
    id: 'donnees-collectees',
    number: '01',
    title: 'Données personnelles collectées',
    content: (
      <>
        <p>Dans le cadre de l’utilisation de la plateforme, nous pouvons collecter les données suivantes :</p>
        <ul className={listClass}>
          <li><strong className="text-black">Informations de compte :</strong> adresse e-mail, prénom, nom et mot de passe stocké sous forme hachée.</li>
          <li><strong className="text-black">Profil professionnel :</strong> compétences renseignées et CV téléversé au format PDF, DOC ou DOCX.</li>
          <li><strong className="text-black">Données d’utilisation :</strong> offres enregistrées en favoris, recherches effectuées et historique de consultation des offres, lorsque ces fonctionnalités sont activées.</li>
          <li><strong className="text-black">Données techniques :</strong> adresse IP, jetons d’authentification JWT et journaux de connexion nécessaires à la sécurité du service.</li>
        </ul>
        <div className="my-7 rounded-2xl bg-black p-7 text-white sm:p-9">
          <p className="font-black">Cas particulier du test ATS</p>
          <p className="mt-2 text-sm leading-6 text-gray-200">
            Le test ATS est accessible sans connexion à un compte. Les données personnelles et le CV transmis pour réaliser ce test ne sont pas conservés à l’issue de l’analyse et ne sont jamais rendus publics.
          </p>
        </div>
      </>
    ),
  },
  {
    id: 'finalites',
    number: '02',
    title: 'Finalités du traitement',
    content: (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-2 border-black text-black">
              <th className="py-3 pr-5 font-black">Finalité</th>
              <th className="py-3 font-black">Base légale</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black/10">
              <td className="py-4 pr-5">Gestion du compte et authentification sécurisée</td>
              <td className="py-4">Exécution du contrat / CGU</td>
            </tr>
            <tr className="border-b border-black/10">
              <td className="py-4 pr-5">Recommandations d’offres et analyse assistée par IA</td>
              <td className="py-4">Intérêt légitime / consentement, selon le traitement</td>
            </tr>
            <tr className="border-b border-black/10">
              <td className="py-4 pr-5">Sauvegarde des favoris, compétences et CV</td>
              <td className="py-4">Exécution du contrat / CGU</td>
            </tr>
            <tr className="border-b border-black/10">
              <td className="py-4 pr-5">Statistiques anonymisées sur le marché de l’emploi</td>
              <td className="py-4">Intérêt légitime</td>
            </tr>
            <tr>
              <td className="py-4 pr-5">Modération, prévention des abus et sécurité</td>
              <td className="py-4">Intérêt légitime / obligation légale</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: 'conservation',
    number: '03',
    title: 'Durée de conservation',
    content: (
      <>
        <p>Les données liées au compte sont conservées pendant sa durée d’activité.</p>
        <ul className={listClass}>
          <li><strong className="text-black">Comptes inactifs :</strong> un compte inactif pendant plus de 24 mois peut être supprimé avec les données qui lui sont associées, notamment les favoris, compétences et CV.</li>
          <li><strong className="text-black">CV et documents du compte :</strong> ils sont conservés jusqu’à leur suppression par l’utilisateur ou jusqu’à la fermeture du compte.</li>
          <li><strong className="text-black">Test ATS sans compte :</strong> les données envoyées sont uniquement traitées le temps nécessaire à l’analyse, puis supprimées.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'destinataires',
    number: '04',
    title: 'Destinataires et partage des données',
    content: (
      <ul className={listClass}>
        <li><strong className="text-black">Aucune revente :</strong> nous ne vendons, ne louons et ne cédons aucune donnée personnelle à des tiers ou à des régies publicitaires.</li>
        <li><strong className="text-black">Traitements internes :</strong> les fonctions d’extraction de compétences et de recommandation sont exécutées dans un environnement sécurisé, sans publication de vos informations nominatives.</li>
        <li><strong className="text-black">Sites tiers :</strong> lorsque vous choisissez de postuler, vous êtes redirigé vers le site à l’origine de l’offre, qui applique sa propre politique de confidentialité.</li>
      </ul>
    ),
  },
  {
    id: 'securite',
    number: '05',
    title: 'Sécurité des données',
    content: (
      <>
        <p>OVERKILL met en œuvre des mesures techniques et organisationnelles adaptées pour protéger les données :</p>
        <ul className={listClass}>
          <li>Hachage sécurisé des mots de passe en base de données ;</li>
          <li>Communications protégées par HTTPS / TLS ;</li>
          <li>Authentification par jetons JWT expirables ;</li>
          <li>Mesures de protection contre les injections SQL, les failles XSS et les tentatives par force brute.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'droits',
    number: '06',
    title: 'Vos droits au titre du RGPD',
    content: (
      <>
        <p>Selon les conditions prévues par la réglementation, vous disposez des droits suivants :</p>
        <ul className={listClass}>
          <li><strong className="text-black">Accès et rectification :</strong> consulter et corriger les informations qui vous concernent.</li>
          <li><strong className="text-black">Effacement :</strong> demander la suppression de votre compte et des données associées.</li>
          <li><strong className="text-black">Limitation et opposition :</strong> limiter un traitement ou vous y opposer lorsque la loi le permet.</li>
          <li><strong className="text-black">Portabilité :</strong> obtenir une copie de vos données dans un format structuré et lisible par machine, tel que JSON ou CSV.</li>
        </ul>
        <p>
          Pour exercer vos droits, écrivez à{' '}
          <a className="font-bold text-black underline decoration-[#d2915c] decoration-2 underline-offset-4 hover:text-[#8b4c25]" href="mailto:contact@overkill.com">
            contact@overkill.com
          </a>
          . Une réclamation peut également être adressée à la CNIL.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    number: '07',
    title: 'Cookies et stockage local',
    content: (
      <>
        <p>La plateforme utilise le stockage local du navigateur et, le cas échéant, des cookies strictement nécessaires afin de :</p>
        <ul className={listClass}>
          <li>maintenir la session ouverte au moyen du jeton d’authentification ;</li>
          <li>mémoriser les préférences indispensables au fonctionnement de l’interface.</li>
        </ul>
        <p>Ces mécanismes ne sont pas utilisés à des fins de ciblage publicitaire.</p>
      </>
    ),
  },
]

function Privacy() {
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
            <p className="text-sm font-bold uppercase tracking-wide text-[#d2915c]">Protection des données</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[1.02] text-black sm:text-6xl lg:text-7xl">Politique de confidentialité</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#4e3824]">Cette politique explique de façon transparente quelles données OVERKILL utilise, pourquoi elles sont traitées et quels droits vous pouvez exercer.</p>
            <p className="mt-6 text-sm font-bold text-[#4e3824]">En vigueur au 30 juillet 2026</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="mb-10 max-w-4xl text-lg leading-8 text-gray-700">
            OVERKILL traite les données à caractère personnel de ses utilisateurs conformément au Règlement général sur la protection des données (RGPD — règlement UE 2016/679) et à la loi Informatique et Libertés.
          </p>
          <div className="grid gap-12 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-16">
            <aside className="lg:sticky lg:top-8 lg:self-start">
              <details className="group border-y border-black/15 py-4 lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between font-black [&::-webkit-details-marker]:hidden">
                  Sur cette page
                  <span className="text-xl font-normal text-[#a65f2e]" aria-hidden="true">
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:inline">−</span>
                  </span>
                </summary>
                <nav className="mt-3 border-l border-black/20" aria-label="Sommaire mobile de la politique de confidentialité">{tocLinks}</nav>
              </details>
              <nav className="hidden lg:block" aria-label="Sommaire de la politique de confidentialité">
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

export default Privacy
