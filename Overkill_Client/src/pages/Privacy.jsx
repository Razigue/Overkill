import LegalDocument, {
  DocumentSection,
  LegalList,
  LegalListItem,
  LegalNotice,
} from '../components/LegalDocument'

const sections = [
  { id: 'donnees-collectees', label: 'Données collectées' },
  { id: 'finalites', label: 'Finalités du traitement' },
  { id: 'conservation', label: 'Durée de conservation' },
  { id: 'destinataires', label: 'Destinataires et partage' },
  { id: 'securite', label: 'Sécurité des données' },
  { id: 'droits', label: 'Vos droits' },
  { id: 'cookies', label: 'Cookies et stockage local' },
]

function Privacy() {
  return (
    <LegalDocument
      category="Protection des données"
      title="Politique de confidentialité"
      description="Cette politique explique de façon transparente quelles données OVERKILL utilise, pourquoi elles sont traitées et quels droits vous pouvez exercer."
      updatedAt="30 juillet 2026"
      sections={sections}
    >
      <p className="mb-10 text-lg leading-8 text-gray-700">
        OVERKILL traite les données à caractère personnel de ses utilisateurs conformément au Règlement général sur la protection des données (RGPD — règlement UE 2016/679) et à la loi Informatique et Libertés.
      </p>

      <DocumentSection id="donnees-collectees" number="01" title="Données personnelles collectées">
        <p>Dans le cadre de l’utilisation de la plateforme, nous pouvons collecter les données suivantes :</p>
        <LegalList>
          <LegalListItem title="Informations de compte :">adresse e-mail, prénom, nom et mot de passe stocké sous forme hachée.</LegalListItem>
          <LegalListItem title="Profil professionnel :">compétences renseignées et CV téléversé au format PDF, DOC ou DOCX.</LegalListItem>
          <LegalListItem title="Données d’utilisation :">offres enregistrées en favoris, recherches effectuées et historique de consultation des offres, lorsque ces fonctionnalités sont activées.</LegalListItem>
          <LegalListItem title="Données techniques :">adresse IP, jetons d’authentification JWT et journaux de connexion nécessaires à la sécurité du service.</LegalListItem>
        </LegalList>
        <LegalNotice title="Cas particulier du test ATS">
          <p>
            Le test ATS est accessible sans connexion à un compte. Les données personnelles et le CV transmis pour réaliser ce test ne sont pas conservés à l’issue de l’analyse et ne sont jamais rendus publics.
          </p>
        </LegalNotice>
      </DocumentSection>

      <DocumentSection id="finalites" number="02" title="Finalités du traitement">
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
      </DocumentSection>

      <DocumentSection id="conservation" number="03" title="Durée de conservation">
        <p>Les données liées au compte sont conservées pendant sa durée d’activité.</p>
        <LegalList>
          <LegalListItem title="Comptes inactifs :">un compte inactif pendant plus de 24 mois peut être supprimé avec les données qui lui sont associées, notamment les favoris, compétences et CV.</LegalListItem>
          <LegalListItem title="CV et documents du compte :">ils sont conservés jusqu’à leur suppression par l’utilisateur ou jusqu’à la fermeture du compte.</LegalListItem>
          <LegalListItem title="Test ATS sans compte :">les données envoyées sont uniquement traitées le temps nécessaire à l’analyse, puis supprimées.</LegalListItem>
        </LegalList>
      </DocumentSection>

      <DocumentSection id="destinataires" number="04" title="Destinataires et partage des données">
        <LegalList>
          <LegalListItem title="Aucune revente :">nous ne vendons, ne louons et ne cédons aucune donnée personnelle à des tiers ou à des régies publicitaires.</LegalListItem>
          <LegalListItem title="Traitements internes :">les fonctions d’extraction de compétences et de recommandation sont exécutées dans un environnement sécurisé, sans publication de vos informations nominatives.</LegalListItem>
          <LegalListItem title="Sites tiers :">lorsque vous choisissez de postuler, vous êtes redirigé vers le site à l’origine de l’offre, qui applique sa propre politique de confidentialité.</LegalListItem>
        </LegalList>
      </DocumentSection>

      <DocumentSection id="securite" number="05" title="Sécurité des données">
        <p>OVERKILL met en œuvre des mesures techniques et organisationnelles adaptées pour protéger les données :</p>
        <LegalList>
          <LegalListItem>Hachage sécurisé des mots de passe en base de données ;</LegalListItem>
          <LegalListItem>Communications protégées par HTTPS / TLS ;</LegalListItem>
          <LegalListItem>Authentification par jetons JWT expirables ;</LegalListItem>
          <LegalListItem>Mesures de protection contre les injections SQL, les failles XSS et les tentatives par force brute.</LegalListItem>
        </LegalList>
      </DocumentSection>

      <DocumentSection id="droits" number="06" title="Vos droits au titre du RGPD">
        <p>Selon les conditions prévues par la réglementation, vous disposez des droits suivants :</p>
        <LegalList>
          <LegalListItem title="Accès et rectification :">consulter et corriger les informations qui vous concernent.</LegalListItem>
          <LegalListItem title="Effacement :">demander la suppression de votre compte et des données associées.</LegalListItem>
          <LegalListItem title="Limitation et opposition :">limiter un traitement ou vous y opposer lorsque la loi le permet.</LegalListItem>
          <LegalListItem title="Portabilité :">obtenir une copie de vos données dans un format structuré et lisible par machine, tel que JSON ou CSV.</LegalListItem>
        </LegalList>
        <p>
          Pour exercer vos droits, écrivez à{' '}
          <a className="font-bold text-black underline decoration-[#d2915c] decoration-2 underline-offset-4 hover:text-[#8b4c25]" href="mailto:contact@overkill.com">
            contact@overkill.com
          </a>
          . Une réclamation peut également être adressée à la CNIL.
        </p>
      </DocumentSection>

      <DocumentSection id="cookies" number="07" title="Cookies et stockage local">
        <p>La plateforme utilise le stockage local du navigateur et, le cas échéant, des cookies strictement nécessaires afin de :</p>
        <LegalList>
          <LegalListItem>maintenir la session ouverte au moyen du jeton d’authentification ;</LegalListItem>
          <LegalListItem>mémoriser les préférences indispensables au fonctionnement de l’interface.</LegalListItem>
        </LegalList>
        <p>Ces mécanismes ne sont pas utilisés à des fins de ciblage publicitaire.</p>
      </DocumentSection>
    </LegalDocument>
  )
}

export default Privacy
