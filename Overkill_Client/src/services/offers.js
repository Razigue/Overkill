export async function listOffers(filters = {}) {
  // TODO API (GET /api/offers) :
  // Remplacer le `return []` par l'appel au backend Symfony.
  // Le backend se charge de lire Neon et de normaliser les offres provenant
  // de France Travail et WeLoveDevs.

  /*
  const apiUrl = 'http://localhost:8000'
  const queryParams = new URLSearchParams()

  Object.entries(filters).forEach(([name, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      queryParams.set(name, value)
    }
  })

  const response = await fetch(`${apiUrl}/api/offers?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      // TODO API AUTH : ajouter le token JWT si GET /api/offers devient protégé.
      // Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })

  if (!response.ok) {
    throw new Error('Impossible de charger les offres.')
  }

  const data = await response.json()

  // TODO API FORMAT :
  // Adapter cette ligne uniquement si Symfony enveloppe les résultats
  // dans une propriété `offers` ou `data`.
  return Array.isArray(data) ? data : data.offers || data.data || []
  */

  void filters // À retirer lorsque l'exemple d'appel ci-dessus sera activé.
  return []
}

export const offerFilterOptions = {
  kinds: [
    { value: 'job', label: 'Emploi' },
    { value: 'internship', label: 'Stage' },
    { value: 'apprenticeship', label: 'Alternance' },
  ],
  contracts: ['CDI', 'CDD', 'stage', 'alternance', 'freelance'].map((value) => ({
    value,
    label: value.charAt(0).toLocaleUpperCase('fr') + value.slice(1),
  })),
  // TODO API : confirmer les valeurs de `isRemote.frequency` renvoyées par Symfony.
  remote: [
    { value: 'full', label: '100 % télétravail' },
    { value: 'hybrid', label: 'Hybride' },
    { value: 'office', label: 'Sur site' },
  ],
  // TODO API : remplacer cette liste par les catégories renvoyées par le backend.
  categories: ['Développement', 'Data', 'Design', 'Infrastructure', 'Produit'],
}
